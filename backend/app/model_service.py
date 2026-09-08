import os
import io
import base64
import logging
from typing import Dict, Any, List, Optional
import numpy as np
from PIL import Image
import cv2
import torch
import torch.nn as nn
from torchvision import models, transforms

logger = logging.getLogger("model_service")
logging.basicConfig(level=logging.INFO)

CLASS_NAMES = ['No DR', 'Mild', 'Moderate', 'Severe', 'Proliferative DR']

STAGE_DESCRIPTIONS = {
    0: {
        "title": "No Apparent DR (Grade 0)",
        "risk": "low",
        "priority": "routine",
        "recommendation": "Annual routine screening recommended. Maintain optimal glycemic and blood pressure control.",
        "findings": [
            "Normal retinal vasculature",
            "Clear macular region",
            "No microaneurysms or hemorrhages detected"
        ]
    },
    1: {
        "title": "Mild NPDR (Grade 1)",
        "risk": "moderate",
        "priority": "routine",
        "recommendation": "Follow-up screening in 6–12 months. Strict glycemic monitoring advised.",
        "findings": [
            "Microaneurysm-like lesions detected",
            "No hard exudates or macular edema apparent",
            "Localized vascular irregularity"
        ]
    },
    2: {
        "title": "Moderate NPDR (Grade 2)",
        "risk": "moderate",
        "priority": "urgent",
        "recommendation": "Referral to ophthalmologist within 4–6 weeks for comprehensive dilated evaluation.",
        "findings": [
            "Multiple microaneurysms detected in central/perimacular field",
            "Dot/blot hemorrhages present",
            "Potential hard exudates near fovea"
        ]
    },
    3: {
        "title": "Severe NPDR (Grade 3)",
        "risk": "high",
        "priority": "priority",
        "recommendation": "Priority ophthalmology evaluation within 1–2 weeks for laser photocoagulation assessment.",
        "findings": [
            "Severe intraretinal hemorrhages in all quadrants (4-2-1 rule)",
            "Venous beading or cotton-wool spots indicated",
            "High risk of progression to proliferative stage"
        ]
    },
    4: {
        "title": "Proliferative DR (Grade 4)",
        "risk": "high",
        "priority": "priority",
        "recommendation": "Urgent ophthalmologist referral within 24–48 hours. High risk of sudden vision loss.",
        "findings": [
            "Neovascularization detected on disc/retina",
            "Preretinal/vitreous hemorrhage risk",
            "Extensive ischemic retinal areas flagged"
        ]
    }
}


class ModelService:
    def __init__(self, checkpoint_path: Optional[str] = None):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'mps' if torch.backends.mps.is_available() else 'cpu')
        self.checkpoint_path = checkpoint_path or self._find_checkpoint()
        self.model = None
        self.checkpoint_meta = {}
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        self._load_model()

    def _find_checkpoint(self) -> str:
        candidates = [
            os.environ.get("CHECKPOINT_PATH", ""),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ML", "classifier.pt")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend", "ML", "classifier.pt")),
            os.path.abspath("backend/ML/classifier.pt"),
            os.path.abspath("ML/classifier.pt"),
            "/app/ML/classifier.pt",
        ]
        for p in candidates:
            if p and os.path.exists(p):
                logger.info(f"Found model checkpoint at: {p}")
                return p
        raise FileNotFoundError(f"Could not locate classifier.pt in candidates: {candidates}")

    def _load_model(self):
        logger.info(f"Loading ResNet-152 architecture on device: {self.device}")
        model = models.resnet152(weights=None)
        num_ftrs = model.fc.in_features
        model.fc = nn.Sequential(
            nn.Linear(num_ftrs, 512),
            nn.ReLU(),
            nn.Linear(512, 5),
            nn.LogSoftmax(dim=1)
        )
        model = model.to(self.device)

        if os.path.exists(self.checkpoint_path):
            logger.info(f"Loading weights from: {self.checkpoint_path}")
            checkpoint = torch.load(self.checkpoint_path, map_location=self.device, weights_only=False)
            model.load_state_dict(checkpoint['model_state_dict'])
            self.checkpoint_meta = {
                "epoch": checkpoint.get("epoch", 0) + 1,
                "train_loss": checkpoint.get("train_loss", 0.0),
                "valid_loss": checkpoint.get("valid_loss", 0.0),
                "valid_accuracy": checkpoint.get("valid_accuracy", 0.0)
            }
            logger.info(f"Loaded checkpoint Epoch {self.checkpoint_meta['epoch']} (Val Acc: {self.checkpoint_meta['valid_accuracy']*100:.2f}%)")
        else:
            logger.warning(f"Checkpoint file not found at {self.checkpoint_path}. Running with uninitialized weights.")

        model.eval()
        self.model = model

    def generate_gradcam(self, orig_img: Image.Image, tensor: torch.Tensor, target_class: int) -> tuple[str, str]:
        """
        Generate Grad-CAM heatmap and blended overlay for target class.
        Returns:
            (heatmap_base64_url, overlay_base64_url)
        """
        gradients = []
        activations = []

        def backward_hook(module, grad_input, grad_output):
            gradients.append(grad_output[0])

        def forward_hook(module, input, output):
            activations.append(output)

        target_layer = self.model.layer4[-1]
        handle_fwd = target_layer.register_forward_hook(forward_hook)
        handle_bwd = target_layer.register_full_backward_hook(backward_hook)

        try:
            tensor_clone = tensor.clone().detach().requires_grad_(True)
            self.model.zero_grad()
            output = self.model(tensor_clone)
            score = output[0, target_class]
            score.backward()

            if not gradients or not activations:
                return "", ""

            grads = gradients[0].cpu().data.numpy()[0]
            acts = activations[0].cpu().data.numpy()[0]

            weights = np.mean(grads, axis=(1, 2))
            cam = np.zeros(acts.shape[1:], dtype=np.float32)

            for i, w in enumerate(weights):
                cam += w * acts[i]

            cam = np.maximum(cam, 0)
            if cam.max() > 0:
                cam = cam / cam.max()

            w, h = orig_img.size
            cam = cv2.resize(cam, (w, h))

            # Heatmap color conversion
            heatmap_raw = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET)
            heatmap_rgb = cv2.cvtColor(heatmap_raw, cv2.COLOR_BGR2RGB)

            # Overlay
            orig_np = np.array(orig_img)
            if len(orig_np.shape) == 2:  # grayscale
                orig_np = cv2.cvtColor(orig_np, cv2.COLOR_GRAY2RGB)
            elif orig_np.shape[2] == 4:  # RGBA
                orig_np = orig_np[:, :, :3]

            overlay = np.uint8(0.65 * orig_np + 0.35 * heatmap_rgb)

            # Encode to PNG base64
            heatmap_pil = Image.fromarray(heatmap_rgb)
            overlay_pil = Image.fromarray(overlay)

            buf_hm = io.BytesIO()
            heatmap_pil.save(buf_hm, format="PNG")
            hm_b64 = f"data:image/png;base64,{base64.b64encode(buf_hm.getvalue()).decode('utf-8')}"

            buf_ov = io.BytesIO()
            overlay_pil.save(buf_ov, format="PNG")
            ov_b64 = f"data:image/png;base64,{base64.b64encode(buf_ov.getvalue()).decode('utf-8')}"

            return hm_b64, ov_b64
        finally:
            handle_fwd.remove()
            handle_bwd.remove()

    def predict_image(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Run inference on image bytes, calculate probabilities, and generate Grad-CAM explainability.
        """
        orig_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor = self.transform(orig_img).unsqueeze(0).to(self.device)

        with torch.no_grad():
            output = self.model(tensor)
            probabilities = torch.exp(output).squeeze().cpu().numpy()

        pred_idx = int(probabilities.argmax())
        confidence = float(probabilities[pred_idx])

        # Generate Grad-CAM heatmaps
        heatmap_url, overlay_url = self.generate_gradcam(orig_img, tensor, pred_idx)

        stage_info = STAGE_DESCRIPTIONS.get(pred_idx, STAGE_DESCRIPTIONS[0])

        class_probs = [
            {"grade": i, "name": name, "probability": round(float(prob), 4), "percentage": round(float(prob) * 100, 1)}
            for i, (name, prob) in enumerate(zip(CLASS_NAMES, probabilities))
        ]

        # Convert original image to base64 data URL for easy display
        buf_orig = io.BytesIO()
        orig_img.save(buf_orig, format="JPEG", quality=85)
        orig_b64 = f"data:image/jpeg;base64,{base64.b64encode(buf_orig.getvalue()).decode('utf-8')}"

        return {
            "grade": pred_idx,
            "stage": CLASS_NAMES[pred_idx],
            "title": stage_info["title"],
            "risk": stage_info["risk"],
            "priority": stage_info["priority"],
            "confidence": round(confidence * 100, 1),
            "probabilities": class_probs,
            "recommendation": stage_info["recommendation"],
            "findings": stage_info["findings"],
            "images": {
                "original": orig_b64,
                "heatmap": heatmap_url,
                "overlay": overlay_url
            },
            "model_metadata": {
                "architecture": "ResNet-152",
                "checkpoint_epoch": self.checkpoint_meta.get("epoch", 5),
                "validation_accuracy": round(self.checkpoint_meta.get("valid_accuracy", 0.0) * 100, 2)
            }
        }

    def get_info(self) -> Dict[str, Any]:
        return {
            "status": "ready",
            "model": "ResNet-152",
            "device": str(self.device),
            "classes": CLASS_NAMES,
            "checkpoint": self.checkpoint_meta
        }


# Singleton pattern
_service: Optional[ModelService] = None

def get_model_service() -> ModelService:
    global _service
    if _service is None:
        _service = ModelService()
    return _service

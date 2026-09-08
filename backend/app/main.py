from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, Dict, Any, List
from contextlib import asynccontextmanager
import logging

import secrets
from pydantic import BaseModel

from app.model_service import get_model_service
from app.db import (
    init_db,
    get_db_status,
    get_all_workers,
    get_worker_by_id,
    create_worker,
    update_worker,
    delete_worker,
    authenticate_worker,
    get_all_patients,
    get_patient_by_id,
    create_patient,
    delete_patient,
    delete_all_patients,
    get_all_screenings,
    create_screening,
    get_all_referrals,
    create_referral,
    update_referral,
)

logger = logging.getLogger("main")
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize MongoDB (with automatic SQLite fallback if MongoDB offline)
    init_db()
    status = get_db_status()
    logger.info(f"Database active: {status}")
    yield


app = FastAPI(
    title="Retinix DR Screening XAI API",
    description="Explainable Deep Learning API with Healthcare Worker Permissions Management, MongoDB persistence, and Clinical Roster",
    version="2.1.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "Retinix DR Screening XAI API",
        "version": "2.1.0"
    }


@app.get("/up")
@app.get("/health")
def up_check():
    return {"status": "up"}


@app.get("/api/db-status")
def check_db_status():
    """Returns whether MongoDB is connected or running in fallback mode."""
    return get_db_status()


@app.get("/api/model-info")
def get_model_info():
    service = get_model_service()
    return service.get_info()


# ===================== WORKER AUTHENTICATION =====================

class WorkerLoginRequest(BaseModel):
    login: str
    password: str

@app.post("/api/auth/worker/login")
@app.post("/api/workers/login")
def worker_login(req: WorkerLoginRequest):
    """Authenticate a frontline healthcare worker via ID, Email, or Phone + Password."""
    worker = authenticate_worker(req.login, req.password)
    if not worker:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials. Please verify your Worker ID or Email and Password."
        )
    if worker.get("suspended"):
        raise HTTPException(
            status_code=403,
            detail="Healthcare worker account is suspended. Please contact the clinic supervising ophthalmologist."
        )

    # Issue deterministic session token
    token = f"worker_{worker['id']}_{secrets.token_hex(20)}"
    logger.info(f"Worker {worker['id']} ({worker['name']}) logged in successfully.")
    return {
        "success": True,
        "token": token,
        "worker": worker,
        "message": f"Welcome back, {worker['name']}."
    }

@app.get("/api/auth/worker/me")
def get_current_worker(token: Optional[str] = None, worker_id: Optional[str] = None):
    """Verify and retrieve current authenticated worker session."""
    w_id = worker_id
    if token and token.startswith("worker_"):
        parts = token.split("_")
        if len(parts) >= 2:
            w_id = parts[1]
    if not w_id:
        raise HTTPException(status_code=401, detail="Authentication token or worker ID is required.")

    worker = get_worker_by_id(w_id)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker session not found.")
    if worker.get("status") == "suspended":
        raise HTTPException(status_code=403, detail="Worker account is suspended.")

    return {
        "authenticated": True,
        "worker": worker
    }


# ===================== WORKERS (DOCTOR PORTAL) =====================

@app.get("/api/workers", response_model=List[Dict[str, Any]])
def list_workers():
    """Retrieve all registered healthcare workers and their active permissions."""
    return get_all_workers()


@app.get("/api/workers/{worker_id}")
def get_worker(worker_id: str):
    worker = get_worker_by_id(worker_id)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    return worker


@app.post("/api/workers", status_code=201)
def register_worker(payload: Dict[str, Any] = Body(...)):
    """Register a new healthcare worker with granular permissions."""
    required = ["id", "name", "email", "phone", "role_title", "clinic"]
    for field in required:
        if not payload.get(field):
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

    existing = get_worker_by_id(payload["id"])
    if existing:
        raise HTTPException(status_code=409, detail=f"Worker with ID {payload['id']} already exists")

    new_worker = create_worker(payload)
    return new_worker


@app.put("/api/workers/{worker_id}")
def modify_worker(worker_id: str, payload: Dict[str, Any] = Body(...)):
    """Update healthcare worker details and permissions."""
    updated = update_worker(worker_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Worker not found")
    return updated


@app.delete("/api/workers/{worker_id}")
def remove_worker(worker_id: str):
    """Deactivate or remove a healthcare worker."""
    success = delete_worker(worker_id)
    return {"success": success, "id": worker_id}


# ===================== PATIENTS =====================

@app.get("/api/patients")
def list_patients():
    return get_all_patients()


@app.get("/api/patients/{patient_id}")
def get_patient(patient_id: str):
    patient = get_patient_by_id(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@app.post("/api/patients", status_code=201)
def add_patient(payload: Dict[str, Any] = Body(...)):
    required = ["id", "name", "age", "diabetes_duration", "village", "contact"]
    for field in required:
        if field not in payload:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

    return create_patient(payload)


@app.delete("/api/patients/{patient_id}")
def remove_patient(patient_id: str):
    success = delete_patient(patient_id)
    if not success:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": f"Patient {patient_id} deleted successfully"}


@app.delete("/api/patients")
def remove_all_patients():
    count = delete_all_patients()
    return {"message": f"All {count} patient(s) and associated records deleted successfully", "deleted_count": count}


# ===================== SCREENINGS (DATA-ONLY) =====================

@app.get("/api/screenings")
def list_screenings():
    """Returns all recorded clinical screenings (without raw image blobs)."""
    return get_all_screenings()


@app.post("/api/screenings", status_code=201)
def save_screening(payload: Dict[str, Any] = Body(...)):
    """
    Records a clinical screening assessment.
    Per strict privacy and lightweight storage policy, raw image blobs/heatmaps are stripped.
    """
    required = ["id", "patient_id", "date", "eye", "grade", "stage", "title", "risk", "priority", "confidence"]
    for field in required:
        if field not in payload:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

    return create_screening(payload)


# ===================== REFERRALS =====================

@app.get("/api/referrals")
def list_referrals():
    return get_all_referrals()


@app.post("/api/referrals", status_code=201)
def add_referral(payload: Dict[str, Any] = Body(...)):
    required = ["id", "screening_id", "patient_id", "date", "risk", "confidence", "priority"]
    for field in required:
        if field not in payload:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

    return create_referral(payload)


@app.put("/api/referrals/{referral_id}")
def review_referral(referral_id: str, payload: Dict[str, Any] = Body(...)):
    """Allows doctor to record clinical review and update referral status."""
    updated = update_referral(referral_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Referral not found")
    return updated


# ===================== PREDICT (PYTORCH INFERENCE + EPHEMERAL GRAD-CAM) =====================

@app.post("/api/predict")
async def predict_dr(
    file: UploadFile = File(...),
    patient_id: Optional[str] = Form(None),
    eye: Optional[str] = Form(None)
):
    """
    Accepts an uploaded retinal fundus image, runs ResNet-152 inference,
    calculates stage probabilities, and generates Grad-CAM explainability heatmaps for preview.
    NOTE: The image is NOT persisted to the database.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid image (JPEG/PNG/etc.)")

    try:
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        service = get_model_service()
        result = service.predict_image(contents)

        if patient_id:
            result["patient_id"] = patient_id
        if eye:
            result["eye"] = eye
        result["filename"] = file.filename

        return JSONResponse(content=result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Inference error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")
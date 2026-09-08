"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "@/lib/navigation";
import {
  Upload, X, AlertCircle, CheckCircle2, Send, RotateCcw,
  Activity, ShieldAlert, Lock, User
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import RetinalImage from "@/components/RetinalImage";
import RiskBadge from "@/components/RiskBadge";
import {
  createScreeningApi,
  createReferralApi,
  fetchPatientsApi,
  getActiveWorker,
  generateId,
  ProbabilityItem,
  Patient,
  Worker,
  type RiskLevel
} from "@/lib/store";

type Phase = "form" | "analyzing" | "result" | "referral" | "sent";
type ViewMode = "original" | "heatmap" | "overlay";

export interface PredictResult {
  grade: number;
  stage: string;
  title: string;
  risk: RiskLevel;
  priority: "routine" | "urgent" | "priority";
  confidence: number;
  probabilities: ProbabilityItem[];
  recommendation: string;
  findings: string[];
  images: {
    original: string;
    heatmap: string;
    overlay: string;
  };
  model_metadata?: {
    architecture: string;
    checkpoint_epoch: number;
    validation_accuracy: number;
  };
}

const SAMPLE_OPTIONS = [
  { label: "Normal (Grade 0)", path: "/samples/normal_fundus.jpg" },
  { label: "Mild (Grade 1)", path: "/samples/mild_fundus.jpg" },
  { label: "Moderate (Grade 2)", path: "/samples/mod_fundus.jpg" },
  { label: "Severe (Grade 3)", path: "/samples/severe_fundus.jpg" },
];

function AnalysisLoader({ progress, currentStep }: { progress: number; currentStep: string }) {
  const steps = [
    { label: "Preprocessing fundus photograph", threshold: 15 },
    { label: "Passing tensor to PyTorch ResNet-152", threshold: 40 },
    { label: "Computing 5-class stage probabilities", threshold: 65 },
    { label: "Computing Grad-CAM gradients on Layer 4", threshold: 85 },
    { label: "Assembling explainability heatmap overlay", threshold: 95 },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-8">
        <div className="w-52 h-52 rounded-full overflow-hidden opacity-85">
          <RetinalImage mode="overlay" size={208} scanAnimate risk="high" />
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/40 animate-spin" style={{ animationDuration: "3s" }} />
        <div className="absolute inset-2 rounded-full border border-emerald-300/30 animate-spin" style={{ animationDuration: "5s", animationDirection: "reverse" }} />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1 rounded-full font-mono flex items-center gap-1.5 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {progress}%
        </div>
      </div>

      <div className="w-full max-w-sm space-y-2.5">
        <p className="text-center text-xs text-emerald-700 font-semibold uppercase tracking-wider mb-2">
          {currentStep || "Connecting to PyTorch Backend..."}
        </p>
        {steps.map((s, i) => {
          const done = progress >= s.threshold;
          const current = progress >= (steps[i - 1]?.threshold ?? 0) && !done;
          return (
            <div key={i} className="flex items-center gap-2.5">
              {done ? (
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
              ) : current ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin shrink-0" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
              )}
              <span className={`text-sm transition-colors ${done ? "text-slate-700 font-medium" : current ? "text-emerald-700 font-semibold" : "text-slate-400"}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResultView({
  result,
  canRefer,
  onReferral,
  onReset,
  viewMode,
  setViewMode
}: {
  result: PredictResult;
  canRefer: boolean;
  onReferral: () => void;
  onReset: () => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
}) {
  const riskColor =
    result.risk === "high"
      ? "text-red-600"
      : result.risk === "moderate"
      ? "text-amber-600"
      : "text-emerald-600";

  return (
    <div className="space-y-6">
      {/* Result header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">AI Screening Result</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
              ResNet-152 + Grad-CAM
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
              Data-Only Storage
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-3xl font-bold ${riskColor}`}>{result.title}</span>
            <RiskBadge risk={result.risk} size="lg" />
          </div>
          <p className="text-slate-500 mt-1 font-mono text-sm">
            Model Confidence: <span className="font-semibold text-slate-800">{result.confidence}%</span>
          </p>
        </div>
        <button onClick={onReset} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors">
          <RotateCcw size={14} /> New screening
        </button>
      </div>

      {/* Clinical Disclaimer */}
      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 leading-relaxed">
          <strong>Important Clinical Note:</strong> This is an AI-assisted screening assessment. In compliance with clinical storage standards, only structured findings and probabilities are saved—no raw retinal photographs are persisted to the database.
        </p>
      </div>

      {/* Image + Explanation Grid */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Retinal Viewer */}
        <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-sm border border-slate-800">
          <div className="flex items-center justify-between p-2.5 border-b border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-1.5">
              {(["original", "heatmap", "overlay"] as ViewMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === m
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {m === "heatmap" ? "AI Heatmap" : m === "overlay" ? "Grad-CAM Overlay" : "Original Fundus"}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-400 font-mono pr-2">
              Layer 4 CAM
            </span>
          </div>

          <div className="p-6 flex items-center justify-center bg-black min-h-[300px]">
            <RetinalImage
              mode={viewMode}
              size={280}
              risk={result.risk}
              src={result.images.original}
              heatmapSrc={result.images.heatmap}
              overlaySrc={result.images.overlay}
            />
          </div>

          {viewMode !== "original" && (
            <div className="px-5 pb-3 pt-1 flex items-center justify-between border-t border-slate-800/80 bg-slate-900/40">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Model Attention:</span>
                <div className="flex gap-0.5">
                  {["bg-red-500", "bg-amber-500", "bg-yellow-400", "bg-cyan-400", "bg-blue-500"].map(c => (
                    <div key={c} className={`w-4 h-2 ${c} rounded-sm opacity-80`} />
                  ))}
                </div>
                <span>High → Low</span>
              </div>
              <span className="text-[11px] text-slate-500">Peak influential lesions highlighted</span>
            </div>
          )}
        </div>

        {/* Explanation & Probability Distribution */}
        <div className="space-y-4">
          {/* 5-Class Probabilities */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase">Stage Probabilities</p>
              <span className="text-xs text-slate-400 font-mono">Softmax Distribution</span>
            </div>

            <div className="space-y-2">
              {result.probabilities.map(p => {
                const isSelected = p.grade === result.grade;
                return (
                  <div key={p.grade} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className={`font-medium ${isSelected ? "text-slate-900 font-semibold" : "text-slate-600"}`}>
                        Grade {p.grade}: {p.name}
                        {isSelected && <span className="ml-1.5 text-[10px] text-emerald-600 font-bold uppercase">(Predicted)</span>}
                      </span>
                      <span className={`font-mono ${isSelected ? "text-emerald-700 font-bold" : "text-slate-500"}`}>
                        {p.percentage}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isSelected
                            ? result.risk === "high"
                              ? "bg-red-500"
                              : result.risk === "moderate"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                            : "bg-slate-300"
                        }`}
                        style={{ width: `${p.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Findings */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-2">Automated Observations</p>
            <ul className="space-y-1.5">
              {result.findings.map((f, i) => (
                <li key={i} className="text-xs text-slate-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendation */}
          <div className={`border rounded-xl p-4 ${
            result.risk === "high"
              ? "bg-red-50/80 border-red-200"
              : result.risk === "moderate"
              ? "bg-amber-50/80 border-amber-200"
              : "bg-emerald-50/80 border-emerald-200"
          }`}>
            <p className={`text-xs font-semibold tracking-widest uppercase mb-1.5 ${
              result.risk === "high" ? "text-red-700" : result.risk === "moderate" ? "text-amber-700" : "text-emerald-700"
            }`}>
              Recommended Action
            </p>
            <p className={`text-sm font-medium ${
              result.risk === "high" ? "text-red-900" : result.risk === "moderate" ? "text-amber-900" : "text-emerald-900"
            }`}>
              {result.recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
        {canRefer ? (
          <button
            onClick={onReferral}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm text-sm"
          >
            <Send size={15} /> Create Referral Case
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-slate-100 text-slate-500 px-4 py-2.5 rounded-xl text-xs font-medium border border-slate-200">
            <Lock size={13} className="text-slate-400" />
            Referral creation restricted by clinic lead
          </div>
        )}

        <button
          onClick={onReset}
          className="flex items-center gap-2 border border-slate-300 text-slate-700 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm"
        >
          New Screening
        </button>
      </div>
    </div>
  );
}

function ReferralForm({
  patientId,
  result,
  eye,
  worker,
  onSend,
  onBack
}: {
  patientId: string;
  result: PredictResult;
  eye: "left" | "right";
  worker: Worker;
  onSend: () => void;
  onBack: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const handleSend = async () => {
    setIsSubmitting(true);
    const screeningId = generateId("SCR");
    const referralId = generateId("REF");

    // Pure clinical metrics — NO raw images stored
    await createScreeningApi({
      id: screeningId,
      patient_id: patientId,
      worker_id: worker.id,
      worker_name: worker.name,
      date: today,
      eye,
      grade: result.grade,
      stage: result.stage,
      title: result.title,
      risk: result.risk,
      priority: result.priority,
      confidence: result.confidence,
      probabilities: result.probabilities,
      findings: result.findings,
      recommendation: result.recommendation,
      referral_status: "pending"
    });

    await createReferralApi({
      id: referralId,
      screening_id: screeningId,
      patient_id: patientId,
      worker_id: worker.id,
      date: today,
      risk: result.risk,
      confidence: result.confidence,
      priority: result.priority,
      status: "pending",
      worker_notes: notes || `AI screening: ${result.title} (${result.confidence}% confidence). ${result.recommendation}`,
      grade: result.grade,
      stage_title: result.title,
      probabilities: result.probabilities,
      recommendation: result.recommendation,
      findings: result.findings
    });

    setIsSubmitting(false);
    onSend();
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1">Create Referral</p>
        <h2 className="text-xl font-semibold text-slate-900">Send case to ophthalmologist</h2>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
        {[
          ["Patient ID", patientId],
          ["Screening Date", today],
          ["Eye Evaluated", eye === "right" ? "Right eye (OD)" : "Left eye (OS)"],
          ["Submitting Screener", `${worker.name} (${worker.id})`],
          ["AI Screening Result", result.title],
          ["Model Confidence", `${result.confidence}%`],
          ["Referral Priority", result.priority.toUpperCase()],
          ["Data Storage Policy", "Structured metrics only (no image files saved)"]
        ].map(([k, v]) => (
          <div key={k} className="flex px-5 py-3">
            <span className="text-sm text-slate-400 w-48 shrink-0">{k}</span>
            <span className={`text-sm font-medium ${
              k === "AI Screening Result"
                ? result.risk === "high"
                  ? "text-red-600"
                  : result.risk === "moderate"
                  ? "text-amber-600"
                  : "text-emerald-600"
                : k === "Referral Priority"
                ? result.priority === "priority"
                  ? "text-red-700 font-bold"
                  : "text-amber-700"
                : "text-slate-800"
            }`}>
              {v}
            </span>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Clinical notes (optional)</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder="Add clinical observations, visual symptoms, or patient complaints..."
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none shadow-sm"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSend}
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm text-sm"
        >
          <Send size={15} /> {isSubmitting ? "Submitting..." : "Send Case to Specialist"}
        </button>
        <button
          onClick={onBack}
          className="border border-slate-300 text-slate-700 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm"
        >
          Back
        </button>
      </div>
    </div>
  );
}

function SentConfirmation({ onNew }: { onNew: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center text-center py-12">
      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-5">
        <CheckCircle2 size={32} className="text-emerald-600" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 mb-2">Referral successfully submitted</h2>
      <p className="text-slate-500 mb-1">Clinical findings and stage metrics recorded into database.</p>
      <p className="text-sm text-slate-400 mb-8">Dr. Arjun Rao will review the case in the Doctor Portal.</p>
      <div className="flex items-center gap-3">
        <button
          onClick={onNew}
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm text-sm"
        >
          Start New Screening
        </button>
        <button
          onClick={() => navigate("/doctor/cases")}
          className="border border-slate-300 text-slate-700 px-6 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm"
        >
          View in Doctor Queue
        </button>
      </div>
    </div>
  );
}

export default function NewScreening() {
  const [activeWorker, setActiveWorkerState] = useState<Worker>(getActiveWorker());
  const [patients, setPatients] = useState<Patient[]>([]);
  const [phase, setPhase] = useState<Phase>("form");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("overlay");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [patientId, setPatientId] = useState("PT-1001");
  const [age, setAge] = useState("58");
  const [duration, setDuration] = useState("12");
  const [eye, setEye] = useState<"right" | "left">("right");
  const [analysisResult, setAnalysisResult] = useState<PredictResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const w = getActiveWorker();
    setActiveWorkerState(w);
    fetchPatientsApi().then(list => {
      setPatients(list);
      if (list.length > 0) {
        setPatientId(list[0].id);
        setAge(String(list[0].age));
        setDuration(String(list[0].diabetes_duration));
      }
    });
  }, []);

  const handleSelectPatient = (pId: string) => {
    setPatientId(pId);
    const p = patients.find(x => x.id === pId);
    if (p) {
      setAge(String(p.age));
      setDuration(String(p.diabetes_duration));
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleSelectSample = async (path: string) => {
    try {
      setImagePreview(path);
      const res = await fetch(path);
      const blob = await res.blob();
      const file = new File([blob], path.split("/").pop() || "sample.jpg", { type: blob.type || "image/jpeg" });
      setSelectedFile(file);
      setErrorMessage(null);
    } catch {
      setImagePreview(path);
    }
  };

  const canScreen = activeWorker.permissions?.can_screen ?? true;
  const canRefer = activeWorker.permissions?.can_refer ?? true;

  const handleAnalyze = async () => {
    if (!canScreen) {
      setErrorMessage("Access Denied: You do not possess permission to execute AI screenings. Contact clinic administrator.");
      return;
    }

    setErrorMessage(null);
    setPhase("analyzing");
    setProgress(10);
    setCurrentStep("Reading fundus photograph...");

    try {
      const formData = new FormData();

      if (selectedFile) {
        formData.append("file", selectedFile);
      } else if (imagePreview) {
        const res = await fetch(imagePreview);
        const blob = await res.blob();
        formData.append("file", blob, "fundus_scan.jpg");
      } else {
        const res = await fetch("/samples/mod_fundus.jpg");
        const blob = await res.blob();
        formData.append("file", blob, "mod_fundus.jpg");
      }

      formData.append("patient_id", patientId);
      formData.append("eye", eye);

      setProgress(35);
      setCurrentStep("Transmitting to FastAPI backend (localhost:8000)...");

      const progressTimer = setInterval(() => {
        setProgress(prev => (prev < 85 ? prev + Math.floor(Math.random() * 8 + 3) : prev));
      }, 250);

      const response = await fetch("http://localhost:8000/api/predict", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressTimer);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errData.detail || `Server error ${response.status}`);
      }

      setProgress(95);
      setCurrentStep("Processing Grad-CAM heatmap overlay...");

      const data: PredictResult = await response.json();
      setAnalysisResult(data);

      setProgress(100);
      setTimeout(() => {
        setPhase("result");
        setViewMode("overlay");
      }, 400);

    } catch (err: any) {
      console.error("Inference request failed:", err);
      setPhase("form");
      setErrorMessage(
        `Backend connection error: ${err.message}. Please verify FastAPI server is running.`
      );
    }
  };

  const handleReset = () => {
    setPhase("form");
    setProgress(0);
    setImagePreview(null);
    setSelectedFile(null);
    setAnalysisResult(null);
    setErrorMessage(null);
    setViewMode("overlay");
  };

  return (
    <div className="flex h-screen bg-[#f0fdf8] overflow-hidden">
      <Sidebar role="worker" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar
          title="New Retinal Screening"
          subtitle={`Acting Screener: ${activeWorker.name} (${activeWorker.clinic})`}
          role="worker"
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">

            {/* Error Notification */}
            {errorMessage && (
              <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm">
                <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Screening Error</p>
                  <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
                </div>
                <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600">
                  <X size={15} />
                </button>
              </div>
            )}

            {/* Permission Restriction Banner if can_screen is false */}
            {!canScreen && (
              <div className="mb-5 flex items-center gap-3 bg-amber-50 border border-amber-300 rounded-xl p-4 text-amber-900 text-sm">
                <ShieldAlert size={20} className="text-amber-600 shrink-0" />
                <div>
                  <p className="font-semibold">AI Screening Restricted</p>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Your account ({activeWorker.name}) is not currently assigned the <strong>AI Screening</strong> capability. Please contact Dr. Arjun Rao via the Root Doctors Portal.
                  </p>
                </div>
              </div>
            )}

            {phase === "form" && (
              <div className="max-w-2xl mx-auto space-y-5">
                {/* Fundus Image Upload */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-semibold text-slate-800 text-base">Retinal Fundus Photograph</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Upload a macular/disc centered fundus scan for AI grading</p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                      <span className="text-xs font-semibold text-slate-600">Eye:</span>
                      <select
                        value={eye}
                        onChange={e => setEye(e.target.value as "right" | "left")}
                        className="text-xs bg-transparent border-none focus:outline-none font-semibold text-emerald-700 cursor-pointer"
                      >
                        <option value="right">Right eye (OD)</option>
                        <option value="left">Left eye (OS)</option>
                      </select>
                    </div>
                  </div>

                    {!imagePreview ? (
                      <div
                        onDragOver={e => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                          dragging ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-400 hover:bg-slate-50"
                        }`}
                      >
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3 text-emerald-600">
                          <Upload size={24} />
                        </div>
                        <p className="text-slate-800 font-semibold mb-1 text-center">Upload Fundus Scan</p>
                        <p className="text-xs text-slate-400 text-center">Drag and drop or click to choose from your device</p>
                        <p className="text-[11px] text-slate-300 mt-1">JPEG, PNG fundus photographs</p>

                        <div className="mt-5 flex items-center gap-2">
                          <button
                            type="button"
                            className="text-xs font-medium bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
                          >
                            Browse Files
                          </button>
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="bg-black rounded-2xl overflow-hidden flex items-center justify-center h-64 border border-slate-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imagePreview} alt="Selected fundus" className="h-full object-contain" />
                        </div>
                        <button
                          onClick={() => { setImagePreview(null); setSelectedFile(null); }}
                          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black transition-colors"
                          title="Remove image"
                        >
                          <X size={14} />
                        </button>
                        <p className="text-xs text-slate-500 mt-2 text-center font-medium">
                          {selectedFile ? `File: ${selectedFile.name}` : "Sample image selected"}
                        </p>
                      </div>
                    )}

                    {/* Quick Preset Samples */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">Or test with clinical samples:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {SAMPLE_OPTIONS.map(opt => (
                          <button
                            key={opt.path}
                            type="button"
                            onClick={() => handleSelectSample(opt.path)}
                            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 font-medium transition-colors text-center truncate"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleAnalyze}
                    disabled={!canScreen}
                    className={`w-full py-3.5 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 shadow-sm text-sm ${
                      canScreen
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <Activity size={17} />
                    {canScreen ? "Analyze Retinal Image with PyTorch Model" : "Screening Permission Denied"}
                  </button>
                </div>
            )}

            {phase === "analyzing" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 shadow-sm flex items-center justify-center">
                <AnalysisLoader progress={progress} currentStep={currentStep} />
              </div>
            )}

            {phase === "result" && analysisResult && (
              <ResultView
                result={analysisResult}
                canRefer={canRefer}
                onReferral={() => setPhase("referral")}
                onReset={handleReset}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
            )}

            {phase === "referral" && analysisResult && (
              <ReferralForm
                patientId={patientId}
                result={analysisResult}
                eye={eye}
                worker={activeWorker}
                onSend={() => setPhase("sent")}
                onBack={() => setPhase("result")}
              />
            )}

            {phase === "sent" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 shadow-sm">
                <SentConfirmation onNew={handleReset} />
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

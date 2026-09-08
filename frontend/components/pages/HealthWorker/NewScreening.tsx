"use client";
import { useState, useRef, useCallback } from "react";
import { useNavigate } from "@/lib/navigation";
import { Upload, X, Eye, AlertCircle, CheckCircle2, Info, Send, RotateCcw, ZoomIn } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import RetinalImage from "@/components/RetinalImage";
import RiskBadge from "@/components/RiskBadge";
import { addScreening, addReferral, generateId } from "@/lib/store";
import type { RiskLevel } from "@/lib/store";

type Phase = "form" | "analyzing" | "result" | "referral" | "sent";
type ViewMode = "original" | "heatmap" | "overlay";

// Deterministic demo result
const DEMO_RESULT = { risk: "high" as RiskLevel, confidence: 91, priority: "priority" as const };

function AnalysisLoader({ progress }: { progress: number }) {
  const steps = [
    { label: "Preprocessing fundus image", threshold: 15 },
    { label: "Extracting retinal features", threshold: 35 },
    { label: "Running classification model", threshold: 60 },
    { label: "Generating explainability map", threshold: 80 },
    { label: "Calculating confidence score", threshold: 95 },
  ];
  const active = steps.filter(s => progress >= s.threshold);

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-8">
        <div className="w-52 h-52 rounded-full overflow-hidden opacity-80">
          <RetinalImage mode="overlay" size={208} scanAnimate risk="high" />
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-spin" style={{ animationDuration: "4s" }} />
        <div className="absolute inset-2 rounded-full border border-emerald-300/20 animate-spin" style={{ animationDuration: "7s", animationDirection: "reverse" }} />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full font-mono">
          {progress}%
        </div>
      </div>
      <div className="w-full max-w-xs space-y-2.5">
        {steps.map((s, i) => {
          const done = progress >= s.threshold;
          const current = progress >= (steps[i - 1]?.threshold ?? 0) && !done;
          return (
            <div key={i} className="flex items-center gap-2.5">
              {done ? (
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              ) : current ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin shrink-0" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
              )}
              <span className={`text-sm transition-colors ${done ? "text-slate-700" : current ? "text-emerald-700 font-medium" : "text-slate-400"}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResultView({ onReferral, onReset, viewMode, setViewMode }: {
  onReferral: () => void;
  onReset: () => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Result header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1">Screening Result</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-red-600">HIGH RISK</span>
            <RiskBadge risk="high" size="lg" />
          </div>
          <p className="text-slate-500 mt-1 font-mono text-sm">91% model confidence</p>
        </div>
        <button onClick={onReset} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600">
          <RotateCcw size={14} /> New screening
        </button>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 leading-relaxed">
          <strong>Important:</strong> This is an AI-assisted screening result and is not a clinical diagnosis. Final assessment must be performed by a qualified eye-care professional.
        </p>
      </div>

      {/* Image + explanation */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Retinal viewer */}
        <div className="bg-slate-900 rounded-xl overflow-hidden">
          <div className="flex items-center gap-1 p-2 border-b border-slate-700">
            {(["original", "heatmap", "overlay"] as ViewMode[]).map(m => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${viewMode === m ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-white"}`}
              >
                {m === "heatmap" ? "AI Explanation" : m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
          <div className="p-4 flex items-center justify-center bg-black">
            <RetinalImage mode={viewMode} size={260} risk="high" />
          </div>
          {viewMode !== "original" && (
            <div className="px-4 pb-3 flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="flex gap-0.5">
                  {["bg-red-500", "bg-amber-500", "bg-yellow-400", "bg-green-500"].map(c => (
                    <div key={c} className={`w-4 h-2 ${c} rounded-sm opacity-70`} />
                  ))}
                </div>
                <span>High → Low influence</span>
              </div>
            </div>
          )}
        </div>

        {/* Explanation panel */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-3">Why was this case flagged?</p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              The model identified retinal regions that contributed strongly to the high-risk screening prediction. The highlighted areas correspond to regions the model found most influential.
            </p>
            <div className="space-y-2">
              {[
                { label: "Microaneurysm-like regions", pct: 78 },
                { label: "Hemorrhage-like regions", pct: 65 },
                { label: "Vascular abnormalities", pct: 52 },
                { label: "Exudate-like regions", pct: 38 },
              ].map(f => (
                <div key={f.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">{f.label}</span>
                    <span className="text-slate-400 font-mono">{f.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${f.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3 italic">
              * Feature labels are model-derived. They are not clinical findings and require specialist interpretation.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-xs font-semibold tracking-widest text-red-600 uppercase mb-2">Recommended Next Action</p>
            <p className="text-sm font-medium text-red-800">Priority specialist evaluation recommended.</p>
            <p className="text-xs text-red-600 mt-1">This case has been flagged for urgent ophthalmologist referral.</p>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="flex gap-3 pt-2 border-t border-slate-100">
        <button
          onClick={onReferral}
          className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-600 transition-colors"
        >
          <Send size={15} /> Create Referral
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors"
        >
          New Screening
        </button>
      </div>
    </div>
  );
}

function ReferralForm({ patientId, onSend, onBack }: { patientId: string; onSend: () => void; onBack: () => void }) {
  const [notes, setNotes] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const handleSend = () => {
    const screeningId = generateId("SCR");
    const referralId = generateId("REF");

    addScreening({
      id: screeningId,
      patientId,
      date: today,
      eye: "right",
      risk: "high",
      confidence: 91,
      referralStatus: "pending",
      workerName: "Priya Venkat",
    });

    addReferral({
      id: referralId,
      screeningId,
      patientId,
      date: today,
      risk: "high",
      confidence: 91,
      priority: "priority",
      status: "pending",
      workerNotes: notes || "Priority referral. High-risk AI screening result.",
    });

    onSend();
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1">Create Referral</p>
        <h2 className="text-xl font-semibold text-slate-900">Send case to ophthalmologist</h2>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {[
          ["Patient ID", patientId],
          ["Screening Date", today],
          ["AI Screening Result", "High Risk"],
          ["Model Confidence", "91%"],
          ["Referral Priority", "Priority"],
        ].map(([k, v]) => (
          <div key={k} className="flex px-5 py-3">
            <span className="text-sm text-slate-400 w-44 shrink-0">{k}</span>
            <span className={`text-sm font-medium ${k === "AI Screening Result" ? "text-red-600" : k === "Referral Priority" ? "text-red-700" : "text-slate-800"}`}>{v}</span>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-xl p-4 flex items-center gap-4">
        <RetinalImage mode="overlay" size={80} risk="high" />
        <div>
          <p className="text-xs text-slate-400 mb-0.5">AI Explanation attached</p>
          <p className="text-sm text-white font-medium">Heatmap + original image will be sent to specialist</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Clinical notes (optional)</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder="Add any relevant clinical observations..."
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSend}
          className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-600 transition-colors"
        >
          <Send size={15} /> Send to Specialist
        </button>
        <button onClick={onBack} className="border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors">
          Back
        </button>
      </div>
    </div>
  );
}

function SentConfirmation({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-12">
      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-5">
        <CheckCircle2 size={32} className="text-emerald-600" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 mb-2">Referral successfully sent</h2>
      <p className="text-slate-500 mb-1">The case has been forwarded to the ophthalmologist.</p>
      <p className="text-sm text-slate-400 mb-8">Dr. Arjun Rao will review the AI screening result and make the clinical assessment.</p>
      <button onClick={onNew} className="bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-emerald-600 transition-colors">
        Start New Screening
      </button>
    </div>
  );
}

export default function NewScreening() {
  const [phase, setPhase] = useState<Phase>("form");
  const [progress, setProgress] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("original");
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [patientId, setPatientId] = useState("PT-2401");
  const [age, setAge] = useState("58");
  const [duration, setDuration] = useState("12");
  const [eye, setEye] = useState("right");
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(URL.createObjectURL(file));
    } else {
      // Use demo retinal if no image
      setImageFile("demo");
    }
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(URL.createObjectURL(file));
    else setImageFile("demo");
  };

  const handleAnalyze = () => {
    if (!imageFile) { setImageFile("demo"); }
    setPhase("analyzing");
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 6 + 2;
      if (p >= 100) { p = 100; clearInterval(interval); setTimeout(() => { setPhase("result"); setViewMode("original"); }, 600); }
      setProgress(Math.round(p));
    }, 150);
  };

  const handleReset = () => {
    setPhase("form");
    setProgress(0);
    setImageFile(null);
    setViewMode("original");
  };

  return (
    <div className="flex h-screen bg-[#f0fdf8] overflow-hidden">
      <Sidebar role="worker" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title="New Retinal Screening" subtitle="Demo prototype — simulated AI analysis" role="worker" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">

            {phase === "form" && (
              <div className="grid lg:grid-cols-5 gap-6">
                {/* Patient info */}
                <div className="lg:col-span-2 space-y-5">
                  <div className="bg-white border border-slate-100 rounded-xl p-5">
                    <h2 className="font-semibold text-slate-800 mb-4">Patient Information</h2>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-500 block mb-1">Patient ID</label>
                        <input
                          value={patientId}
                          onChange={e => setPatientId(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="PT-XXXX"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 block mb-1">Age</label>
                        <input
                          value={age}
                          onChange={e => setAge(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="58"
                          type="number"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 block mb-1">Diabetes duration (years)</label>
                        <input
                          value={duration}
                          onChange={e => setDuration(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="12"
                          type="number"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 block mb-1">Eye being screened</label>
                        <select
                          value={eye}
                          onChange={e => setEye(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                          <option value="right">Right eye (OD)</option>
                          <option value="left">Left eye (OS)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="bg-white border border-slate-100 rounded-xl p-5">
                    <h2 className="font-semibold text-slate-800 mb-4">Retinal Fundus Image</h2>
                    {!imageFile ? (
                      <div
                        onDragOver={e => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${dragging ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"}`}
                      >
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                          <Upload size={22} className="text-slate-400" />
                        </div>
                        <p className="text-slate-700 font-medium mb-1 text-center">Upload retinal fundus image</p>
                        <p className="text-sm text-slate-400 text-center">Drag and drop or click to browse</p>
                        <p className="text-xs text-slate-300 mt-2">JPG, PNG, TIFF · High-quality fundus photographs</p>
                        <div className="mt-5 flex items-center gap-2">
                          <button className="text-sm bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                            Browse files
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setImageFile("demo"); }}
                            className="text-sm border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            Use demo image
                          </button>
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="bg-black rounded-xl overflow-hidden flex items-center justify-center h-56">
                          {imageFile === "demo" ? (
                            <RetinalImage mode="normal" size={220} />
                          ) : (
                            <img src={imageFile} alt="Uploaded fundus" className="h-full object-contain" />
                          )}
                        </div>
                        <button
                          onClick={() => setImageFile(null)}
                          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
                        >
                          <X size={13} />
                        </button>
                        <p className="text-xs text-slate-400 mt-2 text-center">
                          {imageFile === "demo" ? "Demo retinal image · High-quality fundus assumed" : "Image ready for analysis"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-2 text-xs text-slate-400">
                    <Info size={13} className="shrink-0 mt-0.5" />
                    <span>Image quality check is not required — this platform assumes high-quality fundus images supplied by the screening centre.</span>
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={!imageFile && false}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Eye size={18} />
                    Analyze Retina
                  </button>
                </div>
              </div>
            )}

            {phase === "analyzing" && (
              <div className="bg-white border border-slate-100 rounded-2xl p-10 flex flex-col items-center">
                <h2 className="font-semibold text-slate-800 mb-2">AI Analysis in Progress</h2>
                <p className="text-sm text-slate-400 mb-8">Please wait while the model processes the retinal image…</p>
                <AnalysisLoader progress={progress} />
              </div>
            )}

            {phase === "result" && (
              <div className="bg-white border border-slate-100 rounded-2xl p-6">
                <ResultView
                  onReferral={() => setPhase("referral")}
                  onReset={handleReset}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                />
              </div>
            )}

            {phase === "referral" && (
              <div className="bg-white border border-slate-100 rounded-2xl p-6">
                <ReferralForm patientId={patientId} onSend={() => setPhase("sent")} onBack={() => setPhase("result")} />
              </div>
            )}

            {phase === "sent" && (
              <div className="bg-white border border-slate-100 rounded-2xl p-6">
                <SentConfirmation onNew={handleReset} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

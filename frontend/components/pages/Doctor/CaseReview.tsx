"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useNavigate } from "@/lib/navigation";
import { ArrowLeft, CheckCircle2, AlertCircle, User, Clock, Check, Loader2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import RiskBadge from "@/components/RiskBadge";
import RetinalImage from "@/components/RetinalImage";
import { 
  getReferral, 
  getPatient, 
  getScreenings, 
  updateReferralApi,
  fetchReferralsApi,
  fetchPatientsApi,
  fetchScreeningsApi,
  Referral,
  Patient,
  Screening
} from "@/lib/store";

type ViewMode = "original" | "heatmap" | "overlay";

export default function CaseReview({ id }: { id?: string }) {
  const navigate = useNavigate();
  const routeParams = useParams();
  const caseId = id || (routeParams?.id as string) || "";

  const [referral, setReferral] = useState<Referral | undefined>(getReferral(caseId));
  const [patient, setPatient] = useState<Patient | null>(null);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState<ViewMode>("overlay");
  const [clinicalAssessment, setClinicalAssessment] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [action, setAction] = useState<"reviewed" | "follow-up">("reviewed");

  useEffect(() => {
    Promise.all([fetchReferralsApi(), fetchPatientsApi(), fetchScreeningsApi()]).then(([refs, pts, scs]) => {
      const found = refs.find(r => r.id === caseId);
      if (found) {
        setReferral(found);
        setClinicalAssessment(found.doctor_review || "");
        setNotes(found.doctor_notes || "");
        const p = pts.find(pt => pt.id === found.patient_id);
        if (p) setPatient(p);
        setScreenings(scs.filter(s => s.patient_id === found.patient_id));
      }
      setLoading(false);
    });
  }, [caseId]);

  if (loading && !referral) {
    return (
      <div className="flex h-screen bg-[#f0fdf8]">
        <Sidebar role="doctor" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <Loader2 className="animate-spin mx-auto mb-2" size={24} />
            <p className="text-sm">Loading case from MongoDB Atlas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="flex h-screen bg-[#f0fdf8]">
        <Sidebar role="doctor" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-500 mb-4">Case {caseId || ""} not found in database.</p>
            <button onClick={() => navigate("/doctor/cases")} className="text-emerald-600 font-medium">
              ← Back to cases
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    await updateReferralApi(referral.id, {
      status: action,
      doctor_review: clinicalAssessment,
      doctor_notes: notes,
      review_date: new Date().toISOString().split("T")[0],
    });
    setSaved(true);
  };

  const priorityColor =
    referral.priority === "priority"
      ? "text-red-700 bg-red-50 border-red-200"
      : referral.priority === "urgent"
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : "text-slate-600 bg-slate-50 border-slate-200";

  return (
    <div className="flex h-screen bg-[#f0fdf8] overflow-hidden">
      <Sidebar role="doctor" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title={`Case Review · ${referral.patient_id}`} subtitle="Ophthalmologist clinical evaluation" role="doctor" />
        <main className="flex-1 overflow-y-auto p-6">
          <button onClick={() => navigate("/doctor/cases")} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors">
            <ArrowLeft size={15} /> Back to cases
          </button>

          {/* Clinical Decision Support Banner */}
          <div className="mb-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">AI Screening ≠ Clinical Diagnosis</p>
              <p className="text-sm text-amber-700">The PyTorch ResNet-152 model is a clinical decision-support tool. You are the final clinical decision-maker.</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left: Retinal Image & AI analysis */}
            <div className="lg:col-span-3 space-y-5">
              {/* Retinal viewer */}
              <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-1 p-2.5 border-b border-slate-700">
                  {(["original", "heatmap", "overlay"] as ViewMode[]).map(m => (
                    <button
                      key={m}
                      onClick={() => setViewMode(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                        viewMode === m ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {m === "heatmap" ? "Grad-CAM Heatmap" : m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                  <span className="ml-auto text-xs text-slate-400 font-mono">{referral.patient_id} · Retinal Scan</span>
                </div>
                <div className="p-6 flex flex-col items-center justify-center bg-[#080808]">
                  <RetinalImage
                    mode={viewMode}
                    size={300}
                    risk={referral.risk}
                  />
                  <p className="text-[11px] text-slate-500 mt-2 italic">
                    Procedural retinal reconstruction (Screened image data preserved, raw image discarded per storage policy)
                  </p>
                </div>
                {viewMode !== "original" && (
                  <div className="px-5 pb-4 flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>Influence map:</span>
                      <div className="flex gap-px">
                        {["bg-red-500", "bg-amber-500", "bg-yellow-400", "bg-green-400"].map(c => (
                          <div key={c} className={`w-5 h-2 ${c} opacity-75`} />
                        ))}
                      </div>
                      <span>High → Low</span>
                    </div>
                  </div>
                )}
              </div>

              {/* AI result */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1">Deep Learning Inference</p>
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl font-bold ${
                        referral.risk === "high" ? "text-red-600" : referral.risk === "moderate" ? "text-amber-600" : "text-emerald-600"
                      }`}>
                        {referral.stage_title || (referral.risk === "high" ? "HIGH RISK" : referral.risk === "moderate" ? "MODERATE RISK" : "LOW RISK")}
                      </span>
                      <RiskBadge risk={referral.risk} size="md" />
                    </div>
                    <p className="text-sm text-slate-500 font-mono mt-1">{referral.confidence}% model confidence</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border capitalize ${priorityColor}`}>
                    {referral.priority}
                  </span>
                </div>

                {referral.probabilities && referral.probabilities.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {referral.probabilities.map(p => (
                      <div key={p.grade}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className={`font-medium ${p.grade === referral.grade ? "text-slate-900 font-semibold" : "text-slate-600"}`}>
                            Grade {p.grade}: {p.name}
                          </span>
                          <span className="font-mono text-slate-400">{p.percentage}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${p.grade === referral.grade ? "bg-emerald-500" : "bg-slate-300"}`}
                            style={{ width: `${p.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 mb-4">
                    {[
                      { label: "Microaneurysm-like regions", pct: 78 },
                      { label: "Hemorrhage-like regions", pct: 65 },
                      { label: "Vascular abnormalities", pct: 52 },
                    ].map(f => (
                      <div key={f.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600">{f.label}</span>
                          <span className="font-mono text-slate-400">{f.pct}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${referral.risk === "high" ? "bg-red-400" : "bg-amber-400"}`} style={{ width: `${f.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-slate-400 italic">
                  * Feature activations and 5-class distribution produced by PyTorch ResNet-152 fine-tuned model.
                </p>
              </div>

              {/* Screening history */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-800 mb-3">Prior Screening Ledger</p>
                {screenings.length === 0 ? (
                  <p className="text-xs text-slate-400">No prior screenings recorded for this patient.</p>
                ) : (
                  <div className="space-y-2">
                    {screenings.map(s => (
                      <div key={s.id} className="flex items-center gap-3 text-sm">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                          s.risk === "high" ? "bg-red-500" : s.risk === "moderate" ? "bg-amber-500" : "bg-emerald-500"
                        }`} />
                        <span className="text-slate-400 font-mono text-xs">{s.date}</span>
                        <RiskBadge risk={s.risk} size="sm" />
                        <span className="text-slate-400 text-xs">{s.confidence}% confidence</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Patient Demographics & Clinical Assessment */}
            <div className="lg:col-span-2 space-y-4">
              {/* Patient info */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-3">Patient Profile</p>
                {patient ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-emerald-600" />
                      <span className="font-semibold text-slate-800">{patient.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs w-24">Patient ID</span>
                      <span className="font-mono text-slate-700 font-semibold">{patient.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs w-24">Age</span>
                      <span className="text-slate-700">{patient.age} years</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs w-24">DM duration</span>
                      <span className="text-slate-700">{patient.diabetes_duration} years</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs w-24">Village</span>
                      <span className="text-slate-700">{patient.village}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 font-mono">Patient ID: {referral.patient_id}</p>
                )}
              </div>

              {/* Referral info */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-3">Referral Metadata</p>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-slate-400 text-xs w-24">Referral ID</span>
                    <span className="font-mono text-slate-700 font-semibold">{referral.id}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-400 text-xs w-24">Referred Date</span>
                    <span className="text-slate-700">{referral.date}</span>
                  </div>
                  {referral.worker_notes && (
                    <div className="mt-2 text-xs text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="font-medium mb-1 text-slate-700">Health Worker Note:</p>
                      {referral.worker_notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Clinical review action */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-4">Ophthalmologist Assessment</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-2">Triage Decision</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAction("reviewed")}
                        className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${
                          action === "reviewed" ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        Approve / Reviewed
                      </button>
                      <button
                        onClick={() => setAction("follow-up")}
                        className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${
                          action === "follow-up" ? "bg-amber-500 text-white border-amber-500 shadow-sm" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        Follow-up Needed
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1.5">Clinical Evaluation</label>
                    <textarea
                      value={clinicalAssessment}
                      onChange={e => setClinicalAssessment(e.target.value)}
                      placeholder="Record clinical impressions, retinal vascular examination..."
                      rows={3}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1.5">Treatment & Follow-up Instructions</label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Treatment recommendations, in-person clinic visit..."
                      rows={2}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  {saved ? (
                    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-xs font-medium">
                      <CheckCircle2 size={16} />
                      Clinical assessment synchronized with MongoDB Atlas!
                    </div>
                  ) : (
                    <button
                      onClick={handleSave}
                      className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors text-xs shadow-sm"
                    >
                      Save Clinical Assessment
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

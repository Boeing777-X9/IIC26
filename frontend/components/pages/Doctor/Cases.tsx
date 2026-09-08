"use client";
import { useState } from "react";
import { useNavigate } from "@/lib/navigation";
import { Filter, ChevronRight, Stethoscope } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import RiskBadge from "@/components/RiskBadge";
import RetinalImage from "@/components/RetinalImage";
import { getReferrals, getPatient } from "@/lib/store";

export default function Cases() {
  const navigate = useNavigate();
  const referrals = getReferrals();
  const [filter, setFilter] = useState<"all" | "awaiting" | "reviewed">("awaiting");

  const filtered = referrals.filter(r => {
    if (filter === "awaiting") return r.status !== "reviewed";
    if (filter === "reviewed") return r.status === "reviewed";
    return true;
  });

  return (
    <div className="flex h-screen bg-[#f0fdf8] overflow-hidden">
      <Sidebar role="doctor" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title="Cases Awaiting Review" subtitle="Referrals assigned to you" role="doctor" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex gap-2 mb-5">
            {[["all", "All Cases"], ["awaiting", "Awaiting Review"], ["reviewed", "Reviewed"]].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setFilter(v as any)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === v ? "bg-emerald-500 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-400 text-sm">No cases in this category.</div>
            )}
            {filtered.map(r => {
              const patient = getPatient(r.patientId);
              const isReviewed = r.status === "reviewed";
              const priorityColor = r.priority === "priority" ? "text-red-700 bg-red-50 border-red-200" : r.priority === "urgent" ? "text-amber-700 bg-amber-50 border-amber-200" : "text-slate-600 bg-slate-50 border-slate-200";
              return (
                <div key={r.id} className="bg-white border border-slate-100 rounded-xl p-5 hover:border-emerald-200 hover:shadow-sm transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-black shrink-0">
                      <RetinalImage mode={r.risk === "high" ? "overlay" : "normal"} size={64} risk={r.risk} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="font-mono text-sm font-medium text-slate-700">{r.patientId}</span>
                        <RiskBadge risk={r.risk} size="sm" />
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border capitalize ${priorityColor}`}>{r.priority}</span>
                        {isReviewed && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium text-emerald-700 bg-emerald-50 border border-emerald-200">Reviewed</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mb-0.5">{patient?.name} · {r.confidence}% model confidence</p>
                      <p className="text-xs text-slate-400">Referred: {r.date}</p>
                      {r.doctorNotes && isReviewed && (
                        <p className="text-xs text-slate-500 mt-2 bg-slate-50 rounded-lg px-3 py-2">
                          <strong>Your note:</strong> {r.doctorNotes}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/doctor/cases/${r.id}`)}
                      className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 shrink-0"
                    >
                      <Stethoscope size={14} />
                      {isReviewed ? "View" : "Review"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

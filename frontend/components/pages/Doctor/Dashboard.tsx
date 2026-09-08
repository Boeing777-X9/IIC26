"use client";
import { useNavigate } from "@/lib/navigation";
import { ClipboardList, AlertCircle, Clock, CheckCircle2, ChevronRight, Stethoscope, TrendingUp } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import RiskBadge from "@/components/RiskBadge";
import RetinalImage from "@/components/RetinalImage";
import { getReferrals, getPatient } from "@/lib/store";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const referrals = getReferrals();

  const awaiting = referrals.filter(r => ["pending", "viewed", "under-review"].includes(r.status)).length;
  const highPriority = referrals.filter(r => r.priority === "priority" && r.status !== "reviewed").length;
  const urgent = referrals.filter(r => r.priority === "urgent" && r.status !== "reviewed").length;
  const reviewed = referrals.filter(r => r.status === "reviewed").length;
  const needsAttention = referrals.filter(r => r.status !== "reviewed");

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#f0fdf8" }}>
      <Sidebar role="doctor" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title="Overview" subtitle="Dr. Arjun Rao · Ophthalmology" role="doctor" />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Doctor welcome strip */}
          <div className="relative overflow-hidden rounded-2xl p-6 flex items-center justify-between"
            style={{ background: "linear-gradient(135deg, #0d2e24 0%, #065f46 60%, #10b981 100%)" }}>
            <div className="absolute right-0 top-0 w-72 h-72 rounded-full opacity-10" style={{ background: "white", transform: "translate(25%, -25%)" }} />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 text-emerald-200 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-3">
                <AlertCircle size={10} /> AI Screening — not a clinical diagnosis
              </div>
              <h2 className="text-white text-xl font-bold mb-1">Dr. Arjun Rao</h2>
              <p className="text-emerald-200 text-sm">
                <strong className="text-white">{awaiting} case{awaiting !== 1 ? "s" : ""}</strong> awaiting your clinical review ·{" "}
                <strong className="text-red-300">{highPriority} priority</strong>
              </p>
            </div>
            <div className="relative z-10 flex gap-3">
              <button onClick={() => navigate("/doctor/cases")}
                className="flex items-center gap-2 bg-white text-emerald-800 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-50 transition-colors shadow-lg">
                <Stethoscope size={15} /> Review Cases
              </button>
              <button onClick={() => navigate("/doctor/analytics")}
                className="flex items-center gap-2 bg-emerald-800/40 text-white border border-emerald-400/30 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-800/60 transition-colors">
                <TrendingUp size={15} /> Analytics
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Cases awaiting review" value={awaiting} icon={<ClipboardList size={18} />} accent="amber" />
            <StatCard label="Priority cases" value={highPriority} icon={<AlertCircle size={18} />} accent="red" />
            <StatCard label="Urgent cases" value={urgent} icon={<Clock size={18} />} accent="amber" />
            <StatCard label="Reviewed" value={reviewed} icon={<CheckCircle2 size={18} />} accent="teal" />
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {/* Cases table */}
            <div className="lg:col-span-2 bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#d1fae5" }}>
              <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: "#d1fae5" }}>
                <div>
                  <h2 className="font-bold text-[#0d2e24] text-sm">Cases requiring attention</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Ordered by referral priority</p>
                </div>
                <button onClick={() => navigate("/doctor/cases")} className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  View all <ChevronRight size={12} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f0fdf8", background: "#f9fffe" }}>
                      {["Patient", "Date", "Risk", "Confidence", "Priority", "Status", ""].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {needsAttention.map((r, i) => {
                      const pc = r.priority === "priority" ? "text-red-600 bg-red-50 border-red-200" : r.priority === "urgent" ? "text-amber-600 bg-amber-50 border-amber-200" : "text-slate-600 bg-slate-50 border-slate-200";
                      const statusMap: Record<string, string> = { pending: "Pending", viewed: "Viewed", "under-review": "Under Review" };
                      return (
                        <tr key={r.id} className="hover:bg-emerald-50/40 transition-colors" style={{ borderBottom: i < needsAttention.length - 1 ? "1px solid #f0fdf8" : "none" }}>
                          <td className="px-4 py-3 font-mono text-xs font-semibold text-[#0d2e24]">{r.patientId}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{r.date}</td>
                          <td className="px-4 py-3"><RiskBadge risk={r.risk} size="sm" /></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-12 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${r.confidence}%` }} />
                              </div>
                              <span className="text-xs font-mono text-slate-500">{r.confidence}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border capitalize ${pc}`}>{r.priority}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">{statusMap[r.status] ?? r.status}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => navigate(`/doctor/cases/${r.id}`)} className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                              Review <ChevronRight size={11} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {needsAttention.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-10 text-slate-400 text-sm">All cases reviewed.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: next case + priority breakdown */}
            <div className="space-y-4">
              {needsAttention[0] && (
                <div className="bg-white border rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                  style={{ borderColor: "#fecaca" }}
                  onClick={() => navigate(`/doctor/cases/${needsAttention[0].id}`)}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold tracking-widest text-red-600 uppercase">Next Priority Case</span>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <div className="bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center mb-3" style={{ height: 120 }}>
                      <RetinalImage mode="overlay" size={110} risk={needsAttention[0].risk} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#0d2e24] text-sm">{needsAttention[0].patientId}</p>
                        <p className="text-xs text-slate-400">{needsAttention[0].confidence}% model confidence</p>
                      </div>
                      <RiskBadge risk={needsAttention[0].risk} size="sm" />
                    </div>
                    <button className="mt-3 w-full bg-emerald-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                      <Stethoscope size={14} /> Review Case
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white border rounded-2xl p-4" style={{ borderColor: "#d1fae5" }}>
                <p className="text-xs font-bold text-[#0d2e24] uppercase tracking-wide mb-3">Priority Breakdown</p>
                {[
                  { label: "Priority", count: highPriority, color: "bg-red-400", pct: 45 },
                  { label: "Urgent", count: urgent, color: "bg-amber-400", pct: 35 },
                  { label: "Routine", count: Math.max(0, awaiting - highPriority - urgent), color: "bg-emerald-400", pct: 20 },
                ].map(r => (
                  <div key={r.label} className="mb-2.5">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 font-medium">{r.label}</span>
                      <span className="font-mono text-slate-400">{r.count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

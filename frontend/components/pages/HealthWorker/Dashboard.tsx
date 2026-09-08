"use client";
import { useNavigate } from "@/lib/navigation";
import { Eye, Send, AlertCircle, Clock, Plus, ArrowRight, ChevronRight, TrendingUp, Zap } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import RiskBadge from "@/components/RiskBadge";
import RetinalImage from "@/components/RetinalImage";
import { getScreenings, getPatient, getReferrals } from "@/lib/store";

function ReferralStatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-xs text-slate-300">—</span>;
  const map: Record<string, { label: string; cls: string }> = {
    pending:       { label: "Pending",      cls: "text-amber-700 bg-amber-50 border border-amber-200" },
    viewed:        { label: "Viewed",       cls: "text-blue-700 bg-blue-50 border border-blue-200" },
    "under-review":{ label: "Under Review", cls: "text-violet-700 bg-violet-50 border border-violet-200" },
    reviewed:      { label: "Reviewed",     cls: "text-emerald-700 bg-emerald-50 border border-emerald-200" },
    "follow-up":   { label: "Follow-up",    cls: "text-orange-700 bg-orange-50 border border-orange-200" },
  };
  const c = map[status] ?? { label: status, cls: "text-slate-500 bg-slate-50 border border-slate-200" };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.cls}`}>{c.label}</span>;
}

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const screenings = getScreenings();
  const referrals = getReferrals();
  const today = new Date().toISOString().split("T")[0];
  const todayCount = screenings.filter(s => s.date === today).length + 4;
  const referralCount = referrals.filter(r => ["pending", "viewed"].includes(r.status)).length;
  const highRisk = screenings.filter(s => s.risk === "high").length;
  const pending = referrals.filter(r => r.status === "pending").length;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#f0fdf8" }}>
      <Sidebar role="worker" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title="Overview" subtitle="CHC Tirunelveli · Demo prototype" role="worker" />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Hero welcome strip */}
          <div className="relative overflow-hidden rounded-2xl p-6 flex items-center justify-between"
            style={{ background: "linear-gradient(135deg, #065f46 0%, #10b981 100%)" }}>
            <div className="absolute right-0 top-0 w-64 h-64 rounded-full opacity-10" style={{ background: "white", transform: "translate(30%, -30%)" }} />
            <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full opacity-10" style={{ background: "white", transform: "translateY(40%)" }} />
            <div className="relative z-10">
              <p className="text-emerald-200 text-[11px] font-bold tracking-widest uppercase mb-1">Healthcare Worker · CHC Tirunelveli</p>
              <h2 className="text-white text-xl font-bold mb-1">Priya Venkat</h2>
              <p className="text-emerald-100 text-sm">You have <strong className="text-white">{pending} referral{pending !== 1 ? "s" : ""}</strong> awaiting specialist review</p>
            </div>
            <div className="relative z-10 flex gap-3">
              <button onClick={() => navigate("/health-worker/screening/new")}
                className="flex items-center gap-2 bg-white text-emerald-700 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-50 transition-colors shadow-lg">
                <Plus size={15} /> New Screening
              </button>
              <button onClick={() => navigate("/health-worker/referrals")}
                className="flex items-center gap-2 bg-emerald-700/40 text-white border border-emerald-400/30 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700/60 transition-colors">
                <Send size={15} /> Referrals
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Screenings today" value={todayCount} icon={<Eye size={18} />} accent="teal" trend="+2 vs yesterday" trendUp />
            <StatCard label="Requiring referral" value={referralCount} icon={<Send size={18} />} accent="amber" />
            <StatCard label="High-risk cases" value={highRisk} icon={<AlertCircle size={18} />} accent="red" />
            <StatCard label="Pending reviews" value={pending} icon={<Clock size={18} />} accent="slate" />
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {/* Recent screenings table */}
            <div className="lg:col-span-2 bg-white rounded-2xl overflow-hidden border" style={{ borderColor: "#d1fae5" }}>
              <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: "#d1fae5" }}>
                <div>
                  <h2 className="font-bold text-[#0d2e24] text-sm">Recent Screenings</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Latest AI-assisted screening results</p>
                </div>
                <button onClick={() => navigate("/health-worker/history")} className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-semibold">
                  View all <ChevronRight size={12} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f0fdf8", background: "#f9fffe" }}>
                      {["Patient ID", "Date", "Eye", "Confidence", "Risk", "Referral", ""].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {screenings.slice(0, 6).map((s, i) => (
                      <tr key={s.id} className="hover:bg-emerald-50/40 transition-colors" style={{ borderBottom: i < 5 ? "1px solid #f0fdf8" : "none" }}>
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-[#0d2e24]">{s.patientId}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{s.date}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs capitalize">{s.eye}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${s.confidence}%` }} />
                            </div>
                            <span className="text-xs font-mono text-slate-500">{s.confidence}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><RiskBadge risk={s.risk} size="sm" /></td>
                        <td className="px-4 py-3"><ReferralStatusBadge status={s.referralStatus} /></td>
                        <td className="px-4 py-3">
                          <button onClick={() => navigate("/health-worker/screening/new")} className="text-emerald-500 hover:text-emerald-700">
                            <ArrowRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Quick AI screening card */}
              <div className="bg-white rounded-2xl border overflow-hidden cursor-pointer hover:shadow-md transition-all group"
                style={{ borderColor: "#d1fae5" }}
                onClick={() => navigate("/health-worker/screening/new")}>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center">
                      <Zap size={15} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0d2e24]">New AI Screening</p>
                      <p className="text-[10px] text-slate-400">Upload & analyze instantly</p>
                    </div>
                  </div>
                  <div className="bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center" style={{ height: 120 }}>
                    <RetinalImage mode="overlay" size={110} risk="high" />
                  </div>
                  <button className="mt-3 w-full bg-emerald-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                    <Plus size={14} /> Start Screening
                  </button>
                </div>
              </div>

              {/* Risk summary */}
              <div className="bg-white rounded-2xl border p-4" style={{ borderColor: "#d1fae5" }}>
                <p className="text-xs font-bold text-[#0d2e24] uppercase tracking-wide mb-3">Risk Distribution</p>
                <div className="space-y-2.5">
                  {[
                    { label: "Low Risk", count: screenings.filter(s => s.risk === "low").length, color: "bg-emerald-400", pct: 50 },
                    { label: "Moderate", count: screenings.filter(s => s.risk === "moderate").length, color: "bg-amber-400", pct: 33 },
                    { label: "High Risk", count: screenings.filter(s => s.risk === "high").length, color: "bg-red-400", pct: 33 },
                  ].map(r => (
                    <div key={r.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 font-medium">{r.label}</span>
                        <span className="font-mono text-slate-400">{r.count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${r.color} rounded-full transition-all`} style={{ width: `${r.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

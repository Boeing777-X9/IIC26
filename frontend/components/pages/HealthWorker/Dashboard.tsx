"use client";
import { useNavigate } from "@/lib/navigation";
import { Eye, Send, AlertCircle, Clock, Plus, ArrowRight, ChevronRight } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import RiskBadge from "@/components/RiskBadge";
import { getScreenings, getPatient, getReferrals } from "@/lib/store";

function ReferralStatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-xs text-slate-400">—</span>;
  const map: Record<string, { label: string; color: string }> = {
    pending: { label: "Pending", color: "text-amber-700 bg-amber-50" },
    viewed: { label: "Viewed", color: "text-blue-700 bg-blue-50" },
    "under-review": { label: "Under Review", color: "text-indigo-700 bg-indigo-50" },
    reviewed: { label: "Reviewed", color: "text-emerald-700 bg-emerald-50" },
    "follow-up": { label: "Follow-up", color: "text-orange-700 bg-orange-50" },
  };
  const c = map[status] ?? { label: status, color: "text-slate-600 bg-slate-50" };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.color}`}>{c.label}</span>
  );
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
    <div className="flex h-screen bg-[#f0fdf8] overflow-hidden">
      <Sidebar role="worker" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title="Overview" subtitle="Priya Venkat · CHC Tirunelveli" role="worker" />
        <main className="flex-1 overflow-y-auto p-6">

          {/* Demo banner */}
          <div className="mb-5 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
            <AlertCircle size={14} className="text-emerald-600" />
            <p className="text-sm text-emerald-700 font-medium">Demo prototype — all data is simulated for demonstration purposes.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Screenings today" value={todayCount} icon={<Eye size={18} />} sub="Including demo data" accent="teal" />
            <StatCard label="Requiring referral" value={referralCount} icon={<Send size={18} />} sub="Active referrals" accent="amber" />
            <StatCard label="High-risk cases" value={highRisk} icon={<AlertCircle size={18} />} sub="Needs attention" accent="red" />
            <StatCard label="Pending reviews" value={pending} icon={<Clock size={18} />} sub="Awaiting specialist" accent="slate" />
          </div>

          {/* Quick action */}
          <div className="mb-6">
            <button
              onClick={() => navigate("/health-worker/screening/new")}
              className="inline-flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-100"
            >
              <Plus size={16} />
              New Screening
            </button>
          </div>

          {/* Recent screenings */}
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Recent Screenings</h2>
              <button onClick={() => navigate("/health-worker/history")} className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium">
                View all <ChevronRight size={12} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Patient ID", "Date", "Eye", "AI Result", "Risk", "Referral Status", "Action"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-400 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {screenings.slice(0, 8).map(s => {
                    const patient = getPatient(s.patientId);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">{s.patientId}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{s.date}</td>
                        <td className="px-4 py-3 text-slate-500 capitalize">{s.eye}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono text-slate-500">{s.confidence}% confidence</span>
                        </td>
                        <td className="px-4 py-3">
                          <RiskBadge risk={s.risk} size="sm" />
                        </td>
                        <td className="px-4 py-3">
                          <ReferralStatusBadge status={s.referralStatus} />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => navigate("/health-worker/screening/new")}
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                          >
                            View <ArrowRight size={11} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

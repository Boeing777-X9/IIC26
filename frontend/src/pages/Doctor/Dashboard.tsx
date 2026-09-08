import { useNavigate } from "react-router-dom";
import { ClipboardList, AlertCircle, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import StatCard from "../../components/StatCard";
import RiskBadge from "../../components/RiskBadge";
import { getReferrals, getPatient } from "../../store";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const referrals = getReferrals();

  const awaiting = referrals.filter(r => ["pending", "viewed", "under-review"].includes(r.status)).length;
  const highPriority = referrals.filter(r => r.priority === "priority" && r.status !== "reviewed").length;
  const urgent = referrals.filter(r => r.priority === "urgent" && r.status !== "reviewed").length;
  const reviewed = referrals.filter(r => r.status === "reviewed").length;

  const needsAttention = referrals.filter(r => r.status !== "reviewed");

  return (
    <div className="flex h-screen bg-[#f0fdf8] overflow-hidden">
      <Sidebar role="doctor" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title="Overview" subtitle="Dr. Arjun Rao · Ophthalmology" role="doctor" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-5 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
            <AlertCircle size={14} className="text-emerald-600" />
            <p className="text-sm text-emerald-700 font-medium">Demo prototype — all patient data is simulated. AI screening results are not clinical diagnoses.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Cases awaiting review" value={awaiting} icon={<ClipboardList size={18} />} accent="amber" />
            <StatCard label="Priority cases" value={highPriority} icon={<AlertCircle size={18} />} accent="red" />
            <StatCard label="Urgent cases" value={urgent} icon={<Clock size={18} />} accent="amber" />
            <StatCard label="Recently reviewed" value={reviewed} icon={<CheckCircle2 size={18} />} accent="teal" />
          </div>

          {/* Cases requiring attention */}
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Cases requiring attention</h2>
              <button onClick={() => navigate("/doctor/cases")} className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium">
                View all <ChevronRight size={12} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-50">
                    {["Patient ID", "Date", "Risk", "AI Confidence", "Priority", "Status", "Action"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-400 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {needsAttention.map(r => {
                    const patient = getPatient(r.patientId);
                    const priorityColor = r.priority === "priority" ? "text-red-600 bg-red-50" : r.priority === "urgent" ? "text-amber-600 bg-amber-50" : "text-slate-600 bg-slate-50";
                    const statusMap: Record<string, string> = { pending: "Pending", viewed: "Viewed", "under-review": "Under Review" };
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">{r.patientId}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.date}</td>
                        <td className="px-4 py-3"><RiskBadge risk={r.risk} size="sm" /></td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.confidence}%</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${priorityColor}`}>{r.priority}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{statusMap[r.status] ?? r.status}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => navigate(`/doctor/cases/${r.id}`)}
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                          >
                            Review <ChevronRight size={11} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {needsAttention.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-sm">No cases awaiting review.</div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

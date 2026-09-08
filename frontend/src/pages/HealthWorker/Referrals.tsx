import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, ChevronRight } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import RiskBadge from "../../components/RiskBadge";
import { getReferrals, getPatient } from "../../store";
import type { RiskLevel } from "../../store";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "text-amber-700 bg-amber-50 border-amber-200" },
  viewed: { label: "Viewed", color: "text-blue-700 bg-blue-50 border-blue-200" },
  "under-review": { label: "Under Review", color: "text-indigo-700 bg-indigo-50 border-indigo-200" },
  reviewed: { label: "Reviewed", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  "follow-up": { label: "Follow-up Required", color: "text-orange-700 bg-orange-50 border-orange-200" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  priority: { label: "Priority", color: "text-red-700 bg-red-50" },
  urgent: { label: "Urgent", color: "text-amber-700 bg-amber-50" },
  routine: { label: "Routine", color: "text-slate-600 bg-slate-50" },
};

export default function Referrals() {
  const navigate = useNavigate();
  const referrals = getReferrals();
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = referrals.filter(r => {
    if (riskFilter !== "all" && r.risk !== riskFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="flex h-screen bg-[#f0fdf8] overflow-hidden">
      <Sidebar role="worker" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title="Referrals" subtitle="Cases sent to ophthalmologist" role="worker" />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-5">
            <Filter size={14} className="text-slate-400" />
            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All risk levels</option>
              <option value="high">High risk</option>
              <option value="moderate">Moderate risk</option>
              <option value="low">Low risk</option>
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="viewed">Viewed</option>
              <option value="under-review">Under Review</option>
              <option value="reviewed">Reviewed</option>
              <option value="follow-up">Follow-up</option>
            </select>
          </div>

          {/* List */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-400 text-sm">No referrals match the selected filters.</div>
            )}
            {filtered.map(r => {
              const patient = getPatient(r.patientId);
              const sc = statusConfig[r.status] ?? { label: r.status, color: "text-slate-600 bg-slate-50 border-slate-200" };
              const pc = priorityConfig[r.priority] ?? { label: r.priority, color: "text-slate-600 bg-slate-50" };
              return (
                <div key={r.id} className="bg-white border border-slate-100 rounded-xl p-5 hover:border-emerald-200 hover:shadow-sm transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="font-mono text-sm text-slate-600 font-medium">{r.id}</span>
                        <span className="text-slate-300">·</span>
                        <span className="font-mono text-xs text-slate-400">{r.patientId}</span>
                        <RiskBadge risk={r.risk} size="sm" />
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${sc.color}`}>{sc.label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pc.color}`}>{pc.label}</span>
                      </div>
                      <div className="flex gap-6 text-xs text-slate-400">
                        <span>Patient: {patient?.name ?? r.patientId}</span>
                        <span>Date: {r.date}</span>
                        <span>Confidence: {r.confidence}%</span>
                      </div>
                      {r.doctorNotes && (
                        <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                          <strong>Doctor note:</strong> {r.doctorNotes}
                        </div>
                      )}
                    </div>
                    <button className="text-emerald-600 hover:text-emerald-700 shrink-0">
                      <ChevronRight size={16} />
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

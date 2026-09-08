"use client";
import { useState, useEffect } from "react";
import { 
  Filter, 
  ChevronRight, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ShieldAlert,
  Search,
  MessageSquare
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import RiskBadge from "@/components/RiskBadge";
import { 
  Referral, 
  Patient, 
  Worker, 
  getActiveWorker, 
  fetchReferralsApi, 
  fetchPatientsApi,
  type RiskLevel 
} from "@/lib/store";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "text-amber-700 bg-amber-50 border-amber-200" },
  viewed: { label: "Viewed", color: "text-blue-700 bg-blue-50 border-blue-200" },
  "under-review": { label: "Under Review", color: "text-indigo-700 bg-indigo-50 border-indigo-200" },
  reviewed: { label: "Reviewed", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  "follow-up": { label: "Follow-up Required", color: "text-orange-700 bg-orange-50 border-orange-200" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  priority: { label: "High Priority", color: "text-red-700 bg-red-50 border-red-200" },
  urgent: { label: "Urgent", color: "text-amber-700 bg-amber-50 border-amber-200" },
  routine: { label: "Routine", color: "text-slate-600 bg-slate-50 border-slate-200" },
};

export default function Referrals() {
  const [activeWorker, setActiveWorkerState] = useState<Worker | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const worker = getActiveWorker();
    setActiveWorkerState(worker);

    Promise.all([fetchReferralsApi(), fetchPatientsApi()]).then(([refs, pts]) => {
      setReferrals(refs);
      setPatients(pts);
      setLoading(false);
    });
  }, []);

  const canRefer = activeWorker?.permissions?.can_refer ?? true;

  const filtered = referrals.filter(r => {
    if (riskFilter !== "all" && r.risk !== riskFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    
    if (search.trim()) {
      const q = search.toLowerCase();
      const patient = patients.find(p => p.id === (r.patient_id || (r as any).patientId));
      const pName = patient?.name?.toLowerCase() || "";
      const rId = r.id.toLowerCase();
      const pId = (r.patient_id || (r as any).patientId || "").toLowerCase();
      if (!pName.includes(q) && !rId.includes(q) && !pId.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const pendingCount = referrals.filter(r => r.status === "pending").length;
  const underReviewCount = referrals.filter(r => r.status === "under-review" || r.status === "viewed").length;
  const reviewedCount = referrals.filter(r => r.status === "reviewed" || r.status === "follow-up").length;

  return (
    <div className="flex h-screen bg-[#f0fdf8] overflow-hidden">
      <Sidebar role="worker" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title="Ophthalmology Referrals" subtitle="Cases escalated to ophthalmologist consultation" role="worker" />
        
        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Permission restriction banner if referral disabled */}
          {!canRefer && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-800">
              <ShieldAlert size={16} className="text-amber-600 shrink-0" />
              <span>
                <strong>Referral Restricted:</strong> Root Doctor has restricted your account from creating new referrals. You may still view the status of existing cases.
              </span>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Pending Doctor Review</p>
                <p className="text-xl font-bold text-slate-800">{pendingCount}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Under Triage / Review</p>
                <p className="text-xl font-bold text-slate-800">{underReviewCount}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Completed Reviews</p>
                <p className="text-xl font-bold text-slate-800">{reviewedCount}</p>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search referral ID, patient name..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={13} className="text-slate-400" />
              <select
                value={riskFilter}
                onChange={e => setRiskFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Risk Levels</option>
                <option value="high">High Risk</option>
                <option value="moderate">Moderate Risk</option>
                <option value="low">Low Risk</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="viewed">Viewed</option>
                <option value="under-review">Under Review</option>
                <option value="reviewed">Reviewed</option>
                <option value="follow-up">Follow-up</option>
              </select>
            </div>
          </div>

          {/* Referral Cards */}
          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
              <div className="animate-spin w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full mr-2" />
              Loading referrals from database...
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center max-w-md mx-auto my-8">
              <Send size={32} className="mx-auto text-slate-300 mb-2" />
              <h3 className="font-semibold text-slate-700 text-sm">No referrals match the criteria</h3>
              <p className="text-xs text-slate-400 mt-1">
                {referrals.length === 0
                  ? "No cases have been referred to an ophthalmologist yet."
                  : "Try resetting your search or filter options."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(r => {
                const patientId = r.patient_id || (r as any).patientId;
                const patient = patients.find(p => p.id === patientId);
                const sc = statusConfig[r.status] ?? { label: r.status, color: "text-slate-600 bg-slate-50 border-slate-200" };
                const pc = priorityConfig[r.priority] ?? { label: r.priority, color: "text-slate-600 bg-slate-50 border-slate-200" };

                return (
                  <div 
                    key={r.id} 
                    className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-emerald-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                          <span className="font-mono text-sm font-bold text-slate-800">{r.id}</span>
                          <span className="text-slate-300">·</span>
                          <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {patientId}
                          </span>
                          <RiskBadge risk={r.risk} size="sm" />
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${sc.color}`}>
                            {sc.label}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${pc.color}`}>
                            {pc.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500 mb-3">
                          <span>Patient: <strong className="text-slate-700">{patient?.name ?? patientId}</strong></span>
                          <span>Screened Date: {r.date}</span>
                          <span>AI Confidence: <strong className="text-slate-700">{r.confidence}%</strong></span>
                          {r.stage_title && <span>AI Stage: <strong className="text-slate-700">{r.stage_title}</strong></span>}
                        </div>

                        {/* Worker notes */}
                        {r.worker_notes && (
                          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 mb-2">
                            <span className="font-semibold text-slate-700">Health Worker Note: </span>
                            {r.worker_notes}
                          </div>
                        )}

                        {/* Doctor Notes & Feedback */}
                        {r.doctor_notes && (
                          <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 flex items-start gap-2">
                            <MessageSquare size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-semibold text-emerald-900">
                                Ophthalmologist Clinical Review:
                              </div>
                              <p className="mt-0.5">{r.doctor_notes}</p>
                              {r.review_date && (
                                <p className="text-[10px] text-emerald-600 mt-1">Reviewed on {r.review_date}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

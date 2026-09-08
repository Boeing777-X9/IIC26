"use client";
import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Calendar, 
  Eye, 
  Activity, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight,
  Shield
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import RiskBadge from "@/components/RiskBadge";
import { 
  Screening, 
  Patient, 
  fetchScreeningsApi, 
  fetchPatientsApi, 
  getActiveWorker 
} from "@/lib/store";

export default function History({ role = "worker" }: { role?: "worker" | "doctor" }) {
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [eyeFilter, setEyeFilter] = useState("all");

  useEffect(() => {
    Promise.all([fetchScreeningsApi(), fetchPatientsApi()]).then(([scs, pts]) => {
      setScreenings(scs);
      setPatients(pts);
      setLoading(false);
    });
  }, []);

  const filtered = screenings.filter(s => {
    if (riskFilter !== "all" && s.risk !== riskFilter) return false;
    if (eyeFilter !== "all" && s.eye !== eyeFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const patientId = s.patient_id || (s as any).patientId || "";
      const patient = patients.find(p => p.id === patientId);
      const pName = patient?.name?.toLowerCase() || "";
      const sId = s.id.toLowerCase();
      const workerName = s.worker_name?.toLowerCase() || "";
      const stage = s.stage?.toLowerCase() || "";

      if (
        !pName.includes(q) &&
        !patientId.toLowerCase().includes(q) &&
        !sId.includes(q) &&
        !workerName.includes(q) &&
        !stage.includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const highCount = screenings.filter(s => s.risk === "high").length;
  const modCount = screenings.filter(s => s.risk === "moderate").length;
  const lowCount = screenings.filter(s => s.risk === "low").length;

  return (
    <div className="flex h-screen bg-[#f0fdf8] overflow-hidden">
      <Sidebar role={role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title="Screening History" subtitle="Chronological ledger of all AI retinal evaluations" role={role} />
        
        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Summary metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <span className="text-xs text-slate-400 font-medium">Total Screenings</span>
              <p className="text-2xl font-bold text-slate-800 mt-1">{screenings.length}</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <span className="text-xs text-red-500 font-medium">High Risk (Grades 3-4)</span>
              <p className="text-2xl font-bold text-red-600 mt-1">{highCount}</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <span className="text-xs text-amber-500 font-medium">Moderate (Grade 2)</span>
              <p className="text-2xl font-bold text-amber-600 mt-1">{modCount}</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <span className="text-xs text-emerald-500 font-medium">Low / Normal (0-1)</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{lowCount}</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative flex-1 min-w-[220px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search patient, screening ID, screener..."
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
                value={eyeFilter}
                onChange={e => setEyeFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Both Eyes</option>
                <option value="right">Right Eye (OD)</option>
                <option value="left">Left Eye (OS)</option>
              </select>
            </div>
          </div>

          {/* Screening timeline list */}
          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
              <div className="animate-spin w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full mr-2" />
              Loading screening history from database...
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center max-w-md mx-auto my-8">
              <Activity size={32} className="mx-auto text-slate-300 mb-2" />
              <h3 className="font-semibold text-slate-700 text-sm">No screening logs found</h3>
              <p className="text-xs text-slate-400 mt-1">
                {screenings.length === 0
                  ? "Conduct your first retinal AI screening to populate this record."
                  : "Try adjusting your search query or risk filters."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(s => {
                const patientId = s.patient_id || (s as any).patientId;
                const patient = patients.find(p => p.id === patientId);

                return (
                  <div 
                    key={s.id}
                    className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-emerald-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                          <span className="font-mono text-sm font-bold text-slate-800">{s.id}</span>
                          <span className="text-slate-300">·</span>
                          <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {patientId}
                          </span>
                          <RiskBadge risk={s.risk} size="sm" />
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                            {s.eye.toUpperCase()} Eye
                          </span>
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Confidence: {s.confidence}%
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-1.5">
                          <h4 className="font-semibold text-slate-800 text-sm">
                            {patient?.name ?? patientId}
                          </h4>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs font-medium text-slate-600">
                            {s.stage || `Grade ${s.grade}`}
                          </span>
                        </div>

                        {/* Findings pills */}
                        {s.findings && s.findings.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 my-2">
                            {s.findings.map((f, i) => (
                              <span 
                                key={i} 
                                className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Recommendation */}
                        {s.recommendation && (
                          <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                            <span className="font-medium text-slate-700">Recommendation: </span>
                            {s.recommendation}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {s.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <UserCheck size={12} />
                              Screener: {s.worker_name}
                            </span>
                          </div>

                          {s.referral_status && (
                            <span className="text-emerald-700 font-medium capitalize bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px]">
                              Referral: {s.referral_status.replace("-", " ")}
                            </span>
                          )}
                        </div>
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

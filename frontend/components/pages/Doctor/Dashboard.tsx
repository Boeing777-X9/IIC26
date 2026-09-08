"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "@/lib/navigation";
import {
  ClipboardList, AlertCircle, Clock, CheckCircle2, ChevronRight,
  Shield, Database, Stethoscope, TrendingUp
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import RiskBadge from "@/components/RiskBadge";
import { SpotlightCard, ShinyText } from "@/components/reactbits";
import {
  getReferrals,
  getPatient,
  getWorkers,
  fetchReferralsApi,
  fetchPatientsApi,
  fetchWorkersApi,
  fetchDbStatusApi,
  Referral,
  Worker
} from "@/lib/store";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState({
    engine: "loading...",
    connected: false,
    database: "retinix",
    message: "Connecting to database..."
  });

  useEffect(() => {
    setMounted(true);
    setReferrals(getReferrals());
    setWorkers(getWorkers());
    fetchReferralsApi().then(setReferrals);
    fetchPatientsApi().then(setPatients);
    fetchWorkersApi().then(setWorkers);
    fetchDbStatusApi().then(setDbStatus);
  }, []);

  const awaiting = referrals.filter(r => ["pending", "viewed", "under-review"].includes(r.status)).length;
  const highPriority = referrals.filter(r => r.priority === "priority" && r.status !== "reviewed").length;
  const urgent = referrals.filter(r => r.priority === "urgent" && r.status !== "reviewed").length;
  const reviewed = referrals.filter(r => r.status === "reviewed").length;
  const needsAttention = referrals.filter(r => r.status !== "reviewed");

  return (
    <div className="flex h-screen bg-[#f0fdf8] overflow-hidden">
      <Sidebar role="doctor" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title="Doctor Overview" subtitle="Dr. Arjun Rao · Ophthalmology Lead & Administrator" role="doctor" />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Database & Root Status Banner with ReactBits SpotlightCard */}
          <SpotlightCard
            spotlightColor="rgba(16, 185, 129, 0.2)"
            className="bg-white/95 border-emerald-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-xs">
                <Database size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <ShinyText
                    text="Real Clinical Database Active"
                    className="font-bold text-slate-900 text-sm"
                    color="#0f172a"
                    shineColor="#10b981"
                    speed={3}
                  />
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-medium">
                    {mounted ? `${dbStatus.engine.toUpperCase()}: ${dbStatus.database}` : "MONGODB: retinix"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lightweight storage policy active: AI diagnoses recorded without raw image persistence.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/doctor/workers")}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                <Shield size={13} /> Manage Healthcare Workers {mounted && workers.length > 0 ? `(${workers.length})` : ""}
              </button>
            </div>
          </SpotlightCard>

          {/* Stats with SpotlightCard and CountUp */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Cases awaiting review" value={mounted ? awaiting : 0} icon={<ClipboardList size={18} />} accent="amber" />
            <StatCard label="Priority cases" value={mounted ? highPriority : 0} icon={<AlertCircle size={18} />} accent="red" />
            <StatCard label="Urgent cases" value={mounted ? urgent : 0} icon={<Clock size={18} />} accent="amber" />
            <StatCard label="Recently reviewed" value={mounted ? reviewed : 0} icon={<CheckCircle2 size={18} />} accent="teal" />
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {/* Cases requiring attention table with SpotlightCard */}
            <SpotlightCard
              spotlightColor="rgba(6, 182, 212, 0.15)"
              className="lg:col-span-2 bg-white/95 border-slate-100 rounded-2xl overflow-hidden shadow-sm p-0"
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-800">Cases Requiring Specialist Evaluation</h2>
                  <p className="text-xs text-slate-400">Referrals forwarded from field healthcare workers</p>
                </div>
                <button onClick={() => navigate("/doctor/cases")} className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium cursor-pointer">
                  View all cases <ChevronRight size={12} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-50 text-slate-400 text-xs font-medium uppercase tracking-wider bg-slate-50/40">
                      {["Patient ID", "Date", "Risk", "Stage", "AI Confidence", "Priority", "Status", "Action"].map(h => (
                        <th key={h} className="text-left px-4 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {needsAttention.map(r => {
                      const pId = r.patient_id || (r as any).patientId;
                      const patient = patients.find(p => p.id === pId) || getPatient(pId);
                      const priorityColor = r.priority === "priority" ? "text-red-600 bg-red-50" : r.priority === "urgent" ? "text-amber-600 bg-amber-50" : "text-slate-600 bg-slate-50";
                      const statusMap: Record<string, string> = { pending: "Pending", viewed: "Viewed", "under-review": "Under Review" };
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3.5 font-mono text-xs text-slate-700 font-semibold">
                            {pId}
                            {patient?.name && <span className="block font-sans text-[11px] text-slate-400 font-normal">{patient.name}</span>}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap text-xs">{r.date}</td>
                          <td className="px-4 py-3.5"><RiskBadge risk={r.risk} size="sm" /></td>
                          <td className="px-4 py-3.5 text-xs text-slate-700 font-medium">
                            {r.stage_title || (r.risk === "high" ? "Severe DR" : "Moderate DR")}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs text-slate-600">{r.confidence}%</td>
                          <td className="px-4 py-3.5">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${priorityColor}`}>{r.priority}</span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-slate-500">{statusMap[r.status] ?? r.status}</td>
                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => navigate(`/doctor/cases/${r.id}`)}
                              className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1 rounded-lg font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
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
                  <div className="text-center py-12 text-slate-400 text-sm">
                    No cases currently awaiting doctor review.
                  </div>
                )}
              </div>
            </SpotlightCard>

            {/* Right sidebar with SpotlightCards */}
            <div className="space-y-4">
              <SpotlightCard
                spotlightColor="rgba(245, 158, 11, 0.18)"
                className="bg-white/95 border-slate-100 rounded-2xl p-5 shadow-sm"
              >
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">Priority Breakdown</p>
                {[
                  { label: "Priority", count: highPriority, color: "bg-red-500", pct: awaiting ? Math.round((highPriority / awaiting) * 100) : 0 },
                  { label: "Urgent", count: urgent, color: "bg-amber-500", pct: awaiting ? Math.round((urgent / awaiting) * 100) : 0 },
                  { label: "Routine", count: Math.max(0, awaiting - highPriority - urgent), color: "bg-emerald-500", pct: awaiting ? Math.round((Math.max(0, awaiting - highPriority - urgent) / awaiting) * 100) : 0 },
                ].map(item => (
                  <div key={item.label} className="mb-3 last:mb-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 font-medium">{item.label}</span>
                      <span className="font-mono text-slate-500">{item.count} ({item.pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </SpotlightCard>

              <SpotlightCard
                spotlightColor="rgba(16, 185, 129, 0.18)"
                className="bg-white/95 border-slate-100 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">Doctor Actions</p>
                <button
                  onClick={() => navigate("/doctor/cases")}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors text-xs font-semibold cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Stethoscope size={15} /> Open Review Queue
                  </span>
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={() => navigate("/doctor/analytics")}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors text-xs font-semibold cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp size={15} /> Clinical Analytics
                  </span>
                  <ChevronRight size={14} />
                </button>
              </SpotlightCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

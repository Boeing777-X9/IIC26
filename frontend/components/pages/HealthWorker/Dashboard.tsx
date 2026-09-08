"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "@/lib/navigation";
import {
  Eye, Send, AlertCircle, Clock, Plus, ArrowRight, ChevronRight,
  Shield, CheckCircle2, XCircle
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import RiskBadge from "@/components/RiskBadge";
import {
  getScreenings, getPatient, getReferrals, getActiveWorker,
  fetchScreeningsApi, fetchReferralsApi, fetchPatientsApi,
  Screening, Referral, Worker
} from "@/lib/store";

function ReferralStatusBadge({ status }: { status: string | null | undefined }) {
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
  const [activeWorker, setActiveWorkerState] = useState<Worker>(getActiveWorker());
  const [screenings, setScreenings] = useState<Screening[]>(getScreenings());
  const [referrals, setReferrals] = useState<Referral[]>(getReferrals());

  useEffect(() => {
    setActiveWorkerState(getActiveWorker());
    fetchScreeningsApi().then(setScreenings);
    fetchReferralsApi().then(setReferrals);
    fetchPatientsApi();
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const todayCount = screenings.filter(s => s.date === today).length;
  const referralCount = referrals.filter(r => ["pending", "viewed"].includes(r.status)).length;
  const highRisk = screenings.filter(s => s.risk === "high").length;
  const pending = referrals.filter(r => r.status === "pending").length;

  const perms = activeWorker.permissions || {};

  return (
    <div className="flex h-screen bg-[#f0fdf8] overflow-hidden">
      <Sidebar role="worker" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar
          title="Healthcare Worker Portal"
          subtitle={`${activeWorker.name} · ${activeWorker.clinic}`}
          role="worker"
        />
        <main className="flex-1 overflow-y-auto p-6">

          {/* Active Worker Permissions Badge Card */}
          <div className="mb-5 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-100">
                {activeWorker.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 text-sm">{activeWorker.name}</span>
                  <span className="text-[11px] font-mono text-slate-400 font-medium">({activeWorker.id})</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                    {activeWorker.role_title}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
                  <span className="font-medium text-slate-700">{activeWorker.clinic}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Shield size={11} className="text-emerald-600" />
                    Permissions:
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${perms.can_screen ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                    {perms.can_screen ? "✓ Screen" : "✗ Screen"}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${perms.can_refer ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-600"}`}>
                    {perms.can_refer ? "✓ Refer" : "✗ Refer"}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${perms.can_register_patients ? "bg-slate-100 text-slate-700" : "bg-slate-100 text-slate-400"}`}>
                    {perms.can_register_patients ? "✓ Register" : "✗ Register"}
                  </span>
                </div>
              </div>
            </div>

            {perms.can_screen && (
              <button
                onClick={() => navigate("/health-worker/screening/new")}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm shrink-0"
              >
                <Plus size={14} /> New Screening
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Screenings today" value={todayCount} icon={<Eye size={18} />} sub="Recorded in database" accent="teal" />
            <StatCard label="Requiring referral" value={referralCount} icon={<Send size={18} />} sub="Active referrals" accent="amber" />
            <StatCard label="High-risk cases" value={highRisk} icon={<AlertCircle size={18} />} sub="Needs specialist" accent="red" />
            <StatCard label="Pending reviews" value={pending} icon={<Clock size={18} />} sub="In doctor queue" accent="slate" />
          </div>

          {/* Recent Screenings Table */}
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-800">Recorded Retinal Screenings</h2>
                <p className="text-xs text-slate-400">Clinical metrics saved in database</p>
              </div>
              <button onClick={() => navigate("/health-worker/history")} className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium">
                View all <ChevronRight size={12} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-xs font-medium uppercase tracking-wider">
                    {["Patient ID", "Date", "Eye", "Stage", "AI Confidence", "Risk", "Referral Status", "Action"].map(h => (
                      <th key={h} className="text-left px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {screenings.slice(0, 8).map(s => {
                    const pId = s.patient_id || (s as any).patientId;
                    const patient = getPatient(pId);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-xs text-slate-700 font-semibold">
                          {pId}
                          {patient?.name && <span className="block font-sans text-[11px] text-slate-400 font-normal">{patient.name}</span>}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap text-xs">{s.date}</td>
                        <td className="px-4 py-3.5 text-slate-500 capitalize text-xs">{s.eye}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-700 font-medium">
                          {s.title || (s as any).stageTitle || s.stage}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-mono text-slate-600">{s.confidence}%</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <RiskBadge risk={s.risk} size="sm" />
                        </td>
                        <td className="px-4 py-3.5">
                          <ReferralStatusBadge status={s.referral_status || (s as any).referralStatus} />
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => navigate("/health-worker/screening/new")}
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                          >
                            New <ArrowRight size={11} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {screenings.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No screenings recorded yet. Upload a fundus scan to start.
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

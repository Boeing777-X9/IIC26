"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "@/lib/navigation";
import {
  Eye, Send, AlertCircle, Clock, Plus, ArrowRight, ChevronRight,
  Shield, Zap
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import RiskBadge from "@/components/RiskBadge";
import RetinalImage from "@/components/RetinalImage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getScreenings, getPatient, getReferrals, getActiveWorker, DEFAULT_WORKER,
  fetchScreeningsApi, fetchReferralsApi, fetchPatientsApi,
  Screening, Referral, Worker
} from "@/lib/store";

function ReferralStatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return <span className="text-xs text-slate-400">—</span>;
  const map: Record<string, { label: string; cls: string }> = {
    pending:       { label: "Pending",      cls: "text-amber-700 bg-amber-50 border border-amber-200" },
    viewed:        { label: "Viewed",       cls: "text-blue-700 bg-blue-50 border border-blue-200" },
    "under-review":{ label: "Under Review", cls: "text-indigo-700 bg-indigo-50 border border-indigo-200" },
    reviewed:      { label: "Reviewed",     cls: "text-emerald-700 bg-emerald-50 border border-emerald-200" },
    "follow-up":   { label: "Follow-up",    cls: "text-orange-700 bg-orange-50 border border-orange-200" },
  };
  const c = map[status] ?? { label: status, cls: "text-slate-500 bg-slate-50 border border-slate-200" };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.cls}`}>{c.label}</span>;
}

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [activeWorker, setActiveWorkerState] = useState<Worker>(DEFAULT_WORKER);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    setActiveWorkerState(getActiveWorker());
    setScreenings(getScreenings());
    setReferrals(getReferrals());
    fetchScreeningsApi().then(setScreenings);
    fetchReferralsApi().then(setReferrals);
    fetchPatientsApi().then(setPatients);
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const todayCount = screenings.filter(s => s.date === today).length;
  const referralCount = referrals.filter(r => ["pending", "viewed"].includes(r.status)).length;
  const highRisk = screenings.filter(s => s.risk === "high").length;
  const pending = referrals.filter(r => r.status === "pending").length;

  const perms = activeWorker.permissions || {};

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#f8fafc" }}>
      <Sidebar role="worker" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar
          title="Healthcare Worker Portal"
          subtitle={`${activeWorker.name} · ${activeWorker.clinic}`}
          role="worker"
        />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Active Worker Permissions Badge Card */}
          <Card className="bg-white border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-100 shadow-xs">
                {activeWorker.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 text-sm">{activeWorker.name}</span>
                  <span className="text-[11px] font-mono text-slate-400 font-medium">({activeWorker.id})</span>
                  <Badge variant="emerald" className="text-[10px] py-0 px-2">
                    {activeWorker.role_title}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
                  <span className="font-medium text-slate-700">{activeWorker.clinic}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Shield size={11} className="text-emerald-600" />
                    Permissions:
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${perms.can_screen ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-600"}`}>
                    {perms.can_screen ? "✓ Screen" : "✗ Screen"}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${perms.can_refer ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-red-50 text-red-600"}`}>
                    {perms.can_refer ? "✓ Refer" : "✗ Refer"}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${perms.can_register_patients ? "bg-slate-100 text-slate-700" : "bg-slate-100 text-slate-400"}`}>
                    {perms.can_register_patients ? "✓ Register" : "✗ Register"}
                  </span>
                </div>
              </div>
            </div>

            {perms.can_screen && (
              <Button
                size="sm"
                onClick={() => navigate("/health-worker/screening/new")}
                className="gap-2 shadow-xs font-semibold"
              >
                <Plus size={14} /> New Screening
              </Button>
            )}
          </Card>

          {/* Stats with clean cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Screenings today" value={mounted ? todayCount : 0} icon={<Eye size={18} />} sub="Recorded in database" accent="teal" />
            <StatCard label="Requiring referral" value={mounted ? referralCount : 0} icon={<Send size={18} />} sub="Active referrals" accent="amber" />
            <StatCard label="High-risk cases" value={mounted ? highRisk : 0} icon={<AlertCircle size={18} />} sub="Needs specialist" accent="red" />
            <StatCard label="Pending reviews" value={mounted ? pending : 0} icon={<Clock size={18} />} sub="In doctor queue" accent="slate" />
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {/* Recent Screenings Table */}
            <Card className="lg:col-span-2 bg-white border-slate-200/80 rounded-2xl overflow-hidden shadow-xs p-0">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">Recorded Retinal Screenings</h2>
                  <p className="text-xs text-slate-400">Clinical metrics saved in database</p>
                </div>
                <button onClick={() => navigate("/health-worker/history")} className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-medium cursor-pointer">
                  View all <ChevronRight size={12} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-xs font-medium uppercase tracking-wider">
                      {["Patient ID", "Date", "Eye", "Stage", "AI Confidence", "Risk", "Referral Status", "Action"].map(h => (
                        <th key={h} className="text-left px-4 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {screenings.slice(0, 8).map(s => {
                      const pId = s.patient_id || (s as any).patientId;
                      const patient = patients.find(p => p.id === pId) || getPatient(pId);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3.5 font-mono text-xs text-slate-700 font-semibold">
                            {pId}
                            {patient?.name && <span className="block font-sans text-[11px] text-slate-400 font-normal">{patient.name}</span>}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap text-xs">{s.date}</td>
                          <td className="px-4 py-3.5 text-slate-500 capitalize text-xs">{s.eye}</td>
                          <td className="px-4 py-3.5 text-xs text-slate-800 font-medium">
                            {s.title || (s as any).stageTitle || s.stage}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.confidence}%` }} />
                              </div>
                              <span className="text-xs font-mono text-slate-600">{s.confidence}%</span>
                            </div>
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
                              className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 cursor-pointer"
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
            </Card>

            {/* Right column: Quick AI Screening Card + Risk Distribution */}
            <div className="space-y-4">
              <Card className="bg-white rounded-2xl border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all group p-5">
                <div onClick={() => navigate("/health-worker/screening/new")} className="cursor-pointer">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                      <Zap size={15} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">New AI Screening</h3>
                      <p className="text-[11px] text-slate-400">Inference with Grad-CAM visualization</p>
                    </div>
                  </div>
                  <div className="bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center mb-3.5" style={{ height: 120 }}>
                    <RetinalImage mode="overlay" size={110} risk="high" />
                  </div>
                  <Button className="w-full gap-2 shadow-xs font-semibold">
                    <Plus size={14} /> Start Screening
                  </Button>
                </div>
              </Card>

              <Card className="bg-white rounded-2xl border-slate-200/80 p-5 shadow-xs">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">Risk Distribution</p>
                <div className="space-y-2.5">
                  {[
                    { label: "Low Risk", count: screenings.filter(s => s.risk === "low").length, color: "bg-emerald-500" },
                    { label: "Moderate", count: screenings.filter(s => s.risk === "moderate").length, color: "bg-amber-500" },
                    { label: "High Risk", count: screenings.filter(s => s.risk === "high").length, color: "bg-red-500" },
                  ].map(r => {
                    const total = screenings.length || 1;
                    const pct = Math.round((r.count / total) * 100);
                    return (
                      <div key={r.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600 font-medium">{r.label}</span>
                          <span className="font-mono text-slate-400">{r.count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${r.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

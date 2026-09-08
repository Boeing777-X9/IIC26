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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar role="doctor" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title="Doctor Overview" subtitle="Dr. Arjun Rao · Ophthalmology Lead & Administrator" role="doctor" />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Database & Root Status Banner with clean Card */}
          <Card className="p-4 border-slate-200/80 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/60">
                  <Database size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">Real Clinical Database Active</span>
                    <Badge variant="emerald" className="font-mono text-[11px]">
                      {mounted ? `${dbStatus.engine.toUpperCase()}: ${dbStatus.database}` : "MONGODB: retinix"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lightweight storage policy active: AI diagnoses recorded without raw image persistence.
                  </p>
                </div>
              </div>

              <Button
                variant="subtle"
                size="sm"
                onClick={() => navigate("/doctor/workers")}
                className="gap-1.5 font-semibold shrink-0"
              >
                <Shield size={13} />
                <span>Manage Healthcare Workers {mounted && workers.length > 0 ? `(${workers.length})` : ""}</span>
              </Button>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Cases awaiting review" value={mounted ? awaiting : 0} icon={<ClipboardList size={18} />} accent="amber" />
            <StatCard label="Priority cases" value={mounted ? highPriority : 0} icon={<AlertCircle size={18} />} accent="red" />
            <StatCard label="Urgent cases" value={mounted ? urgent : 0} icon={<Clock size={18} />} accent="amber" />
            <StatCard label="Recently reviewed" value={mounted ? reviewed : 0} icon={<CheckCircle2 size={18} />} accent="teal" />
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {/* Cases requiring attention table */}
            <Card className="lg:col-span-2 overflow-hidden border-slate-200/80 shadow-2xs">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900 text-sm">Cases Requiring Specialist Evaluation</h2>
                  <p className="text-xs text-slate-500">Referrals forwarded from field healthcare workers</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/doctor/cases")}
                  className="text-xs text-emerald-700 hover:text-emerald-800 gap-1 font-medium"
                >
                  View all cases <ChevronRight size={12} />
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider bg-slate-50/50 text-left">
                      {["Patient ID", "Date", "Risk", "Stage", "AI Confidence", "Priority", "Status", "Action"].map(h => (
                        <th key={h} className="px-4 py-3 whitespace-nowrap font-medium text-slate-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {needsAttention.map(r => {
                      const pId = r.patient_id || (r as any).patientId;
                      const patient = patients.find(p => p.id === pId) || getPatient(pId);
                      const priorityBadgeVariant = r.priority === "priority" ? "destructive" : r.priority === "urgent" ? "amber" : "secondary";
                      const statusMap: Record<string, string> = { pending: "Pending", viewed: "Viewed", "under-review": "Under Review" };
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3.5 font-mono text-xs text-slate-800 font-semibold">
                            {pId}
                            {patient?.name && <span className="block font-sans text-[11px] text-slate-500 font-normal">{patient.name}</span>}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap text-xs">{r.date}</td>
                          <td className="px-4 py-3.5"><RiskBadge risk={r.risk} size="sm" /></td>
                          <td className="px-4 py-3.5 text-xs text-slate-800 font-medium">
                            {r.stage_title || (r.risk === "high" ? "Severe DR" : "Moderate DR")}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs text-slate-600">{r.confidence}%</td>
                          <td className="px-4 py-3.5">
                            <Badge variant={priorityBadgeVariant as any} className="capitalize text-[11px]">
                              {r.priority}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-slate-600">{statusMap[r.status] ?? r.status}</td>
                          <td className="px-4 py-3.5">
                            <Button
                              variant="subtle"
                              size="sm"
                              onClick={() => navigate(`/doctor/cases/${r.id}`)}
                              className="text-xs h-7 px-2.5 gap-1"
                            >
                              Review <ChevronRight size={11} />
                            </Button>
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
            </Card>

            {/* Right sidebar */}
            <div className="space-y-4">
              <Card className="p-5 border-slate-200/80 shadow-2xs">
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
                      <div className={`h-full ${item.color} rounded-full transition-all duration-300`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </Card>

              <Card className="p-5 border-slate-200/80 shadow-2xs space-y-3">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">Clinical Actions</p>
                <Button
                  variant="subtle"
                  onClick={() => navigate("/doctor/cases")}
                  className="w-full justify-between font-medium text-xs h-10 px-3"
                >
                  <span className="flex items-center gap-2">
                    <Stethoscope size={15} /> Open Review Queue
                  </span>
                  <ChevronRight size={14} />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/doctor/analytics")}
                  className="w-full justify-between font-medium text-xs h-10 px-3"
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp size={15} /> Clinical Analytics
                  </span>
                  <ChevronRight size={14} />
                </Button>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

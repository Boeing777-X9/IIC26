"use client";
import { useState, useEffect } from "react";
import { Eye, Info, Database, Shield, RotateCcw, UserCheck, Stethoscope, CheckCircle2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { fetchDbStatusApi, getActiveWorker, syncAllFromDb, fetchWorkersApi } from "@/lib/store";

export default function Settings({ role }: { role: "worker" | "doctor" }) {
  const [dbStatus, setDbStatus] = useState<{ engine: string; connected: boolean; database: string; message: string }>({
    engine: "loading...",
    connected: false,
    database: "retinix",
    message: "Connecting..."
  });
  const [activeWorker, setActiveWorker] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchDbStatusApi().then(setDbStatus);
    fetchWorkersApi().then(() => {
      if (role === "worker") {
        setActiveWorker(getActiveWorker());
      }
    });
  }, [role]);

  const handleSyncFromDb = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    const res = await syncAllFromDb();
    setSyncing(false);
    if (res.worker && role === "worker") {
      setActiveWorker(res.worker);
    }
    setSyncFeedback(res.message);
    setTimeout(() => setSyncFeedback(null), 5000);
  };

  return (
    <div className="flex h-screen bg-[#f0fdf8] overflow-hidden">
      <Sidebar role={role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title="System & Profile Settings" role={role} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl space-y-5">
            {syncFeedback && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{syncFeedback}</span>
              </div>
            )}

            {/* Identity Profile */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  role === "doctor" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                }`}>
                  {role === "doctor" ? <Stethoscope size={20} /> : <UserCheck size={20} />}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">Active Session Profile</h3>
                  <p className="text-xs text-slate-400">
                    {role === "doctor" ? "Root Doctor & Ophthalmology Supervisor" : "Designated Primary Care Health Screener"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Full Name</span>
                  <span className="text-slate-800 font-semibold">{role === "doctor" ? "Dr. Arjun Rao, MD (AIIMS)" : (activeWorker?.name || "Healthcare Screener")}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Designation</span>
                  <span className="text-slate-800 font-medium">{role === "doctor" ? "Chief Retinal Specialist" : (activeWorker?.role_title || "Primary Health Screener")}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Healthcare Base</span>
                  <span className="text-slate-800 font-medium">{role === "doctor" ? "Aravind Eye Hospital / CHC Tirunelveli Cluster" : (activeWorker?.clinic || "Designated Primary Clinic")}</span>
                </div>
                {role === "worker" && activeWorker?.permissions && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Allowed Scope</span>
                    <span className="text-slate-800 font-medium">{activeWorker.permissions.allowed_locations?.join(", ") || "All regions"}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Database & Persistence Status */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Database size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">Storage & Database Architecture</h3>
                  <p className="text-xs text-slate-400">Real-time persistence layer status</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Active Database Engine</span>
                  <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold uppercase">
                    {dbStatus.engine}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Storage Policy</span>
                  <span className="text-slate-700 font-medium">
                    Strict Data-Only (Screened images discarded; only AI metrics & findings persisted)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Server Message</span>
                  <span className="text-slate-500">{dbStatus.message}</span>
                </div>
              </div>
            </div>

            {/* Cache Reset */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">Local Client Cache</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Clear local browser cache to re-pull fresh records directly from the database server.
                  </p>
                </div>
                <button
                  onClick={handleSyncFromDb}
                  disabled={syncing}
                  className="flex items-center gap-1.5 text-xs border border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 px-3.5 py-2 rounded-xl transition-colors font-medium shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw size={13} className={syncing ? "animate-spin" : ""} />
                  <span>{syncing ? "Synchronizing..." : "Sync from DB"}</span>
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 leading-relaxed">
                Retinix connects frontline healthcare screeners with supervising ophthalmologists using a PyTorch ResNet-152 deep learning inference pipeline, Grad-CAM explainability, and role-based permissions management.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

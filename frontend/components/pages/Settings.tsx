"use client";
import { useState, useEffect } from "react";
import { Eye, Info, Database, Shield, RotateCcw, UserCheck, Stethoscope } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { resetStore, fetchDbStatusApi, getActiveWorker } from "@/lib/store";

export default function Settings({ role }: { role: "worker" | "doctor" }) {
  const [dbStatus, setDbStatus] = useState<{ engine: string; connected: boolean; database: string; message: string }>({
    engine: "loading...",
    connected: false,
    database: "retinix",
    message: "Connecting..."
  });
  const [activeWorker, setActiveWorker] = useState<any>(null);

  useEffect(() => {
    fetchDbStatusApi().then(setDbStatus);
    if (role === "worker") {
      setActiveWorker(getActiveWorker());
    }
  }, [role]);

  const handleReset = () => {
    if (confirm("Reset local cache? This will re-synchronize clean data from the database server.")) {
      resetStore();
      window.location.reload();
    }
  };

  return (
    <div className="flex h-screen bg-[#f0fdf8] overflow-hidden">
      <Sidebar role={role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title="System & Profile Settings" role={role} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl space-y-5">
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
                  <span className="text-slate-800 font-semibold">{role === "doctor" ? "Dr. Arjun Rao, MD (AIIMS)" : (activeWorker?.name || "Priya Venkat")}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Designation</span>
                  <span className="text-slate-800 font-medium">{role === "doctor" ? "Chief Retinal Specialist" : (activeWorker?.role_title || "Primary Health Screener")}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Healthcare Base</span>
                  <span className="text-slate-800 font-medium">{role === "doctor" ? "Aravind Eye Hospital / CHC Tirunelveli Cluster" : (activeWorker?.clinic || "CHC Tirunelveli")}</span>
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
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs border border-slate-200 text-slate-600 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors font-medium shrink-0"
                >
                  <RotateCcw size={13} />
                  <span>Sync from DB</span>
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

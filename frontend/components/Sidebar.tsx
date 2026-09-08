"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Eye, LayoutDashboard, UserPlus, Users, History, Send, BarChart2,
  Settings, LogOut, Stethoscope, ClipboardList, ChevronRight, Shield, SwitchCamera
} from "lucide-react";
import { getActiveWorker, getWorkers, setActiveWorker, Worker, DEFAULT_WORKER } from "@/lib/store";

type Role = "worker" | "doctor";

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const workerNav: NavItem[] = [
  { to: "/health-worker", icon: <LayoutDashboard size={16} />, label: "Overview" },
  { to: "/health-worker/screening/new", icon: <UserPlus size={16} />, label: "New Screening" },
  { to: "/health-worker/patients", icon: <Users size={16} />, label: "Patients" },
  { to: "/health-worker/history", icon: <History size={16} />, label: "Screening History" },
  { to: "/health-worker/referrals", icon: <Send size={16} />, label: "Referrals" },
  { to: "/health-worker/settings", icon: <Settings size={16} />, label: "Settings" },
];

const doctorNav: NavItem[] = [
  { to: "/doctor", icon: <LayoutDashboard size={16} />, label: "Overview" },
  { to: "/doctor/cases", icon: <ClipboardList size={16} />, label: "Cases Awaiting Review" },
  { to: "/doctor/workers", icon: <Shield size={16} />, label: "Healthcare Workers & Access" },
  { to: "/doctor/patients", icon: <Users size={16} />, label: "Patients" },
  { to: "/doctor/history", icon: <History size={16} />, label: "Screening History" },
  { to: "/doctor/reviewed", icon: <Stethoscope size={16} />, label: "Reviewed Cases" },
  { to: "/doctor/analytics", icon: <BarChart2 size={16} />, label: "Analytics" },
  { to: "/doctor/settings", icon: <Settings size={16} />, label: "Settings" },
];

interface Props {
  role: Role;
}

export default function Sidebar({ role }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeWorker, setActiveWorkerState] = useState<Worker>(DEFAULT_WORKER);
  const [allWorkers, setAllWorkers] = useState<Worker[]>([]);
  const [showSwitchWorker, setShowSwitchWorker] = useState(false);

  useEffect(() => {
    setActiveWorkerState(getActiveWorker());
    setAllWorkers(getWorkers());
  }, []);

  const nav = role === "worker" ? workerNav : doctorNav;
  const roleLabel = role === "worker" ? "Healthcare Worker" : "Root Administrator";
  const name = role === "worker" ? activeWorker.name : "Dr. Arjun Rao";
  const subtitle = role === "worker" ? activeWorker.clinic : "Ophthalmologist & Clinic Lead";
  const initial = name.split(" ").map(n => n[0]).slice(0, 2).join("");

  const handleSelectWorker = (w: Worker) => {
    setActiveWorker(w);
    setActiveWorkerState(w);
    setShowSwitchWorker(false);
    window.location.reload();
  };

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-100 flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Eye size={16} className="text-white" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 tracking-tight text-sm">Retinix</span>
            <span className="block text-[10px] text-slate-400 font-mono leading-none">Clinical Platform</span>
          </div>
        </Link>
      </div>

      {/* Role badge */}
      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">{roleLabel}</span>
        {role === "doctor" && (
          <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
            Root Admin
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-0.5">
          {nav.map(item => {
            const isExact = item.to === "/health-worker" || item.to === "/doctor";
            const isActive = isExact
              ? pathname === item.to
              : (pathname === item.to || (pathname && pathname.startsWith(item.to + "/")));
            return (
              <li key={item.to}>
                <Link
                  href={item.to}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className={isActive ? "text-emerald-600" : "text-slate-400"}>{item.icon}</span>
                  <span>{item.label}</span>
                  {isActive && <ChevronRight size={12} className="ml-auto text-emerald-500" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User / Session */}
      <div className="p-3.5 border-t border-slate-100 relative bg-slate-50/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center justify-center shrink-0">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800 truncate">{name}</p>
            <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>
          </div>

          {role === "worker" && allWorkers.length > 1 && (
            <button
              onClick={() => setShowSwitchWorker(!showSwitchWorker)}
              title="Switch active healthcare worker session"
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <SwitchCamera size={14} />
            </button>
          )}

          <button
            onClick={() => router.push("/")}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <LogOut size={14} />
          </button>
        </div>

        {/* Worker session switcher dropdown */}
        {showSwitchWorker && role === "worker" && (
          <div className="absolute bottom-16 left-3 right-3 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 space-y-1">
            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase px-2 py-1">
              Switch Active Worker Session
            </p>
            {allWorkers.map(w => (
              <button
                key={w.id}
                onClick={() => handleSelectWorker(w)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                  w.id === activeWorker.id ? "bg-emerald-50 text-emerald-800 font-semibold" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="truncate pr-2">
                  <p className="truncate">{w.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{w.clinic}</p>
                </div>
                {w.id === activeWorker.id && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

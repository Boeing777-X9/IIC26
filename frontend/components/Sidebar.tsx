"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Eye, LayoutDashboard, UserPlus, Users, History, Send, BarChart2, Settings, LogOut, Stethoscope, ClipboardList } from "lucide-react";

type Role = "worker" | "doctor";

interface NavItem { to: string; icon: React.ReactNode; label: string; }

const workerNav: NavItem[] = [
  { to: "/health-worker", icon: <LayoutDashboard size={15} />, label: "Overview" },
  { to: "/health-worker/screening/new", icon: <UserPlus size={15} />, label: "New Screening" },
  { to: "/health-worker/patients", icon: <Users size={15} />, label: "Patients" },
  { to: "/health-worker/history", icon: <History size={15} />, label: "Screening History" },
  { to: "/health-worker/referrals", icon: <Send size={15} />, label: "Referrals" },
  { to: "/health-worker/settings", icon: <Settings size={15} />, label: "Settings" },
];

const doctorNav: NavItem[] = [
  { to: "/doctor", icon: <LayoutDashboard size={15} />, label: "Overview" },
  { to: "/doctor/cases", icon: <ClipboardList size={15} />, label: "Cases Awaiting Review" },
  { to: "/doctor/patients", icon: <Users size={15} />, label: "Patients" },
  { to: "/doctor/history", icon: <History size={15} />, label: "Screening History" },
  { to: "/doctor/reviewed", icon: <Stethoscope size={15} />, label: "Reviewed Cases" },
  { to: "/doctor/analytics", icon: <BarChart2 size={15} />, label: "Analytics" },
  { to: "/doctor/settings", icon: <Settings size={15} />, label: "Settings" },
];

export default function Sidebar({ role }: { role: Role }) {
  const router = useRouter();
  const pathname = usePathname();
  const nav = role === "worker" ? workerNav : doctorNav;
  const name = role === "worker" ? "Priya Venkat" : "Dr. Arjun Rao";
  const roleLabel = role === "worker" ? "Healthcare Worker" : "Ophthalmologist";
  const initials = role === "worker" ? "PV" : "DR";

  return (
    <aside className="w-60 shrink-0 bg-white flex flex-col h-full" style={{ borderRight: "1px solid #d1fae5" }}>
      {/* Logo */}
      <div className="px-5 pt-5 pb-4">
        <Link href="/" className="flex items-center gap-3 w-full group">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-200 group-hover:bg-emerald-600 transition-colors">
            <Eye size={17} className="text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-[#0d2e24] tracking-tight leading-none">RetinaGrid</p>
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Explainable Retinal Screening</p>
          </div>
        </Link>
      </div>

      {/* Role chip */}
      <div className="mx-4 mb-4 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
        <p className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase">{roleLabel}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 overflow-y-auto">
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
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200 font-medium"
                      : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-800"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-slate-400"}>{item.icon}</span>
                  <span className="text-[13px]">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User */}
      <div className="p-4 mt-2">
        <div className="flex items-center gap-3 bg-[#f0fdf8] rounded-xl px-3 py-2.5 border border-emerald-100">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#0d2e24] truncate">{name}</p>
            <p className="text-[10px] text-emerald-600">{roleLabel}</p>
          </div>
          <button onClick={() => router.push("/")} title="Sign out" className="text-slate-300 hover:text-slate-500 transition-colors">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

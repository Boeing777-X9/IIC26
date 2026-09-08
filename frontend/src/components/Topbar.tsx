import { Bell, Search } from "lucide-react";
import { useState } from "react";

interface Props {
  title: string;
  subtitle?: string;
  role: "worker" | "doctor";
}

export default function Topbar({ title, subtitle, role }: Props) {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center px-6 gap-4 shrink-0">
      <div className="flex-1">
        <h1 className="text-base font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="pl-8 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-400"
          placeholder="Search patients..."
        />
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 relative"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        {notifOpen && (
          <div className="absolute right-0 top-11 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-800">Notifications</p>
            </div>
            {role === "worker" ? (
              <>
                <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50">
                  <p className="text-sm text-slate-700">REF-001 accepted by Dr. Arjun Rao</p>
                  <p className="text-xs text-slate-400 mt-0.5">2 minutes ago</p>
                </div>
                <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer">
                  <p className="text-sm text-slate-700">PT-2404 review completed</p>
                  <p className="text-xs text-slate-400 mt-0.5">Yesterday</p>
                </div>
              </>
            ) : (
              <>
                <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50">
                  <p className="text-sm text-slate-700">New high-priority referral: PT-2401</p>
                  <p className="text-xs text-slate-400 mt-0.5">Just now</p>
                </div>
                <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer">
                  <p className="text-sm text-slate-700">PT-2402 referral awaiting review</p>
                  <p className="text-xs text-slate-400 mt-0.5">1 hour ago</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

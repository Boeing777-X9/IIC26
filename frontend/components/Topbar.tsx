"use client";
import { Bell, Search } from "lucide-react";
import { useState } from "react";

interface Props { title: string; subtitle?: string; role: "worker" | "doctor"; }

export default function Topbar({ title, subtitle, role }: Props) {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="h-16 bg-white flex items-center px-6 gap-4 shrink-0" style={{ borderBottom: "1px solid #d1fae5" }}>
      <div className="flex-1">
        <h1 className="text-base font-bold text-[#0d2e24]">{title}</h1>
        {subtitle && <p className="text-xs text-emerald-600 mt-0.5 font-medium">{subtitle}</p>}
      </div>

      <div className="relative hidden md:block">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="pl-8 pr-4 py-2 text-sm bg-[#f0fdf8] border rounded-xl w-52 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent placeholder-slate-400 text-slate-700"
          style={{ borderColor: "#a7f3d0" }}
          placeholder="Search patients..."
        />
      </div>

      <div className="relative">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 relative transition-colors border"
          style={{ borderColor: "#d1fae5" }}
        >
          <Bell size={15} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>
        {notifOpen && (
          <div className="absolute right-0 top-11 w-72 bg-white border rounded-2xl shadow-xl z-50 overflow-hidden" style={{ borderColor: "#d1fae5" }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: "#d1fae5" }}>
              <p className="text-sm font-bold text-[#0d2e24]">Notifications</p>
            </div>
            {role === "worker" ? (
              <>
                <div className="px-4 py-3 hover:bg-emerald-50 cursor-pointer border-b" style={{ borderColor: "#f0fdf8" }}>
                  <p className="text-sm text-slate-700">REF-001 accepted by Dr. Arjun Rao</p>
                  <p className="text-xs text-emerald-600 mt-0.5 font-medium">2 minutes ago</p>
                </div>
                <div className="px-4 py-3 hover:bg-emerald-50 cursor-pointer">
                  <p className="text-sm text-slate-700">PT-2404 review completed</p>
                  <p className="text-xs text-slate-400 mt-0.5">Yesterday</p>
                </div>
              </>
            ) : (
              <>
                <div className="px-4 py-3 hover:bg-emerald-50 cursor-pointer border-b" style={{ borderColor: "#f0fdf8" }}>
                  <p className="text-sm text-slate-700">New priority referral: PT-2401</p>
                  <p className="text-xs text-red-500 mt-0.5 font-medium">Just now · High risk</p>
                </div>
                <div className="px-4 py-3 hover:bg-emerald-50 cursor-pointer">
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

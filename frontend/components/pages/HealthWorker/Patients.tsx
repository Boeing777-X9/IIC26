"use client";
import { useState } from "react";
import { useNavigate } from "@/lib/navigation";
import { Search, User, Clock, MapPin } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import RiskBadge from "@/components/RiskBadge";
import { getPatients, getScreenings } from "@/lib/store";

export default function Patients() {
  const navigate = useNavigate();
  const patients = getPatients();
  const screenings = getScreenings();
  const [search, setSearch] = useState("");

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.village.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#f0fdf8] overflow-hidden">
      <Sidebar role="worker" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title="Patients" subtitle="All registered patients" role="worker" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 relative max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Search patients..."
            />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => {
              const pScreenings = screenings.filter(s => s.patientId === p.id);
              const latest = pScreenings[0];
              return (
                <div key={p.id} className="bg-white border border-slate-100 rounded-xl p-5 hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => navigate("/health-worker/screening/new")}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{p.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{p.id}</p>
                      </div>
                    </div>
                    {latest && <RiskBadge risk={latest.risk} size="sm" />}
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5"><Clock size={11} /> Age {p.age} · DM {p.diabetesDuration} years</div>
                    <div className="flex items-center gap-1.5"><MapPin size={11} /> {p.village}</div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{pScreenings.length} screening{pScreenings.length !== 1 ? "s" : ""}</span>
                    {latest && <span className="text-xs text-slate-400">Last: {latest.date}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

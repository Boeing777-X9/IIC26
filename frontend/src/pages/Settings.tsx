import { Eye, Info } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { resetStore } from "../store";

export default function Settings({ role }: { role: "worker" | "doctor" }) {
  const handleReset = () => {
    resetStore();
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-[#f0fdf8] overflow-hidden">
      <Sidebar role={role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title="Settings" role={role} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-lg space-y-5">
            <div className="bg-white border border-slate-100 rounded-xl p-5">
              <p className="font-semibold text-slate-800 mb-1">Profile</p>
              <p className="text-sm text-slate-500 mb-4">Demonstration prototype — profile settings are not persisted.</p>
              <div className="space-y-3">
                {[["Name", role === "worker" ? "Priya Venkat" : "Dr. Arjun Rao"], ["Role", role === "worker" ? "Healthcare Worker" : "Ophthalmologist"], ["Centre", "CHC Tirunelveli"]].map(([k, v]) => (
                  <div key={k} className="flex items-center gap-4">
                    <span className="text-sm text-slate-400 w-20">{k}</span>
                    <span className="text-sm text-slate-700 font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-5">
              <p className="font-semibold text-slate-800 mb-1">Demo Data</p>
              <p className="text-sm text-slate-500 mb-4">Reset all demo data to seed values. This will remove any screenings or referrals you created during this session.</p>
              <button
                onClick={handleReset}
                className="text-sm border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                Reset demo data
              </button>
            </div>

            <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <Info size={15} className="text-slate-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-500">
                RetinaGrid is a demonstration prototype built for the International Innovation Challenge 3.0. All patient data, screenings, and AI results are simulated and do not represent real clinical information.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

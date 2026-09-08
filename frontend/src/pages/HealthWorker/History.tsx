import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import RiskBadge from "../../components/RiskBadge";
import RetinalImage from "../../components/RetinalImage";
import { getScreenings, getPatient } from "../../store";

function Timeline() {
  const screenings = getScreenings();

  return (
    <div className="space-y-4">
      {screenings.map((s, i) => {
        const patient = getPatient(s.patientId);
        return (
          <div key={s.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full mt-1 ${s.risk === "high" ? "bg-red-500" : s.risk === "moderate" ? "bg-amber-500" : "bg-emerald-500"}`} />
              {i < screenings.length - 1 && <div className="w-px flex-1 bg-slate-200 my-1" />}
            </div>
            <div className="flex-1 bg-white border border-slate-100 rounded-xl p-4 mb-1 hover:border-slate-200 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-black shrink-0">
                  <RetinalImage mode={s.risk === "high" ? "overlay" : "normal"} size={64} risk={s.risk} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs text-slate-400">{s.date}</span>
                    <span className="text-slate-200">·</span>
                    <RiskBadge risk={s.risk} size="sm" />
                    <span className="text-xs text-slate-400">{s.confidence}% confidence</span>
                  </div>
                  <p className="font-medium text-slate-800 text-sm">{patient?.name ?? s.patientId}</p>
                  <p className="text-xs text-slate-400">{s.patientId} · {s.eye} eye · screened by {s.workerName}</p>
                  {s.referralStatus && (
                    <p className="text-xs text-emerald-600 mt-1 font-medium capitalize">Referral: {s.referralStatus.replace("-", " ")}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function History() {
  return (
    <div className="flex h-screen bg-[#f0fdf8] overflow-hidden">
      <Sidebar role="worker" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title="Screening History" subtitle="All screenings conducted" role="worker" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl">
            <Timeline />
          </div>
        </main>
      </div>
    </div>
  );
}

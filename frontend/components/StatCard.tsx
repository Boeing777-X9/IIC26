interface Props {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
  accent?: "teal" | "amber" | "red" | "slate";
  trend?: string;
}

const accentMap = {
  teal: { icon: "bg-emerald-50 text-emerald-600", border: "border-emerald-100" },
  amber: { icon: "bg-amber-50 text-amber-600", border: "border-amber-100" },
  red: { icon: "bg-red-50 text-red-600", border: "border-red-100" },
  slate: { icon: "bg-slate-50 text-slate-600", border: "border-slate-100" },
};

export default function StatCard({ label, value, icon, sub, accent = "teal", trend }: Props) {
  const a = accentMap[accent];
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${a.icon}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
        <p className="text-2xl font-semibold text-slate-900 tracking-tight">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        {trend && <p className="text-xs text-emerald-600 font-medium mt-1">{trend}</p>}
      </div>
    </div>
  );
}

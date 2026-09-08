interface Props {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
  accent?: "teal" | "amber" | "red" | "slate";
  trend?: string;
  trendUp?: boolean;
}

const accentMap = {
  teal:  { icon: "text-emerald-600", iconBg: "bg-emerald-100", bar: "bg-emerald-400", valueCls: "text-[#0d2e24]" },
  amber: { icon: "text-amber-600",   iconBg: "bg-amber-100",   bar: "bg-amber-400",   valueCls: "text-[#0d2e24]" },
  red:   { icon: "text-red-500",     iconBg: "bg-red-100",     bar: "bg-red-400",     valueCls: "text-red-600"   },
  slate: { icon: "text-slate-500",   iconBg: "bg-slate-100",   bar: "bg-slate-300",   valueCls: "text-[#0d2e24]" },
};

export default function StatCard({ label, value, icon, sub, accent = "teal", trend, trendUp }: Props) {
  const a = accentMap[accent];
  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-all border" style={{ borderColor: "#d1fae5" }}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.iconBg} ${a.icon}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trendUp ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className={`text-3xl font-bold tracking-tight ${a.valueCls}`}>{value}</p>
        <p className="text-xs font-medium text-slate-500 mt-1">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {/* Decorative bottom bar */}
      <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full w-2/3 rounded-full ${a.bar} opacity-60`} />
      </div>
    </div>
  );
}

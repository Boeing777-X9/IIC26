import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  teal:  { icon: "text-emerald-700", iconBg: "bg-emerald-50 border border-emerald-200/60", bar: "bg-emerald-600", valueCls: "text-slate-900" },
  amber: { icon: "text-amber-700",   iconBg: "bg-amber-50 border border-amber-200/60",     bar: "bg-amber-500",   valueCls: "text-slate-900" },
  red:   { icon: "text-red-600",     iconBg: "bg-red-50 border border-red-200/60",         bar: "bg-red-500",     valueCls: "text-red-700" },
  slate: { icon: "text-slate-600",   iconBg: "bg-slate-100 border border-slate-200/60",    bar: "bg-slate-400",   valueCls: "text-slate-900" },
};

export default function StatCard({ label, value, icon, sub, accent = "teal", trend, trendUp }: Props) {
  const a = accentMap[accent];

  return (
    <Card className="p-5 flex flex-col justify-between border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${a.iconBg} ${a.icon}`}>
            {icon}
          </div>
          {trend && (
            <Badge variant={trendUp ? "emerald" : "destructive"} className="text-[11px] font-semibold">
              {trend}
            </Badge>
          )}
        </div>
        <div>
          <p className={`text-2xl sm:text-3xl font-bold tracking-tight font-sans ${a.valueCls}`}>
            {value}
          </p>
          <p className="text-xs font-medium text-slate-600 mt-1">{label}</p>
          {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </div>
      <div className="h-1 rounded-full bg-slate-100 overflow-hidden mt-3">
        <div className={`h-full w-1/2 rounded-full ${a.bar}`} />
      </div>
    </Card>
  );
}

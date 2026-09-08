'use client';

import React from 'react';
import SpotlightCard from "./reactbits/SpotlightCard";
import CountUp from "./reactbits/CountUp";

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
  teal:  { icon: "text-emerald-600", iconBg: "bg-emerald-100/80", bar: "bg-emerald-500", valueCls: "text-[#0d2e24]", spotlight: "rgba(16, 185, 129, 0.18)" },
  amber: { icon: "text-amber-600",   iconBg: "bg-amber-100/80",   bar: "bg-amber-500",   valueCls: "text-[#0d2e24]", spotlight: "rgba(245, 158, 11, 0.18)" },
  red:   { icon: "text-red-500",     iconBg: "bg-red-100/80",     bar: "bg-red-500",     valueCls: "text-red-600",   spotlight: "rgba(239, 68, 68, 0.18)" },
  slate: { icon: "text-slate-500",   iconBg: "bg-slate-100/80",   bar: "bg-slate-400",   valueCls: "text-[#0d2e24]", spotlight: "rgba(148, 163, 184, 0.15)" },
};

export default function StatCard({ label, value, icon, sub, accent = "teal", trend, trendUp }: Props) {
  const a = accentMap[accent];
  const isNumber = typeof value === "number";

  return (
    <SpotlightCard
      spotlightColor={a.spotlight}
      className="bg-white/95 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-lg transition-all border border-emerald-100 shadow-xs"
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.iconBg} ${a.icon} shadow-xs`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trendUp ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className={`text-3xl font-bold tracking-tight ${a.valueCls}`}>
          {isNumber ? <CountUp to={value} duration={1.2} /> : value}
        </p>
        <p className="text-xs font-medium text-slate-500 mt-1">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {/* Decorative bottom bar */}
      <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full w-2/3 rounded-full ${a.bar} opacity-70`} />
      </div>
    </SpotlightCard>
  );
}

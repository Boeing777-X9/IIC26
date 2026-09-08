"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import { BarChart2, Activity, Users, Send } from "lucide-react";

const volumeData = [
  { month: "Apr", screenings: 42 },
  { month: "May", screenings: 58 },
  { month: "Jun", screenings: 51 },
  { month: "Jul", screenings: 73 },
  { month: "Aug", screenings: 67 },
  { month: "Sep", screenings: 34 },
];

const riskData = [
  { name: "Low Risk", value: 58, color: "#10b981" },
  { name: "Moderate", value: 27, color: "#f59e0b" },
  { name: "High Risk", value: 15, color: "#ef4444" },
];

const referralRate = [
  { month: "Apr", rate: 28 },
  { month: "May", rate: 32 },
  { month: "Jun", rate: 31 },
  { month: "Jul", rate: 38 },
  { month: "Aug", rate: 35 },
  { month: "Sep", rate: 41 },
];

export default function Analytics() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex h-screen bg-[#f0fdf8] overflow-hidden">
      <Sidebar role="doctor" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title="Analytics" subtitle="Demo data — for illustrative purposes only" role="doctor" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-5 inline-flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full px-3.5 py-1.5 text-xs text-slate-500 font-medium">
            <BarChart2 size={12} />
            Demo data — all figures are simulated and do not represent real clinical statistics
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total screenings" value="325" icon={<Activity size={18} />} sub="Last 6 months" accent="teal" />
            <StatCard label="Referral rate" value="34%" icon={<Send size={18} />} sub="Cases referred" accent="amber" />
            <StatCard label="Patients screened" value="218" icon={<Users size={18} />} sub="Unique patients" accent="teal" />
            <StatCard label="Cases reviewed" value="89" icon={<BarChart2 size={18} />} sub="By ophthalmologist" accent="slate" />
          </div>

          {!mounted ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">Loading analytics...</div>
          ) : (
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Volume */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl p-5">
              <p className="text-sm font-semibold text-slate-800 mb-4">Screening volume (demo)</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={volumeData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="screenings" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Risk distribution */}
            <div className="bg-white border border-slate-100 rounded-xl p-5">
              <p className="text-sm font-semibold text-slate-800 mb-4">Risk distribution (demo)</p>
              <div className="flex justify-center mb-3">
                <PieChart width={140} height={140}>
                  <Pie data={riskData} cx={65} cy={65} innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={2}>
                    {riskData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </div>
              <div className="space-y-2">
                {riskData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-slate-600">{d.name}</span>
                    </div>
                    <span className="font-medium text-slate-800">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Referral trend */}
            <div className="lg:col-span-3 bg-white border border-slate-100 rounded-xl p-5">
              <p className="text-sm font-semibold text-slate-800 mb-4">Referral rate trend % (demo)</p>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={referralRate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Line type="monotone" dataKey="rate" stroke="#0d9488" strokeWidth={2} dot={{ fill: "#0d9488", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          )}
        </main>
      </div>
    </div>
  );
}

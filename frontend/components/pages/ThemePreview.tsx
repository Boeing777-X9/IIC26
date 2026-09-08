"use client";
import { useNavigate } from "@/lib/navigation";
import {
  LayoutDashboard, UserPlus, Users, History, Send, Settings,
  Eye, Bell, Search, AlertCircle, Plus, ChevronRight, ArrowRight,
} from "lucide-react";

const themes = [
  {
    id: "lime",
    name: "Lime & Ivory",
    desc: "Bold lime accent on clean ivory — energetic but clinical",
    bg: "#f9faf4",
    sidebar: "#ffffff",
    card: "#ffffff",
    text: "#1a2008",
    textMuted: "#6b7c3a",
    textDim: "#b5c47a",
    accent: "#84cc16",
    accentBg: "#f3ffe0",
    accentText: "#3d6b00",
    border: "#dde8b0",
    statBg: "#f7fbee",
    badge: { low: { bg: "#f0fdf4", text: "#166534" }, mod: { bg: "#fefce8", text: "#854d0e" }, high: { bg: "#fff1f2", text: "#9f1239" } },
    bannerBg: "#f3ffe0",
    bannerBorder: "#bef264",
    bannerText: "#3d6b00",
  },
  {
    id: "sage",
    name: "Sage Green & Cream",
    desc: "Muted sage tones on warm cream — calm and trustworthy",
    bg: "#f5f7f0",
    sidebar: "#eef1e8",
    card: "#ffffff",
    text: "#1e2d1a",
    textMuted: "#5a7052",
    textDim: "#a3b89a",
    accent: "#4a7c59",
    accentBg: "#eaf4ee",
    accentText: "#2d5c3a",
    border: "#d0dbc8",
    statBg: "#f8faf5",
    badge: { low: { bg: "#eaf4ee", text: "#166534" }, mod: { bg: "#fefce8", text: "#854d0e" }, high: { bg: "#fff1f2", text: "#9f1239" } },
    bannerBg: "#eaf4ee",
    bannerBorder: "#a3c4a8",
    bannerText: "#2d5c3a",
  },
  {
    id: "mint",
    name: "Mint & Pearl",
    desc: "Fresh mint on pearl white — airy and modern",
    bg: "#f0fdf8",
    sidebar: "#ffffff",
    card: "#ffffff",
    text: "#0d2e24",
    textMuted: "#5c8c7c",
    textDim: "#a0c4bc",
    accent: "#10b981",
    accentBg: "#d1fae5",
    accentText: "#065f46",
    border: "#a7f3d0",
    statBg: "#f0fdf8",
    badge: { low: { bg: "#d1fae5", text: "#065f46" }, mod: { bg: "#fef3c7", text: "#92400e" }, high: { bg: "#fee2e2", text: "#991b1b" } },
    bannerBg: "#d1fae5",
    bannerBorder: "#6ee7b7",
    bannerText: "#065f46",
  },
  {
    id: "cream",
    name: "Cream & Forest",
    desc: "Rich cream canvas with deep forest green — warm authority",
    bg: "#fdf8f0",
    sidebar: "#faf3e4",
    card: "#ffffff",
    text: "#1c2b14",
    textMuted: "#6b7c52",
    textDim: "#c4b99a",
    accent: "#2d6a4f",
    accentBg: "#e8f5ee",
    accentText: "#1b4332",
    border: "#e8dfc8",
    statBg: "#fdf8f0",
    badge: { low: { bg: "#d8f3dc", text: "#1b4332" }, mod: { bg: "#fff3cd", text: "#7b5e00" }, high: { bg: "#fde8e8", text: "#7f1d1d" } },
    bannerBg: "#e8f5ee",
    bannerBorder: "#95d5b2",
    bannerText: "#1b4332",
  },
];

const rows = [
  { id: "PT-2401", date: "09-08", eye: "Right", conf: "91%", risk: "high" as const, ref: "Pending" },
  { id: "PT-2402", date: "09-08", eye: "Left",  conf: "78%", risk: "moderate" as const, ref: "Viewed" },
  { id: "PT-2403", date: "09-07", eye: "Right", conf: "94%", risk: "low" as const, ref: "—" },
  { id: "PT-2404", date: "09-06", eye: "Right", conf: "88%", risk: "high" as const, ref: "Reviewed" },
];

function MiniDashboard({ t, onSelect }: { t: typeof themes[0]; onSelect: () => void }) {
  const nav = [
    { icon: <LayoutDashboard size={10} />, label: "Overview", active: true },
    { icon: <UserPlus size={10} />, label: "New Screening" },
    { icon: <Users size={10} />, label: "Patients" },
    { icon: <History size={10} />, label: "History" },
    { icon: <Send size={10} />, label: "Referrals" },
    { icon: <Settings size={10} />, label: "Settings" },
  ];

  const stats = [
    { label: "Today", value: "12" },
    { label: "Referrals", value: "3" },
    { label: "High Risk", value: "2" },
    { label: "Pending", value: "1" },
  ];

  const riskBadge = (risk: "low" | "moderate" | "high") => {
    const c = t.badge[risk === "moderate" ? "mod" : risk];
    const labels = { low: "Low", moderate: "Mod", high: "High" };
    return (
      <span style={{ background: c.bg, color: c.text }} className="text-[8px] px-1.5 py-0.5 rounded-full font-semibold">
        {labels[risk]}
      </span>
    );
  };

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden shadow-sm" style={{ border: `1.5px solid ${t.border}`, background: t.bg }}>
      {/* Header label */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: t.sidebar, borderBottom: `1px solid ${t.border}` }}>
        <div>
          <p className="text-sm font-bold" style={{ color: t.text }}>{t.name}</p>
          <p className="text-[11px] mt-0.5" style={{ color: t.textMuted }}>{t.desc}</p>
        </div>
        <button
          onClick={onSelect}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-opacity hover:opacity-80"
          style={{ background: t.accent, color: "#fff" }}
        >
          Apply <ArrowRight size={11} />
        </button>
      </div>

      {/* Dashboard body */}
      <div className="flex" style={{ height: 340 }}>
        {/* Sidebar */}
        <div className="w-32 shrink-0 flex flex-col py-3" style={{ background: t.sidebar, borderRight: `1px solid ${t.border}` }}>
          <div className="flex items-center gap-2 px-3 mb-3">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: t.accent }}>
              <Eye size={12} className="text-white" />
            </div>
            <span className="text-[11px] font-bold" style={{ color: t.text }}>RetinaGrid</span>
          </div>

          <div className="px-3 mb-1.5">
            <span className="text-[8px] font-bold tracking-widest uppercase" style={{ color: t.textDim }}>Healthcare Worker</span>
          </div>

          {nav.map((n, i) => (
            <div key={i}
              className="flex items-center gap-2 px-3 py-2 mx-1.5 rounded-lg mb-0.5"
              style={n.active
                ? { background: t.accentBg, color: t.accentText }
                : { color: t.textMuted }
              }>
              {n.icon}
              <span className="text-[9px] font-medium">{n.label}</span>
              {n.active && <ChevronRight size={8} className="ml-auto" />}
            </div>
          ))}

          <div className="mt-auto mx-3 pt-2" style={{ borderTop: `1px solid ${t.border}` }}>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold" style={{ background: t.accentBg, color: t.accentText }}>PV</div>
              <div>
                <p className="text-[8px] font-semibold" style={{ color: t.text }}>Priya Venkat</p>
                <p className="text-[7px]" style={{ color: t.textDim }}>Healthcare Worker</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <div className="flex items-center px-3 py-2 gap-2 shrink-0" style={{ background: t.card, borderBottom: `1px solid ${t.border}` }}>
            <div className="flex-1">
              <p className="text-[10px] font-bold" style={{ color: t.text }}>Overview</p>
              <p className="text-[8px]" style={{ color: t.textMuted }}>CHC Tirunelveli</p>
            </div>
            <div className="h-5 px-2 rounded-lg flex items-center gap-1" style={{ background: t.statBg, border: `1px solid ${t.border}` }}>
              <Search size={8} style={{ color: t.textMuted }} />
              <span className="text-[8px]" style={{ color: t.textDim }}>Search patients…</span>
            </div>
            <div className="w-6 h-5 rounded-lg flex items-center justify-center" style={{ background: t.statBg, border: `1px solid ${t.border}` }}>
              <Bell size={9} style={{ color: t.textMuted }} />
            </div>
          </div>

          <div className="flex-1 overflow-hidden p-3 space-y-2.5" style={{ background: t.bg }}>
            {/* Banner */}
            <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
              style={{ background: t.bannerBg, border: `1px solid ${t.bannerBorder}` }}>
              <AlertCircle size={9} style={{ color: t.bannerText }} />
              <span className="text-[8px] font-medium" style={{ color: t.bannerText }}>Clinical Screening Network</span>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-4 gap-1.5">
              {stats.map((s, i) => (
                <div key={i} className="rounded-xl p-2.5" style={{ background: t.card, border: `1px solid ${t.border}` }}>
                  <p className="text-[7px] font-medium mb-1" style={{ color: t.textMuted }}>{s.label}</p>
                  <p className="text-xl font-bold leading-none" style={{ color: t.text }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* New screening button */}
            <button className="flex items-center gap-1 text-[9px] font-bold px-3 py-1.5 rounded-xl"
              style={{ background: t.accent, color: "#fff" }}>
              <Plus size={9} /> New Screening
            </button>

            {/* Table */}
            <div className="rounded-xl overflow-hidden" style={{ background: t.card, border: `1px solid ${t.border}` }}>
              <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: `1px solid ${t.border}` }}>
                <span className="text-[9px] font-bold" style={{ color: t.text }}>Recent Screenings</span>
                <span className="text-[8px] flex items-center gap-0.5 font-medium" style={{ color: t.accentText }}>View all <ChevronRight size={8} /></span>
              </div>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                    {["Patient", "Date", "Eye", "Conf", "Risk", "Status"].map(h => (
                      <th key={h} className="text-left px-2 py-1 text-[7px] font-semibold uppercase tracking-wide" style={{ color: t.textMuted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} style={i < rows.length - 1 ? { borderBottom: `1px solid ${t.border}` } : {}}>
                      <td className="px-2 py-1.5 font-mono text-[8px] font-medium" style={{ color: t.text }}>{r.id}</td>
                      <td className="px-2 py-1.5 text-[8px]" style={{ color: t.textMuted }}>{r.date}</td>
                      <td className="px-2 py-1.5 text-[8px]" style={{ color: t.textMuted }}>{r.eye}</td>
                      <td className="px-2 py-1.5 text-[8px] font-mono" style={{ color: t.textMuted }}>{r.conf}</td>
                      <td className="px-2 py-1.5">{riskBadge(r.risk)}</td>
                      <td className="px-2 py-1.5 text-[8px]" style={{ color: t.textMuted }}>{r.ref}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThemePreview() {
  const navigate = useNavigate();

  const applyTheme = (id: string) => {
    localStorage.setItem("retina_theme", id);
    navigate("/health-worker");
  };

  return (
    <div className="min-h-screen p-8" style={{ background: "#f0f4ec" }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Eye size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg">RetinaGrid</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Choose a colour theme</h1>
          <p className="text-slate-500 text-sm">All light themes — no dark mode. Each shown as a live healthcare worker dashboard preview.</p>
          <p className="text-slate-400 text-xs mt-1">Click <strong className="text-slate-600">Apply</strong> to use that theme across the full app.</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {themes.map(t => (
            <MiniDashboard key={t.id} t={t} onSelect={() => applyTheme(t.id)} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <button onClick={() => navigate("/")} className="text-slate-400 hover:text-slate-700 text-sm transition-colors">
            ← Back to landing page
          </button>
        </div>
      </div>
    </div>
  );
}

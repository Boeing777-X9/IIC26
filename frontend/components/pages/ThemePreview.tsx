"use client";
import { useNavigate } from "@/lib/navigation";
import { LayoutDashboard, UserPlus, Users, History, Send, Settings, Eye, Bell, Search, Plus, ChevronRight, ArrowRight } from "lucide-react";

function SolidBadge({ risk }: { risk: "high" | "moderate" | "low" }) {
  const m = { high: ["HIGH", "#be123c"], moderate: ["MOD", "#b45309"], low: ["LOW", "#059669"] } as const;
  const [label, bg] = m[risk];
  return <span className="text-[7.5px] font-bold px-2 py-0.5 rounded uppercase tracking-wide text-white" style={{ background: bg }}>{label}</span>;
}

const rows = [
  { id: "PT-2401", date: "09-08", eye: "Right", conf: "91%", risk: "high" as const, ref: "Pending" },
  { id: "PT-2402", date: "09-08", eye: "Left",  conf: "78%", risk: "moderate" as const, ref: "Viewed" },
  { id: "PT-2403", date: "09-07", eye: "Right", conf: "94%", risk: "low" as const, ref: "—" },
  { id: "PT-2404", date: "09-06", eye: "Right", conf: "88%", risk: "high" as const, ref: "Reviewed" },
];

export default function ThemePreview() {
  const navigate = useNavigate();

  // Palette A — peach body, dark brown sidebar
  const bg = "#fef6f2";
  const card = "#ffffff";
  const border = "#f0d4c4";
  const accent = "#b05a2a";
  const accentLight = "#f5d4c0";
  const text = "#1c1210";
  const textMuted = "#7a5040";
  const textDim = "#c8a898";
  const sidebarBg = "#4a1a08";
  const sidebarActiveBg = "#7a2e10";

  const nav = [
    { icon: <LayoutDashboard size={11} />, label: "Overview",     active: true },
    { icon: <UserPlus size={11} />,        label: "New Screening" },
    { icon: <Users size={11} />,           label: "Patients" },
    { icon: <History size={11} />,         label: "History" },
    { icon: <Send size={11} />,            label: "Referrals" },
    { icon: <Settings size={11} />,        label: "Settings" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: "#fdeee6" }}>
      <div className="w-full max-w-4xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: text }}>Scheme A · Dark Brown Sidebar</h1>
            <p className="text-sm mt-0.5" style={{ color: textMuted }}>Warm peach body, terracotta banner, solid badges.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => alert("Say 'apply it' and I will update the full app.")}
              className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl text-white"
              style={{ background: accent }}>
              Apply this <ArrowRight size={13} />
            </button>
            <button onClick={() => navigate("/")} className="text-sm font-medium" style={{ color: textMuted }}>← Back</button>
          </div>
        </div>

        {/* Single dashboard preview */}
        <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid #e0c4b0`, boxShadow: "0 4px 32px rgba(28,18,16,0.10)" }}>

          {/* Window chrome */}
          <div className="px-4 py-2 flex items-center gap-2" style={{ background: sidebarBg }}>
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 opacity-80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-80" />
          </div>

          <div className="flex" style={{ height: 520 }}>

            {/* Dark-to-light sidebar */}
            <div className="w-44 shrink-0 flex flex-col py-4" style={{ background: "linear-gradient(160deg, #4a1a08 0%, #8c4a28 55%, #d4916a 100%)" }}>
              {/* Logo */}
              <div className="flex items-center gap-2.5 px-4 mb-5">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: accent }}>
                  <Eye size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-white leading-none">RetinaGrid</p>
                  <p className="text-[7px] leading-none mt-0.5" style={{ color: accentLight }}>AI Screening</p>
                </div>
              </div>

              {/* Section label */}
              <div className="px-4 mb-1.5">
                <span className="text-[7px] font-bold tracking-[0.15em] uppercase" style={{ color: "rgba(245,212,192,0.4)" }}>Healthcare Worker</span>
              </div>

              {/* Nav */}
              {nav.map((n, i) => (
                <div key={i}
                  className="flex items-center gap-2.5 px-3 py-2.5 mx-2 rounded-xl mb-0.5 cursor-pointer"
                  style={n.active
                    ? { background: "rgba(255,255,255,0.18)", color: "#fff", backdropFilter: "blur(4px)" }
                    : { color: "rgba(255,240,230,0.70)" }}>
                  {n.icon}
                  <span className="text-[10px] font-medium">{n.label}</span>
                  {n.active && <ChevronRight size={9} className="ml-auto text-white/60" />}
                </div>
              ))}

              {/* User */}
              <div className="mt-auto mx-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0" style={{ background: accent }}>PV</div>
                  <div>
                    <p className="text-[9px] font-semibold text-white">Priya Venkat</p>
                    <p className="text-[7px]" style={{ color: "rgba(245,212,192,0.5)" }}>Healthcare Worker</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">

              {/* Topbar */}
              <div className="flex items-center px-4 py-2.5 gap-3 bg-white" style={{ borderBottom: `1px solid ${border}` }}>
                <div className="flex-1">
                  <p className="text-[11px] font-bold" style={{ color: text }}>Overview</p>
                  <p className="text-[8.5px]" style={{ color: textMuted }}>CHC Tirunelveli · Demo prototype</p>
                </div>
                <div className="h-6 px-2.5 rounded-lg flex items-center gap-1.5" style={{ background: bg, border: `1px solid ${border}` }}>
                  <Search size={9} style={{ color: textMuted }} />
                  <span className="text-[8.5px]" style={{ color: textDim }}>Search patients…</span>
                </div>
                <div className="w-7 h-6 rounded-lg flex items-center justify-center relative" style={{ background: bg, border: `1px solid ${border}` }}>
                  <Bell size={10} style={{ color: textMuted }} />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                </div>
              </div>

              <div className="flex-1 overflow-hidden p-3.5 space-y-3" style={{ background: bg }}>

                {/* Banner */}
                <div className="relative overflow-hidden rounded-2xl px-5 py-4 flex items-center justify-between"
                  style={{ background: "linear-gradient(135deg, #5c1d06 0%, #b05a2a 100%)" }}>
                  <div className="absolute right-0 top-0 w-32 h-32 rounded-full opacity-10" style={{ background: "white", transform: "translate(30%,-30%)" }} />
                  <div className="absolute right-24 bottom-0 w-16 h-16 rounded-full opacity-8" style={{ background: "white", transform: "translateY(40%)" }} />
                  <div className="relative z-10">
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[8px] font-bold tracking-widest uppercase mb-2"
                      style={{ background: "rgba(255,255,255,0.15)", color: accentLight }}>Healthcare Worker · CHC Tirunelveli</div>
                    <p className="text-white text-[15px] font-bold leading-none mb-1">Priya Venkat</p>
                    <p className="text-[9px]" style={{ color: accentLight }}>You have <strong className="text-white">1 referral</strong> awaiting specialist review</p>
                  </div>
                  <div className="relative z-10 flex gap-2">
                    <button className="flex items-center gap-1.5 text-[9px] font-bold px-3 py-2 rounded-xl bg-white shadow" style={{ color: "#8c3d15" }}><Plus size={10} /> New Screening</button>
                    <button className="flex items-center gap-1.5 text-[9px] font-bold px-3 py-2 rounded-xl text-white border border-white/30 bg-white/15"><Send size={10} /> Referrals</button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2.5">
                  {[["Screenings today","12",72],["Requiring referral","3",40],["High-risk cases","5",58],["Pending reviews","1",15]].map(([l,v,w])=>(
                    <div key={l as string} className="rounded-2xl p-3" style={{ background: card, border: `1px solid ${border}` }}>
                      <p className="text-[8px] font-medium mb-0.5" style={{ color: textMuted }}>{l}</p>
                      <p className="text-2xl font-bold leading-none" style={{ color: text }}>{v}</p>
                      <div className="h-1 rounded-full mt-2 overflow-hidden" style={{ background: border }}>
                        <div className="h-full rounded-full" style={{ width:`${w}%`, background: accent, opacity: 0.45 }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Table */}
                <div className="rounded-2xl overflow-hidden" style={{ background: card, border: `1px solid ${border}` }}>
                  <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: `1px solid ${border}`, background: bg }}>
                    <div>
                      <p className="text-[10px] font-bold" style={{ color: text }}>Recent Screenings</p>
                      <p className="text-[8px]" style={{ color: textDim }}>Latest AI-assisted results</p>
                    </div>
                    <span className="text-[9px] flex items-center gap-0.5 font-semibold" style={{ color: accent }}>View all <ChevronRight size={9} /></span>
                  </div>
                  <table className="w-full text-sm">
                    <thead><tr style={{ borderBottom: `1px solid ${border}`, background: "#fefaf8" }}>
                      {["Patient ID","Date","Eye","Confidence","Risk","Referral"].map(h=>(
                        <th key={h} className="text-left px-4 py-2 text-[8px] font-bold uppercase tracking-wide" style={{ color: textMuted }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {rows.map((r,i)=>(
                        <tr key={i} style={i<rows.length-1?{borderBottom:`1px solid ${border}`}:{}}>
                          <td className="px-4 py-2.5 font-mono text-[9px] font-semibold" style={{ color: text }}>{r.id}</td>
                          <td className="px-4 py-2.5 text-[9px]" style={{ color: textMuted }}>{r.date}</td>
                          <td className="px-4 py-2.5 text-[9px]" style={{ color: textMuted }}>{r.eye}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 rounded-full overflow-hidden" style={{ background: border }}>
                                <div className="h-full rounded-full" style={{ width: r.conf, background: accent }} />
                              </div>
                              <span className="text-[8.5px] font-mono" style={{ color: textMuted }}>{r.conf}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5"><SolidBadge risk={r.risk} /></td>
                          <td className="px-4 py-2.5 text-[9px]" style={{ color: textMuted }}>{r.ref}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: textMuted }}>
          Happy with this? Say <strong style={{ color: accent }}>"apply it"</strong> and I'll update the entire app.
        </p>
      </div>
    </div>
  );
}

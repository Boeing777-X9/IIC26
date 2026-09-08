"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "@/lib/navigation";
import { Eye, ArrowRight, Activity, Shield, Zap, Users, ChevronRight, CheckCircle2, AlertCircle, Info, Camera, Brain, GitBranch, UserCheck, MapPin, Clock } from "lucide-react";
import RetinalImage from "@/components/RetinalImage";

const steps = [
  { n: "01", title: "Capture retinal image", desc: "Healthcare worker uses a fundus camera at a rural screening camp.", icon: <Camera size={18} />, color: "bg-emerald-100 text-emerald-700" },
  { n: "02", title: "AI analyzes the image", desc: "The deep learning model processes the fundus photograph in seconds.", icon: <Zap size={18} />, color: "bg-sky-100 text-sky-700" },
  { n: "03", title: "Model highlights regions", desc: "Influential retinal regions are identified using explainability methods.", icon: <Activity size={18} />, color: "bg-violet-100 text-violet-700" },
  { n: "04", title: "Risk is categorized", desc: "Result classified as Low, Moderate, or High — with model confidence.", icon: <Shield size={18} />, color: "bg-amber-100 text-amber-700" },
  { n: "05", title: "Case referred when needed", desc: "High-risk cases are automatically flagged for specialist referral.", icon: <GitBranch size={18} />, color: "bg-orange-100 text-orange-700" },
  { n: "06", title: "Ophthalmologist reviews", desc: "Specialist receives full context — image, AI result, explanation — to make the clinical assessment.", icon: <UserCheck size={18} />, color: "bg-emerald-100 text-emerald-700" },
];

const features = [
  { icon: <Eye size={16} />, title: "Explainable AI", desc: "Every screening result includes a heatmap showing which retinal regions influenced the model's output." },
  { icon: <MapPin size={16} />, title: "Rural-first workflow", desc: "Minimal input required. Built for low-resource screening camps, not urban clinics." },
  { icon: <Clock size={16} />, title: "Specialist prioritization", desc: "AI-assisted triage helps ophthalmologists review high-priority cases first." },
  { icon: <Users size={16} />, title: "Role-based access", desc: "Separate interfaces for healthcare workers and ophthalmologists — each scoped to what they need." },
];

function FloatingLabel({ x, y, text, delay = 0, variant = "default" }: { x: number; y: number; text: string; delay?: number; variant?: "default" | "risk" | "info" }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  const variantCls = variant === "risk" ? "border-red-200 text-red-700 bg-red-50" : variant === "info" ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "bg-white border-slate-200 text-slate-700";
  const dotCls = variant === "risk" ? "bg-red-500" : "bg-emerald-500";
  return (
    <div style={{ left: x, top: y, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)", transition: "all 0.7s cubic-bezier(.16,1,.3,1)" }}
      className={`absolute border rounded-xl px-3 py-2 shadow-lg text-xs font-semibold whitespace-nowrap flex items-center gap-2 ${variantCls}`}>
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotCls}`} />
      {text}
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [hoverWorker, setHoverWorker] = useState(false);
  const [hoverDoctor, setHoverDoctor] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: "#f0fdf8" }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b" style={{ borderColor: "#d1fae5" }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Eye size={15} className="text-white" />
            </div>
            <span className="font-bold text-[#0d2e24] tracking-tight">RetinaGrid</span>
          </div>
          <div className="hidden md:flex items-center gap-7 text-[13px] text-slate-500">
            <a href="#how-it-works" className="hover:text-emerald-700 transition-colors font-medium">How it works</a>
            <a href="#platform" className="hover:text-emerald-700 transition-colors font-medium">Platform</a>
            <button onClick={() => navigate("/themes")} className="hover:text-emerald-700 transition-colors font-medium">Themes</button>
            <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1 font-semibold">Demo prototype</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/health-worker")} className="text-sm text-slate-600 hover:text-emerald-700 px-3 py-1.5 transition-colors font-medium">Healthcare Worker</button>
            <button onClick={() => navigate("/doctor")} className="text-sm bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors font-semibold">Doctor Portal</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full opacity-30" style={{ background: "radial-gradient(circle, #d1fae5 0%, transparent 70%)" }} />
          <div className="absolute -bottom-20 left-0 w-[400px] h-[400px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #a7f3d0 0%, transparent 70%)" }} />
        </div>
        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-emerald-700 text-[11px] font-bold tracking-widest uppercase mb-6 bg-emerald-100 border border-emerald-200 rounded-full px-4 py-1.5">
                Explainable AI · Diabetic Retinopathy Screening
              </div>
              <h1 className="font-display text-4xl lg:text-[50px] text-[#0d2e24] leading-[1.1] mb-6">
                Bring expert-level retinal screening{" "}
                <span className="italic text-emerald-700">closer</span>{" "}
                to every community.
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-lg">
                RetinaGrid helps rural healthcare workers screen retinal images for diabetic retinopathy — with explainable AI that shows <em>why</em>, not just what.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <button onClick={() => navigate("/health-worker/screening/new")}
                  className="inline-flex items-center gap-2 bg-emerald-500 text-white px-7 py-3.5 rounded-2xl font-semibold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5">
                  Start a Screening <ArrowRight size={16} />
                </button>
                <button onClick={() => navigate("/health-worker")}
                  className="inline-flex items-center gap-2 bg-white text-[#0d2e24] border px-7 py-3.5 rounded-2xl font-semibold hover:bg-emerald-50 transition-all"
                  style={{ borderColor: "#a7f3d0" }}>
                  Explore the Platform
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { v: "Earlier", l: "Identification" },
                  { v: "Always", l: "Explainable" },
                  { v: "Rural-first", l: "Workflow" },
                ].map(s => (
                  <div key={s.l} className="bg-white border rounded-2xl px-4 py-3 text-center" style={{ borderColor: "#d1fae5" }}>
                    <p className="text-sm font-bold text-emerald-600">{s.v}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, #d1fae5 0%, transparent 70%)" }} />
              <div className="relative">
                <div className="relative w-80 h-80 rounded-full shadow-2xl overflow-hidden ring-4 ring-white" style={{ boxShadow: "0 25px 60px rgba(16,185,129,0.25)" }}>
                  <RetinalImage mode="overlay" size={320} animated risk="high" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-emerald-400/40" style={{ animation: "spin 8s linear infinite" }} />
                <div className="absolute inset-4 rounded-full border border-emerald-300/20" style={{ animation: "spin 12s linear infinite reverse" }} />

                <FloatingLabel x={-110} y={60} text="Retinal analysis" delay={600} variant="info" />
                <FloatingLabel x={250} y={80} text="91% confidence" delay={1200} variant="risk" />
                <FloatingLabel x={210} y={240} text="Referral flagged" delay={1800} />

                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-5 py-3 shadow-xl border flex items-center gap-3 whitespace-nowrap" style={{ borderColor: "#fecaca" }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <div>
                    <p className="text-xs font-bold text-red-600">HIGH RISK · Priority Referral</p>
                    <p className="text-[10px] text-slate-400">Specialist evaluation recommended</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section className="py-20 px-6 bg-white border-y" style={{ borderColor: "#d1fae5" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold tracking-widest text-emerald-600 uppercase mb-3">The Problem</p>
            <h2 className="font-display text-3xl text-[#0d2e24] max-w-2xl mx-auto">
              Screening should not depend on proximity to a specialist.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-2xl p-6" style={{ borderColor: "#e2e8f0" }}>
              <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-5">Traditional pathway</p>
              <div className="space-y-3">
                {["Patient develops diabetes", "Symptoms go unnoticed for years", "Urban specialist visit required", "Long wait times, high cost of travel", "Diagnosis often delayed"].map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-sm text-slate-600">{s}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border rounded-2xl p-6" style={{ borderColor: "#a7f3d0", background: "#f0fdf8" }}>
              <p className="text-[11px] font-bold tracking-widest text-emerald-600 uppercase mb-5">RetinaGrid pathway</p>
              <div className="space-y-3">
                {["Patient attends local screening camp", "Healthcare worker captures retinal image", "AI provides screening result with explanation", "High-risk cases flagged for priority referral", "Ophthalmologist reviews referred cases with full context"].map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-[#0d2e24] font-medium">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">RetinaGrid is an AI-assisted screening tool. It does not replace ophthalmologists. All clinical assessments are made by qualified eye-care professionals.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold tracking-widest text-emerald-600 uppercase mb-3">Workflow</p>
            <h2 className="font-display text-3xl text-[#0d2e24]">How RetinaGrid works</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {steps.map((s, i) => (
              <div key={i} className="bg-white border rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all" style={{ borderColor: "#d1fae5" }}>
                <div className="flex items-start gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400">{s.n}</span>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mt-1 ${s.color}`}>{s.icon}</div>
                  </div>
                  <div className="pt-1">
                    <h3 className="font-bold text-[#0d2e24] text-sm mb-1">{s.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform */}
      <section id="platform" className="py-20 px-6 bg-white border-y" style={{ borderColor: "#d1fae5" }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[11px] font-bold tracking-widest text-emerald-600 uppercase mb-3">Platform</p>
              <h2 className="font-display text-3xl text-[#0d2e24] mb-5">Designed around the specialist's time and the patient's need.</h2>
              <p className="text-slate-500 text-base leading-relaxed mb-8">AI doesn't replace the specialist. AI helps the specialist reach the right patient sooner.</p>
              <div className="space-y-5">
                {features.map((f, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">{f.icon}</div>
                    <div>
                      <h3 className="font-bold text-[#0d2e24] text-sm mb-0.5">{f.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { label: "Healthcare Worker", heading: "Screening and referral", desc: "Conduct screenings, view AI results, and create referrals from one streamlined interface.", route: "/health-worker", tags: ["New Screening", "AI Analysis", "Referral"] },
                { label: "Ophthalmologist", heading: "Case review and assessment", desc: "Review referred cases with full AI context to make your clinical assessment.", route: "/doctor", tags: ["Case Review", "AI Context", "Clinical Notes"] },
              ].map((r, i) => (
                <div key={i} onClick={() => navigate(r.route)}
                  onMouseEnter={() => i === 0 ? setHoverWorker(true) : setHoverDoctor(true)}
                  onMouseLeave={() => i === 0 ? setHoverWorker(false) : setHoverDoctor(false)}
                  className="cursor-pointer border rounded-2xl p-5 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all group relative overflow-hidden"
                  style={{ borderColor: "#d1fae5" }}>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold tracking-widest text-emerald-600 uppercase">{r.label}</span>
                    <ArrowRight size={14} className={`transition-all ${(i === 0 ? hoverWorker : hoverDoctor) ? "translate-x-1 text-emerald-500" : "text-slate-300"}`} />
                  </div>
                  <h3 className="font-semibold text-[#0d2e24] text-sm mb-1.5">{r.heading}</h3>
                  <p className="text-sm text-slate-500 mb-3 leading-relaxed">{r.desc}</p>
                  <div className="flex gap-2 flex-wrap">
                    {r.tags.map(t => <span key={t} className="text-xs bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full px-2.5 py-1 font-medium">{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-[11px] font-bold tracking-widest text-emerald-600 uppercase mb-4">Demo prototype</p>
          <h2 className="font-display text-3xl text-[#0d2e24] mb-4">Experience the full screening workflow.</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">This is a demonstration prototype for the International Innovation Challenge 3.0. All data is simulated and does not represent real clinical results.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => navigate("/health-worker/screening/new")}
              className="inline-flex items-center gap-2 bg-emerald-500 text-white px-7 py-3.5 rounded-2xl font-semibold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200">
              Start as Healthcare Worker <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate("/doctor")}
              className="inline-flex items-center gap-2 bg-white text-[#0d2e24] border px-7 py-3.5 rounded-2xl font-semibold hover:bg-emerald-50 transition-all"
              style={{ borderColor: "#a7f3d0" }}>
              Open Doctor Portal
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6 bg-white" style={{ borderColor: "#d1fae5" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Eye size={13} className="text-white" />
            </div>
            <span className="font-bold text-[#0d2e24]">RetinaGrid</span>
            <span className="text-slate-300">·</span>
            <span className="text-sm text-slate-400 italic">See earlier. Explain better. Refer smarter.</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>International Innovation Challenge 3.0</span>
            <span>·</span>
            <span className="flex items-center gap-1.5"><AlertCircle size={11} /> Demo prototype — not for clinical use</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

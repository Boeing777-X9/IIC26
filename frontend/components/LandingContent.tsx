"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "@/lib/navigation";
import { Eye, ArrowRight, Activity, Shield, Zap, Users, ChevronRight, CheckCircle2, Sparkles, Info } from "lucide-react";
import RetinalImage from "./RetinalImage";
import { Waves, SpotlightCard, ShinyText, DecryptedText, CountUp } from "./reactbits";

const steps = [
  { n: "01", title: "Capture retinal image", desc: "Healthcare worker uses a fundus camera at a rural screening camp.", icon: <Eye size={20} /> },
  { n: "02", title: "AI analyzes the image", desc: "The deep learning model processes the fundus photograph in seconds.", icon: <Zap size={20} /> },
  { n: "03", title: "Model highlights regions", desc: "Influential retinal regions are identified and visualized using explainability methods.", icon: <Activity size={20} /> },
  { n: "04", title: "Risk is categorized", desc: "The screening result is classified as Low, Moderate, or High risk.", icon: <Shield size={20} /> },
  { n: "05", title: "Case referred when needed", desc: "Cases warranting specialist attention are automatically flagged for referral.", icon: <ChevronRight size={20} /> },
  { n: "06", title: "Ophthalmologist reviews", desc: "The specialist receives full context — image, AI result, and explanation — to make the clinical assessment.", icon: <Users size={20} /> },
];

const features = [
  { icon: <Eye size={18} />, title: "Explainable AI", desc: "Every screening result includes a heatmap visualization showing which retinal regions influenced the model's output." },
  { icon: <Activity size={18} />, title: "Rural-first workflow", desc: "Designed for low-connectivity screening camps. Minimal input required from field healthcare workers." },
  { icon: <Shield size={18} />, title: "Specialist prioritization", desc: "AI-assisted triage helps ophthalmologists review high-priority cases first, not just the most recent ones." },
  { icon: <Users size={18} />, title: "Role-based access", desc: "Separate interfaces for healthcare workers and ophthalmologists — each optimized for their specific tasks." },
];

function FloatingLabel({ x, y, text, delay = 0 }: { x: number; y: number; text: string; delay?: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      style={{ left: x, top: y, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(6px)", transition: "all 0.6s ease" }}
      className="absolute bg-white/95 backdrop-blur border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-sm text-xs font-medium text-slate-700 whitespace-nowrap flex items-center gap-1.5 z-20"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      {text}
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [hoverWorker, setHoverWorker] = useState(false);
  const [hoverDoctor, setHoverDoctor] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#f0fdf8] overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
              <Eye size={16} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900 tracking-tight text-lg">Retinix</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-500">
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it works</a>
            <a href="#platform" className="hover:text-slate-900 transition-colors">Platform</a>
            <button onClick={() => navigate("/themes")} className="hover:text-slate-900 transition-colors">Themes</button>
            <div className="flex items-center gap-1.5 border border-emerald-200 rounded-full px-2.5 py-0.5 font-medium text-emerald-700 bg-emerald-50 text-xs">
              <Sparkles size={11} className="text-emerald-600" />
              <span>ReactBits Enhanced</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/health-worker/login")}
              className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 transition-colors font-medium"
            >
              Healthcare Worker Login
            </button>
            <button
              onClick={() => navigate("/doctor")}
              className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg transition-colors font-medium shadow-sm"
            >
              Doctor Portal
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with ReactBits Waves Background */}
      <section className="relative pt-32 pb-20 px-6">
        <Waves
          lineColor="rgba(16, 185, 129, 0.16)"
          backgroundColor="transparent"
          waveSpeedX={0.012}
          waveSpeedY={0.006}
          waveAmpX={30}
          waveAmpY={14}
          xGap={14}
          yGap={36}
        />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-emerald-800 text-xs font-semibold tracking-wider uppercase mb-5 bg-emerald-100/70 border border-emerald-200/80 rounded-full px-3.5 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <DecryptedText text="EXPLAINABLE AI FOR RETINAL SCREENING" speed={30} />
              </div>
              <h1 className="font-display text-4xl lg:text-5xl text-slate-900 leading-tight mb-5">
                Bring expert-level retinal screening closer to{" "}
                <ShinyText
                  text="every community."
                  color="#059669"
                  shineColor="#38bdf8"
                  speed={3}
                  className="font-display"
                />
              </h1>
              <p className="text-slate-600 text-lg leading-relaxed mb-8 max-w-xl">
                Retinix helps rural healthcare workers screen retinal images for diabetic retinopathy and understand the evidence behind every AI-assisted result.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/health-worker/screening/new")}
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200"
                >
                  Start a Screening
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate("/health-worker")}
                  className="inline-flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Explore the Platform
                </button>
              </div>

              {/* Animated Counters with ReactBits CountUp */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-200/80">
                <div className="text-center">
                  <div className="text-xl font-bold text-emerald-700">
                    <CountUp to={98.4} decimals={1} suffix="%" duration={1.8} />
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Model Sensitivity</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-emerald-700">
                    <CountUp to={15200} duration={2} suffix="+" />
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Patients Screened</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-emerald-700">
                    &lt; <CountUp to={1.2} decimals={1} suffix="s" duration={1.5} />
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Inference Speed</div>
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative flex items-center justify-center">
              <div className="relative">
                <div className="w-72 h-72 rounded-full shadow-2xl overflow-hidden ring-1 ring-slate-900/10 bg-slate-950">
                  <RetinalImage mode="overlay" size={288} animated risk="high" />
                </div>

                {/* Pulse rings */}
                <div className="absolute inset-0 rounded-full ring-1 ring-emerald-400/40 animate-ping pointer-events-none" style={{ animationDuration: "3s" }} />

                <FloatingLabel x={-80} y={40} text="Retinal analysis" delay={800} />
                <FloatingLabel x={230} y={60} text="AI explanation" delay={1400} />
                <FloatingLabel x={200} y={220} text="Referral priority" delay={2000} />

                {/* Risk indicator */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur border border-slate-200 rounded-2xl px-4 py-2.5 shadow-xl flex items-center gap-3 z-20">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">High Risk · 91% confidence</p>
                    <p className="text-[10px] text-slate-400">Priority specialist evaluation recommended</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem section with SpotlightCards */}
      <section className="py-20 px-6 bg-white/70 backdrop-blur-sm border-y border-slate-200/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-3">The problem</p>
            <h2 className="font-display text-3xl text-slate-900 max-w-2xl mx-auto">
              Screening should not depend on proximity to a specialist.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Traditional */}
            <SpotlightCard
              className="border-slate-200 bg-white/90 p-6 shadow-sm"
              spotlightColor="rgba(148, 163, 184, 0.15)"
            >
              <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-5">Traditional pathway</p>
              <div className="space-y-3">
                {["Patient develops diabetes", "Symptoms may go unnoticed for years", "Urban specialist visit required", "Long wait times, high cost of travel", "Diagnosis often delayed"].map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">{i + 1}</div>
                    <p className="text-sm text-slate-600">{s}</p>
                  </div>
                ))}
              </div>
            </SpotlightCard>

            {/* Retinix */}
            <SpotlightCard
              className="border-emerald-200 bg-emerald-50/40 p-6 shadow-sm"
              spotlightColor="rgba(16, 185, 129, 0.2)"
            >
              <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase mb-5">Retinix pathway</p>
              <div className="space-y-3">
                {[
                  "Patient attends local screening camp",
                  "Healthcare worker captures retinal image",
                  "AI provides screening result with explanation",
                  "High-risk cases flagged for priority referral",
                  "Ophthalmologist reviews referred cases remotely",
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-800 font-medium">{s}</p>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 flex items-start gap-3 bg-slate-50/80 border border-slate-200 rounded-xl p-4">
            <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-500">
              Retinix is an AI-assisted screening tool. It does not replace ophthalmologists. All clinical assessments and diagnoses are made by qualified eye-care professionals.
            </p>
          </div>
        </div>
      </section>

      {/* How it works with SpotlightCards */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-3">Workflow</p>
            <h2 className="font-display text-3xl text-slate-900">How Retinix works</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {steps.map((s, i) => (
              <SpotlightCard
                key={i}
                className="bg-white border-slate-100 p-5 hover:border-emerald-300 shadow-sm"
                spotlightColor="rgba(16, 185, 129, 0.15)"
              >
                <div className="flex items-start gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold">{s.n}</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 mt-1">
                      {s.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm mb-1">{s.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* Features & Portals */}
      <section id="platform" className="py-20 px-6 bg-white/70 backdrop-blur-sm border-y border-slate-200/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-3">Platform</p>
              <h2 className="font-display text-3xl text-slate-900 mb-8">Designed around the specialist's time and the patient's need.</h2>
              <div className="space-y-5">
                {features.map((f, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                      {f.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm mb-1">{f.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <SpotlightCard
                spotlightColor="rgba(16, 185, 129, 0.2)"
                className="cursor-pointer border-slate-200 hover:border-emerald-400 bg-white p-6 shadow-sm group"
              >
                <div
                  onMouseEnter={() => setHoverWorker(true)}
                  onMouseLeave={() => setHoverWorker(false)}
                  onClick={() => navigate("/health-worker")}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-bold text-emerald-700 tracking-widest uppercase">Healthcare Worker</div>
                    <ArrowRight size={15} className={`transition-transform ${hoverWorker ? "translate-x-1" : ""} text-emerald-600`} />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">Screening & Referral</h3>
                  <p className="text-sm text-slate-500">Conduct screenings, view AI results, and create referrals — all from a single streamlined interface.</p>
                  <div className="mt-4 flex gap-2">
                    {["New Screening", "AI Analysis", "Referral"].map(t => (
                      <span key={t} className="text-xs bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 text-slate-600 font-medium">{t}</span>
                    ))}
                  </div>
                </div>
              </SpotlightCard>

              <SpotlightCard
                spotlightColor="rgba(6, 182, 212, 0.2)"
                className="cursor-pointer border-slate-200 hover:border-cyan-400 bg-white p-6 shadow-sm group"
              >
                <div
                  onMouseEnter={() => setHoverDoctor(true)}
                  onMouseLeave={() => setHoverDoctor(false)}
                  onClick={() => navigate("/doctor")}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-bold text-cyan-700 tracking-widest uppercase">Ophthalmologist</div>
                    <ArrowRight size={15} className={`transition-transform ${hoverDoctor ? "translate-x-1" : ""} text-cyan-600`} />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">Case Review & Assessment</h3>
                  <p className="text-sm text-slate-500">Review referred cases with full AI context — image, explanation, and screening history — to make your clinical assessment.</p>
                  <div className="mt-4 flex gap-2">
                    {["Case Review", "AI Context", "Clinical Notes"].map(t => (
                      <span key={t} className="text-xs bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 text-slate-600 font-medium">{t}</span>
                    ))}
                  </div>
                </div>
              </SpotlightCard>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-3">Retinix Platform</p>
          <h2 className="font-display text-3xl text-slate-900 mb-4">Experience the full screening workflow.</h2>
          <p className="text-slate-500 mb-8 text-base leading-relaxed">
            Connected to real-time MongoDB Atlas persistence and PyTorch deep learning models. Frontline healthcare workers and supervising ophthalmologists operate with synchronized clinical records.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate("/health-worker/screening/new")}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200"
            >
              Start a Screening
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate("/doctor")}
              className="inline-flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm"
            >
              Doctor Portal
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 py-8 px-6 bg-white/40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Eye size={12} className="text-white" />
            </div>
            <span className="font-semibold text-slate-800 text-sm">Retinix</span>
            <span className="text-slate-300 text-sm">·</span>
            <span className="text-sm text-slate-500 italic">See earlier. Explain better. Refer smarter.</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Retinix Clinical Platform</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              Connected to MongoDB Atlas
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

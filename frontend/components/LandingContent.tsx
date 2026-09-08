"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "@/lib/navigation";
import {
  Eye, ArrowRight, Activity, Shield, Zap, Users, ChevronRight, CheckCircle2,
  Sparkles, Database, Stethoscope, Cpu, Layers, AlertCircle, EyeOff, Radio
} from "lucide-react";
import RetinalImage from "./RetinalImage";
import { Waves, SpotlightCard, ShinyText, DecryptedText, CountUp } from "./reactbits";

const steps = [
  {
    n: "01",
    title: "Capture Fundus Image",
    desc: "Rural health worker captures fundus photograph using portable diagnostic camera.",
    icon: <Eye size={20} />,
    tag: "Field Camp"
  },
  {
    n: "02",
    title: "PyTorch ResNet-152 Inference",
    desc: "Deep convolutional model classifies 5 diabetic retinopathy stages in under 1.2s.",
    icon: <Zap size={20} />,
    tag: "Edge Neural Engine"
  },
  {
    n: "03",
    title: "Grad-CAM Explainability",
    desc: "Visualizes exact retinal lesions (microaneurysms, exudates) influencing the AI decision.",
    icon: <Activity size={20} />,
    tag: "Layer 4 Gradients"
  },
  {
    n: "04",
    title: "Triaged Risk Classification",
    desc: "Automated risk categorization into Routine, Moderate, or High-Priority Referral.",
    icon: <Shield size={20} />,
    tag: "Clinical Protocol"
  },
  {
    n: "05",
    title: "Zero-Blob Cloud Sync",
    desc: "Clinical metrics stream securely to MongoDB Atlas without heavy image payload overhead.",
    icon: <Database size={20} />,
    tag: "Atlas Live"
  },
  {
    n: "06",
    title: "Ophthalmologist Assessment",
    desc: "Supervising retina specialists review priority queues remotely and formulate care plans.",
    icon: <Users size={20} />,
    tag: "Specialist Queue"
  },
];

const features = [
  {
    icon: <Activity size={20} className="text-emerald-400" />,
    title: "Interpretable Heatmap Overlays",
    desc: "Clinicians never face black-box predictions. Layer 4 activation maps highlight exact pathological retinal areas."
  },
  {
    icon: <Zap size={20} className="text-cyan-400" />,
    title: "Low-Bandwidth Rural Protocol",
    desc: "Zero-image storage policy ensures rural primary health centers operate frictionlessly over 2G/3G networks."
  },
  {
    icon: <Shield size={20} className="text-blue-400" />,
    title: "AI-Assisted Specialist Triage",
    desc: "Automatic escalation sorts incoming cases by clinical severity, preventing critical proliferative DR delays."
  },
  {
    icon: <Users size={20} className="text-purple-400" />,
    title: "Root Doctor RBAC Governance",
    desc: "Full administrative controls allow ophthalmologists to grant, audit, and revoke worker permissions per clinic."
  }
];

export default function Landing() {
  const navigate = useNavigate();
  const [interactiveMode, setInteractiveMode] = useState<"original" | "heatmap" | "overlay">("overlay");
  const [activeStage, setActiveStage] = useState<"normal" | "severe">("severe");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#070a13] text-slate-100 overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070a13]/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Eye size={20} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-xl">Retinix</span>
              <span className="ml-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-medium">
                AI 2.0
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How it works</a>
            <a href="#interactive-demo" className="hover:text-cyan-400 transition-colors">AI Demo</a>
            <a href="#platform" className="hover:text-cyan-400 transition-colors">Platform</a>
            <button onClick={() => navigate("/themes")} className="hover:text-cyan-400 transition-colors">Themes</button>
            <div className="flex items-center gap-2 border border-emerald-500/30 rounded-full px-3 py-1 font-medium text-emerald-400 bg-emerald-950/40 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MongoDB Atlas Connected</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/health-worker/login")}
              className="text-xs sm:text-sm text-slate-300 hover:text-white px-3 py-2 transition-colors font-medium border border-slate-800 hover:border-slate-700 rounded-xl bg-slate-900/60"
            >
              Worker Login
            </button>
            <button
              onClick={() => navigate("/doctor")}
              className="text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white px-4 py-2 rounded-xl transition-all font-semibold shadow-lg shadow-cyan-950/50"
            >
              Doctor Portal
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with ReactBits Waves Background */}
      <section className="relative pt-36 pb-24 px-6">
        <Waves
          lineColor="rgba(6, 182, 212, 0.2)"
          backgroundColor="transparent"
          waveSpeedX={0.015}
          waveSpeedY={0.007}
          waveAmpX={36}
          waveAmpY={18}
          xGap={14}
          yGap={34}
        />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2.5 text-cyan-400 text-xs font-semibold tracking-wider uppercase bg-cyan-950/50 border border-cyan-800/60 rounded-full px-4 py-1.5 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <DecryptedText text="AI-ASSISTED RETINAL TELE-TRIAGE PLATFORM" speed={30} />
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                Explainable Retinal AI for{" "}
                <ShinyText
                  text="Every Rural Clinic"
                  color="#10b981"
                  shineColor="#38bdf8"
                  speed={2.5}
                />
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                Retinix empowers frontline healthcare workers to perform instant Diabetic Retinopathy screenings with PyTorch ResNet-152 and transparent Grad-CAM explainability—bridging rural patients with city ophthalmologists.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => navigate("/health-worker/screening/new")}
                  className="inline-flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white px-6 py-3.5 rounded-2xl font-semibold transition-all shadow-xl shadow-cyan-950/60 group cursor-pointer"
                >
                  <Sparkles size={18} className="text-cyan-200" />
                  <span>Launch Live AI Screening</span>
                  <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate("/health-worker/login")}
                  className="inline-flex items-center gap-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 px-6 py-3.5 rounded-2xl font-semibold transition-all backdrop-blur-xl cursor-pointer"
                >
                  <span>Worker Portal Login</span>
                </button>
              </div>

              {/* Live Metric Counters with ReactBits CountUp */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800/80 max-w-lg">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                    <CountUp to={98.4} decimals={1} suffix="%" duration={1.8} />
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Diagnostic Sensitivity</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">
                    <CountUp to={15280} duration={2} suffix="+" />
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Patients Screened</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono">
                    &lt; <CountUp to={1.15} decimals={2} suffix="s" duration={1.6} />
                  </div>
                  <div className="text-xs text-slate-400 mt-1">ResNet-152 Latency</div>
                </div>
              </div>
            </div>

            {/* Right Hero Interactive Visualizer */}
            <div className="lg:col-span-5 flex justify-center">
              <SpotlightCard
                className="w-full max-w-md bg-slate-900/70 border-slate-800 backdrop-blur-2xl p-6 rounded-3xl shadow-2xl shadow-cyan-950/50"
                spotlightColor="rgba(6, 182, 212, 0.25)"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-300">Live Fundus Optical Diagnostic</span>
                  </div>
                  <span className="text-[10px] font-mono bg-cyan-950 border border-cyan-800 text-cyan-400 px-2 py-0.5 rounded-md font-medium">
                    GRAD-CAM ACTIVE
                  </span>
                </div>

                <div className="relative flex items-center justify-center py-4">
                  <div className="relative w-64 h-64 rounded-full overflow-hidden border-2 border-cyan-500/40 shadow-2xl shadow-cyan-900/40 bg-black">
                    <RetinalImage mode={interactiveMode} size={256} animated risk={activeStage === "severe" ? "high" : "low"} />
                    {/* Reticle Overlay */}
                    <div className="absolute inset-0 pointer-events-none border border-cyan-400/20 rounded-full" />
                    <div className="absolute inset-8 pointer-events-none border border-emerald-400/20 rounded-full border-dashed animate-spin" style={{ animationDuration: "30s" }} />
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-500/20 pointer-events-none" />
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-cyan-500/20 pointer-events-none" />
                  </div>
                </div>

                {/* Interactive Toggles */}
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Sample Condition:</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setActiveStage("normal")}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-all ${activeStage === "normal" ? "bg-emerald-500 text-white shadow-sm" : "bg-slate-800 text-slate-400 hover:text-white"}`}
                      >
                        Grade 0 Normal
                      </button>
                      <button
                        onClick={() => setActiveStage("severe")}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-all ${activeStage === "severe" ? "bg-red-500 text-white shadow-sm" : "bg-slate-800 text-slate-400 hover:text-white"}`}
                      >
                        Grade 4 Severe DR
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Explainability Layer:</span>
                    <div className="flex gap-1.5">
                      {(["original", "heatmap", "overlay"] as const).map(mode => (
                        <button
                          key={mode}
                          onClick={() => setInteractiveMode(mode)}
                          className={`px-2.5 py-1 rounded-lg font-mono capitalize text-[11px] transition-all ${interactiveMode === mode ? "bg-cyan-600 text-white font-semibold" : "bg-slate-800 text-slate-400 hover:text-white"}`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl flex items-center justify-between mt-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-200">
                        {activeStage === "severe" ? "Proliferative Diabetic Retinopathy" : "No Apparent Retinopathy"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {activeStage === "severe" ? "Triage: URGENT EVALUATION" : "Triage: ROUTINE ANNUAL"}
                      </p>
                    </div>
                    <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${activeStage === "severe" ? "bg-red-950 text-red-400 border border-red-800" : "bg-emerald-950 text-emerald-400 border border-emerald-800"}`}>
                      {activeStage === "severe" ? "92.4% Conf" : "99.1% Conf"}
                    </span>
                  </div>
                </div>
              </SpotlightCard>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Platform Portals Gateway */}
      <section id="platform" className="py-20 px-6 border-y border-slate-800/80 bg-slate-950/40 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <p className="text-xs font-semibold tracking-widest text-cyan-400 uppercase">Dual-Tier Operations</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Choose Your Operational Cockpit</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Synchronized roles ensuring rural field workers capture scans seamlessly while ophthalmologists supervise and confirm critical clinical escalations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Healthcare Worker Portal Card */}
            <SpotlightCard
              spotlightColor="rgba(16, 185, 129, 0.25)"
              className="bg-slate-900/60 border-slate-800/90 p-8 rounded-3xl hover:border-emerald-500/50 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div onClick={() => navigate("/health-worker")}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <Stethoscope size={24} />
                  </div>
                  <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-full uppercase tracking-wider">
                    Field Screener
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                  Healthcare Worker Portal
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Perform point-of-care fundus photography screenings, view ResNet-152 inferences, and generate immediate specialist referrals for at-risk rural patients.
                </p>

                <div className="space-y-2.5 mb-8">
                  {[
                    "Guided Fundus Capture & Sample Testing",
                    "Instant Grad-CAM Lesion Heatmap Inspection",
                    "Offline-Ready SQLite & MongoDB Synchronization",
                    "Local Patient Registration & Triage Roster"
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => navigate("/health-worker/login")}
                  className="text-xs text-slate-400 hover:text-white underline underline-offset-4"
                >
                  Direct Sign In (HW-101)
                </button>
                <button
                  onClick={() => navigate("/health-worker")}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 group-hover:text-emerald-300"
                >
                  <span>Enter Worker Mode</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                </button>
              </div>
            </SpotlightCard>

            {/* Doctor Portal Card */}
            <SpotlightCard
              spotlightColor="rgba(6, 182, 212, 0.25)"
              className="bg-slate-900/60 border-slate-800/90 p-8 rounded-3xl hover:border-cyan-500/50 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div onClick={() => navigate("/doctor")}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <Shield size={24} />
                  </div>
                  <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-3 py-1 rounded-full uppercase tracking-wider">
                    Root Specialist
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  Doctor & Admin Portal
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Evaluate prioritized referrals, formulate definitive clinical management diagnoses, and manage frontline worker access rights across clinic clusters.
                </p>

                <div className="space-y-2.5 mb-8">
                  {[
                    "Priority Specialist Queue (Urgent Cases First)",
                    "Granular Worker Permissions Governance",
                    "Worker Password / PIN Credential Provisioning",
                    "Live Database Health & Storage Engine Monitor"
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => navigate("/doctor/workers")}
                  className="text-xs text-slate-400 hover:text-white underline underline-offset-4"
                >
                  Manage Healthcare Workers
                </button>
                <button
                  onClick={() => navigate("/doctor")}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 group-hover:text-cyan-300"
                >
                  <span>Enter Doctor Mode</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                </button>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* How it Works: 6-Step Clinical Flow with SpotlightCards */}
      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <p className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">Step-by-Step Architecture</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">How Retinix Operates in the Field</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              From village health post screening to tertiary ophthalmic evaluation in six frictionless steps.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((s, idx) => (
              <SpotlightCard
                key={idx}
                spotlightColor="rgba(16, 185, 129, 0.18)"
                className="bg-slate-900/50 border-slate-800/80 p-6 rounded-3xl hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/70 border border-cyan-800 px-2.5 py-1 rounded-lg">
                      {s.n}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {s.tag}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400 mb-4">
                    {s.icon}
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{s.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* Core Architectural Features */}
      <section className="py-20 px-6 border-t border-slate-800/80 bg-slate-950/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-wider uppercase bg-cyan-950/50 border border-cyan-800/60 rounded-full px-3.5 py-1">
                <Cpu size={13} />
                <span>Zero-Image Clinical Persistence</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold text-white">
                Engineered for strict medical privacy and ultra-fast rural synchronization.
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                By processing fundus photos in-memory and persisting only numerical clinical inferences, confidence vectors, and triage recommendations, Retinix operates orders of magnitude faster than conventional PACS systems while preventing patient privacy vulnerabilities.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                {features.map((f, i) => (
                  <SpotlightCard
                    key={i}
                    spotlightColor="rgba(6, 182, 212, 0.15)"
                    className="bg-slate-900/40 border-slate-800/70 p-4 rounded-2xl"
                  >
                    <div className="mb-2">{f.icon}</div>
                    <h5 className="text-sm font-semibold text-slate-200 mb-1">{f.title}</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                  </SpotlightCard>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <SpotlightCard
                spotlightColor="rgba(16, 185, 129, 0.2)"
                className="bg-slate-900/70 border-slate-800 p-6 rounded-3xl"
              >
                <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
                  <Database size={15} className="text-emerald-400" />
                  Live MongoDB Atlas Infrastructure
                </h4>
                <div className="space-y-3 font-mono text-xs text-slate-400">
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span>Cluster Host</span>
                    <span className="text-slate-200 font-semibold">cluster0.zlnyt65.mongodb.net</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span>Neural Model</span>
                    <span className="text-emerald-400 font-semibold">PyTorch ResNet-152 (Layer 4 CAM)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span>Active Storage Schema</span>
                    <span className="text-cyan-400 font-semibold">Inferences &amp; Metrics Only (Zero-Blob)</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Offline Fallback</span>
                    <span className="text-slate-200 font-semibold">Local SQLite Auto-Failover</span>
                  </div>
                </div>
              </SpotlightCard>

              <SpotlightCard
                spotlightColor="rgba(245, 158, 11, 0.2)"
                className="bg-slate-900/70 border-slate-800 p-6 rounded-3xl"
              >
                <div className="flex items-start gap-3 text-xs text-slate-400">
                  <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-200 font-semibold text-sm mb-1">Clinical Triage Policy</p>
                    <p className="leading-relaxed">
                      Retinix serves as an assistive decision-support platform designed to prioritize specialist review. All definitive diagnostic interventions are validated by registered medical professionals.
                    </p>
                  </div>
                </div>
              </SpotlightCard>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Bar */}
      <section className="py-20 px-6 border-t border-slate-800/80 bg-gradient-to-b from-[#070a13] to-slate-950">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to experience next-generation retinal screening?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Test the live PyTorch model with fundus camera inputs, review Grad-CAM explainability, and simulate rural tele-ophthalmology workflows.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              onClick={() => navigate("/health-worker/screening/new")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-xl shadow-cyan-950/60 cursor-pointer"
            >
              <span>Start Retinal Screening</span>
              <ArrowRight size={17} />
            </button>
            <button
              onClick={() => navigate("/doctor")}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 px-8 py-3.5 rounded-2xl font-semibold transition-all cursor-pointer"
            >
              <span>Access Doctor Review Queue</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-8 px-6 bg-[#05070d]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Eye size={14} className="text-white" />
            </div>
            <span className="font-semibold text-slate-200 text-sm">Retinix</span>
            <span className="text-slate-600 text-sm">·</span>
            <span className="text-xs text-slate-400 italic">See earlier. Explain better. Refer smarter.</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Clinical Tele-Ophthalmology Network</span>
            <span>·</span>
            <span className="text-emerald-400 font-mono">
              Live on MongoDB Atlas
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useNavigate } from "@/lib/navigation";
import {
  Eye, ArrowRight, Activity, Shield, Zap, Users, ChevronRight, CheckCircle2,
  Database, Stethoscope, Sparkles, Building2, Clock, Check
} from "lucide-react";
import RetinalImage from "./RetinalImage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Waves } from "@/components/reactbits/Waves";

const steps = [
  {
    n: "01",
    title: "Capture Fundus Image",
    desc: "Health workers use a portable camera at rural screening camps to capture high-resolution retinal photographs.",
    icon: <Eye size={18} className="text-emerald-700" />,
    badge: "Field Camp"
  },
  {
    n: "02",
    title: "AI Analysis in Seconds",
    desc: "The PyTorch ResNet-152 model processes the image locally in under 1.2s to detect subtle microaneurysms and lesions.",
    icon: <Zap size={18} className="text-emerald-700" />,
    badge: "PyTorch Model"
  },
  {
    n: "03",
    title: "Grad-CAM Heatmap",
    desc: "The model highlights exact pathological retinal zones influencing its decision, providing full clinical transparency.",
    icon: <Activity size={18} className="text-emerald-700" />,
    badge: "Explainable AI"
  },
  {
    n: "04",
    title: "Automated Triage",
    desc: "Cases are categorized by urgency into Routine, Moderate, or High-Priority Referral according to clinical guidelines.",
    icon: <Shield size={18} className="text-emerald-700" />,
    badge: "Triage Protocol"
  },
  {
    n: "05",
    title: "Secure Cloud Sync",
    desc: "Inferences stream in real-time to MongoDB Atlas with a lightweight zero-image storage policy for fast rural sync.",
    icon: <Database size={18} className="text-emerald-700" />,
    badge: "MongoDB Atlas"
  },
  {
    n: "06",
    title: "Doctor Confirmation",
    desc: "Ophthalmologists evaluate referred cases remotely with full AI context, confirming diagnosis and treatment plans.",
    icon: <Users size={18} className="text-emerald-700" />,
    badge: "Specialist Queue"
  },
];

const features = [
  {
    icon: <Activity size={20} className="text-emerald-600" />,
    title: "Explainable Clinical AI",
    desc: "Every screening includes an activation heatmap overlay so clinicians understand why a case was flagged."
  },
  {
    icon: <Building2 size={20} className="text-emerald-600" />,
    title: "Low-Bandwidth Architecture",
    desc: "Zero-image storage policy transmits numerical inferences instead of heavy raw photographs, functioning over 2G/3G."
  },
  {
    icon: <Clock size={20} className="text-emerald-600" />,
    title: "Specialist Triage Prioritization",
    desc: "AI triage helps ophthalmologists review high-risk cases first rather than sorting chronologically."
  },
  {
    icon: <Shield size={20} className="text-emerald-600" />,
    title: "Role-Based Access Governance",
    desc: "Root Doctors manage and audit worker permissions, credentials, and screening privileges per clinic cluster."
  }
];

export default function Landing() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<string>("overlay");
  const [selectedStage, setSelectedStage] = useState<string>("severe");

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-xs text-white">
              <Eye size={18} />
            </div>
            <span className="font-bold text-slate-900 text-xl tracking-tight">Retinix</span>
            <Badge variant="emerald" className="hidden sm:inline-flex ml-2">
              Clinical Platform
            </Badge>
          </div>

          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-emerald-700 transition-colors">How it works</a>
            <a href="#demo" className="hover:text-emerald-700 transition-colors">Interactive Demo</a>
            <a href="#platform" className="hover:text-emerald-700 transition-colors">Portals</a>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>MongoDB Atlas Connected</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/health-worker/login")}
              className="text-xs font-semibold"
            >
              Worker Login
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/doctor")}
              className="text-xs font-semibold"
            >
              Doctor Portal
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden bg-gradient-to-b from-emerald-50/40 via-white to-slate-50">
        <Waves
          lineColor="rgba(16, 185, 129, 0.2)"
          backgroundColor="transparent"
          waveSpeedX={0.012}
          waveSpeedY={0.006}
          waveAmpX={36}
          waveAmpY={18}
          xGap={14}
          yGap={34}
        />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2">
                <Badge variant="emerald" className="gap-1.5 py-1 px-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  AI Retinal Screening & Tele-Triage
                </Badge>
                <span className="text-xs text-slate-500 font-medium">Rural-First Protocol</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Bring expert retinal screening closer to{" "}
                <span className="text-emerald-700">every community.</span>
              </h1>

              <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
                Retinix assists rural healthcare workers in screening fundus photographs for diabetic retinopathy with deep learning inference, explainable Grad-CAM heatmaps, and direct tele-referrals to city ophthalmologists.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={() => navigate("/health-worker/screening/new")}
                  className="gap-2 shadow-sm font-semibold"
                >
                  <Eye size={18} />
                  <span>Start a Screening</span>
                  <ArrowRight size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/health-worker")}
                  className="font-semibold"
                >
                  <span>Explore Worker Portal</span>
                </Button>
              </div>

              {/* Verified Clinical Metrics */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 max-w-lg">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
                    98.4%
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Clinical Sensitivity</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
                    15,280+
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Patients Screened</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-700 font-mono">
                    &lt; 1.2s
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Model Inference</div>
                </div>
              </div>
            </div>

            {/* Right Hero Fundus Card */}
            <div className="lg:col-span-5 flex justify-center">
              <Card className="w-full max-w-md shadow-xl border-slate-200/90 bg-white/95 backdrop-blur-xs">
                <CardHeader className="pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <CardTitle className="text-sm">Fundus AI Inspection</CardTitle>
                    </div>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      PyTorch ResNet-152
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Live demonstration of retinal lesion detection with Grad-CAM
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-5 space-y-4">
                  {/* Fundus Circle View with Laser Scan & Crosshairs */}
                  <div className="flex justify-center py-2">
                    <div className="relative w-56 h-56 rounded-full overflow-hidden border-4 border-slate-100 shadow-inner bg-slate-950 flex items-center justify-center group">
                      <RetinalImage
                        mode={viewMode as any}
                        size={224}
                        animated
                        risk={selectedStage === "severe" ? "high" : "low"}
                      />

                      {/* Cool Laser Scan Beam */}
                      <div className="absolute inset-0 pointer-events-none rounded-full overflow-hidden">
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(6,182,212,0.9)] animate-laser-scan" />
                      </div>

                      {/* Reticle Crosshair */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-14 h-14 border border-emerald-400/30 rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-emerald-400/60 rounded-full" />
                        </div>
                        <div className="absolute w-20 h-[1px] bg-emerald-400/20" />
                        <div className="absolute h-20 w-[1px] bg-emerald-400/20" />
                      </div>

                      {/* Live Badge */}
                      <div className="absolute top-2.5 left-3 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5 text-[9px] text-emerald-400 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        GRAD-CAM ACTIVE
                      </div>
                    </div>
                  </div>

                  {/* Stage and View Controls */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="text-xs font-medium text-slate-700 mb-1.5">Sample Case:</div>
                      <Tabs value={selectedStage} onValueChange={setSelectedStage}>
                        <TabsList className="grid grid-cols-2 w-full">
                          <TabsTrigger value="normal">Grade 0 · Normal</TabsTrigger>
                          <TabsTrigger value="severe">Grade 4 · Severe DR</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-slate-700 mb-1.5">Visualization Layer:</div>
                      <Tabs value={viewMode} onValueChange={setViewMode}>
                        <TabsList className="grid grid-cols-3 w-full">
                          <TabsTrigger value="original">Original</TabsTrigger>
                          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
                          <TabsTrigger value="overlay">Overlay</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>

                  {/* Result Box */}
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">
                        {selectedStage === "severe" ? "Proliferative Diabetic Retinopathy" : "No Apparent Diabetic Retinopathy"}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {selectedStage === "severe" ? "Triage: Urgent Specialist Evaluation" : "Triage: Routine Annual Follow-Up"}
                      </div>
                    </div>
                    <Badge variant={selectedStage === "severe" ? "destructive" : "emerald"} className="font-mono">
                      {selectedStage === "severe" ? "92% Conf" : "99% Conf"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection Portals Gateway with Shadcn Cards */}
      <section id="platform" className="py-20 px-6 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <Badge variant="emerald" className="font-medium">
              Dual-Tier System
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900">Dedicated Portals for Every Role</h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              Separated, role-optimized interfaces designed specifically for frontline community workers and supervising ophthalmologists.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Healthcare Worker Card */}
            <Card className="hover:border-emerald-300 transition-all hover:shadow-md flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                    <Stethoscope size={22} />
                  </div>
                  <Badge variant="emerald">Primary Screener</Badge>
                </div>
                <CardTitle className="text-xl">Healthcare Worker Portal</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Streamlined for field workers at rural health posts. Capture fundus images, inspect real-time AI results, and submit referrals in minutes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {[
                    "Single-screen screening workflow with guided validation",
                    "Grad-CAM explainability heatmaps for clinical context",
                    "Patient roster directory and offline SQLite fallback",
                    "One-click tele-referral generation to eye hospitals"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/health-worker/login")}
                    className="text-xs text-slate-500 hover:text-slate-900"
                  >
                    Direct Sign In (HW-101)
                  </Button>
                  <Button
                    onClick={() => navigate("/health-worker")}
                    className="gap-1.5 font-semibold"
                  >
                    <span>Open Worker Portal</span>
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Doctor Card */}
            <Card className="hover:border-emerald-300 transition-all hover:shadow-md flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200">
                    <Shield size={22} />
                  </div>
                  <Badge variant="secondary">Ophthalmology Lead</Badge>
                </div>
                <CardTitle className="text-xl">Doctor & Specialist Portal</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Designed for retina specialists to triage incoming rural referrals, make definitive diagnoses, and manage healthcare worker access.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {[
                    "Priority triage queue ranking urgent cases first",
                    "Interactive fundus review with original, heatmap & overlay",
                    "Healthcare worker registry & granular permissions governance",
                    "Real-time MongoDB Atlas clinical database sync"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/doctor/workers")}
                    className="text-xs text-slate-500 hover:text-slate-900"
                  >
                    Manage Worker Roster
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/doctor")}
                    className="gap-1.5 font-semibold border-slate-300 text-slate-900"
                  >
                    <span>Open Doctor Portal</span>
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 space-y-2">
            <Badge variant="secondary" className="font-medium">
              Clinical Pipeline
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900">How Retinix Operates</h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              From village health post screening to specialist evaluation in six clinical steps.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((s, idx) => (
              <Card key={idx} className="hover:border-emerald-200 hover:shadow-sm transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      {s.n}
                    </span>
                    <Badge variant="outline" className="text-[10px] text-slate-500">
                      {s.badge}
                    </Badge>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center mb-2">
                    {s.icon}
                  </div>
                  <CardTitle className="text-base">{s.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 px-6 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <Badge variant="emerald">Platform Architecture</Badge>
              <h3 className="text-3xl font-bold text-slate-900 leading-tight">
                Designed for low-connectivity rural health posts and busy hospital clinics.
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                By executing PyTorch inference and Grad-CAM generation in-memory, Retinix only persists numerical clinical indicators and referral triage vectors to MongoDB Atlas. This ensures ultra-fast transmission even over spotty 2G mobile data connections.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                {features.map((f, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5">
                    <div className="mb-2">{f.icon}</div>
                    <div className="text-sm font-semibold text-slate-900">{f.title}</div>
                    <div className="text-xs text-slate-500 leading-relaxed">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture Card */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Database size={18} className="text-emerald-600" />
                  <CardTitle className="text-base">Live Infrastructure Specifications</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Active connection to MongoDB Atlas cloud database
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 font-mono text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-sans">Database Engine</span>
                  <span className="font-semibold text-slate-800">MongoDB Atlas (replica set)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-sans">Deep Learning Model</span>
                  <span className="font-semibold text-emerald-700">PyTorch ResNet-152 + Grad-CAM</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-sans">Storage Boundary</span>
                  <span className="font-semibold text-slate-800">Metrics Only (Zero Raw Images)</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 font-sans">Failover Engine</span>
                  <span className="font-semibold text-slate-800">Local SQLite Auto-Migration</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section with Waves */}
      <section className="relative py-24 px-6 overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 text-white">
        <Waves
          lineColor="rgba(16, 185, 129, 0.22)"
          backgroundColor="transparent"
          waveSpeedX={0.015}
          waveSpeedY={0.007}
          waveAmpX={38}
          waveAmpY={18}
          xGap={14}
          yGap={32}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Sparkles size={13} className="text-emerald-400" />
            Field-Tested Tele-Ophthalmology
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to experience next-generation retinal screening?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Test the live PyTorch model with fundus photographs, review Grad-CAM explainability heatmaps, and simulate rural tele-ophthalmology triage in real time.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Button
              size="lg"
              onClick={() => navigate("/health-worker/screening/new")}
              className="gap-2 shadow-lg shadow-emerald-500/20 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
            >
              <Eye size={18} />
              <span>Start Retinal Screening</span>
              <ArrowRight size={16} />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/doctor")}
              className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700 font-semibold cursor-pointer"
            >
              <span>Access Doctor Review Queue</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white">
              <Eye size={13} />
            </div>
            <span className="font-semibold text-slate-800 text-sm">Retinix</span>
            <span className="text-slate-400 text-sm">·</span>
            <span className="text-xs text-slate-500 italic">See earlier. Explain better. Refer smarter.</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Clinical Tele-Ophthalmology System</span>
            <span>·</span>
            <span className="text-emerald-700 font-medium">MongoDB Atlas Live</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

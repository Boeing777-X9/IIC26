"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye, Lock, User, ArrowRight, AlertCircle, CheckCircle2, Shield, EyeOff, Sparkles
} from "lucide-react";
import { loginWorkerApi } from "@/lib/store";
import { Waves, SpotlightCard, ShinyText } from "@/components/reactbits";

export default function WorkerLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login.trim() || !password.trim()) {
      setErrorMsg("Please enter both your Worker ID / Email and Password.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const res = await loginWorkerApi(login.trim(), password.trim());
    setIsLoading(false);

    if (res.success) {
      router.push("/health-worker");
    } else {
      setErrorMsg(res.error || "Login failed. Please check your credentials.");
    }
  };

  const handleQuickFill = (workerId: string, pwd: string) => {
    setLogin(workerId);
    setPassword(pwd);
    setErrorMsg(null);
  };

  return (
    <div className="relative min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* ReactBits Waves Background */}
      <Waves
        lineColor="rgba(6, 182, 212, 0.22)"
        backgroundColor="transparent"
        waveSpeedX={0.015}
        waveSpeedY={0.007}
        waveAmpX={36}
        waveAmpY={18}
        xGap={14}
        yGap={34}
      />

      {/* Top Brand */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Eye size={22} className="text-white" />
          </div>
          <span className="font-bold text-white tracking-tight text-2xl">Retinix</span>
        </Link>
        <div className="flex items-center justify-center gap-2 mb-2">
          <ShinyText
            text="CLINICAL TELE-TRIAGE GATEWAY"
            className="text-xs tracking-wider uppercase font-semibold"
            color="#64748b"
            shineColor="#38bdf8"
            speed={2.5}
          />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Healthcare Worker Portal</h2>
        <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
          Sign in to access AI retinal screening, patient tele-triage, and clinical referrals.
        </p>
      </div>

      {/* Login Card with ReactBits SpotlightCard */}
      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <SpotlightCard
          className="bg-slate-900/80 border-slate-800/80 backdrop-blur-2xl py-8 px-6 sm:px-10 shadow-2xl shadow-cyan-950/40"
          spotlightColor="rgba(6, 182, 212, 0.2)"
        >
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-red-950/60 border border-red-800/60 rounded-2xl flex items-start gap-2.5 text-xs text-red-200 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Worker ID / Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Worker ID or Registered Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={login}
                  onChange={e => setLogin(e.target.value)}
                  placeholder="e.g. HW-101 or priya.venkat@health.gov.in"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Access Password / PIN
                </label>
                <span className="text-[11px] text-slate-500">Issued by Root Doctor</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white py-2.5 px-4 rounded-xl font-semibold text-sm transition-all shadow-md shadow-cyan-900/30 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <span>Sign In as Healthcare Worker</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Demo Quick Fill */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" />
              Demo / Seeded Credentials
            </p>
            <button
              type="button"
              onClick={() => handleQuickFill("HW-101", "retinix2026")}
              className="w-full text-left p-3 rounded-xl border border-cyan-900/50 bg-cyan-950/20 hover:bg-cyan-950/40 transition-colors group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                    Dr. Kavitha Selvam (Lead Screening Specialist)
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    ID: <span className="text-cyan-400 font-bold">HW-101</span> · PIN: <span className="text-slate-200 font-bold">retinix2026</span>
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-cyan-300 bg-cyan-900/60 px-2.5 py-1 rounded-lg border border-cyan-700/60 shrink-0">
                  Quick Fill
                </span>
              </div>
            </button>
          </div>

          {/* Administrative notice */}
          <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-200 transition-colors">
              ← Return Home
            </Link>
            <Link href="/doctor/workers" className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1">
              <Shield size={12} /> Doctor Admin Portal
            </Link>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}

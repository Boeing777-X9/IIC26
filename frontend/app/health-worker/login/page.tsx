"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye, Lock, User, ArrowRight, AlertCircle, CheckCircle2, Shield, EyeOff, Sparkles
} from "lucide-react";
import { loginWorkerApi, DEFAULT_WORKER } from "@/lib/store";

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
    <div className="min-h-screen bg-[#f0fdf8] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Brand */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-200 group-hover:bg-emerald-700 transition-colors">
            <Eye size={20} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-xl">Retinix</span>
        </Link>
        <h2 className="text-2xl font-bold text-slate-900">Healthcare Worker Portal</h2>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          Sign in to access AI retinal screening, patient tele-triage, and clinical referrals.
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-3xl sm:px-10">
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Worker ID / Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Worker ID or Registered Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={login}
                  onChange={e => setLogin(e.target.value)}
                  placeholder="e.g. HW-101 or priya.venkat@health.gov.in"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Access Password / PIN
                </label>
                <span className="text-[11px] text-slate-400">Issued by Root Doctor</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl font-semibold text-sm transition-all shadow-sm shadow-emerald-200 disabled:opacity-50 cursor-pointer"
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
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-500" />
              Demo / Seeded Credentials
            </p>
            <button
              type="button"
              onClick={() => handleQuickFill("HW-101", "retinix2026")}
              className="w-full text-left p-3 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-emerald-800">
                    Priya Venkat (Primary Health Screener)
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    ID: <span className="text-emerald-700 font-bold">HW-101</span> · PIN: <span className="text-slate-700 font-bold">retinix2026</span>
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-white px-2 py-1 rounded-lg border border-emerald-200 shrink-0">
                  Quick Fill
                </span>
              </div>
            </button>
          </div>

          {/* Administrative notice */}
          <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-800 transition-colors">
              ← Return Home
            </Link>
            <Link href="/doctor/workers" className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
              <Shield size={12} /> Doctor Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye, Lock, User, ArrowRight, AlertCircle, Shield, EyeOff, Sparkles, Stethoscope
} from "lucide-react";
import { loginWorkerApi } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-200 group-hover:bg-emerald-700 transition-colors">
            <Eye size={20} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-2xl">Retinix</span>
        </Link>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Badge variant="emerald" className="gap-1 px-3 py-1 font-medium">
            <Stethoscope size={12} className="text-emerald-700" />
            Healthcare Worker Portal
          </Badge>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Authentication</h2>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          Sign in to access AI retinal screening, patient tele-triage, and clinical referrals.
        </p>
      </div>

      {/* Shadcn Card for Login */}
      <div className="relative z-10 mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-md border-slate-200/80 bg-white/95 backdrop-blur-sm">
          <CardContent className="pt-6">
            {errorMsg && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
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
                  <Input
                    type="text"
                    required
                    value={login}
                    onChange={e => setLogin(e.target.value)}
                    placeholder="e.g. HW-101 or kavitha.selvam@health.gov.in"
                    className="pl-10 font-mono text-sm"
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
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="pl-10 pr-10 text-sm"
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

              {/* Submit button with shadcn Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 h-11 text-sm font-semibold shadow-sm"
              >
                {isLoading ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <span>Sign In as Healthcare Worker</span>
                    <ArrowRight size={15} className="ml-1.5" />
                  </>
                )}
              </Button>
            </form>

            {/* Demo Quick Fill */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-500" />
                  Demo Credentials
                </span>
                <span className="text-[11px] text-slate-400">Pre-seeded Screener</span>
              </div>
              <button
                type="button"
                onClick={() => handleQuickFill("HW-101", "retinix2026")}
                className="w-full text-left p-3 rounded-xl border border-emerald-200/80 bg-emerald-50/50 hover:bg-emerald-50 transition-colors group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-emerald-800">
                      Dr. Kavitha Selvam (CHC Tirunelveli)
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      ID: <span className="text-emerald-700 font-bold">HW-101</span> · PIN: <span className="text-slate-700 font-bold">retinix2026</span>
                    </p>
                  </div>
                  <Badge variant="emerald" className="text-[10px] bg-white text-emerald-700 shadow-2xs">
                    Quick Fill
                  </Badge>
                </div>
              </button>
            </div>

            {/* Navigation links */}
            <div className="mt-6 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-50">
              <Link href="/" className="hover:text-slate-800 transition-colors font-medium">
                ← Return to Retinix
              </Link>
              <Link href="/doctor/workers" className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1">
                <Shield size={12} /> Doctor Admin Portal
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

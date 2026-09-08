"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LandingContent from "@/components/LandingContent";

function RoleRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  useEffect(() => {
    if (role === "worker") {
      router.replace("/health-worker");
    } else if (role === "doctor") {
      router.replace("/doctor");
    }
  }, [role, router]);

  return null;
}

export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <RoleRedirect />
      </Suspense>
      <LandingContent />
    </>
  );
}

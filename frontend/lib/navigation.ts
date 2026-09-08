"use client";

import { useRouter as useNextRouter, useParams as useNextParams, useSearchParams as useNextSearchParams } from "next/navigation";
import Link from "next/link";
import React from "react";

export function useNavigate() {
  const router = useNextRouter();
  return (to: string | number, options?: { replace?: boolean }) => {
    if (typeof to === "number") {
      if (to < 0) {
        router.back();
      }
      return;
    }
    if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };
}

export function useParams<T extends Record<string, string | string[] | undefined> = Record<string, string>>(): T {
  const params = useNextParams();
  return (params || {}) as T;
}

export function useSearchParams(): [URLSearchParams, (params: URLSearchParams) => void] {
  const sp = useNextSearchParams();
  const searchParams = React.useMemo(() => new URLSearchParams(sp ? sp.toString() : ""), [sp]);
  return [searchParams, () => {}];
}

export { Link };

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import type { AuthUser } from "@/contexts/auth-context";

export type { AuthUser };

export function useAuth(requireAuth = true) {
  const router = useRouter();
  const { user, token, loading, refreshToken } = useAuthContext();

  useEffect(() => {
    if (loading) return;
    if (requireAuth && !user) {
      router.replace("/login");
    }
  }, [loading, requireAuth, user, router]);

  return { user, token, loading, refreshToken };
}

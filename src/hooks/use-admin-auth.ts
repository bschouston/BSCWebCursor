"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import type { AuthUser } from "@/contexts/auth-context";

export type { AuthUser };

export function useAdminAuth() {
  const router = useRouter();
  const { user, token, loading } = useAuthContext();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      router.replace("/member");
    }
  }, [loading, user, router]);

  return { user, token, loading };
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import type { AuthUser } from "@/contexts/auth-context";

export type { AuthUser };

export function useSuperAdminAuth() {
  const router = useRouter();
  const { user, token, loading } = useAuthContext();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "SUPER_ADMIN") {
      router.replace("/admin");
    }
  }, [loading, user, router]);

  return { user, token, loading };
}

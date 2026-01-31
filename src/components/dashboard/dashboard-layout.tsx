"use client";

import { useAuth } from "@/hooks/use-auth";
import { MemberSidebar } from "./member-sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth(true);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      <MemberSidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}

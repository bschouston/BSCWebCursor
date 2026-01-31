"use client";

import { useAdminAuth } from "@/hooks/use-admin-auth";
import { AdminSidebar } from "./admin-sidebar";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}

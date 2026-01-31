"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/superadmin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/superadmin/users", label: "Users", icon: Users },
  { href: "/superadmin/billing", label: "Billing", icon: CreditCard },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r bg-muted/30 p-4">
      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
        <Link
          href="/admin"
          className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          ← Back to Admin
        </Link>
      </nav>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  Coins,
  ShoppingCart,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/member", label: "Dashboard", icon: LayoutDashboard },
  { href: "/member/events", label: "My Events", icon: Ticket },
  { href: "/member/calendar", label: "Calendar", icon: Calendar },
  { href: "/member/tokens", label: "Tokens", icon: Coins },
  { href: "/member/purchase", label: "Purchase", icon: ShoppingCart },
  { href: "/member/profile", label: "Profile", icon: User },
];

export function MemberSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r bg-muted/30 p-4">
      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
    pathname === link.href ||
    (link.href !== "/member" && pathname.startsWith(link.href + "/"));
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
      </nav>
    </aside>
  );
}

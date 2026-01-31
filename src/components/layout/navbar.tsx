"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { getFirebaseAuth } from "@/lib/firebase/client";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/news", label: "News" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading } = useAuth(false);

  const showAdmin = user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN");
  const showSuperAdmin = user?.role === "SUPER_ADMIN";

  async function handleLogout() {
    const auth = getFirebaseAuth();
    if (auth) {
      await signOut(auth);
      router.push("/");
    }
  }

  const authLinks = (
    <>
      {user && (
        <Button variant="ghost" size="sm" asChild>
          <Link href="/member">Member</Link>
        </Button>
      )}
      {showAdmin && (
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin">Admin</Link>
        </Button>
      )}
      {showSuperAdmin && (
        <Button variant="ghost" size="sm" asChild>
          <Link href="/superadmin">Super Admin</Link>
        </Button>
      )}
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="sm">
              {user.firstName || user.email}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/member">Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/member/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        !loading && (
          <Button variant="default" size="sm" asChild>
            <Link href="/login">Login</Link>
          </Button>
        )
      )}
    </>
  );

  const mobileAuthLinks = user ? (
    <div className="mt-4 flex flex-col gap-2">
      <Button variant="outline" asChild>
        <Link href="/member" onClick={() => setMobileOpen(false)}>
          Member
        </Link>
      </Button>
      {showAdmin && (
        <Button variant="outline" asChild>
          <Link href="/admin" onClick={() => setMobileOpen(false)}>
            Admin
          </Link>
        </Button>
      )}
      {showSuperAdmin && (
        <Button variant="outline" asChild>
          <Link href="/superadmin" onClick={() => setMobileOpen(false)}>
            Super Admin
          </Link>
        </Button>
      )}
      <Button
        variant="destructive"
        onClick={() => {
          setMobileOpen(false);
          handleLogout();
        }}
      >
        Logout
      </Button>
    </div>
  ) : (
    !loading && (
      <Button asChild className="mt-4">
        <Link href="/login" onClick={() => setMobileOpen(false)}>
          Login
        </Link>
      </Button>
    )
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link
          href="/"
          className="text-lg font-bold text-primary hover:text-primary/90"
        >
          Burhani Sports Club
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex md:items-center md:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {authLinks}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "text-base font-medium transition-colors hover:text-primary",
                      pathname === link.href
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                {mobileAuthLinks}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

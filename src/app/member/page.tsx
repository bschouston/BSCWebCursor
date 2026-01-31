"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  description?: string;
}

export default function MemberPage() {
  const { user, token } = useAuth(true);
  const [profile, setProfile] = useState<{ upcomingRsvps: number; profileComplete: boolean } | null>(null);
  const [packages, setPackages] = useState<TokenPackage[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch("/api/member/profile", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok && r.json())
      .then((p) => p && setProfile(p));
  }, [token]);

  useEffect(() => {
    fetch("/api/token-packages")
      .then((r) => r.json())
      .then((data) => setPackages(data.packages?.slice(0, 4) ?? []));
  }, []);

  if (!user) return null;

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <div>
      <h1 className="text-3xl font-bold">Welcome, {displayName}</h1>
      <p className="mt-2 text-muted-foreground">Member Dashboard</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Token Balance</h2>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{user.tokenBalance}</p>
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link href="/member/purchase">Purchase Tokens</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Upcoming Events</h2>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{profile?.upcomingRsvps ?? 0}</p>
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link href="/member/events">View My Events</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Profile</h2>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {profile?.profileComplete ? "Complete" : "Incomplete"}
            </p>
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link href="/member/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {packages.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Token Packages</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {packages.map((pkg) => (
              <Card key={pkg.id}>
                <CardHeader>
                  <h3 className="font-semibold">{pkg.name}</h3>
                  <p className="text-2xl font-bold">{pkg.tokens} tokens</p>
                  <p className="text-sm text-muted-foreground">${(pkg.price / 100).toFixed(2)}</p>
                </CardHeader>
                <CardContent>
                  <Button asChild size="sm">
                    <Link href="/member/purchase">Purchase</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

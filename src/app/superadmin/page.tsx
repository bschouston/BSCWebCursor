"use client";

import Link from "next/link";
import { useSuperAdminAuth } from "@/hooks/use-superadmin-auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalPurchases: number;
  pendingPurchases: number;
  completedPurchases: number;
  totalRevenue: number;
}

export default function SuperAdminPage() {
  const { token } = useSuperAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch("/api/superadmin/stats", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setStats);
  }, [token]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Super Admin</h1>
      <p className="mt-2 text-muted-foreground">System overview</p>

      {stats && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-medium text-muted-foreground">Total Users</h2>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-sm font-medium text-muted-foreground">Active Users</h2>
              <p className="text-2xl font-bold">{stats.activeUsers}</p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-sm font-medium text-muted-foreground">Total Purchases</h2>
              <p className="text-2xl font-bold">{stats.totalPurchases}</p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-sm font-medium text-muted-foreground">Pending Purchases</h2>
              <p className="text-2xl font-bold">{stats.pendingPurchases}</p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-sm font-medium text-muted-foreground">Total Revenue</h2>
              <p className="text-2xl font-bold">${(stats.totalRevenue / 100).toFixed(2)}</p>
            </CardHeader>
          </Card>
        </div>
      )}

      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link href="/superadmin/users">User Management</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/superadmin/billing">Billing Management</Link>
        </Button>
      </div>
    </div>
  );
}

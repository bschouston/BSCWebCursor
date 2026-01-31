"use client";

import Link from "next/link";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface Stats {
  totalEvents: number;
  upcomingEvents: number;
  totalRsvps: number;
  activeMembers: number;
}

export default function AdminPage() {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setStats);
  }, [token]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Manage events and news</p>

      {stats && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-medium text-muted-foreground">Total Events</h2>
              <p className="text-2xl font-bold">{stats.totalEvents}</p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-sm font-medium text-muted-foreground">Upcoming Events</h2>
              <p className="text-2xl font-bold">{stats.upcomingEvents}</p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-sm font-medium text-muted-foreground">Total RSVPs</h2>
              <p className="text-2xl font-bold">{stats.totalRsvps}</p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-sm font-medium text-muted-foreground">Active Members</h2>
              <p className="text-2xl font-bold">{stats.activeMembers}</p>
            </CardHeader>
          </Card>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-4">
        <Button asChild>
          <Link href="/admin/events/new">Create Event</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/events">View Events</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/news">Manage News</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/news/new">Create News</Link>
        </Button>
      </div>
    </div>
  );
}

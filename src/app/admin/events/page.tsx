"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, MapPin } from "lucide-react";
import type { Event } from "@/lib/types";

const CATEGORY_LABELS: Record<string, string> = {
  WEEKLY_SPORTS: "Weekly Sports",
  MONTHLY_EVENTS: "Monthly Events",
  FEATURED_EVENTS: "Featured",
};
const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminEventsPage() {
  const { token } = useAdminAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!token) return;
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    fetch(`/api/admin/events?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setEvents(data.events ?? []))
      .finally(() => setLoading(false));
  }, [token, statusFilter]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="mt-2 text-muted-foreground">Manage all events</p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">Create Event</Link>
        </Button>
      </div>

      <div className="mt-6 flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="mt-8 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      ) : events.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No events found.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <span className="text-xs text-accent">{CATEGORY_LABELS[event.category]}</span>
                  <h3 className="font-semibold">{event.title}</h3>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(event.startTime)}
                    {event.locationName && (
                      <>
                        <MapPin className="h-4 w-4" />
                        {event.locationName}
                      </>
                    )}
                  </div>
                  <span className={`mt-2 inline-block rounded px-2 py-0.5 text-xs ${
                    event.status === "PUBLISHED" ? "bg-green-100 dark:bg-green-900/30" :
                    event.status === "DRAFT" ? "bg-gray-100 dark:bg-gray-800" :
                    event.status === "CANCELLED" ? "bg-red-100 dark:bg-red-900/30" :
                    "bg-blue-100 dark:bg-blue-900/30"
                  }`}>
                    {STATUS_LABELS[event.status]}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/events/${event.id}/rsvps`}>RSVPs</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/events/${event.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {event.rsvpCount ?? 0} / {event.capacity} spots · {event.tokensRequired} token(s)
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

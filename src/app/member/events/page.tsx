"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";
import type { Event } from "@/lib/types";

interface Rsvp {
  id: string;
  eventId: string;
  event: Event;
  status: string;
  waitlistPosition: number | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  WEEKLY_SPORTS: "Weekly Sports",
  MONTHLY_EVENTS: "Monthly Events",
  FEATURED_EVENTS: "Featured",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MemberEventsPage() {
  const { token } = useAuth(true);
  const { toast } = useToast();
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch("/api/member/rsvps", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/events"),
    ])
      .then(async ([r1, r2]) => [await r1.json(), await r2.json()])
      .then(([rsvpData, eventsData]) => {
        setRsvps(rsvpData.rsvps ?? []);
        setEvents(eventsData.events ?? []);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleRsvp(eventId: string) {
    if (!token) return;
    try {
      const res = await fetch("/api/member/rsvps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: data.status === "WAITLISTED" ? "Added to waitlist" : "RSVP confirmed!" });
        const [r1, r2] = await Promise.all([
          fetch("/api/member/rsvps", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/events"),
        ]);
        const [rsvpData, eventsData] = await Promise.all([r1.json(), r2.json()]);
        setRsvps(rsvpData.rsvps ?? []);
        setEvents(eventsData.events ?? []);
      } else {
        toast({ title: data.error ?? "Failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to RSVP", variant: "destructive" });
    }
  }

  async function handleCancel(eventId: string) {
    if (!token) return;
    try {
      const res = await fetch(`/api/member/rsvps?eventId=${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast({ title: "RSVP cancelled" });
        const r1 = await fetch("/api/member/rsvps", { headers: { Authorization: `Bearer ${token}` } });
        const rsvpData = await r1.json();
        setRsvps(rsvpData.rsvps ?? []);
      }
    } catch {
      toast({ title: "Failed to cancel", variant: "destructive" });
    }
  }

  const rsvpEventIds = new Set(rsvps.filter((r) => r.status !== "CANCELLED").map((r) => r.eventId));
  const availableEvents = events.filter((e) => !rsvpEventIds.has(e.id));

  if (loading) {
    return <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">My Events</h1>
      <p className="mt-2 text-muted-foreground">Manage your RSVPs and browse events</p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">My RSVPs</h2>
        {rsvps.filter((r) => r.status !== "CANCELLED").length === 0 ? (
          <p className="mt-4 text-muted-foreground">No RSVPs yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {rsvps
              .filter((r) => r.status !== "CANCELLED")
              .map((r) => (
                <Card key={r.id}>
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <span className="text-xs text-accent">{CATEGORY_LABELS[r.event.category]}</span>
                      <h3 className="font-semibold">{r.event.title}</h3>
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(r.event.startTime)}
                        {r.event.locationName && (
                          <>
                            <MapPin className="h-4 w-4" />
                            {r.event.locationName}
                          </>
                        )}
                      </div>
                      <span
                        className={`mt-2 inline-block rounded px-2 py-0.5 text-xs ${
                          r.status === "CONFIRMED" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {r.status === "WAITLISTED" ? `Waitlist #${r.waitlistPosition}` : "Confirmed"}
                      </span>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleCancel(r.eventId)}>
                      Cancel
                    </Button>
                  </CardHeader>
                </Card>
              ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Available Events</h2>
        {availableEvents.length === 0 ? (
          <p className="mt-4 text-muted-foreground">No available events.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {availableEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <span className="text-xs text-accent">{CATEGORY_LABELS[event.category]}</span>
                  <h3 className="font-semibold">{event.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(event.startTime)}
                  </div>
                  <p className="text-sm">{event.tokensRequired} token(s) required</p>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleRsvp(event.id)}>
                      RSVP
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/events/${event.id}`}>Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

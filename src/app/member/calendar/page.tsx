"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon, MapPin } from "lucide-react";
import type { Event } from "@/lib/types";

interface CalendarEvent extends Event {
  rsvpStatus: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MemberCalendarPage() {
  const { token } = useAuth(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch("/api/member/calendar", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setEvents(data.events ?? []))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />;
  }

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.startTime) >= now);
  const past = events.filter((e) => new Date(e.startTime) < now).reverse();

  return (
    <div>
      <h1 className="text-3xl font-bold">Calendar</h1>
      <p className="mt-2 text-muted-foreground">Your RSVP&apos;d events</p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="mt-4 text-muted-foreground">No upcoming events.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {upcoming.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold">{event.title}</h3>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      {formatDate(event.startTime)}
                      {event.locationName && (
                        <>
                          <MapPin className="h-4 w-4" />
                          {event.locationName}
                        </>
                      )}
                    </div>
                    <span className="mt-2 inline-block rounded bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      {event.rsvpStatus}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Past</h2>
        {past.length === 0 ? (
          <p className="mt-4 text-muted-foreground">No past events.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {past.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="opacity-75 transition-opacity hover:opacity-100">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold">{event.title}</h3>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      {formatDate(event.startTime)}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

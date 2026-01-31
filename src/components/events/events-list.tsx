"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, MapPin, Users } from "lucide-react";
import type { Event } from "@/lib/types";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Events" },
  { value: "WEEKLY_SPORTS", label: "Weekly Sports" },
  { value: "MONTHLY_EVENTS", label: "Monthly Events" },
  { value: "FEATURED_EVENTS", label: "Featured Events" },
];

const CATEGORY_LABELS: Record<string, string> = {
  WEEKLY_SPORTS: "Weekly Sports",
  MONTHLY_EVENTS: "Monthly Events",
  FEATURED_EVENTS: "Featured",
};

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function EventsList({ initialEvents }: { initialEvents: Event[] }) {
  const [category, setCategory] = useState("all");
  const filteredEvents =
    category === "all"
      ? initialEvents
      : initialEvents.filter((e) => e.category === category);

  return (
    <div className="mt-8">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredEvents.length === 0 ? (
        <p className="text-muted-foreground">No events match your filters.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader className="pb-2">
                  <span className="text-xs font-medium text-accent">
                    {CATEGORY_LABELS[event.category] ?? event.category}
                  </span>
                  <h3 className="text-lg font-semibold">{event.title}</h3>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0" />
                    {formatDate(event.startTime)}
                  </div>
                  {event.locationName && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {event.locationName}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4 shrink-0" />
                    {event.rsvpCount ?? 0} / {event.capacity} spots
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";
import type { Event } from "@/lib/types";

const CATEGORY_LABELS: Record<string, string> = {
  WEEKLY_SPORTS: "Weekly Sports",
  MONTHLY_EVENTS: "Monthly Events",
  FEATURED_EVENTS: "Featured",
};

function formatDate(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function UpcomingEvents({ events }: { events: Event[] }) {
  const displayEvents = events.slice(0, 6);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Upcoming Events</h2>
          <Button variant="ghost" asChild>
            <Link href="/events">View all events</Link>
          </Button>
        </div>
        {displayEvents.length === 0 ? (
          <p className="mt-8 text-muted-foreground">
            No upcoming events. Check back soon!
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayEvents.map((event) => (
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
                      <Calendar className="h-4 w-4" />
                      {formatDate(event.startTime)}
                    </div>
                    {event.locationName && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {event.locationName}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

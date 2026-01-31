import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, MapPin, Users, Coins } from "lucide-react";
import { getEventById } from "@/lib/data/events";

const CATEGORY_LABELS: Record<string, string> = {
  WEEKLY_SPORTS: "Weekly Sports",
  MONTHLY_EVENTS: "Monthly Events",
  FEATURED_EVENTS: "Featured",
};

const GENDER_LABELS: Record<string, string> = {
  ALL: "All",
  MALE_ONLY: "Male Only",
  FEMALE_ONLY: "Female Only",
};

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  return (
    <div className="container mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <span className="text-sm font-medium text-accent">
            {CATEGORY_LABELS[event.category] ?? event.category}
          </span>
          <h1 className="text-3xl font-bold">{event.title}</h1>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>{formatDate(event.startTime)}</span>
            </div>
            {event.locationName && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span>{event.locationName}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span>
                {event.rsvpCount ?? 0} / {event.capacity} spots
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-muted-foreground" />
              <span>{event.tokensRequired} token(s) required</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Gender policy
            </p>
            <p>{GENDER_LABELS[event.genderPolicy] ?? event.genderPolicy}</p>
          </div>
          {event.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Description
              </p>
              <p className="mt-1 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/login">RSVP (Login required)</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/member/events">Browse Events</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { EventsList } from "@/components/events/events-list";
import { getPublishedEvents } from "@/lib/data/events";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await getPublishedEvents({ limit: 50 });
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">Events</h1>
      <p className="mt-2 text-muted-foreground">
        Browse upcoming sports events and activities
      </p>
      <EventsList initialEvents={events} />
    </div>
  );
}

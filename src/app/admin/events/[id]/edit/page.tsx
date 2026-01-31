"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface Sport {
  id: string;
  name: string;
}
interface Location {
  id: string;
  name: string;
}
interface Event {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  sportId: string;
  locationId?: string | null;
  startTime: string;
  endTime: string;
  capacity: number;
  tokensRequired: number;
  genderPolicy: string;
  status: string;
}

export default function EditEventPage() {
  const params = useParams();
  const id = params.id as string;
  const { token } = useAdminAuth();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [sports, setSports] = useState<Sport[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    Promise.all([
      fetch(`/api/admin/events/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/admin/sports", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/admin/locations", { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(async ([e, s, l]) => {
        const [eventData, sportsData, locationsData] = await Promise.all([e.json(), s.json(), l.json()]);
        setEvent(e.ok ? eventData : null);
        setSports(sportsData.data ?? []);
        setLocations(locationsData.data ?? []);
      })
      .catch(() => setEvent(null));
  }, [token, id]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token || !event) return;
    const form = e.currentTarget;
    const data = {
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      description: (form.elements.namedItem("description") as HTMLTextAreaElement).value || null,
      category: (form.elements.namedItem("category") as HTMLSelectElement).value,
      sportId: (form.elements.namedItem("sportId") as HTMLSelectElement).value,
      locationId: (form.elements.namedItem("locationId") as HTMLSelectElement).value || null,
      startTime: new Date((form.elements.namedItem("startTime") as HTMLInputElement).value).toISOString(),
      endTime: new Date((form.elements.namedItem("endTime") as HTMLInputElement).value).toISOString(),
      capacity: parseInt((form.elements.namedItem("capacity") as HTMLInputElement).value, 10),
      tokensRequired: parseInt((form.elements.namedItem("tokensRequired") as HTMLInputElement).value, 10),
      genderPolicy: (form.elements.namedItem("genderPolicy") as HTMLSelectElement).value,
      status: (form.elements.namedItem("status") as HTMLSelectElement).value,
    };
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast({ title: "Event updated" });
        setEvent({ ...event, ...data });
      } else {
        const err = await res.json();
        toast({ title: err.error ?? "Failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (!event) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const toLocal = (iso: string) => iso ? new Date(iso).toISOString().slice(0, 16) : "";

  return (
    <div>
      <h1 className="text-3xl font-bold">Edit Event</h1>
      <p className="mt-2 text-muted-foreground">{event.title}</p>

      <Card className="mt-8 max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" defaultValue={event.title} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={event.description ?? ""}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Category *</Label>
                <select name="category" defaultValue={event.category} required className="mt-2 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1">
                  <option value="WEEKLY_SPORTS">Weekly Sports</option>
                  <option value="MONTHLY_EVENTS">Monthly Events</option>
                  <option value="FEATURED_EVENTS">Featured Events</option>
                </select>
              </div>
              <div>
                <Label>Sport *</Label>
                <select name="sportId" defaultValue={event.sportId} required className="mt-2 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1">
                  {sports.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label>Location</Label>
              <select name="locationId" defaultValue={event.locationId ?? ""} className="mt-2 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1">
                <option value="">None</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input id="startTime" name="startTime" type="datetime-local" required defaultValue={toLocal(event.startTime)} />
              </div>
              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <Input id="endTime" name="endTime" type="datetime-local" required defaultValue={toLocal(event.endTime)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="capacity">Capacity *</Label>
                <Input id="capacity" name="capacity" type="number" min={1} required defaultValue={event.capacity} />
              </div>
              <div>
                <Label htmlFor="tokensRequired">Tokens Required</Label>
                <Input id="tokensRequired" name="tokensRequired" type="number" min={0} defaultValue={event.tokensRequired} />
              </div>
              <div>
                <Label>Gender Policy</Label>
                <select name="genderPolicy" defaultValue={event.genderPolicy} className="mt-2 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1">
                  <option value="ALL">All</option>
                  <option value="MALE_ONLY">Male Only</option>
                  <option value="FEMALE_ONLY">Female Only</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <select name="status" defaultValue={event.status} className="mt-2 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/admin/events/${id}/rsvps`}>View RSVPs</Link>
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/events">Back</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

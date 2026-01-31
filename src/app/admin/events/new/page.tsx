"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Sport {
  id: string;
  name: string;
}
interface Location {
  id: string;
  name: string;
}

export default function NewEventPage() {
  const router = useRouter();
  const { token } = useAdminAuth();
  const { toast } = useToast();
  const [sports, setSports] = useState<Sport[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/sports").then((r) => r.json()),
      fetch("/api/admin/locations").then((r) => r.json()),
    ]).then(([s, l]) => {
      setSports(s.data ?? []);
      setLocations(l.data ?? []);
    }).catch(() => {});
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    const form = e.currentTarget;
    const data = {
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      description: (form.elements.namedItem("description") as HTMLTextAreaElement).value || undefined,
      category: (form.elements.namedItem("category") as HTMLSelectElement).value,
      sportId: (form.elements.namedItem("sportId") as HTMLSelectElement).value,
      locationId: (form.elements.namedItem("locationId") as HTMLSelectElement).value || null,
      startTime: new Date((form.elements.namedItem("startTime") as HTMLInputElement).value).toISOString(),
      endTime: new Date((form.elements.namedItem("endTime") as HTMLInputElement).value).toISOString(),
      capacity: parseInt((form.elements.namedItem("capacity") as HTMLInputElement).value, 10),
      tokensRequired: parseInt((form.elements.namedItem("tokensRequired") as HTMLInputElement).value, 10) || 1,
      genderPolicy: (form.elements.namedItem("genderPolicy") as HTMLSelectElement).value,
      status: (form.elements.namedItem("status") as HTMLSelectElement).value,
    };
    setLoading(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        toast({ title: "Event created" });
        router.push(`/admin/events/${result.id}/edit`);
      } else {
        const err = await res.json();
        toast({ title: err.error ?? "Failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to create", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const now = new Date();
  const defaultStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  defaultStart.setHours(18, 0, 0, 0);
  const defaultEnd = new Date(defaultStart.getTime() + 2 * 60 * 60 * 1000);

  return (
    <div>
      <h1 className="text-3xl font-bold">Create Event</h1>
      <p className="mt-2 text-muted-foreground">Add a new event</p>

      <Card className="mt-8 max-w-2xl">
        <CardHeader>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/events">← Back</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Category *</Label>
                <select name="category" required className="mt-2 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1">
                  <option value="WEEKLY_SPORTS">Weekly Sports</option>
                  <option value="MONTHLY_EVENTS">Monthly Events</option>
                  <option value="FEATURED_EVENTS">Featured Events</option>
                </select>
              </div>
              <div>
                <Label>Sport *</Label>
                <select name="sportId" required className="mt-2 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1">
                  <option value="">Select sport</option>
                  {sports.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label>Location</Label>
              <select name="locationId" className="mt-2 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1">
                <option value="">Select location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="datetime-local"
                  required
                  defaultValue={defaultStart.toISOString().slice(0, 16)}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="datetime-local"
                  required
                  defaultValue={defaultEnd.toISOString().slice(0, 16)}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="capacity">Capacity *</Label>
                <Input id="capacity" name="capacity" type="number" min={1} required defaultValue={20} />
              </div>
              <div>
                <Label htmlFor="tokensRequired">Tokens Required</Label>
                <Input id="tokensRequired" name="tokensRequired" type="number" min={0} defaultValue={1} />
              </div>
              <div>
                <Label>Gender Policy</Label>
                <select name="genderPolicy" className="mt-2 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1">
                  <option value="ALL">All</option>
                  <option value="MALE_ONLY">Male Only</option>
                  <option value="FEMALE_ONLY">Female Only</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <select name="status" className="mt-2 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create"}</Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/events">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

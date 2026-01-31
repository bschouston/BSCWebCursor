"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Rsvp {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  attended?: boolean;
  waitlistPosition?: number;
  createdAt: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function EventRsvpsPage() {
  const params = useParams();
  const id = params.id as string;
  const { token } = useAdminAuth();
  const { toast } = useToast();
  const [confirmed, setConfirmed] = useState<Rsvp[]>([]);
  const [waitlisted, setWaitlisted] = useState<Rsvp[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !id) return;
    fetch(`/api/admin/events/${id}/rsvps`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setConfirmed(data.confirmed ?? []);
        setWaitlisted(data.waitlisted ?? []);
      })
      .finally(() => setLoading(false));
    fetch(`/api/admin/events/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((e) => setEventTitle(e.title ?? "Event"))
      .catch(() => {});
  }, [token, id]);

  async function handleAction(action: string, rsvpId: string) {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/events/${id}/rsvps`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rsvpId, action, attended: action === "mark_attended" }),
      });
      if (res.ok) {
        toast({ title: "Updated" });
        const data = await fetch(`/api/admin/events/${id}/rsvps`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
        setConfirmed(data.confirmed ?? []);
        setWaitlisted(data.waitlisted ?? []);
      } else {
        const err = await res.json();
        toast({ title: err.error ?? "Failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/events/${id}/edit`}>← Back</Link>
        </Button>
      </div>
      <h1 className="mt-4 text-3xl font-bold">RSVPs</h1>
      <p className="mt-2 text-muted-foreground">{eventTitle}</p>

      {loading ? (
        <div className="mt-8 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      ) : (
        <>
          <section className="mt-8">
            <h2 className="text-xl font-semibold">Confirmed ({confirmed.length})</h2>
            {confirmed.length === 0 ? (
              <p className="mt-4 text-muted-foreground">No confirmed RSVPs.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {confirmed.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium">{r.userName}</p>
                        <p className="text-sm text-muted-foreground">{r.userEmail}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
                        {r.attended !== undefined && (
                          <span className="text-xs">{r.attended ? "✓ Attended" : "No-show"}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {r.attended === undefined && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleAction("mark_attended", r.id)}>Attended</Button>
                            <Button size="sm" variant="outline" onClick={() => handleAction("mark_no_show", r.id)}>No-show</Button>
                          </>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => handleAction("remove", r.id)}>Remove</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section className="mt-12">
            <h2 className="text-xl font-semibold">Waitlist ({waitlisted.length})</h2>
            {waitlisted.length === 0 ? (
              <p className="mt-4 text-muted-foreground">No waitlisted users.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {waitlisted.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium">{r.userName}</p>
                        <p className="text-sm text-muted-foreground">{r.userEmail}</p>
                        <span className="text-xs"># {r.waitlistPosition}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleAction("promote", r.id)}>Promote</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleAction("remove", r.id)}>Remove</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

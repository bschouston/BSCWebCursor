import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { getEventById } from "@/lib/data/events";

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const db = getAdminFirestore();
    const rsvpSnap = await db
      .collection("eventRsvps")
      .where("userId", "==", user.uid)
      .get();

    const validRsvps = rsvpSnap.docs.filter((d) => {
      const s = d.data().status;
      return s === "CONFIRMED" || s === "WAITLISTED";
    });

    const events: Array<Awaited<ReturnType<typeof getEventById>> & { rsvpStatus: string }> = [];

    for (const doc of validRsvps) {
      const data = doc.data();
      const event = await getEventById(data.eventId);
      if (!event) continue;

      const eventDate = new Date(event.startTime);
      if (startDate && eventDate < new Date(startDate)) continue;
      if (endDate && eventDate > new Date(endDate)) continue;

      events.push({
        ...event,
        rsvpStatus: data.status,
      });
    }

    events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Calendar fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar" },
      { status: 500 }
    );
  }
}

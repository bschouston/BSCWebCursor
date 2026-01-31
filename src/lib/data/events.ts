import { getAdminFirestore } from "@/lib/firebase/admin";
import type { Firestore } from "firebase-admin/firestore";
import type { Event } from "@/lib/types";

async function enrichEventWithNames(
  db: Firestore,
  event: Record<string, unknown>
): Promise<Event> {
  let sportName: string | undefined;
  let locationName: string | undefined;
  let rsvpCount = 0;

  if (event.sportId) {
    const sportDoc = await db.collection("sports").doc(event.sportId as string).get();
    sportName = sportDoc.data()?.name;
  }
  if (event.locationId) {
    const locDoc = await db.collection("locations").doc(event.locationId as string).get();
    locationName = locDoc.data()?.name;
  }
  const rsvpSnap = await db
    .collection("eventRsvps")
    .where("eventId", "==", event.id)
    .where("status", "==", "CONFIRMED")
    .get();
  rsvpCount = rsvpSnap.size;

  return {
    ...event,
    sportName,
    locationName,
    rsvpCount,
  } as Event;
}

function mapDocToEvent(doc: { id: string; data: () => Record<string, unknown> | undefined }): Record<string, unknown> {
  const data = (doc.data() ?? {}) as Record<string, unknown>;
  const toIso = (v: unknown) =>
    v && typeof v === "object" && "toDate" in v && typeof (v as { toDate: () => Date }).toDate === "function"
      ? (v as { toDate: () => Date }).toDate().toISOString()
      : "";
  return {
    id: doc.id,
    ...data,
    startTime: toIso(data.startTime) || "",
    endTime: toIso(data.endTime) || "",
    createdAt: toIso(data.createdAt) || "",
  };
}

export async function getPublishedEvents(options?: {
  category?: string;
  limit?: number;
}): Promise<Event[]> {
  const db = getAdminFirestore();
  const now = new Date();
  const snapshot = await db
    .collection("events")
    .orderBy("startTime", "asc")
    .limit(200)
    .get();

  let docs = snapshot.docs.filter((doc) => {
    const data = doc.data();
    if (data.status !== "PUBLISHED") return false;
    const startTime = data.startTime?.toDate?.();
    return startTime && startTime > now;
  });
  if (
    options?.category &&
    ["WEEKLY_SPORTS", "MONTHLY_EVENTS", "FEATURED_EVENTS"].includes(options.category)
  ) {
    docs = docs.filter((d) => d.data().category === options.category);
  }
  docs = docs.slice(0, options?.limit ?? 50);

  const events: Event[] = [];
  for (const doc of docs) {
    const base = mapDocToEvent(doc);
    events.push(await enrichEventWithNames(db, base));
  }
  return events;
}

export async function getEventById(id: string): Promise<Event | null> {
  const db = getAdminFirestore();
  const doc = await db.collection("events").doc(id).get();
  if (!doc.exists) return null;
  const base = mapDocToEvent(doc);
  return enrichEventWithNames(db, base);
}

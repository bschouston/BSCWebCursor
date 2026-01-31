import { getAdminFirestore } from "@/lib/firebase/admin";
import type { Event } from "@/lib/types";

function toIso(v: unknown): string {
  if (v && typeof v === "object" && "toDate" in v && typeof (v as { toDate: () => Date }).toDate === "function") {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  return "";
}

export async function getAllEvents(options?: {
  category?: string;
  status?: string;
  sportId?: string;
  limit?: number;
}): Promise<Event[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection("events")
    .orderBy("startTime", "desc")
    .limit((options?.limit ?? 100) * 2)
    .get();

  let docs = snapshot.docs;
  if (options?.category && ["WEEKLY_SPORTS", "MONTHLY_EVENTS", "FEATURED_EVENTS"].includes(options.category)) {
    docs = docs.filter((d) => d.data().category === options.category);
  }
  if (options?.status && ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"].includes(options.status)) {
    docs = docs.filter((d) => d.data().status === options.status);
  }
  if (options?.sportId) {
    docs = docs.filter((d) => d.data().sportId === options.sportId);
  }
  docs = docs.slice(0, options?.limit ?? 100);
  const events: Event[] = [];
  for (const doc of docs) {
    const data = doc.data();
    const sportDoc = data.sportId
      ? await db.collection("sports").doc(data.sportId).get()
      : null;
    const locDoc = data.locationId
      ? await db.collection("locations").doc(data.locationId).get()
      : null;
    const rsvpSnap = await db
      .collection("eventRsvps")
      .where("eventId", "==", doc.id)
      .where("status", "==", "CONFIRMED")
      .get();
    events.push({
      id: doc.id,
      ...data,
      sportName: sportDoc?.data()?.name,
      locationName: locDoc?.data()?.name,
      rsvpCount: rsvpSnap.size,
      startTime: toIso(data.startTime),
      endTime: toIso(data.endTime),
      createdAt: toIso(data.createdAt),
    } as Event);
  }
  return events;
}

export async function getAdminEventById(id: string): Promise<Event | null> {
  const db = getAdminFirestore();
  const doc = await db.collection("events").doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  const sportDoc = data.sportId ? await db.collection("sports").doc(data.sportId).get() : null;
  const locDoc = data.locationId ? await db.collection("locations").doc(data.locationId).get() : null;
  const rsvpSnap = await db
    .collection("eventRsvps")
    .where("eventId", "==", id)
    .where("status", "==", "CONFIRMED")
    .get();
  return {
    id: doc.id,
    ...data,
    sportName: sportDoc?.data()?.name,
    locationName: locDoc?.data()?.name,
    rsvpCount: rsvpSnap.size,
    startTime: toIso(data.startTime),
    endTime: toIso(data.endTime),
    createdAt: toIso(data.createdAt),
  } as Event;
}

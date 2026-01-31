import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

export async function GET(request: NextRequest) {
  const user = await requireAdmin(request);
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const db = getAdminFirestore();
    const now = Timestamp.now();

    const [eventsSnap, upcomingSnap, rsvpsSnap, usersSnap] = await Promise.all([
      db.collection("events").get(),
      db.collection("events").where("startTime", ">", now).where("status", "==", "PUBLISHED").get(),
      db.collection("eventRsvps").where("status", "==", "CONFIRMED").get(),
      db.collection("users").where("isActive", "==", true).get(),
    ]);

    return NextResponse.json({
      totalEvents: eventsSnap.size,
      upcomingEvents: upcomingSnap.size,
      totalRsvps: rsvpsSnap.size,
      activeMembers: usersSnap.size,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

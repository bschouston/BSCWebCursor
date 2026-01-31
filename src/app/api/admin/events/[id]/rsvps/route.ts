import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin(request);
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id: eventId } = await params;
    const db = getAdminFirestore();

    const rsvpSnap = await db
      .collection("eventRsvps")
      .where("eventId", "==", eventId)
      .get();

    const confirmed: Array<{ id: string; userId: string; userName: string; userEmail: string; createdAt: string }> = [];
    const waitlisted: Array<{ id: string; userId: string; userName: string; userEmail: string; waitlistPosition: number }> = [];

    for (const doc of rsvpSnap.docs) {
      const data = doc.data();
      if (data.status === "CANCELLED") continue;

      const userDoc = await db.collection("users").doc(data.userId).get();
      const userData = userDoc.data();
      const userName = userData ? `${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim() || userData.email : "Unknown";
      const userEmail = userData?.email ?? "";

      const item = {
        id: doc.id,
        userId: data.userId,
        userName,
        userEmail,
        attended: data.attended,
        waitlistPosition: data.waitlistPosition,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? "",
      };

      if (data.status === "CONFIRMED") {
        confirmed.push(item);
      } else if (data.status === "WAITLISTED") {
        waitlisted.push({ ...item, waitlistPosition: data.waitlistPosition ?? 0 });
      }
    }

    waitlisted.sort((a, b) => a.waitlistPosition - b.waitlistPosition);

    return NextResponse.json({
      confirmed,
      waitlisted,
    });
  } catch (error) {
    console.error("Admin RSVPs fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch RSVPs" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin(request);
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id: eventId } = await params;
    const body = await request.json();
    const { rsvpId, action } = body;

    if (!rsvpId || !action) {
      return NextResponse.json(
        { error: "rsvpId and action are required" },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    const rsvpRef = db.collection("eventRsvps").doc(rsvpId);
    const rsvpDoc = await rsvpRef.get();
    if (!rsvpDoc.exists || rsvpDoc.data()?.eventId !== eventId) {
      return NextResponse.json({ error: "RSVP not found" }, { status: 404 });
    }

    const rsvpData = rsvpDoc.data()!;

    if (action === "mark_attended") {
      await rsvpRef.update({ attended: true, updatedAt: new Date() });
      return NextResponse.json({ success: true });
    }
    if (action === "mark_no_show") {
      await rsvpRef.update({ attended: false, updatedAt: new Date() });
      return NextResponse.json({ success: true });
    }
    if (action === "remove") {
      await rsvpRef.update({ status: "CANCELLED", waitlistPosition: null, updatedAt: new Date() });
      if (rsvpData.status === "CONFIRMED") {
        const eventDoc = await db.collection("events").doc(eventId).get();
        const event = eventDoc.data()!;
        const userDoc = await db.collection("users").doc(rsvpData.userId).get();
        const currentBalance = userDoc.data()?.tokenBalance ?? 0;
        await db.collection("users").doc(rsvpData.userId).update({
          tokenBalance: currentBalance + (event.tokensRequired ?? 1),
          updatedAt: new Date(),
        });
        await db.collection("tokenTransactions").add({
          userId: rsvpData.userId,
          type: "CREDIT",
          amount: event.tokensRequired ?? 1,
          description: `Admin removed RSVP from ${event.title}`,
          eventId,
          createdAt: new Date(),
        });
      }
      return NextResponse.json({ success: true });
    }
    if (action === "promote") {
      if (rsvpData.status !== "WAITLISTED") {
        return NextResponse.json({ error: "Can only promote waitlisted users" }, { status: 400 });
      }
      const eventDoc = await db.collection("events").doc(eventId).get();
      const event = eventDoc.data()!;
      const confirmedCount = await db
        .collection("eventRsvps")
        .where("eventId", "==", eventId)
        .where("status", "==", "CONFIRMED")
        .get();
      if (confirmedCount.size >= event.capacity) {
        return NextResponse.json({ error: "Event at capacity" }, { status: 400 });
      }
      const targetUser = await db.collection("users").doc(rsvpData.userId).get();
      const balance = targetUser.data()?.tokenBalance ?? 0;
      if (balance < (event.tokensRequired ?? 1)) {
        return NextResponse.json({ error: "User has insufficient tokens" }, { status: 400 });
      }
      await rsvpRef.update({
        status: "CONFIRMED",
        waitlistPosition: null,
        updatedAt: new Date(),
      });
      await db.collection("users").doc(rsvpData.userId).update({
        tokenBalance: balance - (event.tokensRequired ?? 1),
        updatedAt: new Date(),
      });
      await db.collection("tokenTransactions").add({
        userId: rsvpData.userId,
        type: "DEBIT",
        amount: event.tokensRequired ?? 1,
        description: `Promoted from waitlist: ${event.title}`,
        eventId,
        createdAt: new Date(),
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin RSVP update error:", error);
    return NextResponse.json(
      { error: "Failed to update RSVP" },
      { status: 500 }
    );
  }
}

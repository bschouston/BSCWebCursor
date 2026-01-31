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
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);

    const db = getAdminFirestore();
    const snapshot = await db
      .collection("eventRsvps")
      .where("userId", "==", user.uid)
      .orderBy("createdAt", "desc")
      .limit(limit * 2)
      .get();

    let docs = snapshot.docs;
    if (status && ["CONFIRMED", "WAITLISTED", "CANCELLED"].includes(status)) {
      docs = docs.filter((d) => d.data().status === status).slice(0, limit);
    } else {
      docs = docs.slice(0, limit);
    }
    const rsvps = [];

    for (const doc of docs) {
      const data = doc.data();
      const event = await getEventById(data.eventId);
      if (event) {
        rsvps.push({
          id: doc.id,
          eventId: data.eventId,
          event,
          status: data.status,
          waitlistPosition: data.waitlistPosition ?? null,
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
        });
      }
    }

    return NextResponse.json({ rsvps });
  } catch (error) {
    console.error("RSVPs fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch RSVPs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const eventId = body.eventId;
    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    const db = getAdminFirestore();
    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    if (event.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Event is not available" }, { status: 400 });
    }
    if (new Date(event.startTime) < new Date()) {
      return NextResponse.json({ error: "Event has already started" }, { status: 400 });
    }
    if (user.tokenBalance < event.tokensRequired) {
      return NextResponse.json(
        { error: "Insufficient tokens", required: event.tokensRequired },
        { status: 400 }
      );
    }

    const rsvpId = `${eventId}_${user.uid}`;
    const existingRsvp = await db.collection("eventRsvps").doc(rsvpId).get();
    if (existingRsvp.exists) {
      const existingData = existingRsvp.data()!;
      if (existingData.status !== "CANCELLED") {
        return NextResponse.json(
          { error: "Already RSVP'd to this event" },
          { status: 400 }
        );
      }
    }

    const confirmedSnap = await db
      .collection("eventRsvps")
      .where("eventId", "==", eventId)
      .where("status", "==", "CONFIRMED")
      .get();

    const waitlistSnap = await db
      .collection("eventRsvps")
      .where("eventId", "==", eventId)
      .where("status", "==", "WAITLISTED")
      .get();

    let status: "CONFIRMED" | "WAITLISTED" = "CONFIRMED";
    let waitlistPosition: number | null = null;

    if (confirmedSnap.size >= event.capacity) {
      status = "WAITLISTED";
      waitlistPosition = waitlistSnap.size + 1;
    }

    await db.runTransaction(async (transaction) => {
      const now = new Date();
      transaction.set(db.collection("eventRsvps").doc(rsvpId), {
        eventId,
        userId: user.uid,
        status,
        waitlistPosition,
        attended: null,
        createdAt: now,
      });

      if (status === "CONFIRMED") {
        const newBalance = user.tokenBalance - event.tokensRequired;
        transaction.update(db.collection("users").doc(user.uid), {
          tokenBalance: newBalance,
          updatedAt: now,
        });
        transaction.set(db.collection("tokenTransactions").doc(), {
          userId: user.uid,
          type: "DEBIT",
          amount: event.tokensRequired,
          description: `RSVP to ${event.title}`,
          eventId,
          createdAt: now,
        });
      }
    });

    return NextResponse.json({
      success: true,
      status,
      waitlistPosition,
    });
  } catch (error) {
    console.error("RSVP error:", error);
    return NextResponse.json(
      { error: "Failed to create RSVP", message: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    const db = getAdminFirestore();
    const rsvpId = `${eventId}_${user.uid}`;
    const rsvpDoc = await db.collection("eventRsvps").doc(rsvpId).get();

    if (!rsvpDoc.exists) {
      return NextResponse.json({ error: "RSVP not found" }, { status: 404 });
    }

    const rsvpData = rsvpDoc.data()!;
    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (new Date(event.startTime) < new Date()) {
      return NextResponse.json({ error: "Cannot cancel RSVP for past event" }, { status: 400 });
    }

    await db.runTransaction(async (transaction) => {
      transaction.update(db.collection("eventRsvps").doc(rsvpId), {
        status: "CANCELLED",
        waitlistPosition: null,
        updatedAt: new Date(),
      });

      if (rsvpData.status === "CONFIRMED") {
        const userDoc = await db.collection("users").doc(user.uid).get();
        const currentBalance = userDoc.data()?.tokenBalance ?? 0;
        const refundAmount = event.tokensRequired;
        transaction.update(db.collection("users").doc(user.uid), {
          tokenBalance: currentBalance + refundAmount,
          updatedAt: new Date(),
        });
        transaction.set(db.collection("tokenTransactions").doc(), {
          userId: user.uid,
          type: "CREDIT",
          amount: refundAmount,
          description: `Cancelled RSVP to ${event.title}`,
          eventId,
          createdAt: new Date(),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel RSVP error:", error);
    return NextResponse.json(
      { error: "Failed to cancel RSVP" },
      { status: 500 }
    );
  }
}

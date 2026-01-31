import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getAdminFirestore();
    const userDoc = await db.collection("users").doc(user.uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = userDoc.data()!;

    const rsvpSnap = await db
      .collection("eventRsvps")
      .where("userId", "==", user.uid)
      .where("status", "==", "CONFIRMED")
      .get();

    const profileComplete = !!(data.firstName && data.lastName && data.email);

    return NextResponse.json({
      id: userDoc.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone ?? null,
      role: data.role ?? "MEMBER",
      tokenBalance: data.tokenBalance ?? 0,
      isActive: data.isActive ?? true,
      upcomingRsvps: rsvpSnap.size,
      profileComplete,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.firstName === "string") updates.firstName = body.firstName;
    if (typeof body.lastName === "string") updates.lastName = body.lastName;
    if (body.phone !== undefined) updates.phone = body.phone ?? null;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    updates.updatedAt = new Date();

    const db = getAdminFirestore();
    await db.collection("users").doc(user.uid).update(updates);

    const updated = await db.collection("users").doc(user.uid).get();
    return NextResponse.json(updated.data());
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

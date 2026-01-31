import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { getAdminEventById } from "@/lib/data/admin-events";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin(request);
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const event = await getAdminEventById(id);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(event);
}

const updateSchema = {
  title: (v: unknown) => typeof v === "string",
  description: (v: unknown) => v === null || typeof v === "string",
  category: (v: unknown) => ["WEEKLY_SPORTS", "MONTHLY_EVENTS", "FEATURED_EVENTS"].includes(v as string),
  sportId: (v: unknown) => typeof v === "string",
  locationId: (v: unknown) => v === null || typeof v === "string",
  startTime: (v: unknown) => typeof v === "string" || v instanceof Date,
  endTime: (v: unknown) => typeof v === "string" || v instanceof Date,
  capacity: (v: unknown) => typeof v === "number",
  tokensRequired: (v: unknown) => typeof v === "number",
  genderPolicy: (v: unknown) => ["ALL", "MALE_ONLY", "FEMALE_ONLY"].includes(v as string),
  isPublic: (v: unknown) => typeof v === "boolean",
  status: (v: unknown) => ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"].includes(v as string),
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin(request);
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const db = getAdminFirestore();
    const ref = db.collection("events").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    for (const [key, validator] of Object.entries(updateSchema)) {
      if (body[key] !== undefined && (validator as (v: unknown) => boolean)(body[key])) {
        if (key === "startTime" || key === "endTime") {
          updates[key] = body[key] instanceof Date ? body[key] : new Date(body[key]);
        } else {
          updates[key] = body[key];
        }
      }
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid updates" }, { status: 400 });
    }
    updates.updatedAt = new Date();
    await ref.update(updates);
    const updated = await ref.get();
    return NextResponse.json(updated.data());
  } catch (error) {
    console.error("Admin event update error:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin(request);
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const db = getAdminFirestore();
    const ref = db.collection("events").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await ref.update({ status: "CANCELLED", updatedAt: new Date() });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin event delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}

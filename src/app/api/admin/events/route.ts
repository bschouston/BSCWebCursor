import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { getAllEvents } from "@/lib/data/admin-events";
import { z } from "zod";

const eventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.enum(["WEEKLY_SPORTS", "MONTHLY_EVENTS", "FEATURED_EVENTS"]),
  sportId: z.string().min(1),
  locationId: z.string().nullable().optional(),
  seriesId: z.string().nullable().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  capacity: z.number().int().positive(),
  tokensRequired: z.number().int().min(0).default(1),
  genderPolicy: z.enum(["ALL", "MALE_ONLY", "FEMALE_ONLY"]).default("ALL"),
  isPublic: z.boolean().default(true),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]).default("DRAFT"),
});

export async function GET(request: NextRequest) {
  const user = await requireAdmin(request);
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const events = await getAllEvents({
      category: searchParams.get("category") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      sportId: searchParams.get("sportId") ?? undefined,
      limit: parseInt(searchParams.get("limit") ?? "100", 10),
    });
    return NextResponse.json({ events });
  } catch (error) {
    console.error("Admin events fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin(request);
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = eventSchema.safeParse({
      ...body,
      startTime: body.startTime?.toISOString?.() ?? body.startTime,
      endTime: body.endTime?.toISOString?.() ?? body.endTime,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const db = getAdminFirestore();
    const now = new Date();
    const eventData = {
      title: data.title,
      description: data.description ?? null,
      category: data.category,
      sportId: data.sportId,
      locationId: data.locationId ?? null,
      seriesId: data.seriesId ?? null,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      capacity: data.capacity,
      tokensRequired: data.tokensRequired,
      genderPolicy: data.genderPolicy,
      isPublic: data.isPublic,
      status: data.status,
      createdAt: now,
      createdBy: user.uid,
    };

    const ref = await db.collection("events").add(eventData);
    return NextResponse.json({
      id: ref.id,
      ...eventData,
      startTime: data.startTime,
      endTime: data.endTime,
    });
  } catch (error) {
    console.error("Admin event create error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

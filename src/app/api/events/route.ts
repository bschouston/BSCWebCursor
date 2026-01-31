import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const sportId = searchParams.get("sportId");
    const genderPolicy = searchParams.get("genderPolicy");
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);

    const db = getAdminFirestore();
    let query = db
      .collection("events")
      .where("status", "==", "PUBLISHED")
      .where("startTime", ">", Timestamp.now())
      .orderBy("startTime", "asc")
      .limit(Math.min(limit, 100));

    if (category && ["WEEKLY_SPORTS", "MONTHLY_EVENTS", "FEATURED_EVENTS"].includes(category)) {
      query = query.where("category", "==", category);
    }
    if (sportId) {
      query = query.where("sportId", "==", sportId);
    }
    if (genderPolicy && ["ALL", "MALE_ONLY", "FEMALE_ONLY"].includes(genderPolicy)) {
      query = query.where("genderPolicy", "==", genderPolicy);
    }

    const snapshot = await query.get();
    const events = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        startTime: data.startTime?.toDate?.()?.toISOString?.() ?? data.startTime,
        endTime: data.endTime?.toDate?.()?.toISOString?.() ?? data.endTime,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? data.createdAt,
      };
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events", message: String(error) },
      { status: 500 }
    );
  }
}

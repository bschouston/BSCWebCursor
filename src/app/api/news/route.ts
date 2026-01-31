import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const db = getAdminFirestore();
    const snapshot = await db
      .collection("newsPosts")
      .where("status", "==", "PUBLISHED")
      .orderBy("publishDate", "desc")
      .limit(limit + offset)
      .get();

    const allDocs = snapshot.docs.slice(offset, offset + limit);
    const posts = allDocs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        publishDate: data.publishDate?.toDate?.()?.toISOString?.() ?? data.publishDate,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? data.createdAt,
      };
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news", message: String(error) },
      { status: 500 }
    );
  }
}

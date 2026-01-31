import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { z } from "zod";

function toIso(v: unknown): string {
  if (v && typeof v === "object" && "toDate" in v && typeof (v as { toDate: () => Date }).toDate === "function") {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  return typeof v === "string" ? v : "";
}

export async function GET(request: NextRequest) {
  const user = await requireAdmin(request);
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const db = getAdminFirestore();
    const query = db.collection("newsPosts").orderBy("publishDate", "desc").limit(100);
    const snapshot = await query.get();
    let docs = snapshot.docs;
    if (status && ["DRAFT", "PUBLISHED"].includes(status)) {
      docs = docs.filter((d) => d.data().status === status);
    }
    const posts = docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        publishDate: toIso(data.publishDate),
        createdAt: toIso(data.createdAt),
      };
    });
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Admin news fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}

const newsSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().max(200).optional(),
  excerpt: z.string().optional(),
  content: z.string(),
  featuredImage: z.string().nullable().optional(),
  author: z.string().nullable().optional(),
  publishDate: z.string().datetime(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin(request);
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = newsSchema.safeParse({
      ...body,
      publishDate: body.publishDate?.toISOString?.() ?? body.publishDate ?? new Date().toISOString(),
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const slug = data.slug || slugify(data.title);
    const db = getAdminFirestore();
    const now = new Date();
    const postData = {
      title: data.title,
      slug,
      excerpt: data.excerpt ?? null,
      content: data.content,
      featuredImage: data.featuredImage ?? null,
      author: data.author ?? (`${user.firstName} ${user.lastName}`.trim() || user.email),
      publishDate: new Date(data.publishDate),
      status: data.status,
      createdAt: now,
    };
    const ref = await db.collection("newsPosts").add(postData);
    return NextResponse.json({
      id: ref.id,
      ...postData,
      publishDate: data.publishDate,
    });
  } catch (error) {
    console.error("Admin news create error:", error);
    return NextResponse.json(
      { error: "Failed to create news" },
      { status: 500 }
    );
  }
}

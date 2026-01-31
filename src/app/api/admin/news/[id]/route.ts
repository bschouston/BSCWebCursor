import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase/admin";

function toIso(v: unknown): string {
  if (v && typeof v === "object" && "toDate" in v && typeof (v as { toDate: () => Date }).toDate === "function") {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  return typeof v === "string" ? v : "";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin(request);
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const db = getAdminFirestore();
  const doc = await db.collection("newsPosts").doc(id).get();
  if (!doc.exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const data = doc.data()!;
  return NextResponse.json({
    id: doc.id,
    ...data,
    publishDate: toIso(data.publishDate),
    createdAt: toIso(data.createdAt),
  });
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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
    const { id } = await params;
    const body = await request.json();
    const db = getAdminFirestore();
    const ref = db.collection("newsPosts").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "News post not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (typeof body.title === "string") updates.title = body.title;
    if (body.slug !== undefined) updates.slug = body.slug || slugify(body.title ?? "");
    if (body.excerpt !== undefined) updates.excerpt = body.excerpt;
    if (typeof body.content === "string") updates.content = body.content;
    if (body.featuredImage !== undefined) updates.featuredImage = body.featuredImage;
    if (body.author !== undefined) updates.author = body.author;
    if (body.publishDate) updates.publishDate = new Date(body.publishDate);
    if (["DRAFT", "PUBLISHED"].includes(body.status)) updates.status = body.status;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid updates" }, { status: 400 });
    }
    updates.updatedAt = new Date();
    await ref.update(updates);
    const updated = await ref.get();
    return NextResponse.json(updated.data());
  } catch (error) {
    console.error("Admin news update error:", error);
    return NextResponse.json(
      { error: "Failed to update news" },
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
    const ref = db.collection("newsPosts").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "News post not found" }, { status: 404 });
    }
    await ref.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin news delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete news" },
      { status: 500 }
    );
  }
}

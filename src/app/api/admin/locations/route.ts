import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  const user = await requireAdmin(request);
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const db = getAdminFirestore();
  const snapshot = await db.collection("locations").get();
  const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ data });
}

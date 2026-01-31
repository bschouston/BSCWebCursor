import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase/admin";

function toIso(v: unknown): string | null {
  if (v && typeof v === "object" && "toDate" in v && typeof (v as { toDate: () => Date }).toDate === "function") {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  return null;
}

export async function GET(request: NextRequest) {
  const user = await requireSuperAdmin(request);
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") ?? "100", 10);
    const db = getAdminFirestore();
    const snapshot = await db
      .collection("purchases")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();
    let docs = snapshot.docs;
    if (status && ["PENDING", "COMPLETED", "FAILED", "REFUNDED"].includes(status)) {
      docs = docs.filter((d) => d.data().status === status);
    }
    docs = docs.slice(0, limit);
    const purchases = [];
    for (const doc of docs) {
      const data = doc.data();
      const userDoc = await db.collection("users").doc(data.userId).get();
      const userData = userDoc.data();
      purchases.push({
        id: doc.id,
        ...data,
        userName: userData ? `${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim() || userData.email : "Unknown",
        userEmail: userData?.email,
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
      });
    }
    return NextResponse.json({ purchases });
  } catch (error) {
    console.error("Purchases fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}

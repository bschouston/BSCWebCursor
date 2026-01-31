import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  const user = await requireSuperAdmin(request);
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const db = getAdminFirestore();
    const [usersSnap, activeSnap, purchasesSnap, completedSnap] = await Promise.all([
      db.collection("users").get(),
      db.collection("users").where("isActive", "==", true).get(),
      db.collection("purchases").get(),
      db.collection("purchases").where("status", "==", "COMPLETED").get(),
    ]);
    let revenue = 0;
    completedSnap.docs.forEach((d) => {
      revenue += d.data().amount ?? 0;
    });
    return NextResponse.json({
      totalUsers: usersSnap.size,
      activeUsers: activeSnap.size,
      totalPurchases: purchasesSnap.size,
      pendingPurchases: purchasesSnap.docs.filter((d) => d.data().status === "PENDING").length,
      completedPurchases: completedSnap.size,
      totalRevenue: revenue,
    });
  } catch (error) {
    console.error("Superadmin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase/admin";

export async function PATCH(request: NextRequest) {
  const adminUser = await requireSuperAdmin(request);
  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { purchaseId, status } = body;
    if (!purchaseId || !["PENDING", "COMPLETED", "FAILED", "REFUNDED"].includes(status)) {
      return NextResponse.json(
        { error: "purchaseId and valid status required" },
        { status: 400 }
      );
    }
    const db = getAdminFirestore();
    const purchaseRef = db.collection("purchases").doc(purchaseId);
    const purchaseDoc = await purchaseRef.get();
    if (!purchaseDoc.exists) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }
    const purchase = purchaseDoc.data()!;
    const oldStatus = purchase.status;
    const now = new Date();
    if (oldStatus === "PENDING" && status === "COMPLETED") {
      const userRef = db.collection("users").doc(purchase.userId);
      const userDoc = await userRef.get();
      const currentBalance = userDoc.data()?.tokenBalance ?? 0;
      const tokens = purchase.tokens ?? 0;
      await db.runTransaction(async (transaction) => {
        transaction.update(purchaseRef, { status, updatedAt: now });
        transaction.update(userRef, {
          tokenBalance: currentBalance + tokens,
          updatedAt: now,
        });
        transaction.set(db.collection("tokenTransactions").doc(), {
          userId: purchase.userId,
          type: "CREDIT",
          amount: tokens,
          description: `Purchase ${purchaseId} completed`,
          eventId: null,
          createdAt: now,
        });
      });
      await db.collection("auditLog").add({
        userId: adminUser.uid,
        action: "PURCHASE_COMPLETED",
        entityType: "PURCHASE",
        entityId: purchaseId,
        details: { tokens },
        createdAt: now,
      });
    } else {
      await purchaseRef.update({ status, updatedAt: now });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Purchase update error:", error);
    return NextResponse.json(
      { error: "Failed to update purchase" },
      { status: 500 }
    );
  }
}

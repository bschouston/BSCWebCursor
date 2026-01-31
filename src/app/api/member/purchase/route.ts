import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { packageId, tokens, amount } = body;

    if (!packageId || typeof tokens !== "number" || typeof amount !== "number") {
      return NextResponse.json(
        { error: "packageId, tokens, and amount are required" },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    const now = new Date();

    await db.collection("purchases").add({
      userId: user.uid,
      packageId,
      productId: null,
      amount,
      tokens,
      status: "PENDING",
      stripePaymentId: null,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Purchase error:", error);
    return NextResponse.json(
      { error: "Failed to create purchase" },
      { status: 500 }
    );
  }
}

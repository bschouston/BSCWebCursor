import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection("tokenTransactions")
      .where("userId", "==", user.uid)
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const transactions = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type,
        amount: data.amount,
        description: data.description ?? null,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
      };
    });

    return NextResponse.json({
      balance: user.tokenBalance,
      transactions,
    });
  } catch (error) {
    console.error("Tokens fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tokens" },
      { status: 500 }
    );
  }
}

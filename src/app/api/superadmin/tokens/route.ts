import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  const user = await requireSuperAdmin(request);
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") ?? "100", 10);
    const db = getAdminFirestore();
    const snapshot = await db
      .collection("tokenTransactions")
      .orderBy("createdAt", "desc")
      .limit(userId ? 500 : limit)
      .get();
    let docs = snapshot.docs;
    if (userId) {
      docs = docs.filter((d) => d.data().userId === userId).slice(0, limit);
    }
    const transactions = docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
      };
    });
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Tokens fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const adminUser = await requireSuperAdmin(request);
  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { userId, amount, description } = body;
    if (!userId || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "userId and positive amount required" },
        { status: 400 }
      );
    }
    const db = getAdminFirestore();
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const currentBalance = userDoc.data()?.tokenBalance ?? 0;
    const now = new Date();
    await db.runTransaction(async (transaction) => {
      transaction.update(userRef, {
        tokenBalance: currentBalance + amount,
        updatedAt: now,
      });
      transaction.set(db.collection("tokenTransactions").doc(), {
        userId,
        type: "CREDIT",
        amount,
        description: description ?? "Admin credit",
        eventId: null,
        createdAt: now,
      });
    });
    await db.collection("auditLog").add({
      userId: adminUser.uid,
      action: "TOKEN_CREDIT",
      entityType: "USER",
      entityId: userId,
      details: { amount, description },
      createdAt: now,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Add tokens error:", error);
    return NextResponse.json(
      { error: "Failed to add tokens" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const adminUser = await requireSuperAdmin(request);
  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { userId, amount, description } = body;
    if (!userId || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "userId and positive amount required" },
        { status: 400 }
      );
    }
    const db = getAdminFirestore();
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const currentBalance = userDoc.data()?.tokenBalance ?? 0;
    if (currentBalance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }
    const now = new Date();
    await db.runTransaction(async (transaction) => {
      transaction.update(userRef, {
        tokenBalance: currentBalance - amount,
        updatedAt: now,
      });
      transaction.set(db.collection("tokenTransactions").doc(), {
        userId,
        type: "DEBIT",
        amount,
        description: description ?? "Admin debit",
        eventId: null,
        createdAt: now,
      });
    });
    await db.collection("auditLog").add({
      userId: adminUser.uid,
      action: "TOKEN_DEBIT",
      entityType: "USER",
      entityId: userId,
      details: { amount, description },
      createdAt: now,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove tokens error:", error);
    return NextResponse.json(
      { error: "Failed to remove tokens" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { z } from "zod";

const registerSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().min(1).max(200),
  lastName: z.string().min(1).max(200),
  phone: z.string().max(50).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const adminAuth = getAdminAuth();

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { uid, email, firstName, lastName, phone } = parsed.data;

    if (uid !== decoded.uid) {
      return NextResponse.json({ error: "UID mismatch" }, { status: 403 });
    }

    const db = getAdminFirestore();
    const userRef = db.collection("users").doc(uid);

    const existing = await userRef.get();
    if (existing.exists) {
      return NextResponse.json({
        success: true,
        user: { id: uid, ...existing.data() },
      });
    }

    const now = new Date();
    const userData = {
      email,
      firstName,
      lastName,
      phone: phone ?? null,
      role: "MEMBER",
      tokenBalance: 0,
      isActive: true,
      createdAt: now,
    };

    await db.runTransaction(async (transaction) => {
      transaction.set(userRef, userData);
      transaction.set(db.collection("userRoles").doc(`${uid}_MEMBER`), {
        userId: uid,
        roleId: "MEMBER",
        assignedAt: now,
        assignedBy: null,
      });
    });

    return NextResponse.json({
      success: true,
      user: { id: uid, ...userData },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Registration failed", message: String(error) },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
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

    const db = getAdminFirestore();
    const userDoc = await db.collection("users").doc(decoded.uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = userDoc.data()!;
    if (!data.isActive) {
      return NextResponse.json({ error: "User account is inactive" }, { status: 403 });
    }

    return NextResponse.json({
      id: userDoc.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role ?? "MEMBER",
      tokenBalance: data.tokenBalance ?? 0,
      isActive: data.isActive ?? true,
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { error: "Server error", message: String(error) },
      { status: 500 }
    );
  }
}

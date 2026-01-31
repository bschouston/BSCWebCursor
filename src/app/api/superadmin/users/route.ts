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
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role ?? "MEMBER",
        tokenBalance: data.tokenBalance ?? 0,
        isActive: data.isActive ?? true,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
      };
    });
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Superadmin users fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

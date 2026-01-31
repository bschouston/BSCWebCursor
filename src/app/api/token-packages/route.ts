import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";

export async function GET() {
  try {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection("tokenPackages")
      .where("isActive", "==", true)
      .get();

    const packages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ packages });
  } catch (error) {
    console.error("Token packages fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}

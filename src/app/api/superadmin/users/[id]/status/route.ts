import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminUser = await requireSuperAdmin(request);
  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const isActive = body.isActive === true;
    const db = getAdminFirestore();
    await db.collection("users").doc(id).update({
      isActive,
      updatedAt: new Date(),
    });
    await db.collection("auditLog").add({
      userId: adminUser.uid,
      action: "USER_STATUS_CHANGED",
      entityType: "USER",
      entityId: id,
      details: { isActive },
      createdAt: new Date(),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}

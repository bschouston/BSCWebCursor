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
    const role = body.role;
    if (!["MEMBER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    const db = getAdminFirestore();
    await db.collection("users").doc(id).update({
      role,
      updatedAt: new Date(),
    });
    await db.collection("userRoles").doc(`${id}_${role}`).set({
      userId: id,
      roleId: role,
      assignedAt: new Date(),
      assignedBy: adminUser.uid,
    });
    await db.collection("auditLog").add({
      userId: adminUser.uid,
      action: "ROLE_CHANGED",
      entityType: "USER",
      entityId: id,
      details: { newRole: role },
      createdAt: new Date(),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Role update error:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}

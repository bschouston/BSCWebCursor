import { NextRequest } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";

export interface AuthUser {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tokenBalance: number;
  isActive: boolean;
}

export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    const userDoc = await getAdminFirestore()
      .collection("users")
      .doc(decoded.uid)
      .get();

    if (!userDoc.exists) return null;

    const data = userDoc.data()!;
    if (!data.isActive) return null;

    return {
      uid: userDoc.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role ?? "MEMBER",
      tokenBalance: data.tokenBalance ?? 0,
      isActive: data.isActive ?? true,
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(request: NextRequest): Promise<AuthUser | null> {
  const user = await verifyAuth(request);
  if (!user) return null;
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") return null;
  return user;
}

export async function requireSuperAdmin(request: NextRequest): Promise<AuthUser | null> {
  const user = await verifyAuth(request);
  if (!user) return null;
  if (user.role !== "SUPER_ADMIN") return null;
  return user;
}

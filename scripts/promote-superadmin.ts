/**
 * Promote a user to SUPER_ADMIN by email.
 * Usage: npx tsx scripts/promote-superadmin.ts user@example.com
 */

import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function promote() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx scripts/promote-superadmin.ts <email>");
    process.exit(1);
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not set");
  }

  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccountKey) as admin.ServiceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });

  const db = admin.firestore();
  const snapshot = await db.collection("users").where("email", "==", email).limit(1).get();
  if (snapshot.empty) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }
  const doc = snapshot.docs[0];
  await doc.ref.update({ role: "SUPER_ADMIN", updatedAt: new Date() });
  await db.collection("userRoles").doc(`${doc.id}_SUPER_ADMIN`).set({
    userId: doc.id,
    roleId: "SUPER_ADMIN",
    assignedAt: new Date(),
    assignedBy: null,
  });
  console.log(`Promoted ${email} to SUPER_ADMIN`);
  process.exit(0);
}

promote().catch((err) => {
  console.error(err);
  process.exit(1);
});

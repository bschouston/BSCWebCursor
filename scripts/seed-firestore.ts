/**
 * Seed Firestore with initial data: roles, sports, skill_levels, locations, token_packages
 * Run with: npm run db:seed
 */

import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const ROLES = [
  { id: "MEMBER", name: "Member", description: "Default role for registered users" },
  { id: "ADMIN", name: "Admin", description: "Can manage events and news" },
  { id: "SUPER_ADMIN", name: "Super Admin", description: "Full system access" },
];

const SPORTS = [
  { name: "Basketball", description: "Indoor/outdoor basketball" },
  { name: "Soccer", description: "Indoor/outdoor soccer" },
  { name: "Volleyball", description: "Volleyball" },
  { name: "Tennis", description: "Tennis singles or doubles" },
  { name: "Cricket", description: "Cricket" },
  { name: "Badminton", description: "Badminton" },
  { name: "Swimming", description: "Swimming" },
  { name: "Table Tennis", description: "Table tennis / Ping pong" },
];

const SKILL_LEVELS = [
  { id: "BEGINNER", name: "Beginner", order: 1 },
  { id: "INTERMEDIATE", name: "Intermediate", order: 2 },
  { id: "ADVANCED", name: "Advanced", order: 3 },
  { id: "EXPERT", name: "Expert", order: 4 },
];

const LOCATIONS = [
  { name: "Main Sports Complex", address: "Houston, TX", description: "Primary venue" },
  { name: "Community Center Gym", address: "Houston, TX" },
  { name: "Outdoor Park Field", address: "Houston, TX" },
  { name: "Indoor Arena", address: "Houston, TX" },
];

const TOKEN_PACKAGES = [
  { name: "Starter Pack", tokens: 5, price: 1000, description: "5 tokens for $10" },
  { name: "Value Pack", tokens: 10, price: 1800, description: "10 tokens for $18 (save $2)" },
  { name: "Premium Pack", tokens: 20, price: 3000, description: "20 tokens for $30 (save $10)" },
  { name: "Mega Pack", tokens: 50, price: 7000, description: "50 tokens for $70 (save $30)" },
];

async function seedFirestore() {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not set in .env.local");
  }

  const serviceAccount = JSON.parse(serviceAccountKey) as admin.ServiceAccount;
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });

  const db = admin.firestore();
  const batch = db.batch();

  console.log("Seeding roles...");
  for (const role of ROLES) {
    const ref = db.collection("roles").doc(role.id);
    batch.set(ref, { ...role, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  }

  console.log("Seeding sports...");
  for (const sport of SPORTS) {
    const ref = db.collection("sports").doc();
    batch.set(ref, { ...sport, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  }

  console.log("Seeding skill levels...");
  for (const level of SKILL_LEVELS) {
    const ref = db.collection("skillLevels").doc(level.id);
    batch.set(ref, { ...level, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  }

  console.log("Seeding locations...");
  for (const location of LOCATIONS) {
    const ref = db.collection("locations").doc();
    batch.set(ref, { ...location, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  }

  console.log("Seeding token packages...");
  for (const pkg of TOKEN_PACKAGES) {
    const ref = db.collection("tokenPackages").doc();
    batch.set(ref, {
      ...pkg,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  console.log("Seed completed successfully.");
  process.exit(0);
}

seedFirestore().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});

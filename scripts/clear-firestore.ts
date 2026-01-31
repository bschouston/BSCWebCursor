/**
 * Script to clear all data from Firestore database.
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/clear-firestore.ts
 * Or: node --loader ts-node/esm scripts/clear-firestore.ts
 *
 * Ensure .env.local is loaded (copy vars to .env for script or use dotenv)
 */

import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function clearFirestore() {
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

  const collections = await db.listCollections();
  console.log(`Found ${collections.length} collections to clear`);

  for (const collectionRef of collections) {
    const collectionId = collectionRef.id;
    let batch = db.batch();
    let count = 0;

    const snapshot = await collectionRef.get();
    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
      count++;
      if (count % 500 === 0) {
        await batch.commit();
        batch = db.batch();
        console.log(`  Deleted ${count} docs from ${collectionId}...`);
      }
    }
    if (count % 500 !== 0) {
      await batch.commit();
    }
    console.log(`Cleared ${collectionId}: ${count} documents deleted`);
  }

  console.log("Firestore database cleared successfully.");
  process.exit(0);
}

clearFirestore().catch((err) => {
  console.error("Error clearing Firestore:", err);
  process.exit(1);
});

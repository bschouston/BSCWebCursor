import { getAdminFirestore } from "@/lib/firebase/admin";
import type { NewsPost } from "@/lib/types";

export async function getPublishedNewsPosts(options?: {
  limit?: number;
  offset?: number;
}): Promise<NewsPost[]> {
  const db = getAdminFirestore();
  const limit = options?.limit ?? 10;
  const offset = options?.offset ?? 0;

  const snapshot = await db
    .collection("newsPosts")
    .orderBy("publishDate", "desc")
    .limit(100)
    .get();

  const docs = snapshot.docs
    .filter((d) => d.data().status === "PUBLISHED")
    .slice(offset, offset + limit);

  return docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      publishDate: data.publishDate?.toDate?.()?.toISOString?.() ?? "",
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? "",
    };
  }) as NewsPost[];
}

export async function getNewsPostBySlug(slug: string): Promise<NewsPost | null> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection("newsPosts")
    .where("slug", "==", slug)
    .where("status", "==", "PUBLISHED")
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    publishDate: data.publishDate?.toDate?.()?.toISOString?.() ?? "",
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? "",
  } as NewsPost;
}

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getPublishedNewsPosts } from "@/lib/data/news";

export const dynamic = "force-dynamic";

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function NewsPage() {
  const posts = await getPublishedNewsPosts({ limit: 20 });

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">News</h1>
      <p className="mt-2 text-muted-foreground">
        Latest updates from Burhani Sports Club
      </p>
      {posts.length === 0 ? (
        <p className="mt-12 text-muted-foreground">No news posts yet.</p>
      ) : (
        <div className="mt-8 space-y-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/news/${post.slug}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader>
                  <h2 className="text-xl font-semibold">{post.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(post.publishDate)}
                    {post.author && ` · ${post.author}`}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-muted-foreground">
                    {post.excerpt || post.content.slice(0, 200)}...
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

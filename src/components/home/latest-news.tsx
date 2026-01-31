import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { NewsPost } from "@/lib/types";

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function LatestNews({ posts }: { posts: NewsPost[] }) {
  const displayPosts = posts.slice(0, 6);

  return (
    <section className="border-t py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Latest News</h2>
          <Button variant="ghost" asChild>
            <Link href="/news">View all news</Link>
          </Button>
        </div>
        {displayPosts.length === 0 ? (
          <p className="mt-8 text-muted-foreground">
            No news yet. Check back soon!
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayPosts.map((post) => (
              <Link key={post.id} href={`/news/${post.slug}`}>
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardHeader className="pb-2">
                    <h3 className="text-lg font-semibold">{post.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(post.publishDate)}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {post.excerpt || post.content.slice(0, 150)}...
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

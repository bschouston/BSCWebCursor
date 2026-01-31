import { notFound } from "next/navigation";
import Image from "next/image";
import { getNewsPostBySlug } from "@/lib/data/news";

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getNewsPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="container mx-auto max-w-3xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold md:text-4xl">{post.title}</h1>
        <div className="mt-4 flex items-center gap-4 text-muted-foreground">
          <time dateTime={post.publishDate}>{formatDate(post.publishDate)}</time>
          {post.author && <span>by {post.author}</span>}
        </div>
      </header>
      {post.featuredImage && (
        <div className="relative mb-8 aspect-video overflow-hidden rounded-lg">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <div className="whitespace-pre-wrap">{post.content}</div>
      </div>
    </article>
  );
}

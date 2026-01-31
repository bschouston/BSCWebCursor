"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface NewsPost {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  publishDate: string;
  status: string;
}

export default function EditNewsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { token } = useAdminAuth();
  const { toast } = useToast();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    fetch(`/api/admin/news/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then(setPost);
  }, [token, id]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token || !post) return;
    const form = e.currentTarget;
    const data = {
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      slug: (form.elements.namedItem("slug") as HTMLInputElement).value || undefined,
      excerpt: (form.elements.namedItem("excerpt") as HTMLTextAreaElement).value || undefined,
      content: (form.elements.namedItem("content") as HTMLTextAreaElement).value,
      publishDate: new Date((form.elements.namedItem("publishDate") as HTMLInputElement).value).toISOString(),
      status: (form.elements.namedItem("status") as HTMLSelectElement).value,
    };
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/news/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast({ title: "News updated" });
        setPost({ ...post, ...data });
      } else {
        const err = await res.json();
        toast({ title: err.error ?? "Failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!token || !confirm("Delete this news post?")) return;
    try {
      const res = await fetch(`/api/admin/news/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast({ title: "Deleted" });
        router.push("/admin/news");
      }
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  }

  if (!post) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const toLocal = (iso: string) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");

  return (
    <div>
      <h1 className="text-3xl font-bold">Edit News</h1>
      <p className="mt-2 text-muted-foreground">{post.title}</p>

      <Card className="mt-8 max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" defaultValue={post.title} required />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={post.slug ?? ""} />
            </div>
            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <textarea
                id="excerpt"
                name="excerpt"
                rows={2}
                defaultValue={post.excerpt ?? ""}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="content">Content *</Label>
              <textarea
                id="content"
                name="content"
                rows={10}
                defaultValue={post.content}
                required
                className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="publishDate">Publish Date *</Label>
                <Input id="publishDate" name="publishDate" type="datetime-local" required defaultValue={toLocal(post.publishDate)} />
              </div>
              <div>
                <Label>Status</Label>
                <select name="status" defaultValue={post.status} className="mt-2 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1">
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/news">Cancel</Link>
              </Button>
              <Button type="button" variant="destructive" onClick={handleDelete}>Delete</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

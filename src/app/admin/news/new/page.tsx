"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function NewNewsPage() {
  const router = useRouter();
  const { token } = useAdminAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
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
      const res = await fetch("/api/admin/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        toast({ title: "News created" });
        router.push(`/admin/news/${result.id}/edit`);
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

  const now = new Date().toISOString().slice(0, 16);

  return (
    <div>
      <h1 className="text-3xl font-bold">Create News</h1>
      <p className="mt-2 text-muted-foreground">Add a new article</p>

      <Card className="mt-8 max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" required />
            </div>
            <div>
              <Label htmlFor="slug">Slug (optional)</Label>
              <Input id="slug" name="slug" placeholder="auto-generated from title" />
            </div>
            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <textarea
                id="excerpt"
                name="excerpt"
                rows={2}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="content">Content *</Label>
              <textarea
                id="content"
                name="content"
                rows={10}
                required
                className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="publishDate">Publish Date *</Label>
                <Input id="publishDate" name="publishDate" type="datetime-local" required defaultValue={now} />
              </div>
              <div>
                <Label>Status</Label>
                <select name="status" className="mt-2 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1">
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create"}</Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/news">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

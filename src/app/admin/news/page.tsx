"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NewsPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishDate: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminNewsPage() {
  const { token } = useAdminAuth();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!token) return;
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    fetch(`/api/admin/news?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setPosts(data.posts ?? []))
      .finally(() => setLoading(false));
  }, [token, statusFilter]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">News</h1>
          <p className="mt-2 text-muted-foreground">Manage news articles</p>
        </div>
        <Button asChild>
          <Link href="/admin/news/new">Create News</Link>
        </Button>
      </div>

      <div className="mt-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="mt-8 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      ) : posts.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No news posts.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <h3 className="font-semibold">{post.title}</h3>
                  <p className="text-sm text-muted-foreground">{formatDate(post.publishDate)}</p>
                  <span className={`mt-2 inline-block rounded px-2 py-0.5 text-xs ${
                    post.status === "PUBLISHED" ? "bg-green-100 dark:bg-green-900/30" : "bg-gray-100 dark:bg-gray-800"
                  }`}>
                    {post.status}
                  </span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/news/${post.id}/edit`}>Edit</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

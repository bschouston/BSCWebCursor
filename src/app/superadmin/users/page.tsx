"use client";

import { useEffect, useState } from "react";
import { useSuperAdminAuth } from "@/hooks/use-superadmin-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tokenBalance: number;
  isActive: boolean;
}

export default function SuperAdminUsersPage() {
  const { token } = useSuperAdminAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch("/api/superadmin/users", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setUsers(data.users ?? []))
      .finally(() => setLoading(false));
  }, [token]);

  async function updateRole(userId: string, role: string) {
    if (!token) return;
    try {
      const res = await fetch(`/api/superadmin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        toast({ title: "Role updated" });
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
      } else {
        const err = await res.json();
        toast({ title: err.error ?? "Failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  }

  async function toggleStatus(userId: string, isActive: boolean) {
    if (!token) return;
    try {
      const res = await fetch(`/api/superadmin/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      });
      if (res.ok) {
        toast({ title: "Status updated" });
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive } : u)));
      } else {
        toast({ title: "Failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  }

  const filtered = users.filter(
    (u) =>
      !search ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-3xl font-bold">User Management</h1>
      <p className="mt-2 text-muted-foreground">Manage users, roles, and status</p>

      <div className="mt-6">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {loading ? (
        <div className="mt-8 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      ) : (
        <div className="mt-8 space-y-4">
          {filtered.map((user) => (
            <Card key={user.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="mt-1 flex gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        user.isActive ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user.tokenBalance} tokens
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Select
                    value={user.role}
                    onValueChange={(v) => updateRole(user.id, v)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant={user.isActive ? "destructive" : "default"}
                    size="sm"
                    onClick={() => toggleStatus(user.id, !user.isActive)}
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

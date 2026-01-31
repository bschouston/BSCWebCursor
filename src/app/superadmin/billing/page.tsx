"use client";

import { useEffect, useState } from "react";
import { useSuperAdminAuth } from "@/hooks/use-superadmin-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  tokenBalance: number;
}
interface Purchase {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  tokens: number;
  status: string;
  createdAt: string;
}

export default function SuperAdminBillingPage() {
  const { token } = useSuperAdminAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [addUserId, setAddUserId] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [removeUserId, setRemoveUserId] = useState("");
  const [removeAmount, setRemoveAmount] = useState("");

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch("/api/superadmin/users", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/superadmin/purchases", { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(async ([u, p]) => [await u.json(), await p.json()])
      .then(([uData, pData]) => {
        setUsers(uData.users ?? []);
        setPurchases(pData.purchases ?? []);
      });
  }, [token]);

  async function handleAddTokens() {
    if (!token || !addUserId || !addAmount) return;
    try {
      const res = await fetch("/api/superadmin/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: addUserId,
          amount: parseInt(addAmount, 10),
          description: addDesc || undefined,
        }),
      });
      if (res.ok) {
        toast({ title: "Tokens added" });
        setAddAmount("");
        setAddDesc("");
        const uRes = await fetch("/api/superadmin/users", { headers: { Authorization: `Bearer ${token}` } });
        const uData = await uRes.json();
        setUsers(uData.users ?? []);
      } else {
        const err = await res.json();
        toast({ title: err.error ?? "Failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  }

  async function handleRemoveTokens() {
    if (!token || !removeUserId || !removeAmount) return;
    try {
      const res = await fetch("/api/superadmin/tokens", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: removeUserId,
          amount: parseInt(removeAmount, 10),
        }),
      });
      if (res.ok) {
        toast({ title: "Tokens removed" });
        setRemoveAmount("");
        const uRes = await fetch("/api/superadmin/users", { headers: { Authorization: `Bearer ${token}` } });
        const uData = await uRes.json();
        setUsers(uData.users ?? []);
      } else {
        const err = await res.json();
        toast({ title: err.error ?? "Failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  }

  async function updatePurchaseStatus(purchaseId: string, status: string) {
    if (!token) return;
    try {
      const res = await fetch("/api/superadmin/purchases/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ purchaseId, status }),
      });
      if (res.ok) {
        toast({ title: "Purchase updated" });
        const pRes = await fetch("/api/superadmin/purchases", { headers: { Authorization: `Bearer ${token}` } });
        const pData = await pRes.json();
        setPurchases(pData.purchases ?? []);
      } else {
        const err = await res.json();
        toast({ title: err.error ?? "Failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Billing Management</h1>
      <p className="mt-2 text-muted-foreground">Tokens and purchases</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Add Tokens</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>User</Label>
              <Select value={addUserId} onValueChange={setAddUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                min={1}
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
              />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input value={addDesc} onChange={(e) => setAddDesc(e.target.value)} />
            </div>
            <Button onClick={handleAddTokens}>Add Tokens</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Remove Tokens</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>User</Label>
              <Select value={removeUserId} onValueChange={setRemoveUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.tokenBalance} tokens)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                min={1}
                value={removeAmount}
                onChange={(e) => setRemoveAmount(e.target.value)}
              />
            </div>
            <Button variant="destructive" onClick={handleRemoveTokens}>
              Remove Tokens
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold">Purchases</h2>
        {purchases.length === 0 ? (
          <p className="mt-4 text-muted-foreground">No purchases.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {purchases.map((p) => (
              <Card key={p.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{p.userName}</p>
                    <p className="text-sm text-muted-foreground">{p.userEmail}</p>
                    <p className="text-sm">
                      ${(p.amount / 100).toFixed(2)} · {p.tokens} tokens · {p.status}
                    </p>
                  </div>
                  {p.status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => updatePurchaseStatus(p.id, "COMPLETED")}>
                        Complete
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updatePurchaseStatus(p.id, "FAILED")}>
                        Fail
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

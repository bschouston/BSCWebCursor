"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  description?: string;
}

export default function MemberPurchasePage() {
  const { token } = useAuth(true);
  const { toast } = useToast();
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/token-packages")
      .then((r) => r.json())
      .then((data) => setPackages(data.packages ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handlePurchase(pkg: TokenPackage) {
    if (!token) return;
    setPurchasing(pkg.id);
    try {
      const res = await fetch("/api/member/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ packageId: pkg.id, tokens: pkg.tokens, amount: pkg.price }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Purchase recorded", description: "Admin will process your payment." });
      } else {
        toast({ title: data.error ?? "Failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to purchase", variant: "destructive" });
    } finally {
      setPurchasing(null);
    }
  }

  if (loading) {
    return <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Purchase Tokens</h1>
      <p className="mt-2 text-muted-foreground">Buy token packages to RSVP to events</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {packages.map((pkg) => (
          <Card key={pkg.id}>
            <CardHeader>
              <h3 className="text-lg font-semibold">{pkg.name}</h3>
              <p className="text-2xl font-bold">{pkg.tokens} tokens</p>
              <p className="text-muted-foreground">${(pkg.price / 100).toFixed(2)}</p>
              {pkg.description && (
                <p className="text-sm text-muted-foreground">{pkg.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handlePurchase(pkg)}
                disabled={purchasing === pkg.id}
              >
                {purchasing === pkg.id ? "Processing..." : "Purchase"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {packages.length === 0 && (
        <p className="mt-8 text-muted-foreground">No token packages available.</p>
      )}

      <p className="mt-8 text-sm text-muted-foreground">
        Purchases are recorded as PENDING. An admin will process your payment and credit tokens to your account.
      </p>
    </div>
  );
}

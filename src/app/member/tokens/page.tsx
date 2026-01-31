"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

interface Transaction {
  id: string;
  type: "CREDIT" | "DEBIT";
  amount: number;
  description: string | null;
  createdAt: string | null;
}

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MemberTokensPage() {
  const { token } = useAuth(true);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch("/api/member/tokens", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setBalance(data.balance ?? 0);
        setTransactions(data.transactions ?? []);
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Tokens</h1>
      <p className="mt-2 text-muted-foreground">Your token balance and transaction history</p>

      <Card className="mt-8 max-w-md">
        <CardHeader>
          <h2 className="text-lg font-semibold">Current Balance</h2>
          <p className="text-3xl font-bold">{balance}</p>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/member/purchase">Purchase Tokens</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="mt-4 text-muted-foreground">No transactions yet.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {transactions.map((tx) => (
              <Card key={tx.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    {tx.type === "CREDIT" ? (
                      <ArrowDownCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowUpCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">
                        {tx.type === "CREDIT" ? "+" : "-"}
                        {tx.amount} {tx.amount === 1 ? "token" : "tokens"}
                      </p>
                      <p className="text-sm text-muted-foreground">{tx.description ?? "-"}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(tx.createdAt)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

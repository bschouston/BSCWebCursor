"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Chrome } from "lucide-react";
import { useAuthContext } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getFirebaseAuth } from "@/lib/firebase/client";
import {
  signInWithPopup,
  getRedirectResult,
  GoogleAuthProvider,
  type User,
} from "firebase/auth";

function getRedirectPath(role?: string): string {
  if (role === "SUPER_ADMIN") return "/superadmin";
  if (role === "ADMIN") return "/admin";
  return "/member";
}

async function signInAndRedirect(
  user: User,
  token: string,
  router: ReturnType<typeof useRouter>,
  setUserFromLogin: (user: import("@/contexts/auth-context").AuthUser, token: string) => void
) {
  let meRes = await fetch("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (meRes.status === 404) {
    const nameParts = user.displayName?.split(" ") ?? [];
    const firstName = nameParts[0] ?? user.email?.split("@")[0] ?? "User";
    const lastName = nameParts.slice(1).join(" ") || " ";
    const regRes = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email ?? "",
        firstName,
        lastName,
      }),
    });
    if (!regRes.ok) {
      const data = await regRes.json();
      throw new Error(data.message ?? "Registration failed");
    }
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 300));
      meRes = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      if (meRes.ok) break;
    }
  }

  const meData = meRes.ok ? await meRes.json() : {};
  if (meData?.role) {
    setUserFromLogin({ ...meData, uid: meData.id ?? meData.uid }, token);
  }
  router.replace(getRedirectPath(meData?.role));
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, setUserFromLogin } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(getRedirectPath(user.role));
      return;
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setSigningIn(true);
          return result.user
            .getIdToken()
            .then((token) => signInAndRedirect(result.user, token, router, setUserFromLogin));
        }
        if (auth.currentUser) {
          setSigningIn(true);
          return auth.currentUser
            .getIdToken()
            .then((token) =>
              signInAndRedirect(auth.currentUser!, token, router, setUserFromLogin)
            );
        }
      })
      .catch((err) => {
        console.error("Login error:", err);
        setError(err instanceof Error ? err.message : "Sign-in failed");
      })
      .finally(() => {
        setLoading(false);
        setSigningIn(false);
      });
  }, [router, setUserFromLogin]);

  async function handleGoogleSignIn() {
    const auth = getFirebaseAuth();
    if (!auth) {
      setError("Firebase not initialized");
      return;
    }

    setSigningIn(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const token = await result.user.getIdToken();
      await signInAndRedirect(result.user, token, router, setUserFromLogin);
    } catch (err) {
      console.error("Sign-in error:", err);
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setSigningIn(false);
    }
  }

  if (loading || signingIn) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">
            {signingIn ? "Signing you in..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Sign in with your Google account to access the member area
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}
          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Chrome className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

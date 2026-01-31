"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useForm } from "react-hook-form";

interface ProfileForm {
  firstName: string;
  lastName: string;
  phone: string;
}

export default function MemberProfilePage() {
  const { user, token } = useAuth(true);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const form = useForm<ProfileForm>({
    defaultValues: { firstName: "", lastName: "", phone: "" },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        phone: "",
      });
    }
  }, [user, form]);

  useEffect(() => {
    if (!token) return;
    fetch("/api/member/profile", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        form.reset({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          phone: data.phone ?? "",
        });
      });
  }, [token, form]);

  async function onSubmit(data: ProfileForm) {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/member/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast({ title: "Profile updated" });
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold">Profile</h1>
      <p className="mt-2 text-muted-foreground">Manage your account</p>

      <Card className="mt-8 max-w-lg">
        <CardHeader>
          <h2 className="text-lg font-semibold">Basic Information</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} readOnly disabled className="bg-muted" />
            </div>
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...form.register("firstName")} />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...form.register("lastName")} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" {...form.register("phone")} />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().min(1, "Message is required").max(5000),
});

type FormData = z.infer<typeof schema>;

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message ?? "Failed to send message");
      }

      toast({
        title: "Message sent",
        description: "We'll get back to you soon.",
      });
      form.reset();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...form.register("name")}
          placeholder="Your name"
          className={form.formState.errors.name ? "border-destructive" : ""}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...form.register("email")}
          placeholder="you@example.com"
          className={form.formState.errors.email ? "border-destructive" : ""}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          {...form.register("subject")}
          placeholder="What's this about?"
          className={form.formState.errors.subject ? "border-destructive" : ""}
        />
        {form.formState.errors.subject && (
          <p className="text-sm text-destructive">
            {form.formState.errors.subject.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          {...form.register("message")}
          rows={5}
          placeholder="Your message..."
          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {form.formState.errors.message && (
          <p className="text-sm text-destructive">
            {form.formState.errors.message.message}
          </p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}

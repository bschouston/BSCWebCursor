import { ContactForm } from "@/components/contact/contact-form";

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <p className="mt-2 text-muted-foreground">
        Send us a message and we&apos;ll get back to you as soon as we can
      </p>
      <ContactForm />
    </div>
  );
}

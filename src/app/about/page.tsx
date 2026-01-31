import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">About Us</h1>
      <p className="mt-2 text-muted-foreground">
        Learn more about Burhani Sports Club Houston
      </p>

      <div className="mt-12 space-y-8">
        <section>
          <h2 className="text-xl font-semibold">Our Mission</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Burhani Sports Club Houston is dedicated to building a vibrant
            community through sports and physical activity. We bring members
            together for regular events, foster connections, and promote healthy
            living in a welcoming environment.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Our Values</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Community first – we prioritize connection and camaraderie</li>
            <li>Inclusivity – everyone is welcome regardless of skill level</li>
            <li>Health and wellness – staying active together</li>
            <li>Integrity – fair play and respect on and off the field</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Our History</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Founded to serve the Houston community, Burhani Sports Club has grown
            from a small group of enthusiasts into a thriving organization. We
            host weekly sports events, monthly special activities, and bring
            people together through a shared love of sport.
          </p>
        </section>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Get in Touch</h2>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Have questions or want to learn more? We&apos;d love to hear from
              you.
            </p>
            <Button asChild className="mt-4">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

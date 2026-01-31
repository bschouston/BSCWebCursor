import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-dark-blue py-20 text-white dark:bg-primary dark:text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Burhani Sports Club Houston
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90 dark:text-primary-foreground/90">
          Building community through sports. Join us for weekly events, connect
          with fellow members, and stay active together.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="bg-gold text-dark-blue hover:bg-gold/90">
            <Link href="/register">Join Now</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white/30 text-white hover:bg-white/10 hover:text-white dark:border-primary-foreground/30 dark:text-primary-foreground dark:hover:bg-primary-foreground/10"
          >
            <Link href="/events">View Events</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

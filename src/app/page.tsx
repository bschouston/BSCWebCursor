import { HeroSection } from "@/components/home/hero-section";
import { UpcomingEvents } from "@/components/home/upcoming-events";
import { LatestNews } from "@/components/home/latest-news";
import { getPublishedEvents } from "@/lib/data/events";
import { getPublishedNewsPosts } from "@/lib/data/news";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [events, posts] = await Promise.all([
    getPublishedEvents({ limit: 6 }),
    getPublishedNewsPosts({ limit: 6 }),
  ]);

  return (
    <>
      <HeroSection />
      <UpcomingEvents events={events} />
      <LatestNews posts={posts} />
    </>
  );
}

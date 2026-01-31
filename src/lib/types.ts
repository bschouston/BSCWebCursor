export type EventCategory =
  | "WEEKLY_SPORTS"
  | "MONTHLY_EVENTS"
  | "FEATURED_EVENTS";

export type GenderPolicy = "ALL" | "MALE_ONLY" | "FEMALE_ONLY";

export type EventStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "CANCELLED"
  | "COMPLETED";

export interface Event {
  id: string;
  title: string;
  description: string | null;
  category: EventCategory;
  sportId: string;
  locationId: string | null;
  seriesId: string | null;
  startTime: string;
  endTime: string;
  capacity: number;
  tokensRequired: number;
  genderPolicy: GenderPolicy;
  status: EventStatus;
  isPublic: boolean;
  createdAt: string;
  createdBy: string | null;
  sportName?: string;
  locationName?: string;
  rsvpCount?: number;
}

export interface NewsPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  author: string | null;
  publishDate: string;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
}

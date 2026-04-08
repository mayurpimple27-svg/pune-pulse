import {
  Cpu,
  Landmark,
  TreePine,
  Building2,
  GraduationCap,
  Castle,
  Bus,
  UtensilsCrossed,
  Warehouse,
  Coffee,
} from "lucide-react";

export type AreaVibe = "tech" | "traditional" | "urban" | "green" | "heritage";

export interface PuneArea {
  slug: string;
  name: string;
  tagline: string;
  vibe: AreaVibe;
  icon: typeof Cpu;
  image: string;
  gradient: string; // tailwind gradient classes for the card
  accentColor: string; // tailwind text color for accent
  bgAccent: string; // tailwind bg for pills/badges
  description: string;
  features: string[]; // local highlights shown on the area page
}

export const PUNE_AREAS: PuneArea[] = [
  {
    slug: "hinjewadi",
    name: "Hinjewadi",
    tagline: "The IT Capital of Pune",
    vibe: "tech",
    icon: Cpu,
    image: "/images/traffic-1.webp",
    gradient:
      "from-cyan-500/20 to-blue-600/20 dark:from-cyan-500/10 dark:to-blue-600/10",
    accentColor: "text-cyan-500",
    bgAccent: "bg-cyan-500/10",
    description:
      "Home to Rajiv Gandhi Infotech Park — where startups meet skyscrapers and code meets coffee.",
    features: ["IT Parks", "Startups", "Tech Events", "Co-working Spaces"],
  },
  {
    slug: "kothrud",
    name: "Kothrud",
    tagline: "The Cultural Heart",
    vibe: "traditional",
    icon: Landmark,
    image: "/images/general-1.webp",
    gradient:
      "from-amber-500/20 to-orange-500/20 dark:from-amber-500/10 dark:to-orange-500/10",
    accentColor: "text-amber-600",
    bgAccent: "bg-amber-500/10",
    description:
      "Classic Pune — tree-lined streets, old bungalows, and the warmth of Maharashtrian culture.",
    features: ["Heritage Homes", "Local Markets", "Temples", "Marathi Theatre"],
  },
  {
    slug: "baner",
    name: "Baner",
    tagline: "The New-Age Hub",
    vibe: "urban",
    icon: Building2,
    image: "/images/general-4.webp",
    gradient:
      "from-violet-500/20 to-purple-500/20 dark:from-violet-500/10 dark:to-purple-500/10",
    accentColor: "text-violet-500",
    bgAccent: "bg-violet-500/10",
    description:
      "Where modern Pune lives — high-rises, craft breweries, and weekend farmers' markets.",
    features: ["Cafés & Pubs", "Luxury Living", "Weekend Markets", "Nightlife"],
  },
  {
    slug: "aundh",
    name: "Aundh",
    tagline: "The Educated Elite",
    vibe: "traditional",
    icon: GraduationCap,
    image: "/images/general-2.webp",
    gradient:
      "from-emerald-500/20 to-teal-500/20 dark:from-emerald-500/10 dark:to-teal-500/10",
    accentColor: "text-emerald-600",
    bgAccent: "bg-emerald-500/10",
    description:
      "University campuses, D.P. Road jogging tracks, and the classic Pune intellectual vibe.",
    features: ["Universities", "Parks & Gardens", "Street Food", "Book Stores"],
  },
  {
    slug: "katraj",
    name: "Katraj",
    tagline: "Nature's Gateway",
    vibe: "green",
    icon: TreePine,
    image: "/images/event-1.webp",
    gradient:
      "from-green-500/20 to-lime-500/20 dark:from-green-500/10 dark:to-lime-500/10",
    accentColor: "text-green-600",
    bgAccent: "bg-green-500/10",
    description:
      "Katraj lake, the snake park, and lush green hillsides — Pune's southern retreat.",
    features: ["Katraj Lake", "Snake Park", "Hill Treks", "Dairy Farms"],
  },
  {
    slug: "camp",
    name: "Camp",
    tagline: "The British Quarter",
    vibe: "heritage",
    icon: Castle,
    image: "/images/general-3 event-3.webp",
    gradient:
      "from-rose-500/20 to-pink-500/20 dark:from-rose-500/10 dark:to-pink-500/10",
    accentColor: "text-rose-600",
    bgAccent: "bg-rose-500/10",
    description:
      "MG Road, Koregaon Park lane, colonial architecture, and the beating heart of Pune nightlife.",
    features: [
      "MG Road Shopping",
      "Heritage Buildings",
      "Fine Dining",
      "Museums",
    ],
  },
  {
    slug: "shivajinagar",
    name: "Shivajinagar",
    tagline: "The Old City Core",
    vibe: "heritage",
    icon: Bus,
    image: "/images/event-2.webp",
    gradient:
      "from-yellow-500/20 to-amber-500/20 dark:from-yellow-500/10 dark:to-amber-500/10",
    accentColor: "text-yellow-600",
    bgAccent: "bg-yellow-500/10",
    description:
      "The transport hub that never sleeps — Mandai market, FC Road, and decades of Pune memories.",
    features: [
      "Mandai Market",
      "FC Road",
      "Street Shopping",
      "Iconic Eateries",
    ],
  },
  {
    slug: "wakad",
    name: "Wakad",
    tagline: "The Suburb of Tomorrow",
    vibe: "tech",
    icon: Warehouse,
    image: "/images/traffic-2.webp",
    gradient:
      "from-indigo-500/20 to-blue-500/20 dark:from-indigo-500/10 dark:to-blue-500/10",
    accentColor: "text-indigo-500",
    bgAccent: "bg-indigo-500/10",
    description:
      "Rapidly growing IT corridor neighbour — smart apartments and digital-first living.",
    features: [
      "Tech Corridor",
      "New Developments",
      "Gyms & Studios",
      "Food Delivery Hub",
    ],
  },
  {
    slug: "deccan",
    name: "Deccan",
    tagline: "Pune's Times Square",
    vibe: "heritage",
    icon: Coffee,
    image: "/images/general-5.webp",
    gradient:
      "from-orange-500/20 to-red-500/20 dark:from-orange-500/10 dark:to-red-500/10",
    accentColor: "text-orange-600",
    bgAccent: "bg-orange-500/10",
    description:
      "Goodluck Café, Garware Bridge sunsets, and the crossroads where every Punekar passes.",
    features: ["Goodluck Café", "JM Road", "Garware Bridge", "Street Artists"],
  },
  {
    slug: "koregaon-park",
    name: "Koregaon Park",
    tagline: "The Cosmopolitan Quarter",
    vibe: "urban",
    icon: UtensilsCrossed,
    image: "/images/event-4.webp",
    gradient:
      "from-fuchsia-500/20 to-pink-500/20 dark:from-fuchsia-500/10 dark:to-pink-500/10",
    accentColor: "text-fuchsia-500",
    bgAccent: "bg-fuchsia-500/10",
    description:
      "Boutique stores, global cuisines, Osho Garden — Pune's most eclectic neighbourhood.",
    features: [
      "Osho Garden",
      "International Cuisine",
      "Art Galleries",
      "Boutiques",
    ],
  },
];

export function getAreaBySlug(slug: string): PuneArea | undefined {
  return PUNE_AREAS.find((a) => a.slug === slug);
}

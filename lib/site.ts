export const site = {
  name: "MyPickleball",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://mypickleball.app",
  tagline: "Pickleball club management software",
  description:
    "MyPickleball is the all-in-one pickleball club management software for court bookings, open play queues, coaching, memberships, leagues and payments, built by people who run real courts.",
  email: "hello@mypickleball.app",
  phone: "+1 (555) 014-2290",
  social: {
    instagram: "https://instagram.com/mypickleball",
    facebook: "https://facebook.com/mypickleball",
    x: "https://x.com/mypickleball",
    youtube: "https://youtube.com/@mypickleball",
    tiktok: "https://tiktok.com/@mypickleball",
    linkedin: "https://linkedin.com/company/mypickleball",
  },
};

export const nav = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "Our story" },
  { href: "/contact", label: "Contact" },
];

export type Plan = {
  id: string;
  name: string;
  monthly: number;
  yearly: number;
  blurb: string;
  courts: string;
  features: string[];
  cta: string;
  featured?: boolean;
};

export const plans: Plan[] = [
  {
    id: "rally",
    name: "Rally",
    monthly: 49,
    yearly: 39,
    blurb: "For a single venue getting off paper and group chats.",
    courts: "Up to 4 courts",
    features: [
      "Online court booking & waitlists",
      "Open play queue with play-time tracking",
      "Player profiles & DUPR-style ratings",
      "Card & wallet payments",
      "Email + SMS reminders",
    ],
    cta: "Start free trial",
  },
  {
    id: "club",
    name: "Club",
    monthly: 129,
    yearly: 99,
    blurb: "For busy clubs with coaches, members and weekly leagues.",
    courts: "Up to 12 courts",
    features: [
      "Everything in Rally",
      "Memberships, passes & packages",
      "Coach scheduling, lessons & clinics",
      "Leagues, ladders & round robins",
      "Staff roles, shifts & front-desk mode",
      "Revenue & utilization reports",
    ],
    cta: "Start free trial",
    featured: true,
  },
  {
    id: "facility",
    name: "Facility",
    monthly: 299,
    yearly: 239,
    blurb: "For multi-site operators and tournament hosts.",
    courts: "Unlimited courts & locations",
    features: [
      "Everything in Club",
      "Multi-location dashboard",
      "Tournament brackets & live scoring",
      "Court lighting & door access hooks",
      "Custom branded player app",
      "Priority onboarding & a named success lead",
    ],
    cta: "Talk to sales",
  },
];

export const faqs = [
  {
    q: "How long does it take to set up MyPickleball?",
    a: "Most clubs are taking bookings the same day. Add your courts, set your hours and prices, and share your booking link. Our team will import your existing members and passes for free on Club and Facility plans.",
  },
  {
    q: "Can players book and pay from their phone?",
    a: "Yes. Players book courts, join open play, sign up for clinics and pay from any phone, no app download required. A branded app is available on the Facility plan.",
  },
  {
    q: "How does the open play queue work?",
    a: "Players check in at the desk or by QR code and join a live queue. MyPickleball rotates groups onto courts fairly, tracks each player's time on court and shows who's up next on a TV display.",
  },
  {
    q: "Do you charge a fee per booking?",
    a: "No per-booking fees from us. You pay a flat monthly plan, plus standard card processing from your payment provider.",
  },
  {
    q: "Can I manage coaches and staff?",
    a: "Yes. Give coaches, front-desk staff and managers their own roles and permissions. Coaches manage their availability, lessons and payouts; staff run check-ins and the queue.",
  },
  {
    q: "Is there a free trial?",
    a: "Every plan includes a 14-day free trial with all features unlocked. No credit card required to start.",
  },
];

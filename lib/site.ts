export const site = {
  name: "MyPickleball",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://mypickleball.app",
  tagline: "Pickleball club management software",
  description:
    "MyPickleball is the all-in-one pickleball club management software for court bookings, open play queues, coaching, memberships, leagues and payments, in one dashboard for owners, organizers, coaches and the front desk.",
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
      "Court calendar, online booking & waitlists",
      "Open play queue with play-time tracking",
      "TV court board for your facility",
      "Player profiles & skill ratings",
      "Front-desk quick sale & refunds",
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
      "Memberships & renewals",
      "Coach schedules, lessons & clinics",
      "Leagues, ladders & round robins",
      "Staff roles, shifts & permissions",
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
    blurb: "For large facilities and clubs that run big events.",
    courts: "Unlimited courts",
    features: [
      "Everything in Club",
      "Unlimited staff seats",
      "Court light controls",
      "Priority onboarding & a named success lead",
      "First access to new modules as they ship",
    ],
    cta: "Talk to sales",
  },
];

/** Shown on the features page so the site never promises what isn't built yet. */
export const roadmap = [
  { t: "Email & SMS reminders", d: "Automatic booking reminders and waitlist alerts." },
  { t: "QR check-in & waivers", d: "Players scan in at the door and sign waivers once." },
  { t: "Tournament brackets", d: "Single and double elimination with live scoring." },
  { t: "Passes & packages", d: "Punch passes, lesson packs and gift cards." },
  { t: "Multi-location", d: "One login and one report across every site you run." },
  { t: "Integrations", d: "Stripe payouts, DUPR ratings, door access and accounting exports." },
];

export const faqs = [
  {
    q: "How long does it take to set up MyPickleball?",
    a: "You can add your courts, set your hours and prices and share your booking page in one sitting. On the Club and Facility plans we import your existing members for you.",
  },
  {
    q: "Can players book from their phone?",
    a: "Yes. Your club gets a player booking page that works on any phone, with no app to download. Players book courts, join open play, sign up for clinics and events, and join waitlists when something is full.",
  },
  {
    q: "How does the open play queue work?",
    a: "Players check in at the desk and join a live queue. MyPickleball sends groups of four onto open courts, either first come or balanced by skill, gives priority to whoever has played the fewest games, tracks each player's time on court and shows who's up next on a TV court board.",
  },
  {
    q: "Do you charge a fee per booking?",
    a: "No. You pay a flat monthly plan. Card processing is charged separately by your payment provider.",
  },
  {
    q: "Can I manage coaches and staff?",
    a: "Yes. Owners, managers, coaches and front-desk staff each get their own role. Coaches run their sessions and rosters; desk staff handle check-in, the queue and quick sales.",
  },
  {
    q: "Is there a free trial?",
    a: "Every plan includes a 14-day free trial with all features unlocked. No credit card required to start.",
  },
];

import type { StaticImageData } from "next/image";
import { img } from "./images";

export type FeaturePage = {
  slug: string;
  short: string;
  card: string;
  metaTitle: string;
  metaDescription: string;
  title: string;
  dim: string;
  lead: string;
  image: StaticImageData;
  alt: string;
  problem: { h: string; p: string };
  points: { t: string; d: string }[];
  steps: { t: string; d: string }[];
  faqs: { q: string; a: string }[];
};

export const featurePages: FeaturePage[] = [
  {
    slug: "pickleball-court-booking-software",
    short: "Court booking",
    card: "A live court calendar with member pricing, recurring bookings and waitlists.",
    metaTitle: "Pickleball Court Booking Software",
    metaDescription:
      "Online pickleball court booking with peak and off-peak pricing, member rates, recurring bookings, waitlists and a day and week court calendar for your desk.",
    title: "Pickleball court booking",
    dim: "that fills the quiet hours.",
    lead: "Players book from any phone, the desk sees every court on one calendar, and member rates and peak pricing apply automatically.",
    image: img.ballCourt,
    alt: "Neon pickleball resting on the corner of a court",
    problem: {
      h: "Spreadsheets and group chats leave courts empty.",
      p: "When booking happens over text, the 2 PM slot sits empty, double bookings slip through and nobody knows who paid. A shared court calendar fixes all three: players see what's open, the system blocks conflicts, and every booking carries its price and payment status.",
    },
    points: [
      { t: "Day and week calendar", d: "Every court side by side for the day, or one court across the whole week. Click an empty slot to book it." },
      { t: "Prices that set themselves", d: "Peak and off-peak hourly rates, with each membership plan's court discount applied automatically." },
      { t: "Recurring bookings", d: "Book the Tuesday 7 PM doubles group once and repeat it every week." },
      { t: "Waitlists", d: "When a slot is taken, players join the waitlist instead of giving up." },
      { t: "Check-in and no-shows", d: "Mark players checked in, collect unpaid balances, or record a no-show and its fee." },
      { t: "No double bookings", d: "The calendar refuses overlapping bookings on the same court." },
    ],
    steps: [
      { t: "Add your courts", d: "Name each court, mark it indoor or outdoor and set your opening hours." },
      { t: "Set your prices", d: "Choose peak hours, peak and off-peak rates, and member discounts." },
      { t: "Share your booking page", d: "Players book from their phone; the desk books walk-ins from the calendar." },
    ],
    faqs: [
      {
        q: "Can members get a lower court rate?",
        a: "Yes. Each membership plan has a court discount, and it applies automatically when that member books.",
      },
      {
        q: "Can I block a court for maintenance?",
        a: "Yes. Blocking a court ends any game in progress and stops new bookings until you reopen it.",
      },
      {
        q: "Do players need to download an app?",
        a: "No. The booking page works in any phone browser.",
      },
    ],
  },
  {
    slug: "pickleball-open-play-management",
    short: "Open play",
    card: "Check-in, a fair rotation queue, game timers and a TV board for open play sessions.",
    metaTitle: "Pickleball Open Play Management & Rotation Queue",
    metaDescription:
      "Run pickleball open play without a paddle stack: player check-in, a fair rotation queue, skill-balanced groups, game timers, play-time tracking and a TV court board.",
    title: "Open play",
    dim: "without the paddle stack.",
    lead: "Players check in, the queue builds itself, and groups of four rotate onto courts fairly. Everyone can see their place in line and their time on court.",
    image: img.aerialPlay,
    alt: "Aerial view of doubles open play on outdoor pickleball courts",
    problem: {
      h: "The paddle stack doesn't scale.",
      p: "With forty players and four courts, paddles on the fence turn into arguments: who was next, who has played three games in a row, who has been waiting twenty minutes. A real queue keeps it fair and frees the desk from refereeing.",
    },
    points: [
      { t: "Fast check-in", d: "Find a player by name or phone. Members join free; drop-ins are charged the drop-in fee automatically." },
      { t: "Fair rotation", d: "Players with the fewest games go first. Choose first come or skill-balanced groups within a tight rating band." },
      { t: "Fill every open court", d: "One button sends the next groups onto every open court." },
      { t: "Game timers", d: "Each court counts down and warns when a game is ending or running over." },
      { t: "Play-time tracking", d: "See minutes and games per player for the session, so nobody hogs a court." },
      { t: "TV court board", d: "Put who's on, time left and who's next on the facility TV." },
    ],
    steps: [
      { t: "Choose your rules", d: "Pick the game length and whether groups are first come or skill balanced." },
      { t: "Check players in", d: "At the desk, or players join from their phone." },
      { t: "Send groups to courts", d: "Fill open courts in one click and let the timers and TV board do the rest." },
    ],
    faqs: [
      {
        q: "How are groups chosen in skill-balanced mode?",
        a: "The player who has played the fewest games anchors the group, and the next three are chosen from the closest ratings, with longer waits breaking ties.",
      },
      {
        q: "Can players leave the queue?",
        a: "Yes. They can leave from the desk or their phone, and the queue reorders instantly.",
      },
      {
        q: "What length should open play games be?",
        a: "Most clubs use 12 to 15 minutes. You can set anything from 10 to 25 minutes.",
      },
    ],
  },
  {
    slug: "pickleball-coaching-scheduling",
    short: "Coaching",
    card: "Privates, clinics and camps with online sign-up, rosters, waitlists and payout totals.",
    metaTitle: "Pickleball Coaching & Clinic Scheduling Software",
    metaDescription:
      "Schedule pickleball lessons, clinics and camps. Players sign up online, rosters fill to capacity, waitlists catch the overflow and every session shows its payout.",
    title: "Coaching and clinics",
    dim: "that fill themselves.",
    lead: "Publish privates, clinics and camps on the courts you choose. Players sign up online and every session shows its roster, capacity and earnings.",
    image: img.duoPlayers,
    alt: "Two players holding pickleball paddles together at sunset",
    problem: {
      h: "Clinic sign-ups shouldn't live in a text thread.",
      p: "Coaches lose spots to people who never show up, players can't tell if a clinic is full, and nobody is sure what each session earned. Online sign-up with real capacity limits fixes that.",
    },
    points: [
      { t: "Three formats", d: "Private lessons, group clinics and multi-session camps." },
      { t: "Capacity and rosters", d: "Set the maximum players, see who's enrolled and add or remove players from the desk." },
      { t: "Waitlists", d: "Full sessions take a waitlist, and the next player moves in when a spot opens." },
      { t: "Coach view", d: "Each coach's sessions, fill rate and booked revenue for the week." },
      { t: "Payout totals", d: "Every session shows the coach's share at the club's split." },
      { t: "Levels", d: "Tag sessions by level so players pick the right clinic." },
    ],
    steps: [
      { t: "Add your coaches", d: "Name, specialty and private-lesson rate." },
      { t: "Publish sessions", d: "Pick a court, time, level, price and capacity." },
      { t: "Let players sign up", d: "They enroll from the booking page; the roster and waitlist update live." },
    ],
    faqs: [
      { q: "Can I enroll a player from the desk?", a: "Yes. Open the session and add any player to the roster until it's full." },
      { q: "What happens when someone drops out?", a: "The first player on the waitlist moves into the open spot automatically." },
      { q: "Can coaches see their own schedule?", a: "Yes. Filter the schedule by coach to see their week and what it earns." },
    ],
  },
  {
    slug: "pickleball-league-management",
    short: "Leagues & round robins",
    card: "Round robins with rotating partners, ladders, leagues, score entry and live standings.",
    metaTitle: "Pickleball League & Round Robin Software",
    metaDescription:
      "Create pickleball round robins with rotating partners, run ladders and leagues, enter scores and publish standings automatically. Players register online.",
    title: "Leagues and round robins",
    dim: "that run themselves.",
    lead: "Generate a round robin in seconds, enter scores as games finish and watch the standings update. Players register for events from their phone.",
    image: img.outdoorCourts,
    alt: "Outdoor pickleball courts surrounded by trees",
    problem: {
      h: "Round robin spreadsheets break on game day.",
      p: "Rotating partners by hand takes an hour, a late cancellation ruins the draw, and standings are always a round behind. Generating the schedule and updating standings from each score keeps the event moving.",
    },
    points: [
      { t: "Round robin generator", d: "Pick players in fours and a number of rounds. Partners rotate every round." },
      { t: "Leagues and ladders", d: "Team leagues and individual ladders with their own standings." },
      { t: "Score entry", d: "Enter a score from the desk or courtside and standings update instantly." },
      { t: "Standings", d: "Wins, losses, win percentage and point difference, sorted for you." },
      { t: "Online registration", d: "Players sign up for events from the booking page until capacity is reached." },
      { t: "Event status", d: "Move events from registering to in progress to completed." },
    ],
    steps: [
      { t: "Create the event", d: "Format, dates, level, entry fee and capacity." },
      { t: "Open registration", d: "Players register online; you can add players from the desk too." },
      { t: "Generate and play", d: "Create the schedule, enter scores and share the standings." },
    ],
    faqs: [
      { q: "What if the player count isn't a multiple of four?", a: "The generator uses the largest multiple of four. Extra players can rotate in on the next round." },
      { q: "Do you support elimination brackets?", a: "Not yet. Single and double elimination brackets are on our roadmap." },
      { q: "Can players see standings?", a: "Yes. Standings update the moment a score is saved." },
    ],
  },
];

export const getFeaturePage = (slug: string) => featurePages.find((p) => p.slug === slug);

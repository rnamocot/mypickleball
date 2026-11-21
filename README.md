# MyPickleball

Pickleball club management SaaS: a marketing site plus a club dashboard for court bookings, open play queues with play-time tracking, coaching, leagues, memberships, payments and staff.

## Stack

- Next.js (App Router) + TypeScript
- Plain CSS design system (dark theme, neon accent, Inter)
- No backend yet: the dashboard runs on seeded demo data saved in the browser

## Run locally

```bash
npm install
npm run dev
```

Open these in the browser:

- http://localhost:3000 marketing site
- http://localhost:3000/dashboard staff dashboard (sample club)
- http://localhost:3000/play player booking portal (same sample club; actions show up live in the dashboard)
- http://localhost:3000/tv full-screen court board for the facility TV

## Structure

- `app/(site)` marketing pages (home, features, pricing, story, contact, signup, legal)
- `app/dashboard` club dashboard
- `app/play` player booking portal, `app/tv` TV court board
- `components` shared UI, branded icons, logo
- `components/dash` dashboard store, charts, views
- `lib/site.ts` site config, pricing plans, FAQ

Set `NEXT_PUBLIC_SITE_URL` to your production domain for canonical URLs, sitemap and Open Graph tags.

Photos: Unsplash (free license).

## Contact and newsletter forms

Forms post to `app/api/contact/route.ts`. Copy `.env.example` to `.env.local` and set `RESEND_API_KEY`, `CONTACT_TO` and `CONTACT_FROM` to deliver them by email through [Resend](https://resend.com). Without those keys, submissions are logged on the server.

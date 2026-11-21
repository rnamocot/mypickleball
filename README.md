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

Open http://localhost:3000 for the site and http://localhost:3000/dashboard for the club dashboard.

## Structure

- `app/(site)` marketing pages (home, features, pricing, story, contact, signup, legal)
- `app/dashboard` club dashboard
- `components` shared UI, branded icons, logo
- `components/dash` dashboard store, charts, views
- `lib/site.ts` site config, pricing plans, FAQ

Set `NEXT_PUBLIC_SITE_URL` to your production domain for canonical URLs, sitemap and Open Graph tags.

Photos: Unsplash (free license).

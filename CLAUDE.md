# MyPickleball

Pickleball club management SaaS: marketing site, staff dashboard, player portal (`/play`) and TV board (`/tv`). Next.js 16 App Router, React 19, TypeScript 6, plain CSS. Demo data lives in localStorage (no backend yet).

**Start every session by reading `docs/BUILD_GUIDE.md`.** It has the full build history, code map, design rules, pre-commit checklist and the pending list.

Hard rules:
- Never use em dashes ("—") in any copy or metadata.
- No eyebrow labels or pill badges above headings. No grid-line backgrounds.
- Dark theme, neon `#d4ff3f`, Inter, branded icons from `components/Icons.tsx`.
- Honest marketing: no invented stats, testimonials or customers.
- Keep TypeScript on `^6` (typescript-eslint does not support 7).
- Bump `DATA_VERSION` in `components/dash/data.ts` when the seed or the State shape changes.
- Before committing: `npm run lint`, `npm run build`, and grep for "—". Update section 8 of the guide when an item ships.

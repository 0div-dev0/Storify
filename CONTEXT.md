# Storify — Developer Context

> **For AI agents / new developers:** Read this file first. It is the single source of
> truth for how this repo works. Keep it up to date — whenever you learn something new
> about the architecture, a convention, or a gotcha, **edit this file in the same PR**.
> The goal: get a new agent to full context in under a minute instead of re-exploring.

---

## 1. What this is

**Storify** — a personal journaling web app. You write daily journal entries, set goals,
and an AI turns your entries into either a *lifestyle analysis* or a *story*.

- **Stack:** Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, MongoDB via Mongoose.
- **AI:** OpenRouter (`google/gemini-2.5-flash`) for generation; keyword-matching for goal analysis.
- **Motion:** GSAP 3.15 (`gsap` + ScrollTrigger + SplitText) drives the `/` landing page.
  `components/landing/SectionParallax.js` owns bounded scroll + pointer parallax on
  selected elements. Nothing is thrown off screen, and reduced-motion users get static
  content. See `lib/gsap.js` and §7.
- **No auth.** Login/register/NextAuth/email verification were fully removed — the app is
  **single-user**. There is no session, no user id, no route protection.
- **No API keys beyond two** (see §6). Everything else is client/server local.

---

## 2. Directory map

```
app/
  layout.js            Root layout. Loads globals.css, wraps in DataProvider. NO auth provider.
  page.js              Landing page — composed from components/landing/* (GSAP animated).
  globals.css          ★ THE DESIGN SYSTEM — all vintage tokens & primitives live here.
  home/page.js         Dashboard (Aside + AccountDetails). No session guard.
  home/layout.js       Navbar + flex shell.
  journal/page.js      Journal editor (Aside + DiaryLLM). No session guard.
  journal/layout.js    Navbar + flex shell.
  api/
    journals/route.js          GET list / POST create
    journals/[id]/route.js     GET / PUT / DELETE single entry
    journals/lifestyle/route.js  ★ AI generation (reads MongoDB → OpenRouter)
    goals/route.js             GET / POST / DELETE goals
    goals/analyze/route.js     ★ AI goal analysis (keyword match → DayStatus)
    day-status/route.js        GET day status map
  actions/
    llm.js             Server action (OpenRouter) — currently UNUSED/dead code.
components/            All UI. See §4.
  landing/             ★ The `/` landing page — see §4b. Includes SectionParallax.js.
lib/
  gsap.js              ★ GSAP entry: registers ScrollTrigger + SplitText, exports
                      `gsap`, `useIsoLayoutEffect`, `useScrollRefresh`.
  DataContext.js       Global client state: goals, journals, dayStatuses, loading.
                      Fetches the 3 GET endpoints, caches to localStorage, revalidates
                      on the 'journalSaved' window event. Uses fixed CACHE_USER='local'.
  journalCache.js     localStorage cache (TTL 5 min) for lists + individual journals.
  dbConfig.js         Mongoose connection helper (default export = connectMongo).
models/
  Journal.js          title, content(HTML), plainText, date. Index on date.
  Goal.js             title, frequency(daily/weekly/monthly), startDate, endDate, completedDates[].
  DayStatus.js        date (YYYY-MM-DD), status (green|yellow|red). Unique index on date.
                      NOTE: no User/Session models — deleted with auth.
```

---

## 3. Data flow (the important part)

1. **Reads:** `DataProvider` fetches `/api/goals`, `/api/journals`, `/api/day-status` in
   parallel on mount → stores in context + localStorage.
2. **Write journal:** `DiaryLLM` POSTs/PUTs `/api/journals` → optimistically adds to
   context → fires `/api/goals/analyze` in background → dispatches `journalSaved` event →
   `DataProvider` refetches everything.
3. **AI generation:** `AccountDetails` POSTs `/api/journals/lifestyle` with a date range +
   mode(feedback|story) + length + theme. The route pulls journals from MongoDB, builds a
   prompt, calls OpenRouter, returns markdown text.
4. **Goal analysis:** `/api/goals/analyze` reads that day's journals, checks each applicable
   goal's title words against the text, updates `completedDates`, then writes a green/yellow/red
   `DayStatus`. This is **keyword matching, not LLM** (an LLM path exists in
   `app/actions/llm.js` but is not wired up).

**Auth is gone** — no `getServerSession`, no `session.user.id` anywhere. Queries are
unscoped (single global dataset).

---

## 4. Components

| Component | Role |
|-----------|------|
| `Navbar` | Top nav (desktop) + mobile bottom bar. No session/logout. Settings is a stub. |
| `Hero` | **Landing hero** (`components/landing/Hero.js`): entrance timeline, SplitText headline, parallax, dust motes, rotating seal, pointer-tilt journal preview. |
| `Logo` | "Stor**ify**" wordmark (`compact` prop for mobile, `tone="dark"` for brown/espresso backgrounds). |
| `JournalAnimation` | Typewriter effect that types out a sample diary entry. |
| `Aside` | Slide-in sidebar (mobile) / column (desktop) holding TodayGoals + GoalCalendar. |
| `TodayGoals` | Goals due today (daily/weekly/monthly filtering). |
| `GoalCalendar` | Month grid with green/yellow/red day dots + add/delete goals. |
| `AccountDetails` | Dashboard: date-range form + AI generation output panel. |
| `DiaryLLM` | Tiptap rich-text editor + toolbar + save + previous-journals panel. |
| `PreviousJournals` | Collapsible list of entries grouped by month; edit/delete. |
| `GreatSeperator`, `Searchbar`, `Popup` | Currently **unreferenced** stubs left from the old design — safe to delete or wire up. |

### 4b. The `/` landing page (`components/landing/`)

Composed in `app/page.js`: `Hero → Ticker → What → Why → How → Ticker → Contact → Footer`.
All are client components animated with GSAP.

| Component | Section | Signature motion |
|-----------|---------|------------------|
| `Hero` | Opening screen | Entrance timeline, SplitText word reveal, bounded backdrop/card/note parallax, mouse parallax on headline + CTAs + chips + paper, drifting dust motes, rotating seal, pointer-tilt journal card |
| `Ticker` | Infinite type marquee band (`bg-mahogany` / `bg-cocoa`) | `xPercent` loop, duplicated track for a seamless -50% wrap; subtle mouse parallax on the band |
| `What` | "What it is" (`bg-tan`) | Ruled-line `scaleX` wipe, specimen-page scroll parallax, icon ink-pop, selected pillar parallax |
| `Why` | "Why keep one" (`bg-paper`) | Reason cards + stat strip drift in bounded directions, number counters, stat-rule sweep |
| `How` | "How to use it" (`bg-espresso`, `#how`) | **Pinned horizontal scroll on desktop** (vertical scroll drives a horizontal track via `containerAnimation`); cards reveal on entry with no off-screen exit. Vertical staggered fallback below 1024px. |
| `Contact` | "Say hello" (`bg-clay`) | Bounded form/heading parallax, quill mouse parallax, success-state pop. Submits via `mailto:` (no backend) |
| `Footer` | `bg-espresso` | Selected column parallax, rotating diamond |
| `SectionParallax` | Controller, rendered last in `app/page.js` | Scroll-scrubbed `--scroll-x/y` and eased pointer `--mouse-x/y` custom properties, composed by CSS `translate`. Only selected, untransformed elements move; all values are bounded. No off-screen transitions, no swing/pendulum. |

**Anchors:** `#top` (page wrapper) and `#how` (`How` section). Keep them in sync with any in-page links.

**Chapter wrappers:** every landing section is wrapped in `<div data-chapter="Label">` in
`app/page.js`. The wrappers are trigger/anchoring context only — they are never
transformed. `SectionParallax` selects a small subset of elements inside them via
`data-parallax-x/y` and `data-mouse-x/y`. Scroll and pointer each write their own CSS
variable; `globals.css` composes them with `translate`, so the two systems never fight.
When GSAP transforms an element, put the parallax attributes on an untransformed child
or parent wrapper instead — GSAP writes `translate: none` inline on elements it owns.
Render `SectionParallax` last among siblings so its ScrollTriggers are created after the
pinned horizontal triggers.

---

## 5. ★ Design system (vintage / editorial)

**Everything is defined in `app/globals.css`.** Read it before styling anything.
Generated with the `ui-ux-pro-max` skill (vintage analog + editorial classic).

- **Fonts** (loaded via CSS `@import`, NOT `next/font` — see §7): `Playfair Display`
  (display/headings), `Libre Baskerville` (body), `JetBrains Mono` (mono).
- **Palette:** aged cream paper `#f4ecd8`, dark sepia ink `#2b2118`, and a family of
  **brown section blocks** — tan `#e6d3b3`, clay `#d8bc93`, sienna `#b5825a`,
  mahogany `#7a4e2d`, espresso `#4a3120`. Accents: terracotta CTA `#b5432e`,
  muted teal `#4a7b7c`, aged gold `#c08a2e`.
- **Borderless rule (important):** sections are separated by **brown colour blocks**,
  not outlines. Use `.card-vintage`, `.section-tan/clay/sienna/mahogany/espresso`,
  `.panel-inset`. Dividers are subtle brown hairlines (`border-sepia/15`), never light
  paper-coloured borders.
- **Primitives:** `.btn-vintage` (terracotta CTA), `.btn-brown`, `.btn-outline` (tint
  fill, no stroke), `.input-vintage` (borderless tinted field), `.eyebrow` /
  `.eyebrow-light` (small-caps labels), `.ornament` (centred divider),
  `.ruled-paper`, `.drop-cap`.
- **Texture:** `body::before` = film grain overlay, `body::after` = vignette. Both are
  `pointer-events: none`.
- **Accessibility:** focus-visible brown ring, `prefers-reduced-motion` respected,
  warm brass scrollbar. Icons are SVG (react-icons) — never emoji.

---

## 6. Environment (`.env.local`)

Only two keys, both required:

| Key | Used by | Purpose |
|-----|---------|---------|
| `MONGO_URI` | `lib/dbConfig.js` | MongoDB connection — journals/goals/day-status data that feeds the AI. |
| `OPENROUTER_KEY` | `api/journals/lifestyle`, `actions/llm.js` | OpenRouter API for AI generation. |

> Removed with auth: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GITHUB_ID/SECRET`,
> `RESEND_API_KEY`. Do not reintroduce.

---

## 7. Gotchas / conventions

- **Fonts must load without network at build time.** `next/font/google` fails the build
  when offline, so fonts are loaded via CSS `@import url(...)` at the top of
  `globals.css`. Keep it that way (or vendor the font files locally).
- **Tailwind v4** — theme tokens are declared in `@theme {}` inside `globals.css`, so
  `bg-paper`, `text-ink`, `border-sepia`, `font-display` etc. all resolve from there.
  Add new colours as `--color-*` tokens, don't hardcode hex in components.
- **No auth means no user scoping.** If you add queries, do NOT filter by `userId` —
  it no longer exists on any model.
- **`journalSaved` event** is the cross-component refresh signal. Dispatch it after any
  mutation that should refresh the dashboard/calendar.
- **`app/actions/llm.js` is dead code** (unused LLM goal analysis). Either wire it up or
  delete it — don't assume it runs.
- **`proxy.ts` (NextAuth middleware) was deleted.** There is no route protection now.
- **GSAP conventions (landing page).** Always import from `@/lib/gsap`, never straight
  from `"gsap"` — that module registers ScrollTrigger + SplitText and exports:
  - `useIsoLayoutEffect` — use it instead of `useEffect` for GSAP setup so `from()`
    start states apply *before* first paint (no flash), while staying SSR-safe.
  - `useScrollRefresh()` — re-runs `ScrollTrigger.refresh()` on `load` + `fonts.ready`.
    Call it in the first section of a page.
  - Wrap every animation in `gsap.matchMedia()` with
    `"(prefers-reduced-motion: no-preference)"` and return the cleanup from
    `mm.add(...)`. That way **reduced-motion users get fully visible, un-animated
    content** — never `gsap.set(..., {opacity: 0})` outside that branch.
  - For pinned horizontal scroll, the track tween must use `ease: "none"` and
    per-card triggers must set `containerAnimation` to that tween. Chapter wrappers are
    static, so the default `fixed` pin stays accurate.
  - Bounded parallax uses `data-parallax-x/y` for scroll and `data-mouse-x/y` for
    pointer. `globals.css` composes `--scroll-*` and `--mouse-*` through the independent
    `translate` property. Only put these attributes on elements GSAP does **not**
    transform directly: GSAP sets inline `translate: none` on its own targets, which
    silently disables CSS parallax. Move the attributes to a child/parent wrapper when
    an element already has a GSAP transform.
  - Pointer parallax is gated to `(hover: hover) and (pointer: fine)` and
    `prefers-reduced-motion: no-preference`. Cleanup kills the tweens, removes the
    listeners and resets the custom properties. Do not reintroduce off-screen exits,
    chapter flips, or pendulum/swing motion.
  - Scope with `gsap.context(() => {...}, rootRef)` and select via `data-*`
    attributes (never bare class names — Tailwind classes change often).
  - `@gsap/react` is **not installed** (registry was unreachable); use
    `useIsoLayoutEffect` + `gsap.context` instead of the `useGSAP()` hook.
- **Contact form has no backend.** It validates client-side then opens a
  `mailto:` — there is no `/api/contact`. Don't add one unless asked.

---

## 8. Commands

```bash
npm run dev     # dev server → http://localhost:3000
npm run build   # production build (Turbopack)
npm run start   # serve the production build
```

---

## 9. Change log (append here when you change architecture)

- **Auth removal:** deleted `app/login`, `app/register`, `app/api/auth`,
  `app/actions/email.js`, `models/User.js`, `models/Session.js`,
  `components/SessionProvider.js`, `proxy.ts`. Removed deps: `next-auth`, `bcrypt`,
  `bcryptjs`, `resend`, `react-hook-form`. Stripped session checks from all API routes
  and `useSession` from components. App is now single-user.
- **Vintage redesign:** replaced the dark slate/indigo/neon theme with a light
  parchment editorial vintage system (see §5) in `globals.css`.
- **MongoDB kept** — it is the data source for AI generation, not just auth storage.
- **Landing page rebuild (GSAP):** `app/page.js` now composes `components/landing/*`
  (Hero, Ticker, What, Why, How, Contact, Footer) with GSAP 3.15 scroll + entrance
  animation. Added `gsap` dependency and `lib/gsap.js`. Deleted the superseded
  `components/Hero.js` and the unused `components/Button.js` (email-capture leftover).
- **Design token fix:** `--font-display/body/mono` in `globals.css` `@theme {}` were
  self-referential (`--font-mono: var(--font-mono), …`), which made `font-mono`
  invalid at computed-value time. They are now self-contained stacks.
- **GSAP installed offline:** `gsap@3.15.1` came from the local npm cache;
  `@gsap/react` was not cached, so the `useGSAP()` hook is intentionally not used.
- **Landing motion overhaul:** enlarged the hero journal page, unified CTA alignment
  (`.landing-cta`) and the `max-w-[88rem]` container across sections. `How` is a pinned
  horizontal scroller on desktop with a vertical fallback. Added `data-chapter`
  wrappers in `app/page.js`.
- **Motion v2 (per-element, superseded in v4):** removed the whole-section flip and full-screen veil.
  `SectionChoreography.js` now runs seven distinct, slow (`scrub: 1.3`) recipes that
  move individual headings/paragraphs/cards/fields off screen in different directions
  and bounce them back in with an ~84% opacity floor. Incoming headings are split
  into words for progressive, scroll-linked pops. What/Why gained in-section
  horizontal drift. Section-local generic reveals were removed so choreography is
  the single owner.
- **Motion v3 (timing + pendulum, superseded in v4):** split each boundary into an EXIT trigger
  (`top 42%` → `bottom 100%`, `scrub: 0.65`) that finishes before the next section
  enters, and an ENTRANCE trigger (`top 96%` → `top 46%`, `scrub: 0.75`) that settles
  the new section early. Added `lib/pendulum.js`: scroll velocity kicks `[data-swing]`
  elements through a CSS `--swing-rotate` custom property so cards/headings/graphics
  hang and damp to rest without fighting GSAP transforms. Hero CTAs now share an
  identical box and equal width. Added idle breathing to the sticky note and contact
  form and retargeted directional lean to `xPercent` so it composes with exits.
- **Motion v4 (bounded parallax):** removed the off-screen chapter-exit system entirely —
  deleted `components/landing/SectionChoreography.js` and `lib/pendulum.js`, including
  swing, chapter HUD, and off-screen `EXIT`/`ENTRANCE` tweens. Added
  `components/landing/SectionParallax.js`: bounded scroll parallax in alternating
  directions plus eased pointer parallax across the hero, cards, headings, ticker and
  footer. Replaced `[data-swing]` with `data-parallax-x/y` and `data-mouse-x/y`; CSS
  composes them through `translate`. Parallax targets moved off GSAP-transformed
  elements (wrappers/children used instead), and `floatLoop` calls were removed from all
  landing sections. `How` no longer spins/fades cards off screen. Hero CTA boxes share
  identical width/height and no longer use `y`/`scale` in the entrance tween.

*When you change any of the above, update the relevant section AND append a line here.*
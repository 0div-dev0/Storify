# Storify

A vintage-styled personal journaling app built with **Next.js 16**, **React 19**,
**Tailwind CSS v4**, and **MongoDB**, with AI-powered journal analysis via OpenRouter.

Write daily entries, set goals, and let AI turn your journals into a lifestyle analysis
or a story.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Create a `.env.local` with:

- `MONGO_URI` — MongoDB connection string (stores journals/goals/day-status).
- `OPENROUTER_KEY` — OpenRouter API key for AI generation.

> This app has **no authentication** — it is single-user.

## Project structure

See [`CONTEXT.md`](./CONTEXT.md) for the full developer context: architecture, data
flow, design system, and conventions. **Read it first** — it is the source of truth.

## Scripts

```bash
npm run dev     # development server
npm run build   # production build
npm run start   # serve production build
```

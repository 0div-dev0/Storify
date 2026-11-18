# Design System Master File — Storify (Vintage Editorial)

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

**NOTE:** This file is the design source of truth. The *implemented* tokens live in
`app/globals.css` (Tailwind v4 `@theme`). If they ever diverge, `globals.css` wins —
update this file to match it.

---

**Project:** Storify
**Style:** Vintage Analog + Editorial Classic
**Mood:** warm, aged, literary, nostalgic, refined

---

## Global Rules

### Color Palette (borderless — colour blocks, not outlines)

| Role | Hex | Token |
|------|-----|-------|
| Page background | `#f4ecd8` | `--color-paper` |
| Light panel | `#fbf6ea` | `--color-parchment` |
| Secondary panel | `#ede0c4` | `--color-vellum` |
| Tan section | `#e6d3b3` | `--color-tan` |
| Clay section | `#d8bc93` | `--color-clay` |
| Sienna section | `#b5825a` | `--color-sienna` |
| Mahogany section | `#7a4e2d` | `--color-mahogany` |
| Espresso section | `#4a3120` | `--color-espresso` |
| Primary text (ink) | `#2b2118` | `--color-ink` |
| Muted text | `#6b5b4a` | `--color-ink-soft` |
| CTA (terracotta) | `#b5432e` | `--color-terracotta` |
| Accent (teal) | `#4a7b7c` | `--color-teal` |
| Accent (gold) | `#c08a2e` | `--color-gold` |

**Colour notes:** Sections are separated by **brown colour blocks**, never light
paper-coloured borders. Dividers are subtle brown hairlines (`border-sepia/15`).

### Typography

- **Display / Headings:** Playfair Display
- **Body:** Libre Baskerville
- **Mono:** JetBrains Mono

**CSS Import (loaded at runtime — do NOT use `next/font`, it breaks offline builds):**
```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
```

### Effects

- Film-grain overlay (`body::before`, SVG noise, 5% opacity, multiply)
- Vignette (`body::after`, radial darkened edges)
- Warm brass scrollbar
- Ornate centred dividers (`.ornament`), ruled-paper surfaces (`.ruled-paper`)

---

## Component Primitives (defined in `globals.css`)

| Class | Use |
|-------|-----|
| `.card-vintage` | Borderless paper panel — soft warm shadow, no stroke |
| `.section-tan / -clay / -sienna / -mahogany / -espresso` | Brown colour-block sections |
| `.panel-inset` | Sunken tinted area (no border) |
| `.btn-vintage` | Terracotta CTA with soft lift shadow |
| `.btn-brown` | Solid brown button (for dark sections) |
| `.btn-outline` | Tint-fill button (no stroke) |
| `.input-vintage` | Borderless tinted input |
| `.eyebrow` / `.eyebrow-light` | Small-caps section labels |
| `.ornament` | Centred decorative divider |
| `.ruled-paper` / `.drop-cap` | Journal typography flourishes |

---

## Anti-Patterns (Do NOT Use)

- ❌ Light / paper-coloured **outlines** around cards or sections — use colour blocks
- ❌ Dark mode by default — this is a light parchment theme
- ❌ Emojis as icons — use SVG (react-icons / Heroicons / Lucide)
- ❌ Neon / glow / CRT / synthwave effects — that was a rejected direction
- ❌ Missing `cursor:pointer` on interactive elements
- ❌ Layout-shifting hovers (scale transforms)
- ❌ Low contrast text — keep 4.5:1 minimum
- ❌ Instant state changes — use 150–300ms transitions
- ❌ Invisible focus states — use the brown `:focus-visible` ring

---

## Pre-Delivery Checklist

- [ ] No emojis used as icons (SVG instead)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150–300ms)
- [ ] Text contrast ≥ 4.5:1 on parchment backgrounds
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Sections separated by colour blocks, not outlines
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
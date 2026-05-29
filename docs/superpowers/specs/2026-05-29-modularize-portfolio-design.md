# Modularize Portfolio — Design

**Date:** 2026-05-29
**Status:** Approved (pending spec review)

## Goal

Make the codebase easier to maintain and edit by breaking the current monoliths
into small, focused files. No change to the rendered site, its appearance, or its
behavior — this is a pure refactor for maintainability.

## Constraints

- **Zero-build.** No npm, no bundler, no tooling. The site must still deploy by
  serving the files directly (open `index.html`). Splitting uses native ES modules
  (`<script type="module">`) and plain CSS.
- **Markup stays in `index.html`.** No runtime fetching of HTML partials (avoids
  SEO/flash tradeoffs). Only the inline `<script>` blocks and the Tailwind config
  move out.
- **External dependencies unchanged.** Tailwind, Three.js, Lenis, fonts, and
  Font Awesome continue to load via their existing CDN `<link>`/`<script>` tags.

## Current state (problems being addressed)

- `index.html` — 849 lines mixing: the ~90-line Tailwind config (inline
  `<script id="tailwind-config">`), a 6-line anti-flash theme script, all page
  markup, and a ~200-line inline Three.js GLSL background script.
- `js/main.js` — 201 lines bundling six unrelated concerns: carousel, theme
  toggle, skill-bar animation, typing effect, mobile menu, Lenis smooth scroll.
  Several behaviors are triggered by inline `onclick=""` attributes in the HTML.
- `css/style.css` — 310 lines mixing color tokens (light + dark), keyframe
  animations, base/background styles, and certificate-section styles.

## Target file structure

```
Portfolio/
├── index.html              (~560 lines: markup + <link>/<script> tags only)
├── css/
│   ├── style.css           entry — @imports the four partials (one <link> in HTML)
│   ├── theme.css           :root + html.dark color tokens
│   ├── animations.css      keyframes + .animate-* classes + #typing-text cursor
│   ├── base.css            html scroll-behavior, Lenis CSS, gradient-overlay, body backgrounds
│   └── certificates.css    .certi-img, .certificate-img, grid + cert1/cert2 breakpoints
└── js/
    ├── main.js             entry (type="module"): imports + runs each init()
    ├── tailwind-config.js  the tailwind.config object (classic script, after CDN)
    ├── theme-toggle.js     dark/light toggle (desktop + mobile buttons)
    ├── typing.js           hero typing/erasing effect
    ├── mobile-menu.js      hamburger open/close + close-on-link
    ├── carousel.js         certificate carousel (prev/next/auto, pause on hover)
    ├── skill-bars.js       skill bar fill + counter animation
    ├── smooth-scroll.js    Lenis init
    └── hills-background.js  Three.js GLSL hero background
```

## JS architecture

- Each module exports an `init` function (e.g. `export function initCarousel()`).
  Modules hold their own state in module scope — no globals on `window`.
- `main.js` imports every `init` and calls them. Because `type="module"` scripts are
  deferred, the DOM is parsed before `main.js` runs; the existing
  `readyState`/`DOMContentLoaded` wrappers are removed.
- `hills-background.js` and `smooth-scroll.js` reference the CDN globals `THREE`
  and `Lenis`. Those CDN tags are classic scripts placed before `main.js`, so the
  globals exist when the module executes.

## Removing inline event handlers (required)

ES module functions are not global, so the current inline `onclick` handlers would
break. They are rewired to `addEventListener` via `data-` attributes. This is the
only change to the markup itself (≈9 elements), and produces identical behavior.

| Current (in index.html)                      | New attribute                                  | Wired in        |
|----------------------------------------------|------------------------------------------------|-----------------|
| `onclick="prevSlide()"`                      | `data-carousel="prev"`                         | `carousel.js`   |
| `onclick="nextSlide()"`                      | `data-carousel="next"`                         | `carousel.js`   |
| `onclick="animateSkill('bar-html', 85)"`     | `data-skill-bar="bar-html" data-skill-percent="85"` | `skill-bars.js` |

(The skill-button mapping applies to all seven buttons: html 85, css 58,
bootstrap 75, js 55, php 50, mysql 60, cisco 65.)

## CSS architecture

- `style.css` becomes a thin entry containing only `@import url("theme.css");` etc.
  (in that order: theme, base, animations, certificates). The single
  `<link rel="stylesheet" href="./css/style.css">` in `index.html` is unchanged.
- Tradeoff: `@import` loads the partials sequentially rather than in parallel.
  Negligible for four small local files; acceptable for this portfolio.

## Deliberately kept inline in `<head>`

- **Anti-flash theme check** (6 lines): must run synchronously before first paint;
  externalizing it would add a blocking request and risk a flash of wrong theme.
- **`tailwind-config.js`**: loaded as a **classic** `<script src>` immediately after
  the Tailwind CDN tag (not a module), preserving the order Tailwind needs to read
  `tailwind.config` before it scans the document.

## Out of scope

- Data-driven rendering of repeated cards (projects/services/skills/certificates).
- Splitting HTML markup into partials.
- Any visual or content change.
- Adding a build step, minification, or local Tailwind compilation.

## Verification

No automated tests exist. Verify by serving the site locally and exercising every
interactive piece in the browser, in **both light and dark mode**:

1. Theme toggle (desktop + mobile buttons) — persists via `localStorage`, no flash on reload.
2. Hero typing/erasing effect cycles through all four phrases.
3. Mobile menu opens/closes; icon swaps menu/close; closes on link click.
4. Certificate carousel: prev/next buttons, 4s autoplay, pause on hover (mobile breakpoint).
5. Skill buttons animate their bar + counter on click (all seven).
6. Lenis smooth scroll active.
7. Three.js GLSL hero background renders and animates; color shifts between themes.
8. No console errors; no 404s for the new files.

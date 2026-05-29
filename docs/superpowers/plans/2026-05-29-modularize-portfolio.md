# Portfolio Modularization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the monolithic `index.html`, `js/main.js`, and `css/style.css` into small, focused ES modules and CSS partials, with zero build tooling and no change to how the site looks or behaves.

**Architecture:** Native ES modules (`<script type="module">`) for JS; one `init()` export per behavior, started by an entry `main.js`. CSS split into four partials pulled together by an `@import` entry. Inline `onclick` handlers are replaced with `data-*` attributes wired via `addEventListener` (required, since module functions are not global). All markup stays in `index.html`; external CDN dependencies (Tailwind, Three.js, Lenis, fonts, Font Awesome) are unchanged.

**Tech Stack:** Plain HTML/CSS/JS, Tailwind Play CDN, Three.js r128 (CDN global `THREE`), Lenis (CDN global `Lenis`).

---

## Conventions for this plan

- **Move operations** (cutting an existing rule/function from one file into another, unchanged) are specified by **selector/identifier + source line range** in the current file. Cut those exact blocks and paste them — do not retype from scratch (avoids transcription errors). The current files are the source of truth for the moved text.
- **New or changed code** is shown in full in the step.
- Source files at plan time: `index.html` (849 lines), `js/main.js` (201 lines), `css/style.css` (310 lines).

## Critical workflow change (read first)

ES modules do **not** load from the `file://` protocol. After Task 4, opening `index.html` by double-clicking will fail with a CORS/module error in the console. **Local preview now requires a static server.** Use:

```bash
python -m http.server 8000
```

then open `http://localhost:8000/`. This does **not** affect deployment — GitHub Pages (or any HTTP host) serves over HTTP and works fine.

For every verification step below, the server must be running and you load `http://localhost:8000/` (hard-reload to bypass cache). Verify in **both light and dark mode** (toggle with the theme button), and check the browser console for errors / 404s after each task.

---

## Task 1: Split `css/style.css` into partials

**Files:**
- Create: `css/theme.css`, `css/base.css`, `css/animations.css`, `css/certificates.css`
- Modify: `css/style.css` (becomes an `@import` entry)
- No change to `index.html` (the single `<link href="./css/style.css">` stays)

- [ ] **Step 1: Create `css/theme.css`** — move the two token blocks.

Cut from `css/style.css`:
- `:root { ... }` — lines 1–53
- `html.dark { ... }` — lines 55–107

Paste both into `css/theme.css` (de-indent to column 0; these were extracted from a `<style>` block so they carry leading spaces). Nothing else goes in this file.

- [ ] **Step 2: Create `css/base.css`** — move base layout + background rules.

Cut from `css/style.css` and paste into `css/base.css`, in this order:
- `html { scroll-behavior: smooth; }` — lines 109–111
- The five Lenis rules (`html.lenis, html.lenis body` … `.lenis.lenis-smooth iframe`) — lines 113–128
- `.gradient-overlay { ... }` — lines 232–234
- `html:not(.dark) body { ... }` — lines 293–301
- `html.dark body { ... }` — lines 303–311

- [ ] **Step 3: Create `css/animations.css`** — move keyframes + animation classes.

Cut from `css/style.css` and paste into `css/animations.css`, in this order (lines 130–230):
- `@keyframes float` (130–140)
- `@keyframes pulse-glow` (142–152)
- `@keyframes fadeInUp` (154–164)
- `@keyframes slideInRight` (166–176)
- `.animate-fade-up`, `.animate-slide-right`, `.animate-float`, `.animate-pulse-glow` (178–192)
- `.animate-neon-glow` (194–197)
- `@keyframes neon-pulse` (199–213)
- `#typing-text` (215–218)
- `@keyframes blink-cursor` (220–230)

- [ ] **Step 4: Create `css/certificates.css`** — move certificate-section rules.

Cut from `css/style.css` and paste into `css/certificates.css`, in this order (lines 237–291):
- `.certi-img` (238–245)
- `.certi-img:hover` (247–251)
- `.certificate-img` (253–257)
- `.c-img3, .c-img8` (259–262)
- `.c-img1, .c-img5, .c-img6, .c-img10` (264–269)
- `@media (max-width: 991px)` (271–279)
- `@media (min-width: 992px)` (281–291)

- [ ] **Step 5: Replace `css/style.css` with an import entry.**

After Steps 1–4, `style.css` should be empty. Replace its entire contents with exactly:

```css
@import url("theme.css");
@import url("base.css");
@import url("animations.css");
@import url("certificates.css");
```

- [ ] **Step 6: Verify in browser.**

Run: `python -m http.server 8000` (from repo root), open `http://localhost:8000/`.
Expected: Site looks **identical** to before in both light and dark mode — colors, fonts, hero neon glow, fade/slide entrance animations, typing cursor blink, certificate grid (desktop ≥992px) vs carousel (≤991px), and the subtle grid/radial body background. Console: no 404 for any `css/*.css`, no errors.

- [ ] **Step 7: Commit.**

```bash
git add css/style.css css/theme.css css/base.css css/animations.css css/certificates.css
git commit -m "refactor(css): split style.css into theme/base/animations/certificates partials"
```

---

## Task 2: Extract the Tailwind config out of `index.html`

**Files:**
- Create: `js/tailwind-config.js`
- Modify: `index.html` (remove inline config block; add a classic `<script src>`)

- [ ] **Step 1: Create `js/tailwind-config.js`.**

Move the body of the inline `<script id="tailwind-config">` (the `tailwind.config = { ... }` object, `index.html` lines 20–110) into `js/tailwind-config.js`. Keep it as a plain assignment — **no** `export`, this is a classic script that sets a global Tailwind reads. The file content is exactly the JS currently between the `<script id="tailwind-config">` open tag (line 19) and its `</script>` close tag (line 111):

```js
tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            // ... full colors / borderRadius / spacing / fontFamily / fontSize
            // (moved verbatim from index.html lines 20-110)
        }
    }
}
```

- [ ] **Step 2: Update `index.html` — swap inline config for the external file.**

Delete the entire inline block `index.html` lines 19–111 (`<script id="tailwind-config"> ... </script>`). In its place (immediately after the Tailwind CDN `<script src="https://cdn.tailwindcss.com...">` on line 9, and before the inline anti-flash theme script on lines 112–119) insert:

```html
<script src="./js/tailwind-config.js"></script>
```

Leave the anti-flash theme `<script>` (currently lines 112–119) inline and untouched. Leave `<link rel="stylesheet" href="./css/style.css">` untouched.

- [ ] **Step 3: Verify in browser.**

Reload `http://localhost:8000/`.
Expected: Identical appearance — custom Tailwind colors (`bg-background`, `text-primary`, etc.), custom spacing (`px-margin-edge`, `py-section-gap`), and custom fonts/sizes (`font-headline-xl`, `text-label-sm`) all still apply. If the page looks unstyled/default, the config didn't load in time — confirm the `<script src="./js/tailwind-config.js">` is placed **after** the CDN script and is a classic (non-module) script. Console: no errors, `js/tailwind-config.js` returns 200.

- [ ] **Step 4: Commit.**

```bash
git add js/tailwind-config.js index.html
git commit -m "refactor(html): extract Tailwind config to js/tailwind-config.js"
```

---

## Task 3: Create the six behavior modules (not yet wired in)

This task only **creates** new module files by extracting logic from `js/main.js`. The old `js/main.js` is left untouched and still drives the page, so the site keeps working. Switchover happens in Task 4.

**Files:**
- Create: `js/theme-toggle.js`, `js/typing.js`, `js/mobile-menu.js`, `js/carousel.js`, `js/skill-bars.js`, `js/smooth-scroll.js`
- No change to `index.html` or `js/main.js` yet

- [ ] **Step 1: Create `js/theme-toggle.js`.**

```js
export function initThemeToggle() {
    const themeToggles = [
        document.getElementById('theme-toggle'),
        document.getElementById('theme-toggle-mobile'),
    ];

    themeToggles.forEach(btn => {
        if (!btn) return;
        btn.addEventListener('click', () => {
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.theme = 'light';
            } else {
                document.documentElement.classList.add('dark');
                localStorage.theme = 'dark';
            }
        });
    });
}
```

- [ ] **Step 2: Create `js/typing.js`.**

```js
const textArray = ["Web Developer", "Web Designer", "IT Support", "IT Specialist"];
const typingDelay = 100;
const erasingDelay = 50;
const newTextDelay = 2000;
let textArrayIndex = 0;
let charIndex = 0;
let typingTextSpan = null;

function type() {
    if (!typingTextSpan) return;
    if (charIndex < textArray[textArrayIndex].length) {
        typingTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
        charIndex++;
        setTimeout(type, typingDelay);
    } else {
        setTimeout(erase, newTextDelay);
    }
}

function erase() {
    if (!typingTextSpan) return;
    if (charIndex > 0) {
        typingTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
        charIndex--;
        setTimeout(erase, erasingDelay);
    } else {
        textArrayIndex++;
        if (textArrayIndex >= textArray.length) textArrayIndex = 0;
        setTimeout(type, typingDelay + 500);
    }
}

export function initTyping() {
    typingTextSpan = document.getElementById("typing-text");
    if (textArray.length && typingTextSpan) setTimeout(type, newTextDelay + 250);
}
```

- [ ] **Step 3: Create `js/mobile-menu.js`.**

```js
export function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (!mobileMenuBtn || !mobileMenu) return;

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        const icon = mobileMenuBtn.querySelector('span');
        if (icon) icon.innerText = mobileMenu.classList.contains('hidden') ? 'menu' : 'close';
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            const icon = mobileMenuBtn.querySelector('span');
            if (icon) icon.innerText = 'menu';
        });
    });
}
```

- [ ] **Step 4: Create `js/carousel.js`.**

Note: `prevSlide`/`nextSlide` are now module-scoped and the prev/next buttons are wired by `data-carousel` attributes (added to the HTML in Task 4) instead of inline `onclick`.

```js
let currentIndex = 0;
let track = null;
let totalSlides = 0;
let autoSlideInterval = null;

function updateCarousel() {
    if (track && totalSlides > 0) {
        track.style.transform = `translateX(-${currentIndex * (100 / totalSlides)}%)`;
    }
}

function nextSlide() {
    if (totalSlides > 0) {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
    }
}

function prevSlide() {
    if (totalSlides > 0) {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateCarousel();
    }
}

export function initCarousel() {
    track = document.getElementById('carousel-track');
    if (!track) return;
    totalSlides = track.children.length;

    document.querySelectorAll('[data-carousel="prev"]').forEach(btn =>
        btn.addEventListener('click', prevSlide));
    document.querySelectorAll('[data-carousel="next"]').forEach(btn =>
        btn.addEventListener('click', nextSlide));

    autoSlideInterval = setInterval(nextSlide, 4000);

    const cert2Container = document.querySelector('.cert2');
    if (cert2Container) {
        cert2Container.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
        cert2Container.addEventListener('mouseleave', () => {
            clearInterval(autoSlideInterval);
            autoSlideInterval = setInterval(nextSlide, 4000);
        });
    }
}
```

- [ ] **Step 5: Create `js/skill-bars.js`.**

Note: the seven skill buttons are wired by `data-skill-bar` / `data-skill-percent` attributes (added in Task 4) instead of inline `onclick="animateSkill(...)"`. The `animateSkill` body is moved verbatim from `js/main.js` lines 58–114.

```js
function animateSkill(barId, percent) {
    const bar = document.getElementById(barId);
    const textId = 'text-' + barId;
    const textElement = document.getElementById(textId);

    if (!bar) return;

    bar.classList.remove('transition-all', 'duration-1000', 'ease-out');
    bar.style.width = '0%';
    bar.classList.add('brightness-150');

    if (textElement) {
        textElement.classList.remove('opacity-0');
        textElement.innerText = '0%';
    }

    void bar.offsetWidth;

    requestAnimationFrame(() => {
        bar.classList.add('transition-all', 'duration-1000', 'ease-out');
        bar.style.width = percent + '%';

        if (textElement) {
            const duration = 1000;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOutProgress = 1 - Math.pow(1 - progress, 3);
                const currentPercent = Math.floor(easeOutProgress * percent);
                textElement.innerText = currentPercent + '%';
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    textElement.innerText = percent + '%';
                }
            }
            requestAnimationFrame(updateCounter);
        }

        setTimeout(() => {
            bar.classList.remove('brightness-150');
        }, 1000);
    });
}

export function initSkillBars() {
    document.querySelectorAll('[data-skill-bar]').forEach(btn => {
        btn.addEventListener('click', () => {
            const barId = btn.dataset.skillBar;
            const percent = Number(btn.dataset.skillPercent);
            animateSkill(barId, percent);
        });
    });
}
```

- [ ] **Step 6: Create `js/smooth-scroll.js`.**

References the CDN global `Lenis`.

```js
export function initSmoothScroll() {
    if (typeof Lenis === 'undefined') return;

    const lenis = new Lenis({
        lerp: 0.15,
        smoothWheel: true,
        wheelMultiplier: 1.2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
}
```

- [ ] **Step 7: Verify nothing broke (modules exist but are unused).**

Reload `http://localhost:8000/`. The old `js/main.js` is still loaded, so the site behaves exactly as before. The new files are not referenced yet. Console: no errors (the new files aren't loaded, so they can't error). This step is just confirming the extraction didn't accidentally touch `index.html`/`main.js`.

- [ ] **Step 8: Commit.**

```bash
git add js/theme-toggle.js js/typing.js js/mobile-menu.js js/carousel.js js/skill-bars.js js/smooth-scroll.js
git commit -m "refactor(js): add per-behavior ES modules (carousel, theme, skills, typing, menu, scroll)"
```

---

## Task 4: Switch over to the module entry and rewire inline handlers

This is the switchover. After it, `main.js` is an ES module that imports the Task-3 modules, and the inline `onclick` attributes are gone.

**Files:**
- Modify: `js/main.js` (replace entire contents with the entry below)
- Modify: `index.html` (script tag → `type="module"`; carousel + skill button attributes)

- [ ] **Step 1: Replace the entire contents of `js/main.js` with the entry module.**

```js
import { initThemeToggle } from './theme-toggle.js';
import { initTyping } from './typing.js';
import { initMobileMenu } from './mobile-menu.js';
import { initCarousel } from './carousel.js';
import { initSkillBars } from './skill-bars.js';
import { initSmoothScroll } from './smooth-scroll.js';

// Module scripts are deferred, so the DOM is ready here.
initThemeToggle();
initTyping();
initMobileMenu();
initCarousel();
initSkillBars();
initSmoothScroll();
```

- [ ] **Step 2: Make `main.js` load as a module in `index.html`.**

Change the last script tag (currently `index.html` line 847):

```html
<script src="./js/main.js"></script>
```

to:

```html
<script type="module" src="./js/main.js"></script>
```

- [ ] **Step 3: Rewire the carousel buttons (remove inline `onclick`).**

In `index.html` (currently lines 362–367), change the Prev button's `onclick="prevSlide()"` to `data-carousel="prev"` and the Next button's `onclick="nextSlide()"` to `data-carousel="next"`. Keep every other attribute/class on those buttons unchanged. Result:

```html
<button
    class="bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface px-4 py-2 rounded-lg font-bold text-sm transition-transform hover:scale-105"
    data-carousel="prev">Prev</button>
<button
    class="bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface px-4 py-2 rounded-lg font-bold text-sm transition-transform hover:scale-105"
    data-carousel="next">Next</button>
```

- [ ] **Step 4: Rewire the seven skill buttons (remove inline `onclick`).**

In `index.html` (currently lines 429–443), for each skill button replace `onclick="animateSkill('<barId>', <percent>)"` with `data-skill-bar="<barId>" data-skill-percent="<percent>"`. Keep all classes unchanged. The seven mappings:

| Button label      | `data-skill-bar` | `data-skill-percent` |
|-------------------|------------------|----------------------|
| HTML5             | `bar-html`       | `85`                 |
| CSS               | `bar-css`        | `58`                 |
| Bootstrap         | `bar-bootstrap`  | `75`                 |
| JavaScript        | `bar-js`         | `55`                 |
| PHP               | `bar-php`        | `50`                 |
| MySQL             | `bar-mysql`      | `60`                 |
| Cisco Networking  | `bar-cisco`      | `65`                 |

Example (HTML5 button):

```html
<button data-skill-bar="bar-html" data-skill-percent="85"
    class="px-4 py-2 bg-surface-container-high border border-outline-variant/30 rounded font-label-sm text-label-sm text-on-surface hover:bg-primary hover:text-on-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary shadow-sm active:scale-95 cursor-pointer">HTML5</button>
```

- [ ] **Step 5: Verify all behaviors in the browser.**

Reload `http://localhost:8000/` (hard reload). Check, in both light and dark mode:
- Theme toggle (desktop + mobile) flips theme and persists across reload with no flash.
- Hero typing effect types/erases through all four phrases with blinking cursor.
- Mobile menu (narrow viewport / devtools device mode): hamburger opens menu, icon → `close`, closing or clicking a link → `menu`.
- Certificate carousel (≤991px viewport): Prev/Next move slides, autoplay advances every 4s, hovering pauses autoplay.
- Each of the seven skill buttons animates its bar + counter to the correct percentage.
- Smooth scroll feels momentum-eased (Lenis).

Console: zero errors, zero 404s. Critically confirm there is **no** `prevSlide is not defined` / `animateSkill is not defined` error (would mean an inline `onclick` was missed).

- [ ] **Step 6: Commit.**

```bash
git add js/main.js index.html
git commit -m "refactor(js): load main.js as ES module entry; wire handlers via data attributes"
```

---

## Task 5: Extract the Three.js GLSL background into a module

**Files:**
- Create: `js/hills-background.js`
- Modify: `index.html` (remove the inline GLSL `<script>`); `js/main.js` (import + call)

- [ ] **Step 1: Create `js/hills-background.js`.**

Move the entire body of the inline GLSL `<script>` (`index.html` lines 643–841 — everything inside the `document.addEventListener('DOMContentLoaded', () => { ... })` callback) into an exported `initHillsBackground()`. Drop the `DOMContentLoaded` wrapper (the module entry already runs after DOM ready). The function references the CDN global `THREE`. Structure:

```js
export function initHillsBackground() {
    const canvas = document.getElementById('glsl-canvas');
    const container = document.getElementById('glsl-container');
    if (!canvas || !container) return;

    const planeSize = 256;
    const speed = 0.5;
    const cameraZ = 125;

    class Plane {
        // ... moved verbatim from index.html lines 653-802 ...
    }

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: true });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 10000);
    const clock = new THREE.Clock();
    const plane = new Plane();

    const resize = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    };

    const render = () => {
        plane.render(clock.getDelta());
        renderer.render(scene, camera);
    };

    const renderLoop = () => {
        render();
        requestAnimationFrame(renderLoop);
    };

    const init = () => {
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(1);
        renderer.setClearColor(0x000000, 0);
        camera.position.set(0, 16, cameraZ);
        camera.lookAt(new THREE.Vector3(0, 28, 0));
        scene.add(plane.mesh);
        window.addEventListener('resize', resize);
        resize();
        renderLoop();
    };

    init();
}
```

The `Plane` class (constructor + `createMesh()` with the full vertex/fragment shader template strings + `render(time)`) is moved verbatim from `index.html` lines 653–802. Do not edit the GLSL shader strings.

- [ ] **Step 2: Remove the inline GLSL script from `index.html`.**

Delete the entire inline `<script>` block at `index.html` lines 642–842 (the `// GLSL Hills Background Animation` comment through its closing `</script>`). Leave the Three.js CDN `<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js">` (line 640) in place — `hills-background.js` depends on the global `THREE` it provides. Leave the Lenis CDN tag and the `main.js` module tag in place.

- [ ] **Step 3: Wire it into the entry `js/main.js`.**

Add the import at the top and the call at the bottom of `js/main.js`:

```js
import { initHillsBackground } from './hills-background.js';
```

```js
initHillsBackground();
```

Final `js/main.js`:

```js
import { initThemeToggle } from './theme-toggle.js';
import { initTyping } from './typing.js';
import { initMobileMenu } from './mobile-menu.js';
import { initCarousel } from './carousel.js';
import { initSkillBars } from './skill-bars.js';
import { initSmoothScroll } from './smooth-scroll.js';
import { initHillsBackground } from './hills-background.js';

// Module scripts are deferred, so the DOM is ready here.
initThemeToggle();
initTyping();
initMobileMenu();
initCarousel();
initSkillBars();
initSmoothScroll();
initHillsBackground();
```

- [ ] **Step 4: Verify the hero background.**

Reload `http://localhost:8000/`. Expected: the animated wireframe "hills" render in the hero behind the text and move continuously. Toggle theme — the wireframe color shifts (cyan in dark mode, dark blue in light mode). Resize the window — the canvas resizes without distortion. Console: no errors; confirm no `THREE is not defined` (would mean the CDN tag was removed or ordered after the module).

- [ ] **Step 5: Commit.**

```bash
git add js/hills-background.js index.html js/main.js
git commit -m "refactor(js): extract Three.js GLSL hero background into hills-background module"
```

---

## Task 6: Final full-site verification

**Files:** none (verification only)

- [ ] **Step 1: Full regression pass.**

With `python -m http.server 8000` running, hard-reload `http://localhost:8000/` and walk the entire page top to bottom in **both** light and dark mode:

1. Hero: Three.js background animates; typing effect cycles; "Download Resume" + "Learn More" links present.
2. Work: three project cards, hover scale on images, links open in new tab.
3. Certificates: desktop grid (≥992px) with hover-zoom; switch to ≤991px → carousel with working Prev/Next + 4s autoplay + pause-on-hover.
4. Services: three cards with hover lift.
5. Skills: all seven buttons animate their bar + counter to the right percentage.
6. About / CTA / Footer: layout intact, social links present.
7. Theme toggle persists across a reload with no flash of the wrong theme.
8. Nav: anchor links smooth-scroll (Lenis); mobile hamburger works at narrow width.

Console must be clean: no errors, no 404s for any `css/*.css` or `js/*.js`.

- [ ] **Step 2: Confirm the structure matches the spec.**

Run: `git status` and `ls js css`
Expected `js/`: `main.js`, `tailwind-config.js`, `theme-toggle.js`, `typing.js`, `mobile-menu.js`, `carousel.js`, `skill-bars.js`, `smooth-scroll.js`, `hills-background.js`.
Expected `css/`: `style.css`, `theme.css`, `base.css`, `animations.css`, `certificates.css`.
`index.html` should contain no inline `tailwind.config`, no inline GLSL script, and no `onclick=` attributes (grep to confirm: `grep -n "onclick" index.html` returns nothing).

---

## Self-review notes

- **Spec coverage:** CSS split (Task 1) ✓, Tailwind config extraction (Task 2) ✓, six behavior modules + module entry (Tasks 3–4) ✓, inline `onclick` removal via data attributes (Task 4, all 9 elements) ✓, GLSL extraction (Task 5) ✓, anti-flash theme script kept inline (Task 2 Step 2) ✓, `tailwind-config.js` as classic script after CDN (Task 2) ✓, `@import` CSS entry keeping one `<link>` (Task 1 Step 5) ✓, CDN globals unchanged (Tasks 2, 5) ✓, both-theme browser verification (every task + Task 6) ✓.
- **Type/name consistency:** export names `initThemeToggle`, `initTyping`, `initMobileMenu`, `initCarousel`, `initSkillBars`, `initSmoothScroll`, `initHillsBackground` match between their defining task and the `main.js` imports in Tasks 4 and 5. `data-carousel` / `data-skill-bar` / `data-skill-percent` attribute names match between the HTML (Task 4) and the querying modules (Task 3, Steps 4–5).
- **Skill percentages** verified against `index.html` source: html 85, css 58, bootstrap 75, js 55, php 50, mysql 60, cisco 65.

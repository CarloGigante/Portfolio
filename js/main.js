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

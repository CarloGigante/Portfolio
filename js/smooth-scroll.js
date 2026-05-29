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

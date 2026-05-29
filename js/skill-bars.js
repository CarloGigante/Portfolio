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

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

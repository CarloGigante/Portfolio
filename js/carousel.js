let currentIndex = 0;
let track = null;
let totalSlides = 0;
let autoSlideInterval = null;

function updateCarousel() {
    if (track && totalSlides > 0) {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
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

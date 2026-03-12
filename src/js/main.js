// ===== NAV SCROLL =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 80);
}, { passive: true });

// ===== MOBILE MENU =====
function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    const hamburger = document.getElementById('hamburger');
    menu.classList.toggle('active');
    hamburger.classList.toggle('active');
    document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
}

// ===== SCROLL REVEAL =====
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
reveals.forEach(el => observer.observe(el));

// ===== HERO PARALLAX =====
const heroBg = document.getElementById('heroBg');
if (heroBg) {
    window.addEventListener('scroll', () => {
        if (window.scrollY < window.innerHeight) {
            heroBg.style.transform = `translateY(${window.scrollY * 0.2}px) scale(1.02)`;
        }
    }, { passive: true });
}

// ===== FACTORY CAROUSEL =====
(function() {
    const track = document.querySelector('.factory-carousel-track');
    if (!track) return;

    const slides = track.querySelectorAll('.factory-slide');
    const dotsContainer = document.querySelector('.factory-carousel-dots');
    const prevBtn = document.querySelector('.factory-carousel-prev');
    const nextBtn = document.querySelector('.factory-carousel-next');
    let current = 0;
    let autoTimer;

    // Create dots
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'factory-carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Imagen ' + (i + 1));
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
    });

    function goTo(index) {
        slides[current].classList.remove('active');
        dotsContainer.children[current].classList.remove('active');
        current = (index + slides.length) % slides.length;
        slides[current].classList.add('active');
        dotsContainer.children[current].classList.add('active');
        resetAuto();
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    function resetAuto() {
        clearInterval(autoTimer);
        autoTimer = setInterval(() => goTo(current + 1), 4500);
    }
    resetAuto();
})();


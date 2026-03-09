// ===== i18n SYSTEM =====
// `translations` is injected as a global variable by the template

// Store original ES content
const esStore = {};

function initLanguage() {
    // Store all original ES content
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        esStore[key] = el.textContent;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        esStore[key] = el.innerHTML;
    });
    // Store meta
    esStore['meta.title'] = document.title;
    esStore['meta.description'] = document.querySelector('meta[name="description"]').getAttribute('content');

    // Detect language
    const params = new URLSearchParams(window.location.search);
    const paramLang = params.get('lang');
    const lang = paramLang || localStorage.getItem('pmp-lang') || 'es';

    setLanguage(lang, true);
}

function setLanguage(lang, isInit) {
    const validLangs = ['es', 'ca', 'en'];
    if (!validLangs.includes(lang)) lang = 'es';

    // Swap text
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (lang === 'es') {
            el.textContent = esStore[key] || el.textContent;
        } else {
            el.textContent = (translations[lang] && translations[lang][key]) || esStore[key] || el.textContent;
        }
    });

    // Swap HTML
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (lang === 'es') {
            el.innerHTML = esStore[key] || el.innerHTML;
        } else {
            el.innerHTML = (translations[lang] && translations[lang][key]) || esStore[key] || el.innerHTML;
        }
    });

    // Update meta
    if (lang === 'es') {
        document.title = esStore['meta.title'];
        document.querySelector('meta[name="description"]').setAttribute('content', esStore['meta.description']);
    } else {
        document.title = translations[lang]['meta.title'] || esStore['meta.title'];
        document.querySelector('meta[name="description"]').setAttribute('content', translations[lang]['meta.description'] || esStore['meta.description']);
    }

    // Update html lang
    document.documentElement.lang = lang;

    // Update active buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.trim().toLowerCase() === lang);
    });

    // Persist
    localStorage.setItem('pmp-lang', lang);

    // Update URL without reload
    const url = new URL(window.location);
    if (lang === 'es') {
        url.searchParams.delete('lang');
    } else {
        url.searchParams.set('lang', lang);
    }
    history.replaceState(null, '', url);

    // Restore opacity (FOUC prevention)
    document.documentElement.style.opacity = '1';
    document.documentElement.style.transition = 'opacity 0.15s ease';
}

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

// Init language (DOM is ready since script is at end of body)
initLanguage();

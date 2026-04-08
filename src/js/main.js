/* Page dots — JS scroll to handle sticky sections */
(function() {
    var dots = document.querySelectorAll('.page-dot[href^="#"]');
    dots.forEach(function(dot) {
        dot.addEventListener('click', function(e) {
            e.preventDefault();
            var id = dot.getAttribute('href').slice(1);
            var sections = document.querySelectorAll('section');
            var scrollTarget = 0;
            for (var i = 0; i < sections.length; i++) {
                if (sections[i].id === id) break;
                scrollTarget += sections[i].offsetHeight;
            }
            window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
        });
    });
})();

/* Non-desktop: replace <br> with spaces in all headers/text */
(function() {
    if (window.innerWidth < 1024) {
        var els = document.querySelectorAll('h1, h2, h3, p');
        els.forEach(function(el) {
            if (el.querySelector('br')) {
                el.innerHTML = el.innerHTML.replace(/<br\s*\/?>/gi, ' ');
            }
        });
    }
})();

/* Nav scroll + page dots */
(function() {
    var nav = document.getElementById('nav');
    var intro = document.getElementById('nosotros');
    var contact = document.getElementById('contacto');
    var dots = document.querySelectorAll('.page-dot');
    var dotsContainer = document.getElementById('pageDots');
    var sections = document.querySelectorAll('section');
    if (!nav) return;

    window.addEventListener('scroll', function() {
        nav.classList.toggle('nav--scrolled', window.scrollY > 60);
        if (intro) {
            var introTop = intro.getBoundingClientRect().top;
            var pastHero = introTop <= 100;
            var onContact = contact && contact.getBoundingClientRect().top <= 100;
            nav.classList.toggle('nav--dark', pastHero && !onContact);
            nav.classList.toggle('nav--light', onContact);
            nav.classList.toggle('nav--hidden', onContact);
            if (dotsContainer) dotsContainer.classList.toggle('page-dots--visible', pastHero && !onContact);
        }

        // Update page dots
        var active = 0;
        sections.forEach(function(sec, i) {
            if (sec.getBoundingClientRect().top <= window.innerHeight * 0.5) active = i;
        });
        dots.forEach(function(dot, i) {
            dot.classList.toggle('page-dot--active', i === active);
        });
    }, { passive: true });
})();

/* Mobile menu */
function toggleMenu() {
    var menu = document.getElementById('mobileMenu');
    var burger = document.getElementById('navBurger');
    if (!menu || !burger) return;
    menu.classList.toggle('mmenu--open');
    burger.classList.toggle('nav__burger--open');
    document.body.style.overflow = menu.classList.contains('mmenu--open') ? 'hidden' : '';
}

/* Hero text aligned to diagonal line */
(function() {
    if (window.innerWidth < 1024) return;
    var heroContent = document.querySelector('.hero__content');
    if (!heroContent) return;

    function positionTexts() {
        var w = document.documentElement.clientWidth;
        var pageH = document.documentElement.scrollHeight;
        var vh = window.innerHeight;
        var x1 = w * 0.50;
        var x2 = w * 0.05;
        var gap = 60;

        var lineAtTagline = x1 + (x2 - x1) * (vh * 0.42 / pageH);
        var lineAtTitle = x1 + (x2 - x1) * (vh * 0.58 / pageH);

        var taglineRight = w - lineAtTagline + gap;
        heroContent.style.setProperty('--diag-tagline-right', taglineRight + 'px');
        heroContent.style.setProperty('--diag-title-left', (lineAtTitle + gap) + 'px');
    }

    positionTexts();
    window.addEventListener('resize', positionTexts);
    window.addEventListener('load', positionTexts);
})();

/* Diagonal line segments — each section gets its portion of the global diagonal */
(function() {
    if (window.innerWidth < 1024) return;
    var segments = document.querySelectorAll('.diagonal-segment');
    if (!segments.length) return;

    function update() {
        var w = document.documentElement.clientWidth;
        var pageH = document.documentElement.scrollHeight;
        var x1Global = w * 0.50;
        var x2Global = w * 0.05;

        segments.forEach(function(seg) {
            var section = seg.parentElement;
            var rect = section.getBoundingClientRect();
            var top = rect.top + window.scrollY;
            var height = rect.height;
            if (height <= 0) return;
            var bottom = top + height;

            var xAtTop = x1Global + (x2Global - x1Global) * (top / pageH);
            var xAtBottom = x1Global + (x2Global - x1Global) * (bottom / pageH);

            var svg = seg.querySelector('svg');
            var line = seg.querySelector('line');
            svg.setAttribute('viewBox', '0 0 ' + w + ' ' + height);
            line.setAttribute('x1', xAtTop);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', xAtBottom);
            line.setAttribute('y2', height);
        });
    }

    update();
    window.addEventListener('resize', update);
    window.addEventListener('load', function() {
        update();
        setTimeout(update, 500);
    });
})();

/* Scroll reveal (.sr → .sr--visible) */
(function() {
    var els = document.querySelectorAll('.sr');
    if (!els.length) return;
    var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
            if (e.isIntersecting) {
                e.target.classList.add('sr--visible');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function(el) { obs.observe(el); });
})();


/* Stack carousel — auto + manual navigation */
(function() {
    var cards = document.querySelectorAll('.stack-card');
    if (!cards.length) return;
    var total = cards.length;
    var current = 0;
    var interval;
    var isDesktop = window.innerWidth >= 1024;

    var btnPrev = document.getElementById('stackPrev');
    var btnNext = document.getElementById('stackNext');
    var container = document.getElementById('stackCards');

    if (isDesktop) {
        /* Desktop: stack carousel with data-state */
        function setStep(step) {
            current = ((step % total) + total) % total;
            cards.forEach(function(card, i) {
                var pos = (i - current + total) % total;
                if (pos === 0) {
                    card.setAttribute('data-state', 'active');
                } else {
                    card.setAttribute('data-state', 'queued-' + Math.min(pos, 3));
                }
            });
        }

        function next() { setStep(current + 1); }
        function startAuto() { interval = setInterval(next, 15000); }
        function stopAuto() { clearInterval(interval); }

        if (btnNext) btnNext.addEventListener('click', function() { stopAuto(); setStep(current + 1); startAuto(); });
        if (btnPrev) btnPrev.addEventListener('click', function() { stopAuto(); setStep(current - 1); startAuto(); });
        cards.forEach(function(card, i) {
            card.addEventListener('click', function() { stopAuto(); setStep(i); startAuto(); });
        });
        startAuto();
    } else {
        /* Non-desktop: horizontal scroll slider */
        function scrollToCard(index) {
            current = ((index % total) + total) % total;
            var card = cards[current];
            container.scrollTo({ left: card.offsetLeft - (container.offsetWidth - card.offsetWidth) / 2, behavior: 'smooth' });
        }

        function nextMobile() { scrollToCard(current + 1); }
        function startAutoMobile() { interval = setInterval(nextMobile, 15000); }
        function stopAutoMobile() { clearInterval(interval); }

        if (btnNext) btnNext.addEventListener('click', function() { stopAutoMobile(); scrollToCard(current + 1); startAutoMobile(); });
        if (btnPrev) btnPrev.addEventListener('click', function() { stopAutoMobile(); scrollToCard(current - 1); startAutoMobile(); });
        startAutoMobile();
    }
})();

/* Stack card offset — adapt vertical spacing to viewport height */
(function() {
    if (window.innerWidth < 1024) return;
    var carousel = document.getElementById('stackCarousel');
    if (!carousel) return;

    function updateStep() {
        var vh = window.innerHeight;
        var step = Math.max(60, Math.round(vh * 0.13));
        carousel.style.setProperty('--stack-step', step + 'px');
    }

    updateStep();
    window.addEventListener('resize', updateStep);
})();


/* Khanvian video lightbox */
(function() {
    var lightbox = document.getElementById('khanvianLightbox');
    var iframe = document.getElementById('khanvianIframe');
    var closeBtn = document.getElementById('lightboxClose');
    if (!lightbox || !iframe) return;

    var vimeoUrl = 'https://player.vimeo.com/video/1100597686?autoplay=1';

    var triggers = document.querySelectorAll('.khanvian__video-trigger');
    triggers.forEach(function(trigger) {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            iframe.src = vimeoUrl;
            lightbox.classList.add('lightbox--open');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeLightbox() {
        lightbox.classList.remove('lightbox--open');
        iframe.src = '';
        document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('lightbox--open')) closeLightbox();
    });
})();


/* Mobile: replace <br> with spaces in hero tagline */
(function() {
    if (window.innerWidth <= 900) {
        var els = document.querySelectorAll('.hero__tagline, .khanvian__title');
        els.forEach(function(el) {
            el.innerHTML = el.innerHTML.replace(/<br\s*\/?>/gi, ' ');
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


/* Diagonal line segments — each section gets its portion of the global diagonal */
(function() {
    if (window.innerWidth <= 900) return;
    var segments = document.querySelectorAll('.diagonal-segment');
    if (!segments.length) return;

    function getAbsoluteTop(el) {
        var top = 0;
        while (el) {
            top += el.offsetTop;
            el = el.offsetParent;
        }
        return top;
    }

    function update() {
        var w = document.documentElement.clientWidth;
        var pageH = document.documentElement.scrollHeight;
        // Global line: from (50% of w, 0) to (5% of w, pageH)
        var x1Global = w * 0.50;
        var x2Global = w * 0.05;

        segments.forEach(function(seg) {
            var section = seg.parentElement;
            var rect = section.getBoundingClientRect();
            var top = rect.top + window.scrollY;
            var height = seg.offsetHeight || rect.height;
            if (height <= 0) return;
            var bottom = top + height;

            // Calculate x position at section top and bottom
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
    window.addEventListener('load', update);
    window.addEventListener('scroll', update, { passive: true });
})();

/* Hero text aligned to diagonal line */
(function() {
    if (window.innerWidth <= 900) return;
    var heroContent = document.querySelector('.hero__content');
    if (!heroContent) return;

    function positionTexts() {
        var w = document.documentElement.clientWidth;
        var pageH = document.documentElement.scrollHeight;
        var vh = window.innerHeight;
        var x1 = w * 0.50;
        var x2 = w * 0.05;
        var gap = 40;

        // Tagline center at 42% of vh, title at 58%
        var lineAtTagline = x1 + (x2 - x1) * (vh * 0.42 / pageH);
        var lineAtTitle = x1 + (x2 - x1) * (vh * 0.58 / pageH);

        // Tagline: right edge = gap to the left of the line
        // CSS right = distance from right edge of container to right edge of element
        var taglineRight = w - lineAtTagline + gap;
        heroContent.style.setProperty('--diag-tagline-right', taglineRight + 'px');

        // Title: left edge = gap to the right of the line
        heroContent.style.setProperty('--diag-title-left', (lineAtTitle + gap) + 'px');
    }

    positionTexts();
    window.addEventListener('resize', positionTexts);
    window.addEventListener('load', positionTexts);
})();

/* Diagonal clip-path — match the diagonal line angle */
(function() {
    if (window.innerWidth <= 900) return;
    function updateClipPaths() {
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.scrollHeight;
        var slope = (0.50 - 0.05) * w / h;

        // Stack cards
        var cards = document.querySelectorAll('.stack-card');
        cards.forEach(function(card) {
            var cardH = card.offsetHeight;
            var cardW = card.offsetWidth;
            var shiftPct = (slope * cardH / cardW) * 100;
            card.style.clipPath = 'polygon(' +
                shiftPct + '% 0%, 100% 0%, ' +
                (100 - shiftPct) + '% 100%, 0% 100%)';
        });

        // Khanvian textbox
        var kTextbox = document.querySelector('.khanvian__textbox');
        if (kTextbox) {
            var tbH = kTextbox.offsetHeight;
            var tbW = kTextbox.offsetWidth;
            var tbShift = (slope * tbH / tbW) * 100;
            kTextbox.style.clipPath = 'polygon(' +
                tbShift + '% 0%, 100% 0%, ' +
                (100 - tbShift) + '% 100%, 0% 100%)';
        }
    }
    updateClipPaths();
    window.addEventListener('resize', updateClipPaths);
    window.addEventListener('load', updateClipPaths);
})();

/* Stack carousel — auto + manual navigation */
(function() {
    var cards = document.querySelectorAll('.stack-card');
    if (!cards.length) return;

    var total = cards.length;
    var current = 0;
    var interval;

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
    function startAuto() { interval = setInterval(next, 4000); }
    function stopAuto() { clearInterval(interval); }

    var btnPrev = document.getElementById('stackPrev');
    var btnNext = document.getElementById('stackNext');

    if (btnNext) btnNext.addEventListener('click', function() { stopAuto(); setStep(current + 1); startAuto(); });
    if (btnPrev) btnPrev.addEventListener('click', function() { stopAuto(); setStep(current - 1); startAuto(); });

    cards.forEach(function(card, i) {
        card.addEventListener('click', function() { stopAuto(); setStep(i); startAuto(); });
    });

    startAuto();
})();

/* Blocks dividers — faster parallax scroll (desktop only) */
(function() {
    if (window.innerWidth <= 900) return;
    var blocks = document.querySelectorAll('.blocks-divider, .khanvian__blocks-divider');
    if (!blocks.length) return;
    var speed = 1.8; // moves 1.8x faster than normal scroll

    window.addEventListener('scroll', function() {
        var scrollY = window.scrollY;
        blocks.forEach(function(el) {
            var rect = el.getBoundingClientRect();
            var offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * (speed - 1);
            el.style.transform = 'translate3d(0,' + offset + 'px,0)';
        });
    }, { passive: true });
})();

/* Hide hero bg when scrolled past hero (desktop only) */
(function() {
    if (window.innerWidth <= 900) return;
    var heroBg = document.getElementById('heroBg');
    var hero = document.getElementById('hero');
    if (!heroBg || !hero) return;

    window.addEventListener('scroll', function() {
        var heroBottom = hero.offsetTop + hero.offsetHeight;
        heroBg.style.visibility = window.scrollY > heroBottom ? 'hidden' : 'visible';
    }, { passive: true });
})();

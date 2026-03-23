/* Nav scroll */
(function() {
    var nav = document.getElementById('nav');
    var hero = document.getElementById('hero');
    if (!nav) return;
    window.addEventListener('scroll', function() {
        nav.classList.toggle('nav--scrolled', window.scrollY > 60);
        if (hero) {
            var heroBottom = hero.offsetTop + hero.offsetHeight;
            nav.classList.toggle('nav--dark', window.scrollY > heroBottom - 100);
        }
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
    function updateClipPaths() {
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.scrollHeight;
        // Diagonal line goes from 50% to 5% across full page height
        // Slope: how much % of width shifts per pixel of height
        var slope = (0.50 - 0.05) * w / h;

        var cards = document.querySelectorAll('.stack-card');
        cards.forEach(function(card) {
            var cardH = card.offsetHeight;
            var cardW = card.offsetWidth;
            // Shift in % of card width over the card's height
            var shiftPct = (slope * cardH / cardW) * 100;

            // Left edge: top-left shifts right by shiftPct compared to bottom-left
            // Right edge: top-right shifts right by shiftPct compared to bottom-right
            var clip = 'polygon(' +
                shiftPct + '% 0%, ' +
                '100% 0%, ' +
                (100 - shiftPct) + '% 100%, ' +
                '0% 100%)';
            card.style.clipPath = clip;
        });

        // Also apply to khanvian textbox
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

/* Stack carousel — circular rotation on scroll */
(function() {
    var carousel = document.getElementById('stackCarousel');
    var cards = document.querySelectorAll('.stack-card');
    var khanvian = document.getElementById('khanvian');
    var heading = document.querySelector('.companies__heading');
    if (!carousel || !cards.length) return;

    var total = cards.length;
    var currentStep = -1;

    // Circular: the active card goes to the back of the queue
    function setStep(step) {
        if (step === currentStep) return;
        currentStep = step;
        var s = Math.min(step, total - 1);
        cards.forEach(function(card, i) {
            var pos = (i - s + total) % total;
            if (pos === 0) {
                card.setAttribute('data-state', 'active');
            } else {
                card.setAttribute('data-state', 'queued-' + Math.min(pos, 3));
            }
        });
        // Show khanvian only after last card has been seen
        if (khanvian) {
            khanvian.style.opacity = (step >= total - 1) ? 1 : 0;
        }
    }

    cards.forEach(function(card, i) {
        card.addEventListener('click', function() { setStep(i); });
    });

    // Scroll per card + extra dwell after the last card
    var vh = window.innerHeight;
    var scrollPerCard = vh * 0.75;
    var dwellAfterLast = vh * 1;
    var totalScrollNeeded = (scrollPerCard * total) + dwellAfterLast;

    function measure() {
        vh = window.innerHeight;
        scrollPerCard = vh * 0.75;
        dwellAfterLast = vh * 1;
        totalScrollNeeded = (scrollPerCard * total) + dwellAfterLast;
        carousel.style.height = (vh + totalScrollNeeded) + 'px';
    }

    measure();

    window.addEventListener('scroll', function() {
        var rect = carousel.getBoundingClientRect();
        var isSticky = rect.top <= 0 && rect.bottom > vh;

        // Show/hide heading with carousel
        if (heading) {
            heading.classList.toggle('companies__heading--visible', isSticky);
        }

        if (rect.top > 0) {
            setStep(0);
            return;
        }
        var scrolled = -rect.top;
        var step = Math.min(Math.floor(scrolled / scrollPerCard), total - 1);
        setStep(step);
    }, { passive: true });

    window.addEventListener('resize', measure);
})();

/* Blocks dividers — faster parallax scroll */
(function() {
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

/* Hide hero bg when scrolled past hero */
(function() {
    var heroBg = document.getElementById('heroBg');
    var hero = document.getElementById('hero');
    if (!heroBg || !hero) return;

    window.addEventListener('scroll', function() {
        var heroBottom = hero.offsetTop + hero.offsetHeight;
        heroBg.style.visibility = window.scrollY > heroBottom ? 'hidden' : 'visible';
    }, { passive: true });
})();

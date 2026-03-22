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

/* Stack carousel — simple scroll, no parallax */
(function() {
    var carousel = document.getElementById('stackCarousel');
    var cardsContainer = document.getElementById('stackCards');
    var cards = document.querySelectorAll('.stack-card');
    var khanvian = document.getElementById('khanvian');
    if (!carousel || !cards.length) return;

    var total = cards.length;

    // Use IntersectionObserver to trigger card changes
    var currentActive = 0;

    function setActive(index) {
        if (index === currentActive) return;
        currentActive = index;
        cards.forEach(function(card, i) {
            if (i < index) {
                card.setAttribute('data-state', 'done');
            } else if (i === index) {
                card.setAttribute('data-state', 'active');
            } else {
                var queuePos = i - index;
                card.setAttribute('data-state', 'queued-' + Math.min(queuePos, 3));
            }
        });
        if (khanvian) {
            khanvian.style.opacity = index === total - 1 ? 1 : 0;
        }
    }

    // Click/tap on queued cards to advance
    cards.forEach(function(card, i) {
        card.addEventListener('click', function() {
            setActive(i);
        });
    });

    var shrinkPerCard = 300;
    var sticky = document.querySelector('.stack-carousel__sticky');
    var initialCarouselH, initialStickyH, scrollRange;

    function measure() {
        // Reset height to recalculate
        carousel.style.height = '';
        if (sticky) sticky.style.height = '';
        initialCarouselH = carousel.offsetHeight;
        initialStickyH = sticky ? sticky.offsetHeight : 0;
        scrollRange = initialCarouselH - window.innerHeight;
        if (scrollRange <= 0) scrollRange = 1;
    }

    // Measure after layout settles
    setTimeout(measure, 100);

    window.addEventListener('scroll', function() {
        if (!initialCarouselH) return;
        var rect = carousel.getBoundingClientRect();
        var vh = window.innerHeight;

        // Only start when section top reaches viewport top
        if (rect.top > 0) {
            setActive(0);
            return;
        }

        var scrolled = -rect.top;
        // Use a fixed scroll amount per card
        var scrollPerCard = scrollRange / total;
        var index = Math.min(Math.floor(scrolled / scrollPerCard), total - 1);
        setActive(index);

        // Shrink
        var shrink = index * shrinkPerCard;
        carousel.style.height = (initialCarouselH - shrink) + 'px';
        if (sticky) sticky.style.height = (initialStickyH - shrink) + 'px';
    }, { passive: true });

    window.addEventListener('resize', measure);
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

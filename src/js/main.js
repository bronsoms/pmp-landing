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

/* Diagonal line — fixed on viewport, from top-center to bottom-left */
(function() {
    var svg = document.getElementById('diagonalSvg');
    var line = document.getElementById('diagonalLine');
    if (!svg || !line) return;
    function resize() {
        var w = window.innerWidth;
        var h = window.innerHeight;
        svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
        line.setAttribute('x1', w * 0.50);
        line.setAttribute('y1', 0);
        line.setAttribute('x2', w * 0.35);
        line.setAttribute('y2', h);
    }
    resize();
    window.addEventListener('resize', resize);
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

/* Stack carousel — cards animate on scroll */
(function() {
    var carousel = document.getElementById('stackCarousel');
    var cardsContainer = document.getElementById('stackCards');
    var cards = document.querySelectorAll('.stack-card');
    var dots = document.querySelectorAll('.stack-carousel__dot');
    if (!carousel || !cards.length) return;

    var total = cards.length;

    function update() {
        var rect = carousel.getBoundingClientRect();
        var carouselTop = carousel.offsetTop;
        var carouselHeight = carousel.offsetHeight;
        var vh = window.innerHeight;
        var scrollY = window.scrollY;

        var scrollStart = carouselTop + vh * 0.8;
        var scrollEnd = carouselTop + carouselHeight - vh;
        var totalProgress = (scrollY - scrollStart) / (scrollEnd - scrollStart);
        totalProgress = Math.max(0, Math.min(1, totalProgress));

        // Use 90% of scroll for card switching, last 10% for exit
        var cardProgress = Math.min(totalProgress / 0.9, 1);
        var exitProgress = Math.max((totalProgress - 0.9) / 0.1, 0);

        // Which card is active (0 to total-1)
        var activeIndex = Math.min(Math.floor(cardProgress * total), total - 1);

        cards.forEach(function(card, i) {
            if (i < activeIndex) {
                card.setAttribute('data-state', 'done');
            } else if (i === activeIndex) {
                card.setAttribute('data-state', 'active');
            } else {
                var queuePos = i - activeIndex;
                card.setAttribute('data-state', 'queued-' + Math.min(queuePos, 3));
            }
        });

        // Show khanvian when last card is active
        var khanvian = document.getElementById('khanvian');
        var heading = document.querySelector('.companies__heading');
        var isLastCard = activeIndex === total - 1;

        // Khanvian opacity: fade in during last card, full during exit
        var khanvianOpacity = 0;
        if (isLastCard && exitProgress === 0) {
            var lastCardStart = (total - 1) / total;
            var lastCardProgress = (cardProgress - lastCardStart) / (1 / total);
            khanvianOpacity = Math.min(lastCardProgress * 1.5, 1);
        }
        if (exitProgress > 0) {
            khanvianOpacity = 1;
        }
        if (khanvian) {
            khanvian.style.opacity = khanvianOpacity;
        }

        // Exit: all cards and heading slide up when reaching end
        if (exitProgress > 0) {
            var yOffset = exitProgress * vh;
            cardsContainer.style.transform = 'translateY(-' + yOffset + 'px)';
            cardsContainer.style.opacity = 1 - exitProgress;
            if (heading) {
                heading.style.transform = 'translateY(-' + yOffset + 'px)';
                heading.style.opacity = 1 - exitProgress;
            }
        } else {
            cardsContainer.style.transform = '';
            cardsContainer.style.opacity = '';
            if (heading) {
                heading.style.transform = '';
                heading.style.opacity = '';
            }
        }

        dots.forEach(function(dot, i) {
            if (i === activeIndex) {
                dot.classList.add('stack-carousel__dot--active');
            } else {
                dot.classList.remove('stack-carousel__dot--active');
            }
        });
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
})();

/* Hide hero bg when contact section is visible */
(function() {
    var heroBg = document.getElementById('heroBg');
    var contact = document.getElementById('contacto');
    if (!heroBg || !contact) return;

    window.addEventListener('scroll', function() {
        var contactRect = contact.getBoundingClientRect();
        if (contactRect.top < window.innerHeight) {
            heroBg.style.visibility = 'hidden';
        } else {
            heroBg.style.visibility = 'visible';
        }
    }, { passive: true });
})();

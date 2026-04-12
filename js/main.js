/* =========================================
   GOA ESCAPE — MAIN JAVASCRIPT
   ========================================= */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // ===== LOADER =====
    const loader = document.getElementById('loader');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => loader.classList.add('hidden'), 600);
        });
        // Fallback
        setTimeout(() => loader?.classList.add('hidden'), 3500);
    }

    // ===== NAVBAR SCROLL EFFECT =====
    const navbar = document.getElementById('navbar');
    if (navbar) {
        const onScroll = () => {
            navbar.classList.toggle('scrolled', window.scrollY > 60);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // ===== MOBILE SIDEBAR =====
    const hamburger = document.getElementById('hamburger');
    const mobileSidebar = document.getElementById('mobileSidebar');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const sidebarClose = document.getElementById('sidebarClose');

    function openSidebar() {
        if (!mobileSidebar) return;
        mobileSidebar.classList.add('open');
        if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (hamburger) hamburger.setAttribute('aria-expanded', 'true');
        hamburger?.classList.add('open');
    }

    function closeSidebar() {
        if (!mobileSidebar) return;
        mobileSidebar.classList.remove('open');
        if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
        document.body.style.overflow = '';
        if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
        hamburger?.classList.remove('open');
    }

    hamburger?.addEventListener('click', () => {
        if (mobileSidebar?.classList.contains('open')) closeSidebar();
        else openSidebar();
    });

    sidebarClose?.addEventListener('click', closeSidebar);
    sidebarBackdrop?.addEventListener('click', closeSidebar);

    // Close sidebar on any link click inside sidebar
    mobileSidebar?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeSidebar);
    });

    // Sidebar accordion for Experiences
    const sidebarSubToggle = document.getElementById('sidebarExpToggle');
    const sidebarSubContent = document.getElementById('sidebarExpContent');
    if (sidebarSubToggle && sidebarSubContent) {
        sidebarSubToggle.addEventListener('click', () => {
            const isOpen = sidebarSubToggle.classList.toggle('open');
            sidebarSubContent.classList.toggle('open', isOpen);
        });
    }

    // Close sidebar on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSidebar();
    });

    // ===== BACK TO TOP =====
    const backBtn = document.getElementById('backToTop');
    if (backBtn) {
        window.addEventListener('scroll', () => {
            backBtn.classList.toggle('show', window.scrollY > 400);
        }, { passive: true });
        backBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ===== HERO SEARCH FORM =====
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const activity = document.getElementById('search-activity')?.value.trim();
            const date = document.getElementById('search-date')?.value;
            const persons = document.getElementById('search-persons')?.value;

            if (!activity) {
                showToast('Please enter what you\'re looking for!', 'warning');
                document.getElementById('search-activity')?.focus();
                return;
            }

            // Show searching feedback
            const btn = searchForm.querySelector('.btn-search');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
                // Redirect to packages with query
                const params = new URLSearchParams({ q: activity });
                if (date) params.set('date', date);
                if (persons) params.set('persons', persons);
                window.location.href = `packages.html?${params}`;
            }, 1200);
        });
    }

    // ===== COUNTER ANIMATION =====
    const statItems = document.querySelectorAll('[data-count]');
    if (statItems.length) {
        const animateCount = (el) => {
            const target = parseFloat(el.dataset.count);
            const isDecimal = target % 1 !== 0;
            const duration = 2000;
            const start = performance.now();
            const step = (now) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const value = target * eased;
                el.textContent = isDecimal ? value.toFixed(1) : Math.floor(value).toLocaleString();
                if (progress < 1) requestAnimationFrame(step);
                else el.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString();
            };
            requestAnimationFrame(step);
        };

        const statObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const numEl = entry.target.querySelector('.stat-number');
                    if (numEl) animateCount(numEl);
                    statObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statItems.forEach(el => statObserver.observe(el));
    }

    // ===== SCROLL REVEAL =====
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (revealEls.length) {
        const revealObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(el => revealObs.observe(el));
    }

    // ===== PACKAGE FILTER TABS =====
    const pkgTabs = document.querySelectorAll('.pkg-tab');
    const pkgCards = document.querySelectorAll('.pkg-card');
    if (pkgTabs.length && pkgCards.length) {
        // Read query param on page load
        const urlQ = new URLSearchParams(window.location.search).get('filter');
        if (urlQ) {
            pkgTabs.forEach(t => t.classList.remove('active'));
            const matchTab = document.querySelector(`[data-filter="${urlQ}"]`);
            if (matchTab) matchTab.classList.add('active');
            filterPackages(urlQ);
        }

        pkgTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                pkgTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                filterPackages(tab.dataset.filter);
            });
        });

        function filterPackages(filter) {
            pkgCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        }
    }

    // ===== TESTIMONIALS SLIDER =====
    const track = document.getElementById('testimonialsTrack');
    const dotsCont = document.getElementById('testiDots');
    const prevBtn = document.getElementById('testiBtnPrev');
    const nextBtn = document.getElementById('testiBtnNext');

    if (track) {
        const cards = track.querySelectorAll('.testi-card');
        let current = 0;
        let visibleCount = getVisibleCount();
        let autoSlideTimer;

        function getVisibleCount() {
            return window.innerWidth < 768 ? 1 : window.innerWidth < 1000 ? 2 : 3;
        }

        const totalSlides = Math.ceil(cards.length / visibleCount);

        // Build dots
        if (dotsCont) {
            dotsCont.innerHTML = '';
            for (let i = 0; i < Math.max(1, cards.length - visibleCount + 1); i++) {
                const dot = document.createElement('button');
                dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
                dot.addEventListener('click', () => goTo(i));
                dotsCont.appendChild(dot);
            }
        }

        function goTo(idx) {
            const maxIdx = Math.max(0, cards.length - visibleCount);
            current = Math.max(0, Math.min(idx, maxIdx));
            const cardWidth = cards[0]?.offsetWidth + 24 || 0; // 24 = gap
            track.style.transform = `translateX(-${current * cardWidth}px)`;
            document.querySelectorAll('.testi-dot').forEach((d, i) => d.classList.toggle('active', i === current));
        }

        function next() { goTo(current + 1); }
        function prev() { goTo(current - 1); }

        nextBtn?.addEventListener('click', next);
        prevBtn?.addEventListener('click', prev);

        // Auto slide
        const startAuto = () => { autoSlideTimer = setInterval(next, 4500); };
        const stopAuto = () => clearInterval(autoSlideTimer);

        track.addEventListener('mouseenter', stopAuto);
        track.addEventListener('mouseleave', startAuto);
        startAuto();

        // Touch support
        let touchStartX = 0;
        track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; stopAuto(); }, { passive: true });
        track.addEventListener('touchend', e => {
            const dx = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(dx) > 40) dx > 0 ? next() : prev();
            startAuto();
        }, { passive: true });

        window.addEventListener('resize', () => {
            visibleCount = getVisibleCount();
            goTo(0);
        });
    }

    // ===== FAQ ACCORDION =====
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const btn = item.querySelector('.faq-question');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            // Close all
            faqItems.forEach(f => f.classList.remove('open'));
            // Toggle
            if (!isOpen) item.classList.add('open');
        });
    });

    // ===== WATER SPORTS FILTER =====
    const wsFilterBtns = document.querySelectorAll('.ws-filter-btn');
    const wsCards = document.querySelectorAll('.ws-card[data-type]');
    wsFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            wsFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.type;
            wsCards.forEach(card => {
                if (filter === 'all' || card.dataset.type === filter) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // ===== BOOKING FORM =====
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = bookingForm.querySelector('.form-submit');
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1800));

            const successEl = document.getElementById('formSuccess');
            if (successEl) {
                bookingForm.querySelector('#formFields').style.display = 'none';
                successEl.classList.add('show');
            } else {
                showToast('Booking request sent! We\'ll contact you within 24 hours.', 'success');
                bookingForm.reset();
            }
            btn.innerHTML = original;
            btn.disabled = false;
        });
    }

    // ===== TOAST NOTIFICATION =====
    function showToast(msg, type = 'info') {
        const existing = document.querySelector('.toast-notification');
        existing?.remove();

        const colors = { success: '#2d8653', warning: '#f4a435', error: '#e74c3c', info: '#0077b6' };
        const icons = { success: 'fa-check-circle', warning: 'fa-exclamation-triangle', error: 'fa-times-circle', info: 'fa-info-circle' };

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.style.cssText = `
      position: fixed; bottom: 6.5rem; left: 50%; transform: translateX(-50%) translateY(20px);
      background: ${colors[type]}; color: white; padding: 0.85rem 1.5rem;
      border-radius: 40px; font-size: 0.92rem; font-weight: 500;
      display: flex; align-items: center; gap: 0.6rem;
      box-shadow: 0 8px 30px rgba(0,0,0,0.25); z-index: 2000;
      opacity: 0; transition: all 0.35s ease; white-space: nowrap; max-width: 90vw;
    `;
        toast.innerHTML = `<i class="fas ${icons[type]}"></i> ${msg}`;
        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(() => toast.remove(), 400);
        }, 3800);
    }

    // ===== ACTIVE NAV LINK =====
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href')?.split('?')[0].split('#')[0];
        link.classList.toggle('active', href === currentPage);
    });

    // ===== SMOOTH SCROLL for anchor links =====
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ===== AUTO ADD reveal CLASSES to section items =====
    document.querySelectorAll('.service-card, .pkg-card, .stay-card, .ws-card, .cruise-card, .hotel-card, .testi-card').forEach((el, i) => {
        el.classList.add('reveal');
        el.style.transitionDelay = `${(i % 4) * 0.1}s`;
    });
    document.querySelectorAll('.section-header, .why-content, .why-image-block, .stat-item, .cta-content, .contact-info, .booking-form').forEach(el => {
        el.classList.add('reveal');
    });

    // Re-run observer after adding classes
    const allReveal = document.querySelectorAll('.reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible)');
    if (allReveal.length) {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
        allReveal.forEach(el => obs.observe(el));
    }

    // ===== Search from URL query (packages page) =====
    if (window.location.pathname.includes('packages')) {
        const urlParams = new URLSearchParams(window.location.search);
        const q = urlParams.get('q');
        if (q) {
            const searchEl = document.getElementById('pkgSearchInput');
            if (searchEl) { searchEl.value = q; filterBySearch(q); }
        }
    }

    function filterBySearch(query) {
        const q = query.toLowerCase();
        document.querySelectorAll('.pkg-card').forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(q) ? '' : 'none';
        });
    }

    const pkgSearchInput = document.getElementById('pkgSearchInput');
    pkgSearchInput?.addEventListener('input', (e) => filterBySearch(e.target.value));

    console.log('%c🌊 Goa Escape — Developed with ❤️', 'font-size:14px; color: #0077b6; font-weight:bold;');
});

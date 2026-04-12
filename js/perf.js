/* =========================================================
   GOA ESCAPE — PERFORMANCE JAVASCRIPT
   - Native lazy loading polyfill
   - Optimized image loading
   - Critical resource hints
   - Testimonial touch-scroll on mobile
   ========================================================= */
'use strict';

(function () {

    // ─── 1. CRITICAL: fix date input min to today ───────────────
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(el => {
        if (!el.min || el.min === '2025-01-01') el.min = today;
    });

    // ─── 2. NATIVE LAZY LOADING fallback ───────────────────────
    if ('loading' in HTMLImageElement.prototype) {
        // Native lazy loading supported — browser handles it
    } else {
        // Polyfill for older browsers
        const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver(entries => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        const img = e.target;
                        if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
                        io.unobserve(img);
                    }
                });
            }, { rootMargin: '200px 0px' });
            lazyImgs.forEach(img => io.observe(img));
        } else {
            // Fallback: load all
            lazyImgs.forEach(img => { if (img.dataset.src) img.src = img.dataset.src; });
        }
    }

    // ─── 3. IMAGE ERROR HANDLING ───────────────────────────────
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', () => {
            img.style.display = 'none';
        }, { once: true });
    });

    // ─── 4. TESTIMONIALS: Touch/Pointer drag scroll on mobile ──
    const track = document.getElementById('testimonialsTrack');
    if (track) {
        let startX = 0, scrollLeft = 0, isDragging = false;

        const onPointerDown = e => {
            isDragging = true;
            startX = e.pageX - track.offsetLeft;
            scrollLeft = track.scrollLeft || 0;
            track.style.cursor = 'grabbing';
        };
        const onPointerMove = e => {
            if (!isDragging) return;
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 1.5;
            track.scrollLeft = scrollLeft - walk;
        };
        const onPointerUp = () => {
            isDragging = false;
            track.style.cursor = 'grab';
        };

        track.addEventListener('pointerdown', onPointerDown);
        track.addEventListener('pointermove', onPointerMove);
        track.addEventListener('pointerup', onPointerUp);
        track.addEventListener('pointerleave', onPointerUp);

        // On mobile use scroll-snap + native scroll (no JS transform)
        if (window.innerWidth <= 768) {
            track.style.transform = 'none';
        }
    }

    // ─── 5. PACKAGE FILTER: observer for hidden/show animation ─
    const pkgGrid = document.getElementById('packagesGrid');
    if (pkgGrid) {
        const observer = new MutationObserver(() => {
            const visible = pkgGrid.querySelectorAll('.pkg-card:not(.hidden)');
            const noResult = document.getElementById('noResults');
            if (noResult) noResult.style.display = visible.length === 0 ? 'block' : 'none';
        });
        observer.observe(pkgGrid, { subtree: true, attributes: true, attributeFilter: ['class'] });
    }

    // ─── 6. SEARCH INPUT: keyboard shortcut ────────────────────
    document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-input, #pkgSearchInput');
            searchInput?.focus();
        }
    });

    // ─── 7. FORM: real-time phone formatting ───────────────────
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', () => {
            phoneInput.value = phoneInput.value.replace(/[^0-9+\s-]/g, '').slice(0, 15);
        });
    }

    // ─── 8. STAY FILTER: actual filter logic ───────────────────
    const filterType = document.getElementById('filterType');
    const filterLocation = document.getElementById('filterLocation');
    const filterBudget = document.getElementById('filterBudget');
    const hotelsGrid = document.getElementById('hotelsGrid');

    if (hotelsGrid && (filterType || filterLocation || filterBudget)) {
        const applyFilters = () => {
            const type = filterType?.value || '';
            const location = filterLocation?.value || '';
            const budget = filterBudget?.value || '';

            hotelsGrid.querySelectorAll('.hotel-card').forEach(card => {
                const matchType = !type || card.dataset.type === type;
                const matchLocation = !location || card.dataset.loc === location;
                const matchBudget = !budget || card.dataset.budget === budget;
                card.style.display = (matchType && matchLocation && matchBudget) ? '' : 'none';
            });
        };

        filterType?.addEventListener('change', applyFilters);
        filterLocation?.addEventListener('change', applyFilters);
        filterBudget?.addEventListener('change', applyFilters);
    }

    // ─── 9. MOBILE NAV: close on outside click ─────────────────
    document.addEventListener('click', e => {
        const nav = document.getElementById('navLinks');
        const ham = document.getElementById('hamburger');
        if (nav?.classList.contains('open') && !nav.contains(e.target) && !ham?.contains(e.target)) {
            nav.classList.remove('open');
            ham?.classList.remove('open');
            ham?.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });

    // ─── 10. DEBOUNCED RESIZE: recalculate testimonials ────────
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Reload current slide position on resize
            const track = document.getElementById('testimonialsTrack');
            if (track && window.innerWidth <= 768) {
                track.style.transform = 'none';
            }
        }, 150);
    }, { passive: true });

    // ─── 11. VIEWPORT HEIGHT FIX (iOS Safari 100vh bug) ────────
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVH();
    window.addEventListener('resize', setVH, { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(setVH, 200), { passive: true });

    // ─── 12. SMOOTH ANCHOR with offset ─────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const id = link.getAttribute('href').slice(1);
            const target = id ? document.getElementById(id) : null;
            if (target) {
                e.preventDefault();
                const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '80');
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ─── 13. PREFETCH next page on link hover ──────────────────
    if ('requestIdleCallback' in window) {
        const links = ['packages.html', 'water-sports.html', 'cruises.html', 'stay.html', 'contact.html'];
        const prefetched = new Set();

        requestIdleCallback(() => {
            document.querySelectorAll('a[href]').forEach(link => {
                const href = link.getAttribute('href');
                if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;
                link.addEventListener('mouseenter', () => {
                    if (prefetched.has(href)) return;
                    prefetched.add(href);
                    const prefetch = document.createElement('link');
                    prefetch.rel = 'prefetch';
                    prefetch.href = href;
                    document.head.appendChild(prefetch);
                }, { once: true, passive: true });
            });
        }, { timeout: 2000 });
    }

})();

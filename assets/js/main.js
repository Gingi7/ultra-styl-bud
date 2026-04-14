(function () {
  'use strict';

  /* -------------------------------------------------------
     LENIS — smooth scroll
  ------------------------------------------------------- */
  const lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    smooth: true,
  });
  gsap.registerPlugin(ScrollTrigger);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* -------------------------------------------------------
     HELPERS
  ------------------------------------------------------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* -------------------------------------------------------
     TEXT SPLITTER UTILITY
  ------------------------------------------------------- */
  function splitTextToWords(el) {
    const words = el.innerText.trim().split(/\s+/);
    el.innerHTML = '';
    words.forEach(word => {
      const wrap = document.createElement('span');
      wrap.className = 'word-wrap';
      wrap.innerHTML = '<span class="word-inner">' + word + '\u00a0</span>';
      el.appendChild(wrap);
    });
  }

  /* -------------------------------------------------------
     NAV: scrolled state + dropdown
  ------------------------------------------------------- */
  const siteNav = $('.site-nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (siteNav) siteNav.classList.toggle('nav-scrolled', y > 60);
    lastScroll = y;
  }, { passive: true });

/* -------------------------------------------------------
     ACTIVE NAV LINK
  ------------------------------------------------------- */
  const currentFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  $$('.nav-links a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href === currentFile) a.setAttribute('aria-current', 'page');
  });

  /* -------------------------------------------------------
     MOBILE NAV TOGGLE
  ------------------------------------------------------- */
  const navToggle = $('.nav-toggle');
  const navLinks = $('.nav-links');

  if (navToggle && navLinks) {
    const mobileNavQuery = window.matchMedia('(max-width: 860px)');
    const navBrand = $('.nav-brand');
    let navScrollY = 0;
    let isMenuOpen = false;

    const mobileMenuOverlay = document.createElement('div');
    mobileMenuOverlay.className = 'mobile-menu-overlay';
    mobileMenuOverlay.setAttribute('aria-hidden', 'true');

    const mobileMenuShell = document.createElement('div');
    mobileMenuShell.className = 'mobile-menu-shell';

    const mobileMenuTopbar = document.createElement('div');
    mobileMenuTopbar.className = 'mobile-menu-topbar';

    const mobileMenuBack = document.createElement('button');
    mobileMenuBack.className = 'mobile-menu-back';
    mobileMenuBack.type = 'button';
    mobileMenuBack.setAttribute('aria-label', 'Zamknij menu');
    mobileMenuBack.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 18L9 12L15 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    const mobileMenuBrand = navBrand ? navBrand.cloneNode(true) : document.createElement('a');
    mobileMenuBrand.classList.add('mobile-menu-brand');

    const mobileMenuClose = document.createElement('button');
    mobileMenuClose.className = 'mobile-menu-close';
    mobileMenuClose.type = 'button';
    mobileMenuClose.setAttribute('aria-label', 'Zamknij menu');
    mobileMenuClose.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6L18 18M18 6L6 18" stroke-width="2" stroke-linecap="round"/></svg>';

    const mobileMenuPanel = document.createElement('div');
    mobileMenuPanel.className = 'mobile-menu-panel';

    mobileMenuTopbar.append(mobileMenuBack, mobileMenuBrand, mobileMenuClose);
    mobileMenuShell.append(mobileMenuTopbar, mobileMenuPanel);
    mobileMenuOverlay.appendChild(mobileMenuShell);
    document.body.appendChild(mobileMenuOverlay);

    function moveNavToOverlay() {
      if (mobileNavQuery.matches && navLinks.parentElement !== mobileMenuPanel) {
        mobileMenuPanel.appendChild(navLinks);
      } else if (!mobileNavQuery.matches && siteNav && navLinks.parentElement !== siteNav) {
        siteNav.insertBefore(navLinks, navToggle);
      }
    }

    function lockScroll() {
      navScrollY = window.scrollY;
      document.body.classList.add('menu-open');
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + navScrollY + 'px';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      lenis.stop();
    }

    function unlockScroll() {
      document.body.classList.remove('menu-open');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      lenis.start();
      window.scrollTo(0, navScrollY);
    }

    function openMenu() {
      if (isMenuOpen || !mobileNavQuery.matches) return;
      moveNavToOverlay();
      isMenuOpen = true;
      navLinks.classList.add('open');
      mobileMenuOverlay.classList.add('open');
      mobileMenuOverlay.setAttribute('aria-hidden', 'false');
      navToggle.classList.add('is-open');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Zamknij menu');
      if (siteNav) siteNav.classList.add('nav-open');
      lockScroll();
    }

    function closeMenu() {
      if (!isMenuOpen) return;
      isMenuOpen = false;
      navLinks.classList.remove('open');
      mobileMenuOverlay.classList.remove('open');
      mobileMenuOverlay.setAttribute('aria-hidden', 'true');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Otwórz menu');
      if (siteNav) siteNav.classList.remove('nav-open');
      unlockScroll();
    }

    moveNavToOverlay();

    navToggle.addEventListener('click', () => {
      if (isMenuOpen) closeMenu();
      else openMenu();
    });

    mobileMenuClose.addEventListener('click', closeMenu);
    mobileMenuBack.addEventListener('click', closeMenu);
    mobileMenuBrand.addEventListener('click', closeMenu);

    mobileMenuOverlay.addEventListener('click', e => {
      if (e.target === mobileMenuOverlay) closeMenu();
    });

    $$('.nav-links a').forEach(a => {
      a.addEventListener('click', closeMenu);
    });

    mobileNavQuery.addEventListener('change', e => {
      if (!e.matches) closeMenu();
      moveNavToOverlay();
    });

    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* -------------------------------------------------------
     FLOATING TOOLS: phone button + scroll-to-top
  ------------------------------------------------------- */
  const scrollTopBtn = document.getElementById('scroll-to-top');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
    }, { passive: true });
    scrollTopBtn.addEventListener('click', () => {
      lenis.scrollTo(0, { duration: 1.2 });
    });
  }

  /* -------------------------------------------------------
     HERO SLIDESHOW (6 slides + dots)
  ------------------------------------------------------- */
  const heroSlides = $$('.hero-slide');
  const heroDots = $$('.hero-dot');
  if (heroSlides.length > 1) {
    let cur = 0;
    let interval;

    function goTo(idx) {
      heroSlides[cur].classList.remove('active');
      if (heroDots[cur]) { heroDots[cur].classList.remove('active'); heroDots[cur].setAttribute('aria-selected', 'false'); }
      cur = (idx + heroSlides.length) % heroSlides.length;
      heroSlides[cur].classList.add('active');
      if (heroDots[cur]) { heroDots[cur].classList.add('active'); heroDots[cur].setAttribute('aria-selected', 'true'); }
    }

    function startAuto() {
      interval = setInterval(() => goTo(cur + 1), 8000);
    }

    heroDots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        clearInterval(interval);
        goTo(i);
        startAuto();
      });
    });

    startAuto();
  }

  /* -------------------------------------------------------
     GALLERY FILTER (realizacje.html + galeria.html)
  ------------------------------------------------------- */
  const gallery = $('#js-gallery');
  const filtersWrap = $('#js-filters');
  if (gallery && filtersWrap) {
    const items = $$('.gallery-item', gallery);

    function applyFilter(cat) {
      items.forEach(el => {
        const c = el.getAttribute('data-cat') || '';
        el.style.display = (cat === 'all' || c === cat) ? '' : 'none';
      });
    }

    $$('.filter-btn', filtersWrap).forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.filter-btn', filtersWrap).forEach(b => {
          b.setAttribute('aria-pressed', 'false');
          b.classList.remove('active');
        });
        btn.setAttribute('aria-pressed', 'true');
        btn.classList.add('active');
        applyFilter(btn.getAttribute('data-filter') || 'all');
      });
    });
    applyFilter('all');
  }

  /* -------------------------------------------------------
     LIGHTBOX (universal — works on all pages with .gallery-item)
  ------------------------------------------------------- */
  (function () {
    const imgs = $$('.gallery-item img, .gallery-img');
    if (!imgs.length) return;

    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Powiększone zdjęcie');
    lb.innerHTML =
      '<div class="lightbox-content">' +
        '<button class="lightbox-close" aria-label="Zamknij">Zamknij ✕</button>' +
        '<img class="lightbox-img" src="" alt="" />' +
        '<div class="lightbox-counter"></div>' +
      '</div>' +
      '<button class="lightbox-prev" aria-label="Poprzednie">&#8249;</button>' +
      '<button class="lightbox-next" aria-label="Następne">&#8250;</button>';
    document.body.appendChild(lb);

    const lbImg     = lb.querySelector('.lightbox-img');
    const lbCounter = lb.querySelector('.lightbox-counter');
    const lbClose   = lb.querySelector('.lightbox-close');
    const lbPrev    = lb.querySelector('.lightbox-prev');
    const lbNext    = lb.querySelector('.lightbox-next');
    let cur = 0;

    function open(idx) {
      cur = (idx + imgs.length) % imgs.length;
      lbImg.src = imgs[cur].src;
      lbImg.alt = imgs[cur].alt || '';
      lbCounter.textContent = (cur + 1) + ' / ' + imgs.length;
      lb.classList.add('active');
      lenis.stop();
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    }

    function close() {
      lb.classList.remove('active');
      lenis.start();
      document.body.style.overflow = '';
    }

    imgs.forEach((img, i) => {
      const parent = img.closest('.gallery-item') || img;
      parent.addEventListener('click', () => open(i));
    });

    lbClose.addEventListener('click', close);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    lbPrev.addEventListener('click', () => open(cur - 1));
    lbNext.addEventListener('click', () => open(cur + 1));

    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('active')) return;
      if (e.key === 'Escape')    close();
      if (e.key === 'ArrowLeft') open(cur - 1);
      if (e.key === 'ArrowRight') open(cur + 1);
    });

    // Touch swipe
    let touchX = 0;
    lb.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) dx < 0 ? open(cur + 1) : open(cur - 1);
    }, { passive: true });
  }());

  /* -------------------------------------------------------
     GDPR MAP CONSENT
  ------------------------------------------------------- */
  const mapBtn = document.getElementById('map-consent-btn');
  if (mapBtn) {
    mapBtn.addEventListener('click', () => {
      const wrapper = document.getElementById('map-consent');
      if (!wrapper) return;
      const iframe = document.createElement('iframe');
      iframe.src = 'https://maps.google.com/maps?q=Rzesz%C3%B3w,+Podkarpacie,+Polska&output=embed&hl=pl&z=8';
      iframe.width = '100%';
      iframe.height = '380';
      iframe.style.cssText = 'border:0;display:block;';
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('loading', 'lazy');
      iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      iframe.title = 'Obszar działania STYL-BUD – Województwo Podkarpackie';
      wrapper.replaceWith(iframe);
    });
  }

  /* -------------------------------------------------------
     STATS COUNTER (count-up on scroll)
  ------------------------------------------------------- */
  const statNumbers = $$('.stat-number[data-target]');
  if (statNumbers.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        obs.unobserve(el);
        if (target === 0) { el.textContent = '0' + suffix; return; }
        let start = 0;
        const duration = 1400;
        const step = duration / target;
        const timer = setInterval(() => {
          start++;
          el.textContent = start + suffix;
          if (start >= target) clearInterval(timer);
        }, step);
      });
    }, { threshold: 0.5 });
    statNumbers.forEach(n => obs.observe(n));
  }

  /* -------------------------------------------------------
     FOOTER YEAR
  ------------------------------------------------------- */
  const yearEl = document.getElementById('y');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------------------------------------------------------
     SITE ANIMATIONS (GSAP)
  ------------------------------------------------------- */
  function initSite() {

    /* Split-animate scroll reveals */
    $$('.split-animate').forEach(el => {
      splitTextToWords(el);
      const words = el.querySelectorAll('.word-inner');
      gsap.set(words, { y: '110%' });
      gsap.to(words, {
        y: '0%',
        duration: 1,
        ease: 'power3.out',
        stagger: 0.025,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    /* FAQ Accordion */
    const faqItems = $$('.faq-item');
    if (faqItems.length) {
      faqItems.forEach(item => {
        item.addEventListener('click', e => {
          if (e.target.tagName.toLowerCase() === 'summary') {
            e.preventDefault();
            const isOpen = item.hasAttribute('open');
            faqItems.forEach(faq => { if (faq !== item) faq.removeAttribute('open'); });
            if (isOpen) item.removeAttribute('open');
            else item.setAttribute('open', '');
          }
        });
      });
    }

    /* Hero */
    const heroSpans = $$('.hero-headline span');
    if (heroSpans.length) {
      gsap.to(heroSpans, { y: 0, stagger: 0.12, duration: 1.6, ease: 'power4.out' });
      gsap.to('.hero-kicker', { opacity: 1, y: 0, duration: 1, delay: 0.25, ease: 'power3.out' });
      gsap.to('.hero-fade', { opacity: 1, duration: 1, delay: 0.5 });
      gsap.to('.hero-actions', { opacity: 1, duration: 1, delay: 0.7 });

      if ($$('.hero-slider').length) {
        gsap.to('.hero-slider', {
          yPercent: 28,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    }

    /* Page hero (subpages) */
    const pageHeroEms = $$('.page-hero-title span em');
    if (pageHeroEms.length) {
      gsap.to(pageHeroEms, { y: 0, stagger: 0.1, duration: 1.3, delay: 0.2, ease: 'power4.out' });
    }

    /* Stack cards scale on scroll */
    const cards = gsap.utils.toArray('.card-item');
    cards.forEach((card, i) => {
      const nextCard = cards[i + 1];
      if (nextCard) {
        gsap.to(card.querySelector('.card-inner'), {
          scale: 0.9,
          opacity: 0.38,
          ease: 'none',
          scrollTrigger: {
            trigger: nextCard,
            start: 'top bottom',
            end: 'top 10vh',
            scrub: true,
          },
        });
      }
    });

    /* Footer parallax reveal */
    const footerInner = $('.footer-inner');
    if (footerInner) {
      gsap.from(footerInner, {
        y: 80,
        opacity: 0.5,
        scale: 0.95,
        scrollTrigger: {
          trigger: '.footer-sticky',
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: true,
        },
      });
    }
  }

  /* -------------------------------------------------------
     PAGE LOADER DISMISSAL (subpages, threshold 300ms)
  ------------------------------------------------------- */
  function dismissPageLoader() {
    if (!document.documentElement.classList.contains('is-loading')) return;
    const bar = document.querySelector('.page-loader-bar');
    if (bar) {
      bar.style.transition = 'width 0.25s ease';
      bar.style.width = '100%';
    }
    setTimeout(() => {
      document.documentElement.classList.remove('is-loading');
    }, 260);
  }

  if (document.readyState === 'complete') {
    dismissPageLoader();
  } else {
    window.addEventListener('load', dismissPageLoader, { once: true });
    setTimeout(dismissPageLoader, 4000);
  }

  /* -------------------------------------------------------
     PRELOADER (index.html) vs direct init (subpages)
  ------------------------------------------------------- */
  const loader = $('.loader');
  if (loader) {
    const firstSlide = $('.hero-slide');

    function runLoaderExit() {
      gsap.killTweensOf('.loader-bar');
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.opacity = '1';
          initSite();
        },
      });
      tl
        .to('.loader-bar', { width: '100%', duration: 0.2, ease: 'power2.out' })
        .to('.loader-text', { y: -40, opacity: 0, duration: 0.2 })
        .to('.loader', { yPercent: -100, duration: 0.55, ease: 'power4.inOut' });
    }

    gsap.to('.loader-bar', { width: '88%', duration: 1.5, ease: 'power1.inOut' });

    // Hero slides are divs with background-image — no img.complete to check
    gsap.delayedCall(0.3, runLoaderExit);
  } else {
    initSite();
  }

})();

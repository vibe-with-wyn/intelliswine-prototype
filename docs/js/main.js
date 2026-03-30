/* ============================================
  IntelliSwine — Shared JavaScript
   Navigation, scroll effects, animations
   ============================================ */

(() => {
  const authStore = window.AppAuthStorage;

  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initScrollAnimations();
    initLandingNavHighlight();
    initAuthUi();
  });

/* ---------- Navbar Scroll Effect ---------- */
  function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
  }

/* ---------- Mobile Menu ---------- */
  function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const navActions = document.getElementById('navActions');
  const overlay = document.getElementById('mobileOverlay');

  if (!hamburger) return;

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('active');
    navLinks?.classList.toggle('open', isOpen);
    navActions?.classList.toggle('open', isOpen);
    overlay?.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  overlay?.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks?.classList.remove('open');
    navActions?.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  });

  // Close on link click
  navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
      navActions?.classList.remove('open');
      overlay?.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
  }

/* ---------- Scroll Animations ---------- */
  function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    }
  );

  elements.forEach(el => observer.observe(el));
  }

  function initLandingNavHighlight() {
  const navLinks = document.getElementById('navLinks');
  if (!navLinks) {
    return;
  }

  const sectionLinks = Array.from(navLinks.querySelectorAll('a[href^="#"]'))
    .map(link => {
      const targetId = link.getAttribute('href')?.slice(1);
      const section = targetId ? document.getElementById(targetId) : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if (!sectionLinks.length) {
    return;
  }

  const homeLink = navLinks.querySelector('a[href="index.html"]');

  const setActive = (activeLink) => {
    navLinks.querySelectorAll('a').forEach(link => link.classList.remove('active'));
    activeLink?.classList.add('active');
  };

  const getOffset = () => {
    const navbar = document.getElementById('navbar');
    const height = navbar ? navbar.offsetHeight : 0;
    return height + 24;
  };

  const updateActive = () => {
    const scrollPos = window.scrollY + getOffset();
    const current = sectionLinks.find(({ section }) => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      return scrollPos >= top && scrollPos < bottom;
    });

    if (current) {
      setActive(current.link);
    } else if (homeLink) {
      setActive(homeLink);
    }
  };

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
  }

  function initAuthUi() {
  // Prototype mode: do not gate or redirect pages based on auth state.
  }


/* ---------- Smooth Scroll for anchor links ---------- */
  document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;

  const targetId = link.getAttribute('href');
  if (targetId === '#') return;

  const target = document.querySelector(targetId);
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  });
})();

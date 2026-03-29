/* ============================================
   Landing Page JavaScript
   Counter animations & hero effects
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initCounterAnimations();
  initDashboardAnimation();
});

/* ---------- Animate stat counters ---------- */
function initCounterAnimations() {
  const statValues = document.querySelectorAll('.hero-stat-value');
  if (!statValues.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateValue(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statValues.forEach(el => observer.observe(el));
}

function animateValue(el) {
  const text = el.textContent.trim();
  const numMatch = text.match(/([\d.]+)/);
  if (!numMatch) return;

  const target = parseFloat(numMatch[1]);
  const prefix = text.substring(0, text.indexOf(numMatch[1]));
  const suffix = text.substring(text.indexOf(numMatch[1]) + numMatch[1].length);
  const decimals = numMatch[1].includes('.') ? numMatch[1].split('.')[1].length : 0;
  const duration = 1500;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = (target * eased).toFixed(decimals);
    el.textContent = prefix + current + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = text; // restore original
    }
  }

  requestAnimationFrame(update);
}

/* ---------- Dashboard bar animation ---------- */
function initDashboardAnimation() {
  const bars = document.querySelectorAll('.dash-bar');
  if (!bars.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          bars.forEach((bar, i) => {
            const height = bar.style.height;
            bar.style.height = '0%';
            setTimeout(() => {
              bar.style.height = height;
            }, i * 80);
          });
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  const chartContainer = document.querySelector('.dash-chart-bars');
  if (chartContainer) {
    observer.observe(chartContainer);
  }
}

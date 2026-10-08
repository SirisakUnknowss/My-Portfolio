const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
document.querySelector('#year').textContent = new Date().getFullYear();
// Enhance the page only when motion is welcome; content stays visible without JS.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealTargets = document.querySelectorAll(
  '.hero-top, .hero h1, .hero-bottom, .hero-foot, .section-heading, .project, .about-left, .about-right > p, .experience > div, .services article, .contact-grid > div, #contact-form'
);
let revealObserver;
let motionFrame = 0;
const progress = document.querySelector('.scroll-progress');
const projectVisuals = [...document.querySelectorAll('.project-visual')];

function updateScrollMotion() {
  motionFrame = 0;
  const travel = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${travel > 0 ? Math.min(1, Math.max(0, window.scrollY / travel)) : 0})`;
  projectVisuals.forEach(visual => {
    const bounds = visual.getBoundingClientRect();
    if (bounds.bottom > 0 && bounds.top < window.innerHeight) {
      const offset = Math.max(-18, Math.min(18, (window.innerHeight / 2 - bounds.top - bounds.height / 2) * 0.045));
      visual.style.setProperty('--image-drift', `${offset}px`);
    }
  });
}

function queueScrollMotion() {
  if (!motionPreference.matches && !motionFrame) {
    motionFrame = requestAnimationFrame(updateScrollMotion);
  }
}

function configureMotion() {
  revealObserver?.disconnect();
  cancelAnimationFrame(motionFrame);
  motionFrame = 0;
  revealTargets.forEach(target => target.classList.remove('reveal-pending'));
  document.body.classList.toggle('motion-enabled', !motionPreference.matches);
  if (motionPreference.matches || !('IntersectionObserver' in window)) return;

  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-pending');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -35px 0px' });

  revealTargets.forEach(target => {
    target.classList.add('scroll-reveal');
    // Avoid hiding content already visible, including a directly linked section.
    if (target.getBoundingClientRect().top >= window.innerHeight) {
      target.classList.add('reveal-pending');
      revealObserver.observe(target);
    }
  });
  document.querySelectorAll('.projects, .services, .experience').forEach(group => {
    [...group.children].forEach((child, index) => {
      child.style.setProperty('--reveal-delay', `${index * 90}ms`);
    });
  });
  queueScrollMotion();
}
configureMotion();
motionPreference.addEventListener('change', configureMotion);
window.addEventListener('scroll', queueScrollMotion, { passive: true });
window.addEventListener('resize', queueScrollMotion, { passive: true });
window.addEventListener('load', queueScrollMotion, { once: true });
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) navigation.querySelectorAll('a').forEach(link => {
        const active = link.hash === `#${entry.target.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-10% 0px -65% 0px' });
  document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
}
document.querySelector('#contact-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  const status = document.querySelector('#form-status');
  if (button.disabled) return;
  const data = Object.fromEntries(new FormData(form));
  button.disabled = true;
  button.textContent = 'Sending…';
  status.textContent = '';
  delete status.dataset.state;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch('https://formsubmit.co/ajax/sirisak.unknowss@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...data, _subject: `Portfolio enquiry from ${data.name}`, _template: 'table', _captcha: 'false' }),
      signal: controller.signal
    });
    const result = await response.json();
    if (!response.ok || (result.success !== true && result.success !== 'true')) throw new Error('Message not accepted');
    status.dataset.state = 'success';
    status.textContent = 'Thank you. Your message has been sent — I’ll be in touch.';
    form.reset();
  } catch {
    status.dataset.state = 'error';
    status.textContent = 'Your message could not be sent. Please try again or email me directly.';
  } finally {
    clearTimeout(timeout);
    button.disabled = false;
    button.textContent = 'Send message';
  }
});

// Cards whose link has not been added yet: keep the page from jumping to the top.
document.querySelectorAll('a[data-link-pending]').forEach(link => {
  link.addEventListener('click', event => event.preventDefault());
});

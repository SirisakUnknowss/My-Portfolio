const defaultConfig = {
  developer_name: 'Developer',
  developer_title: 'Full-Stack Developer',
  hero_tagline: 'Building robust digital experiences from frontend to backend. Passionate about clean code, secure systems, and scalable architecture.',
  about_text: "I'm a passionate full-stack developer with expertise across the entire development stack. From crafting pixel-perfect interfaces to architecting secure backend systems, I bring ideas to life with clean, maintainable code.",
  contact_email: 'hello@developer.com',
  primary_color: '#818cf8',
  secondary_color: '#13131a',
  text_color: '#f1f5f9',
  accent_color: '#c084fc',
  bg_color: '#0a0a0f'
};

let currentPage = 'home';

function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
  });
  document.getElementById(`page-${page}`).classList.add('active');

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.page === page) {
      link.classList.add('active');
    }
  });

  currentPage = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById('contact-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const form = this;
  const statusEl = document.getElementById('form-status');
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerText;

  // Loading state
  submitBtn.innerText = 'Sending...';
  submitBtn.disabled = true;
  statusEl.classList.add('hidden');

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Add configuration for FormSubmit
  const payload = {
    ...data,
    _subject: `New Message from ${data.name || 'Portfolio Visitor'}`, // Custom subject
    _template: 'table', // Nice email format
    _captcha: 'false' // Disable captcha for cleaner UX (optional, can be true)
  };

  fetch('https://formsubmit.co/ajax/sirisak.unknowss@gmail.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then(response => response.json())
    .then(data => {
      statusEl.textContent = '✓ Message sent successfully! I\'ll check my email soon.';
      statusEl.className = 'text-center text-sm text-green-400 block mt-4';
      statusEl.classList.remove('hidden');
      form.reset();

      // Hide success message after 5 seconds
      setTimeout(() => {
        statusEl.classList.add('hidden');
      }, 5000);
    })
    .catch(error => {
      console.error('Error sending message:', error);
      statusEl.textContent = '❌ Failed to send message. Please try again or email me directly.';
      statusEl.className = 'text-center text-sm text-red-400 block mt-4';
      statusEl.classList.remove('hidden');
    })
    .finally(() => {
      // Reset button state
      submitBtn.innerText = originalBtnText;
      submitBtn.disabled = false;
    });
});

async function onConfigChange(config) {
  const name = config.developer_name || defaultConfig.developer_name;
  const title = config.developer_title || defaultConfig.developer_title;
  const tagline = config.hero_tagline || defaultConfig.hero_tagline;
  const aboutText = config.about_text || defaultConfig.about_text;
  const email = config.contact_email || defaultConfig.contact_email;
  const primaryColor = config.primary_color || defaultConfig.primary_color;
  const secondaryColor = config.secondary_color || defaultConfig.secondary_color;
  const textColor = config.text_color || defaultConfig.text_color;
  const accentColor = config.accent_color || defaultConfig.accent_color;
  const bgColor = config.bg_color || defaultConfig.bg_color;

  document.getElementById('hero-name').textContent = name;
  document.getElementById('hero-title').textContent = title;
  document.getElementById('hero-tagline').textContent = tagline;
  // document.getElementById('nav-name').textContent = name;
  document.getElementById('about-text').textContent = aboutText;
  document.getElementById('contact-email-display').textContent = email;

  document.body.style.backgroundColor = bgColor;
  document.body.style.color = textColor;

  document.documentElement.style.setProperty('--accent', primaryColor);
  document.documentElement.style.setProperty('--accent-light', accentColor);
  document.documentElement.style.setProperty('--bg-primary', bgColor);
  document.documentElement.style.setProperty('--bg-secondary', secondaryColor);
  document.documentElement.style.setProperty('--text-primary', textColor);

  document.querySelectorAll('.card-hover').forEach(card => {
    card.style.backgroundColor = secondaryColor + '80';
  });

  document.querySelectorAll('.bg-slate-900\\/50').forEach(el => {
    el.style.backgroundColor = secondaryColor + '80';
  });
}

function mapToCapabilities(config) {
  return {
    recolorables: [
      {
        get: () => config.bg_color || defaultConfig.bg_color,
        set: (value) => { config.bg_color = value; window.elementSdk.setConfig({ bg_color: value }); }
      },
      {
        get: () => config.secondary_color || defaultConfig.secondary_color,
        set: (value) => { config.secondary_color = value; window.elementSdk.setConfig({ secondary_color: value }); }
      },
      {
        get: () => config.text_color || defaultConfig.text_color,
        set: (value) => { config.text_color = value; window.elementSdk.setConfig({ text_color: value }); }
      },
      {
        get: () => config.primary_color || defaultConfig.primary_color,
        set: (value) => { config.primary_color = value; window.elementSdk.setConfig({ primary_color: value }); }
      },
      {
        get: () => config.accent_color || defaultConfig.accent_color,
        set: (value) => { config.accent_color = value; window.elementSdk.setConfig({ accent_color: value }); }
      }
    ],
    borderables: [],
    fontEditable: undefined,
    fontSizeable: undefined
  };
}

function mapToEditPanelValues(config) {
  return new Map([
    ['developer_name', config.developer_name || defaultConfig.developer_name],
    ['developer_title', config.developer_title || defaultConfig.developer_title],
    ['hero_tagline', config.hero_tagline || defaultConfig.hero_tagline],
    ['about_text', config.about_text || defaultConfig.about_text],
    ['contact_email', config.contact_email || defaultConfig.contact_email]
  ]);
}

if (window.elementSdk) {
  window.elementSdk.init({
    defaultConfig,
    onConfigChange,
    mapToCapabilities,
    mapToEditPanelValues
  });
}

// View Counter Implementation
document.addEventListener('DOMContentLoaded', async () => {
  const counterEl = document.getElementById('view-counter');
  if (!counterEl) return;

  try {
    // Unique namespace for this portfolio
    const namespace = 'unknowss-portfolio';
    const key = 'visits';

    // Hit the counter using CounterAPI.dev (replacing dead countapi.xyz)
    const response = await fetch(`https://api.counterapi.dev/v1/${namespace}/${key}/up`);
    if (!response.ok) throw new Error('API Error');

    const data = await response.json();
    const count = data.count;

    // Animation
    let current = 0;
    const increment = Math.ceil(count / 50); // Speed of counting

    const timer = setInterval(() => {
      current += increment;
      if (current >= count) {
        current = count;
        clearInterval(timer);
      }
      counterEl.textContent = current.toLocaleString();
    }, 20);

  } catch (e) {
    console.log('Counter fallback', e);
    // Fallback if API fails (e.g. adblocker)
    counterEl.textContent = '--';
  }
});

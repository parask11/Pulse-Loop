/**
 * PulseLoop — script.js
 * All interactive logic: metabolic meter, WhatsApp simulation,
 * scroll reveals, counters, navbar, CTA handling.
 * Author: PulseLoop Design · 2025
 */

'use strict';

/* ══════════════════════════════════════════════════════════
   1. NAVBAR — scroll-aware glass effect
══════════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const btn    = document.getElementById('mobile-menu-btn');
  const menu   = document.getElementById('mobile-menu');

  // Scroll shadow
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu toggle
  if (btn && menu) {
    btn.addEventListener('click', () => {
      menu.classList.toggle('hidden');
      menu.classList.toggle('open');
    });

    // Close on nav link click
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        menu.classList.add('hidden');
        menu.classList.remove('open');
      });
    });
  }
})();


/* ══════════════════════════════════════════════════════════
   2. INTERSECTION OBSERVER — reveal on scroll
══════════════════════════════════════════════════════════ */
(function initReveal() {
  const revealEls = document.querySelectorAll('[data-reveal]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el    = entry.target;
      const delay = parseInt(el.dataset.delay || '0', 10);

      setTimeout(() => {
        el.classList.add('revealed');
        // Trigger stat bar fills when visible
        const fill = el.querySelector('[data-fill]');
        if (fill) fill.style.width = fill.dataset.fill;
      }, delay);

      observer.unobserve(el);
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));
})();


/* ══════════════════════════════════════════════════════════
   3. METABOLIC INDEX METER — live fluctuation
══════════════════════════════════════════════════════════ */
(function initMetabolicMeter() {
  const valueEl  = document.getElementById('metabolic-value');
  const barEl    = document.getElementById('metabolic-bar');
  const labelEl  = document.getElementById('metabolic-label');
  const hrvEl    = document.getElementById('stat-hrv');
  const sleepEl  = document.getElementById('stat-sleep');
  const stressEl = document.getElementById('stat-stress');

  if (!valueEl || !barEl) return;

  // Zone definitions
  const zones = [
    { min: 0,  max: 35, label: 'At Risk',   class: 'status-risk',     textClass: 'text-red-400'   },
    { min: 35, max: 60, label: 'Moderate',  class: 'status-moderate', textClass: 'text-gold'      },
    { min: 60, max: 82, label: 'Optimal',   class: 'status-optimal',  textClass: 'text-teal-light' },
    { min: 82, max: 100,label: 'Peak',      class: 'status-peak',     textClass: 'text-emerald-300'},
  ];

  // Initial state
  let currentValue = 78;
  let currentHrv   = 62;
  let currentSleep = 7.2;
  let currentStress = 34;

  function getZone(v) {
    return zones.find(z => v >= z.min && v < z.max) || zones[2];
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function gaussian() {
    // Box-Muller for natural-feeling drift
    const u1 = Math.random(), u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  function updateMeter() {
    // Gently fluctuate with momentum
    const drift   = gaussian() * 2.2;
    currentValue  = clamp(currentValue + drift, 45, 98);

    const displayVal = Math.round(currentValue);
    const zone       = getZone(displayVal);

    // Update value
    valueEl.textContent = displayVal;

    // Update bar width + class
    barEl.style.width = `${displayVal}%`;
    barEl.className   = `meter-fill h-full rounded-full transition-all duration-700 ease-in-out ${zone.class}`;

    // Update label colour
    labelEl.textContent = zone.label;
    labelEl.className   = `text-sm font-medium mt-0.5 ${zone.textClass}`;

    // Fluctuate mini stats (correlated with main index)
    const base = currentValue;
    currentHrv    = clamp(currentHrv    + gaussian() * 1.5, 38, 95);
    currentSleep  = clamp(currentSleep  + gaussian() * 0.08, 5.5, 8.8);
    currentStress = clamp(currentStress - (base - 70) * 0.03 + gaussian() * 1.5, 10, 75);

    if (hrvEl)    hrvEl.textContent    = Math.round(currentHrv);
    if (sleepEl)  sleepEl.textContent  = currentSleep.toFixed(1);
    if (stressEl) stressEl.textContent = Math.round(currentStress);
  }

  // Run immediately then every 2.4 s
  updateMeter();
  setInterval(updateMeter, 2400);
})();


/* ══════════════════════════════════════════════════════════
   4. WHATSAPP CHAT SIMULATION
══════════════════════════════════════════════════════════ */
(function initChatSim() {
  const chatBody = document.getElementById('chat-body');
  if (!chatBody) return;

  // Conversation script
  const SCRIPT = [
    {
      type:    'timestamp',
      text:    'Today · 7:43 AM',
      delay:   800,
    },
    {
      type:    'ai-alert',
      text:    '🔶 HRV Alert · Your heart-rate variability dropped 22% overnight (62 → 48 ms). This often follows high-stress days.',
      delay:   1600,
      typing:  1000,
    },
    {
      type:    'ai',
      text:    "Good morning, Arjun 👋 I noticed you slept only 5h 40m and your stress index is elevated. Big day today?",
      delay:   4200,
      typing:  900,
    },
    {
      type:    'user',
      text:    "Yeah, board presentation at 10. Super nervous.",
      delay:   6800,
    },
    {
      type:    'ai',
      text:    "Got it — before you head in, try a 4-7-8 breath cycle (just 90 seconds 🌬️). It's been shown to lower cortisol fast. Want me to guide you?",
      delay:   8200,
      typing:  1100,
    },
    {
      type:    'user',
      text:    "Yes please! Send it.",
      delay:   10600,
    },
    {
      type:    'ai',
      text:    "Sending your breathing protocol now 🧘 Also blocking your lunch for a 20-min walk — I'll remind you at 12:45. You've got this.",
      delay:   12000,
      typing:  1200,
    },
  ];

  let chatStarted = false;

  // Watch for the chat section to enter viewport
  const chatSection = document.getElementById('chat-demo');
  if (!chatSection) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !chatStarted) {
      chatStarted = true;
      runChatSequence();
      observer.disconnect();
    }
  }, { threshold: 0.3 });

  observer.observe(chatSection);

  function runChatSequence() {
    SCRIPT.forEach(msg => {
      setTimeout(() => {
        if (msg.type === 'timestamp') {
          appendTimestamp(msg.text);
        } else if (msg.type === 'user') {
          appendBubble(msg.text, 'user');
        } else {
          // Show typing indicator first, then bubble
          const typingEl = appendTypingIndicator();
          setTimeout(() => {
            typingEl.remove();
            const bubbleClass = msg.type === 'ai-alert' ? 'alert' : 'ai';
            appendBubble(msg.text, bubbleClass);
          }, msg.typing || 800);
        }
      }, msg.delay);
    });
  }

  function appendTimestamp(text) {
    const el = document.createElement('p');
    el.className = 'chat-timestamp';
    el.textContent = text;
    chatBody.appendChild(el);
    scrollChat();
  }

  function appendBubble(text, type) {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col';

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble chat-bubble--${type}`;
    bubble.textContent = text;

    wrapper.appendChild(bubble);
    chatBody.appendChild(wrapper);
    scrollChat();

    // Animate in after next frame
    requestAnimationFrame(() => requestAnimationFrame(() => bubble.classList.add('visible')));
  }

  function appendTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = `
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    `;
    chatBody.appendChild(indicator);
    scrollChat();

    // Animate in
    requestAnimationFrame(() => requestAnimationFrame(() => indicator.classList.add('visible')));
    return indicator;
  }

  function scrollChat() {
    chatBody.scrollTop = chatBody.scrollHeight;
  }
})();


/* ══════════════════════════════════════════════════════════
   5. ANIMATED COUNTERS — traction strip
══════════════════════════════════════════════════════════ */
(function initCounters() {
  const counters = document.querySelectorAll('.counter[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.textContent.replace(/[0-9]/g, ''); // preserve any suffix
      const start  = performance.now();
      const dur    = 1800; // ms

      function ease(t) {
        // Ease out quad
        return 1 - (1 - t) * (1 - t);
      }

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / dur, 1);
        const current  = Math.round(ease(progress) * target);
        el.textContent = current + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();


/* ══════════════════════════════════════════════════════════
   6. STAT BAR FILLS — triggered by reveal observer
      (bars under problem stat cards)
══════════════════════════════════════════════════════════ */
(function initStatBars() {
  // The reveal observer handles stat bars via [data-fill].
  // This function observes .stat-card elements directly.
  const cards = document.querySelectorAll('.stat-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const fill = entry.target.querySelector('[data-fill]');
      if (fill) {
        setTimeout(() => { fill.style.width = fill.dataset.fill; }, 300);
      }
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  cards.forEach(c => observer.observe(c));
})();


/* ══════════════════════════════════════════════════════════
   7. CTA EMAIL FORM — micro-interaction
══════════════════════════════════════════════════════════ */
(function initCTA() {
  const submitBtn = document.getElementById('cta-submit');
  const emailInput = document.getElementById('email-input');
  const msgEl      = document.getElementById('cta-message');

  if (!submitBtn || !emailInput) return;

  submitBtn.addEventListener('click', () => {
    const email = emailInput.value.trim();

    // Basic email validation
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!valid) {
      // Shake the input
      emailInput.style.borderColor = '#ef4444';
      emailInput.classList.add('shake');
      setTimeout(() => {
        emailInput.style.borderColor = '';
        emailInput.classList.remove('shake');
      }, 600);
      return;
    }

    // Success state
    submitBtn.textContent   = '✓ Sent!';
    submitBtn.disabled      = true;
    submitBtn.style.opacity = '0.6';
    emailInput.disabled     = true;
    emailInput.style.opacity = '0.5';

    if (msgEl) {
      msgEl.classList.remove('hidden');
    }

    // In production: POST to your backend / Airtable / Mailchimp here
    console.log('[PulseLoop] Investor email captured:', email);
  });

  // Enter key support
  emailInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitBtn.click();
  });
})();


/* ══════════════════════════════════════════════════════════
   8. SMOOTH ANCHOR SCROLL — account for fixed navbar
══════════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = document.getElementById('navbar')?.offsetHeight || 72;
      const top       = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ══════════════════════════════════════════════════════════
   9. ARCHITECTURE CARD — stagger on hover neighbour
══════════════════════════════════════════════════════════ */
(function initArchHover() {
  const cards = document.querySelectorAll('.arch-card');
  cards.forEach((card, i) => {
    card.addEventListener('mouseenter', () => {
      cards.forEach((c, j) => {
        const dist = Math.abs(i - j);
        c.style.transform = dist === 0 ? 'translateY(-6px)' :
                            dist === 1 ? 'translateY(-2px)' : '';
        c.style.opacity   = dist === 0 ? '1' :
                            dist === 1 ? '0.85' : '0.65';
        c.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
      });
    });
    card.addEventListener('mouseleave', () => {
      cards.forEach(c => {
        c.style.transform = '';
        c.style.opacity   = '';
      });
    });
  });
})();


/* ══════════════════════════════════════════════════════════
   10. SHAKE keyframe — injected dynamically for email error
══════════════════════════════════════════════════════════ */
(function injectShakeKeyframe() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-6px); }
      40%      { transform: translateX(6px); }
      60%      { transform: translateX(-4px); }
      80%      { transform: translateX(4px); }
    }
    .shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
  `;
  document.head.appendChild(style);
})();

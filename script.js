let toastTimeoutId;
let formResetTimeoutId;

function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMsg');

  if (!toast || !toastMessage) {
    return;
  }

  toastMessage.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimeoutId);
  toastTimeoutId = window.setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function resetForm() {
  const form = document.getElementById('contactForm');
  const formContent = document.getElementById('formContent');
  const formSuccess = document.getElementById('formSuccess');
  const submitButton = form ? form.querySelector('[type="submit"]') : null;

  window.clearTimeout(formResetTimeoutId);
  if (form) {
    form.reset();
    form.removeAttribute('aria-busy');
  }

  if (formContent) {
    formContent.style.display = 'block';
  }

  if (formSuccess) {
    formSuccess.style.display = 'none';
  }

  if (submitButton) {
    submitButton.disabled = false;
    submitButton.textContent = 'Send Message →';
  }
}

function submitForm(event) {
  event.preventDefault();

  const form = event.currentTarget;
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const formContent = document.getElementById('formContent');
  const formSuccess = document.getElementById('formSuccess');
  const submitButton = event.submitter || form.querySelector('[type="submit"]');

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
  }
  form.setAttribute('aria-busy', 'true');

  fetch(form.action, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: new FormData(form),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Form submission failed with status ${response.status}`);
      }

      if (formContent) {
        formContent.style.display = 'none';
      }

      if (formSuccess) {
        formSuccess.style.display = 'block';
      }

      form.removeAttribute('aria-busy');
      showToast('Your message has been sent successfully!');
      formResetTimeoutId = window.setTimeout(resetForm, 3000);
    })
    .catch((error) => {
      console.error('Unable to send contact form:', error);
      form.removeAttribute('aria-busy');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message →';
      }
      showToast('We could not send your message. Please try again or email us directly.');
    });
}

document.addEventListener('DOMContentLoaded', () => {
  const scrollTopButton = document.getElementById('scrollTopBtn');
  const form = document.getElementById('contactForm');
  const kenyaDateTime = document.getElementById('kenyaDateTime');
  const selectedPackage = document.getElementById('selectedPackage');
  const navToggle = document.getElementById('navToggle');
  const primaryNavigation = document.getElementById('primary-navigation');
  const navigationBar = document.querySelector('nav[aria-label="Primary navigation"]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollBehavior = reduceMotion ? 'auto' : 'smooth';

  if (kenyaDateTime) {
    const updateKenyaDateTime = () => {
      const now = new Date();
      kenyaDateTime.dateTime = now.toISOString();
      kenyaDateTime.textContent = new Intl.DateTimeFormat('en-KE', {
        timeZone: 'Africa/Nairobi',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(now);
    };

    updateKenyaDateTime();
    window.setInterval(updateKenyaDateTime, 60000);
  }

  const closeNavigation = () => {
    if (!navToggle || !primaryNavigation) {
      return;
    }

    primaryNavigation.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
  };

  if (navToggle && primaryNavigation) {
    navToggle.addEventListener('click', () => {
      const shouldOpen = navToggle.getAttribute('aria-expanded') !== 'true';
      primaryNavigation.classList.toggle('is-open', shouldOpen);
      navToggle.setAttribute('aria-expanded', String(shouldOpen));
      navToggle.setAttribute('aria-label', shouldOpen ? 'Close navigation menu' : 'Open navigation menu');
    });

    document.addEventListener('click', (event) => {
      if (
        navToggle.getAttribute('aria-expanded') === 'true'
        && !primaryNavigation.contains(event.target)
        && !navToggle.contains(event.target)
      ) {
        closeNavigation();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        closeNavigation();
        navToggle.focus();
      }
    });
  }

  document.querySelectorAll('.package-cta[data-package]').forEach((link) => {
    link.addEventListener('click', () => {
      if (selectedPackage) {
        selectedPackage.value = link.dataset.package || '';
      }
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');

      if (!href || href === '#') {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: scrollBehavior });
        return;
      }

      let targetElement;
      try {
        targetElement = document.getElementById(decodeURIComponent(href.slice(1)));
      } catch (error) {
        return;
      }

      if (!targetElement) {
        return;
      }

      event.preventDefault();
      if (link.closest('#primary-navigation')) {
        closeNavigation();
      }

      if (!targetElement.hasAttribute('tabindex')) {
        targetElement.setAttribute('tabindex', '-1');
      }
      targetElement.focus({ preventScroll: true });

      const navigationHeight = navigationBar ? navigationBar.getBoundingClientRect().height : 0;
      const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY - navigationHeight - 12;
      window.scrollTo({ top: offsetTop, behavior: scrollBehavior });
    });
  });

  if (form) {
    form.addEventListener('submit', submitForm);
  }

  if (scrollTopButton) {
    const toggleScrollTop = () => {
      scrollTopButton.classList.toggle('is-visible', window.scrollY > 420);
    };

    toggleScrollTop();
    window.addEventListener('scroll', toggleScrollTop, { passive: true });
    scrollTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: scrollBehavior });
    });
  }

  const revealTargets = document.querySelectorAll(
    'section, .service-card, .package-card, .why-card, .portfolio-card, .testimonial-card, .about-skills, .about-stats, .contact-item, .contact-form'
  );

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.01,
      rootMargin: '0px 0px -8% 0px',
    }
  );

  revealTargets.forEach((element) => {
    element.classList.add('reveal-item');
    revealObserver.observe(element);
  });
});

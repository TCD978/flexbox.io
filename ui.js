// ui.js — improved contact form handling and reveal animations
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const toast = document.getElementById('toast');
  const toastText = toast?.querySelector('.toast__text');
  const submitBtn = form?.querySelector('button[type="submit"]');

  function showToast(message, ms = 3500) {
    if (!toast) return;
    toastText.textContent = message;
    toast.hidden = false;
    toast.classList.add('show');
    toast.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      toast.classList.remove('show');
      toast.hidden = true;
      toast.setAttribute('aria-hidden', 'true');
    }, ms);
  }

  if (form) {
    // Ensure placeholders exist so :placeholder-shown works for floating labels
    form.querySelectorAll('input, textarea').forEach(el => {
      if (!el.placeholder) el.placeholder = ' ';
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.classList.add('submitting'); }

      const formData = new FormData(form);
      const payload = {};
      formData.forEach((value, key) => {
        if (key.endsWith('[]')) {
          const base = key.replace(/\[\]$/, '');
          payload[base] = payload[base] || [];
          payload[base].push(value);
        } else {
          if (Object.prototype.hasOwnProperty.call(payload, key)) {
            payload[key] = [].concat(payload[key], value);
          } else {
            payload[key] = value;
          }
        }
      });

      try {
        const res = await fetch(form.action, {
          method: form.method || 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          showToast('Message sent successfully');
          form.reset();
          const first = form.querySelector('input, textarea, select');
          if (first) first.focus();
        } else {
          let err = 'Submission failed. Please try again.';
          try {
            const json = await res.json();
            if (json?.error) err = json.error;
            else if (json?.message) err = json.message;
          } catch (_) {}
          showToast(err);
          console.error('Form error', res.status, res.statusText);
        }
      } catch (err) {
        showToast('Network error. Please try again later.');
        console.error('Network error', err);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('submitting');
          submitBtn.classList.add('success');
          setTimeout(() => submitBtn.classList.remove('success'), 900);
        }
      }
    });
  }

  // Reveal animation (IntersectionObserver)
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }
});
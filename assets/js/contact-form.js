(() => {
  const form = document.getElementById('contactForm');
  if (!form || !window.fetch) return;
  form.noValidate = true;
  const fields = ['f-nombre', 'f-email', 'f-mensaje'].map(id => document.getElementById(id));
  const errors = new Map();
  fields.forEach(field => {
    const error = document.createElement('p');
    error.id = field.id + '-error';
    error.className = 'contact-field-error';
    error.hidden = true;
    field.after(error);
    field.setAttribute('aria-describedby', error.id);
    errors.set(field, error);
    field.addEventListener('input', () => { if (!error.hidden) validate(field); });
  });
  const message = fields[2];
  message.minLength = 10;
  message.maxLength = 3000;
  const hint = document.createElement('p');
  hint.className = 'contact-field-hint';
  hint.id = 'message-requirements';
  hint.textContent = 'Mínimo 10 caracteres. Máximo 3000.';
  message.after(hint);
  message.setAttribute('aria-describedby', hint.id + ' ' + errors.get(message).id);
  const status = document.createElement('p');
  status.className = 'contact-send-status';
  status.setAttribute('role', 'status');
  status.tabIndex = -1;
  status.hidden = true;
  form.append(status);
  function validate(field) {
    const value = field.value.trim();
    let text = '';
    if (!value) text = field === fields[0] ? 'Completá tu nombre.' : field === fields[1] ? 'Completá tu email.' : 'Escribí tu mensaje.';
    else if (field === fields[1] && field.validity.typeMismatch) text = 'Ingresá un email válido, por ejemplo nombre@gmail.com.';
    else if (field === message && [...value].length < 10) text = 'El mensaje debe tener al menos 10 caracteres.';
    else if (field.validity.tooLong) text = 'El texto supera el máximo permitido.';
    errors.get(field).textContent = text;
    errors.get(field).hidden = !text;
    field.setAttribute('aria-invalid', text ? 'true' : 'false');
    return !text;
  }
  form.addEventListener('submit', event => {
    const invalid = fields.filter(field => !validate(field));
    if (invalid.length) {
      event.preventDefault();
      event.stopImmediatePropagation();
      invalid[0].focus();
    }
  }, true);
  // Protección anti-spam: al abrirse, el formulario pide al servidor un token firmado, de un
  // solo uso, que debe acompañar al envío. Si el servidor tiene reCAPTCHA v3 habilitado,
  // también publica la clave del sitio y se agrega la verificación (sin cargar nada de
  // Google mientras no esté habilitado).
  const MIN_TOKEN_AGE = 3500;
  const tokenField = document.createElement('input');
  tokenField.type = 'hidden';
  tokenField.name = '_t';
  const captchaField = document.createElement('input');
  captchaField.type = 'hidden';
  captchaField.name = 'g-recaptcha-response';
  form.append(tokenField, captchaField);
  let tokenIssuedAt = 0;
  let siteKey = null;
  let tokenRequest = null;
  function loadRecaptcha(key) {
    if (document.querySelector('script[data-pyp-recaptcha]')) return;
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=' + encodeURIComponent(key);
    script.async = true;
    script.dataset.pypRecaptcha = '1';
    document.head.append(script);
    const legal = document.createElement('p');
    legal.className = 'form-note';
    legal.innerHTML = 'Este sitio está protegido por reCAPTCHA y se aplican la <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Política de privacidad</a> y los <a href="https://policies.google.com/terms" target="_blank" rel="noopener">Términos de servicio</a> de Google.';
    form.append(legal);
  }
  function refreshToken() {
    const url = new URL(form.action, window.location.href);
    url.searchParams.set('t', '1');
    tokenRequest = fetch(url, {headers: {Accept: 'application/json'}, cache: 'no-store'})
      .then(response => response.json())
      .then(data => {
        if (!data.ok) throw new Error('token');
        tokenField.value = data.token;
        tokenIssuedAt = Date.now();
        if (data.recaptcha && data.recaptcha !== siteKey) {
          siteKey = data.recaptcha;
          loadRecaptcha(siteKey);
        }
      })
      .catch(() => { tokenField.value = ''; });
    return tokenRequest;
  }
  refreshToken();
  async function prepareAntiSpam() {
    await tokenRequest;
    if (!tokenField.value) await refreshToken();
    if (!tokenField.value) throw new Error('No pudimos validar el formulario. Recargá la página o escribinos por WhatsApp.');
    // El servidor exige unos segundos desde que se abrió el formulario; casi nunca hay que esperar.
    const wait = MIN_TOKEN_AGE - (Date.now() - tokenIssuedAt);
    if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
    if (siteKey) {
      for (let i = 0; i < 40 && !window.grecaptcha; i++) await new Promise(resolve => setTimeout(resolve, 100));
      captchaField.value = await new Promise(resolve => {
        if (!window.grecaptcha) return resolve('');
        window.grecaptcha.ready(() => window.grecaptcha.execute(siteKey, {action: 'contacto'}).then(resolve, () => resolve('')));
      });
    }
  }
  let sending = false;
  form.addEventListener('submit', async event => {
    // The phone validator runs first and can defer submission until it is ready.
    if (event.defaultPrevented) return;
    event.preventDefault();
    if (sending) return;
    sending = true;
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.hidden = false;
    status.textContent = 'Enviando mensaje…';
    try {
      await prepareAntiSpam();
      const response = await fetch(form.action, {method: 'POST', body: new FormData(form), headers: {Accept: 'application/json'}});
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'No pudimos enviar el mensaje. Intentá nuevamente.');
      status.textContent = 'Gracias por escribirnos. Tu mensaje fue enviado.';
      window.location.assign('/gracias/');
    } catch (error) {
      status.textContent = error instanceof SyntaxError || error instanceof TypeError
        ? 'No pudimos confirmar el envío. Conservamos tus datos; revisá tu conexión e intentá nuevamente.'
        : error.message;
      status.focus();
      refreshToken();   // el token es de un solo uso: el reintento necesita uno nuevo
    } finally {
      sending = false;
      button.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
})();

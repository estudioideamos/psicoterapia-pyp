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
      const response = await fetch(form.action, {method: 'POST', body: new FormData(form), headers: {Accept: 'application/json'}});
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'No pudimos enviar el mensaje. Intentá nuevamente.');
      status.textContent = 'Gracias por escribirnos. Tu mensaje fue enviado.';
      status.focus();
      form.reset();
    } catch (error) {
      status.textContent = error instanceof SyntaxError || error instanceof TypeError
        ? 'No pudimos confirmar el envío. Conservamos tus datos; revisá tu conexión e intentá nuevamente.'
        : error.message;
      status.focus();
    } finally {
      sending = false;
      button.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
})();

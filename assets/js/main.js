/* Psicoterapia P&P — interacciones
   Motivo visual: cinta de Moebius (loop infinito), en foto e ícono SVG.
   Todo el contenido permanece visible y navegable sin este script. */

document.documentElement.classList.add('js');

/* ---------------------------------------------------------
   1) Iconografía de loop reutilizable + textura de grano
--------------------------------------------------------- */
function loopIconSVG(){
  return `<svg class="loop-icon" viewBox="0 0 100 50" fill="none" aria-hidden="true">
    <path d="M25,25 C25,10 42,10 50,25 C58,40 75,40 75,25 C75,10 58,10 50,25 C42,40 25,40 25,25 Z"
      stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
}
function blotSVG(){
  return `<svg viewBox="0 0 200 240" fill="currentColor" aria-hidden="true">
    <path d="M100,8 C60,8 50,40 45,60 C38,85 60,95 50,118 C40,140 10,145 22,178 C32,205 65,222 100,232 C135,222 168,205 178,178 C190,145 160,140 150,118 C140,95 162,85 155,60 C150,40 140,8 100,8 Z"/>
  </svg>`;
}
function stepsPathSVG(){
  return `<svg viewBox="0 0 1000 120" preserveAspectRatio="none" fill="none" aria-hidden="true">
    <path d="M20,60 C 260,-10 360,140 500,60 S 740,-10 980,60" stroke="#3c4f28" stroke-width="1.5" stroke-dasharray="2 10" stroke-linecap="round"/>
  </svg>`;
}
document.querySelectorAll('[data-mobius="steps"]').forEach(el => el.innerHTML = stepsPathSVG());
document.querySelectorAll('[data-blot]').forEach(el => el.innerHTML = blotSVG());
document.querySelectorAll('[data-loop-icon]').forEach(el => el.innerHTML = loopIconSVG());

/* Set de íconos propios (línea, trazo redondeado) — misma familia visual que el loop,
   con un detalle animado por ícono (sutil, se apaga con reduced-motion vía CSS) */
const ICONS = {
  online: '<circle cx="50" cy="50" r="33" stroke="currentColor" stroke-width="4" fill="none"/><circle class="ico-pulse" cx="50" cy="50" r="33" stroke="currentColor" stroke-width="2" fill="none"/><path d="M43 36 L68 50 L43 64 Z" fill="currentColor"/>',
  presencial: '<path d="M50 16 C64 16 75 27 75 41 C75 58 50 84 50 84 C50 84 25 58 25 41 C25 27 36 16 50 16 Z" stroke="currentColor" stroke-width="4" fill="none" stroke-linejoin="round"/><circle class="ico-dot" cx="50" cy="41" r="10" stroke="currentColor" stroke-width="4" fill="none"/>',
  exterior: '<circle cx="50" cy="50" r="33" stroke="currentColor" stroke-width="4" fill="none"/><g class="ico-spin" style="transform-origin:50px 50px"><path d="M17 50 H83 M50 17 C61 28 61 72 50 83 C39 72 39 28 50 17 Z" stroke="currentColor" stroke-width="4" fill="none"/></g>',
  calendar: '<rect x="18" y="24" width="64" height="58" rx="9" stroke="currentColor" stroke-width="4" fill="none"/><path d="M18 42 H82 M34 16 V30 M66 16 V30" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path class="ico-check" d="M30 58 L44 70 L70 44" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  clock: '<circle cx="50" cy="50" r="33" stroke="currentColor" stroke-width="4" fill="none"/><path class="ico-hand" d="M50 31 V50 L64 59" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" style="transform-origin:50px 50px"/>',
  chat: '<path d="M50 18 C30 18 16 31 16 48 C16 57 20 64 26 70 L22 83 L37 77 C41 79 45 80 50 80 C70 80 84 67 84 50 C84 33 70 18 50 18 Z" stroke="currentColor" stroke-width="4" fill="none" stroke-linejoin="round"/><circle class="ico-dot" cx="50" cy="49" r="4" fill="currentColor"/>',
  mail: '<rect x="15" y="27" width="70" height="46" rx="6" stroke="currentColor" stroke-width="4" fill="none"/><path d="M18 31 L50 54 L82 31" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  write: '<path d="M20 80 L29 78 L66 41 C69 38 69 33 66 30 C63 27 58 27 55 30 L18 67 L16 76 C15 79 17 81 20 80 Z" stroke="currentColor" stroke-width="4" fill="none" stroke-linejoin="round"/><path d="M53 32 L64 43" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>'
};
function iconSVG(name, cls){
  return `<svg class="feature-icon icon-${name} ${cls||''}" viewBox="0 0 100 100" fill="none" aria-hidden="true">${ICONS[name]||''}</svg>`;
}
document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = iconSVG(el.getAttribute('data-icon')));

const grain = document.createElement('div');
grain.className = 'grain';
grain.setAttribute('aria-hidden', 'true');
document.body.appendChild(grain);

/* El atributo autoplay no siempre dispara la reproducción de forma fiable
   (políticas del navegador, timing de carga). Forzamos play() explícitamente
   y, si aun así falla, mostramos el poster como <img> para nunca dejar un
   recuadro vacío. */
document.querySelectorAll('video[autoplay]').forEach(video => {
  const tryPlay = () => video.play().catch(() => {
    if(video.poster && !video.parentElement.querySelector('.video-fallback-poster')){
      const img = document.createElement('img');
      img.src = video.poster;
      img.alt = '';
      img.className = 'video-fallback-poster';
      img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
      video.style.display = 'none';
      video.insertAdjacentElement('afterend', img);
    }
  });
  tryPlay();
  document.addEventListener('visibilitychange', () => { if(!document.hidden && video.paused) tryPlay(); });
});

/* Botón flotante de WhatsApp — en todas las páginas */
const waFloat = document.createElement('a');
waFloat.href = 'https://wa.me/5491151489394';
waFloat.target = '_blank';
waFloat.rel = 'noopener';
waFloat.className = 'wa-float';
waFloat.setAttribute('aria-label', 'Escribir por WhatsApp');
waFloat.innerHTML = `<span class="wa-float-ring"></span><svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16.04 3C9.37 3 3.96 8.4 3.96 15.06c0 2.22.6 4.3 1.65 6.09L4 29l7.99-1.57a12.9 12.9 0 0 0 4.05.65c6.67 0 12.08-5.4 12.08-12.06C28.12 8.4 22.71 3 16.04 3Zm0 21.9c-1.35 0-2.68-.26-3.9-.76l-.28-.11-4.75.93.95-4.63-.13-.3a10.03 10.03 0 0 1-1.55-5.37c0-5.55 4.52-10.06 10.09-10.06 2.7 0 5.23 1.05 7.13 2.95a10.02 10.02 0 0 1 2.96 7.12c0 5.56-4.52 10.07-10.09 10.07l.02-.02Zm5.53-7.54c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.36.22-.66.08-.3-.15-1.28-.47-2.44-1.5-.9-.8-1.51-1.79-1.69-2.09-.18-.3-.02-.46.13-.6.14-.14.3-.36.45-.55.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.93-2.24-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.02-1.05 2.5 0 1.47 1.08 2.9 1.23 3.1.15.2 2.12 3.24 5.15 4.54.72.31 1.28.5 1.72.63.72.23 1.38.2 1.9.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.07-.13-.27-.2-.57-.35Z"/></svg>`;
document.body.appendChild(waFloat);

/* Marquee: duplica el contenido una vez para que el loop de -50% sea perfecto */
document.querySelectorAll('.marquee-track').forEach(track => {
  track.insertAdjacentHTML('beforeend', track.innerHTML);
});

/* ---------------------------------------------------------
   2) Header: estado al hacer scroll + menú móvil
--------------------------------------------------------- */
const header = document.querySelector('.site-header');
const onScroll = () => {
  if(!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 12);
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

const navToggle = document.querySelector('.nav-toggle');
const mobilePanel = document.querySelector('.mobile-panel');
if(navToggle && mobilePanel){
  navToggle.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!open));
    mobilePanel.classList.toggle('is-open', !open);
    document.body.style.overflow = !open ? 'hidden' : '';
  });
  mobilePanel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navToggle.setAttribute('aria-expanded', 'false');
    mobilePanel.classList.remove('is-open');
    document.body.style.overflow = '';
  }));
}

/* ---------------------------------------------------------
   3) Índice editorial de motivos de consulta (acordeón simple)
--------------------------------------------------------- */
document.querySelectorAll('.reason-row[data-toggle]').forEach(row => {
  row.addEventListener('click', () => {
    const wasOpen = row.classList.contains('is-open');
    row.parentElement.querySelectorAll('.reason-row.is-open').forEach(r => r.classList.remove('is-open'));
    if(!wasOpen) row.classList.add('is-open');
  });
});

/* ---------------------------------------------------------
   4) FAQ animado: progresa sobre <details> nativo (accesible sin JS)
--------------------------------------------------------- */
document.querySelectorAll('.faq-item').forEach(details => {
  const summary = details.querySelector('summary');
  const wrap = details.querySelector('.faq-a-wrap');
  if(!summary || !wrap) return;
  wrap.style.height = details.hasAttribute('open') ? 'auto' : '0px';

  summary.addEventListener('click', (e) => {
    e.preventDefault();
    const isOpen = details.hasAttribute('open');
    if(isOpen){
      wrap.style.height = wrap.scrollHeight + 'px';
      requestAnimationFrame(() => { wrap.style.height = '0px'; });
      wrap.addEventListener('transitionend', function onEnd(ev){
        if(ev.propertyName !== 'height') return;
        details.removeAttribute('open');
        wrap.removeEventListener('transitionend', onEnd);
      });
    } else {
      details.setAttribute('open', '');
      wrap.style.height = '0px';
      requestAnimationFrame(() => { wrap.style.height = wrap.scrollHeight + 'px'; });
      wrap.addEventListener('transitionend', function onEnd(ev){
        if(ev.propertyName !== 'height') return;
        wrap.style.height = 'auto';
        wrap.removeEventListener('transitionend', onEnd);
      });
    }
  });
});

/* ---------------------------------------------------------
   5) Revelado al hacer scroll — IntersectionObserver puro
      (independiente de GSAP y de recalculos de layout por fuentes/imagenes)
--------------------------------------------------------- */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function observeReveal(selector, className){
  const els = document.querySelectorAll(selector);
  if(reduceMotion || !('IntersectionObserver' in window)){
    els.forEach(el => el.classList.add(className));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add(className); io.unobserve(e.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
  els.forEach(el => io.observe(el));

  // red de seguridad: si por lo que sea el IntersectionObserver no dispara
  // (extensiones, navegadores atípicos, pestaña recién visible), revisamos
  // manualmente por posición en cada scroll/resize para que el contenido
  // nunca quede invisible.
  let ticking = false;
  const manualCheck = () => {
    ticking = false;
    const vh = window.innerHeight;
    els.forEach(el => {
      if(el.classList.contains(className)) return;
      const r = el.getBoundingClientRect();
      if(r.top < vh * 0.92 && r.bottom > 0) el.classList.add(className);
    });
  };
  const onScrollOrResize = () => { if(!ticking){ ticking = true; requestAnimationFrame(manualCheck); } };
  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize);
  manualCheck();
}
observeReveal('.reveal', 'is-ready');
observeReveal('.img-reveal', 'is-ready');

/* ---------------------------------------------------------
   6) Contadores animados (cifras de confianza / trayectoria)
--------------------------------------------------------- */
function animateCount(el){
  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  if(reduceMotion || typeof gsap === 'undefined'){
    el.textContent = prefix + target.toFixed(decimals).replace('.', ',') + suffix;
    return;
  }
  const obj = { v: 0 };
  gsap.to(obj, {
    v: target, duration: 1.6, ease: 'power2.out',
    onUpdate: () => { el.textContent = prefix + obj.v.toFixed(decimals).replace('.', ',') + suffix; }
  });
}
const counters = document.querySelectorAll('[data-count]');
if(counters.length){
  if(reduceMotion || !('IntersectionObserver' in window)){
    counters.forEach(animateCount);
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if(e.isIntersecting){ animateCount(e.target); io.unobserve(e.target); } });
    }, { threshold: .5 });
    counters.forEach(el => io.observe(el));
  }
}

/* ---------------------------------------------------------
   7) Halo de cursor en el hero
--------------------------------------------------------- */
document.querySelectorAll('.hero').forEach(hero => {
  const glow = hero.querySelector('.cursor-glow');
  if(!glow || reduceMotion) return;
  hero.addEventListener('pointermove', (e) => {
    const rect = hero.getBoundingClientRect();
    glow.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
    glow.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
  });
});

/* ---------------------------------------------------------
   8) Botones magnéticos (desplazamiento sutil hacia el cursor)
--------------------------------------------------------- */
if(!reduceMotion && window.matchMedia('(pointer: fine)').matches){
  document.querySelectorAll('.btn--primary, .btn--ghost').forEach(btn => {
    btn.classList.add('is-magnetic');
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.25;
      const y = (e.clientY - r.top - r.height / 2) * 0.35;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* ---------------------------------------------------------
   9) GSAP: titulares, parallax de fondos, línea de pasos
--------------------------------------------------------- */
if(!(reduceMotion || typeof gsap === 'undefined')){
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll('[data-split-lines]').forEach(el => {
    const words = el.textContent.trim().split(' ');
    el.innerHTML = words.map(w => `<span class="line-word">${w}</span>`).join(' ');
    gsap.from(el.querySelectorAll('.line-word'), {
      opacity: 0, y: 24, duration: .7, ease: 'power2.out', stagger: 0.045, delay: .15
    });
  });
  document.querySelectorAll('[data-fade-up]').forEach((el, i) => {
    gsap.from(el, { opacity:0, y:18, duration:.8, ease:'power2.out', delay: .3 + i*0.12 });
  });

  // parallax muy leve de las imágenes de fondo por sección
  document.querySelectorAll('.bg-photo img, .bg-photo video').forEach(img => {
    gsap.to(img, {
      yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: img.closest('section, .mode-card--lead'), start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });
}

/* ---------------------------------------------------------
   9b) Video inmersivo: reproducir al hacer clic en el botón de play
--------------------------------------------------------- */
document.querySelectorAll('.video-break').forEach(block => {
  const trigger = block.querySelector('.play-trigger');
  const video = block.querySelector('video');
  if(!trigger || !video) return;
  trigger.addEventListener('click', () => {
    block.classList.add('is-playing');
    video.muted = false;
    video.controls = true;
    video.play();
  });
});

/* ---------------------------------------------------------
   10b) Formulario de contacto (FormSubmit): mensaje de éxito tras el redirect
--------------------------------------------------------- */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
if(contactForm && formSuccess){
  if(new URLSearchParams(location.search).get('enviado') === '1'){
    contactForm.hidden = true;
    formSuccess.hidden = false;
  }
}

/* ---------------------------------------------------------
   11) Año dinámico en el footer
--------------------------------------------------------- */
document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

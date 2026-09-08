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
function stepsPathSVG(){
  return `<svg viewBox="0 0 1000 120" preserveAspectRatio="none" fill="none" aria-hidden="true">
    <path d="M20,60 C 260,-10 360,140 500,60 S 740,-10 980,60" stroke="#3c4f28" stroke-width="1.5" stroke-dasharray="2 10" stroke-linecap="round"/>
  </svg>`;
}
document.querySelectorAll('[data-mobius="steps"]').forEach(el => el.innerHTML = stepsPathSVG());
document.querySelectorAll('[data-loop-icon]').forEach(el => el.innerHTML = loopIconSVG());

/* Set de íconos propios (línea, trazo redondeado) — misma familia visual que el loop */
const ICONS = {
  online: '<circle cx="50" cy="50" r="33" stroke="currentColor" stroke-width="4" fill="none"/><path d="M43 36 L68 50 L43 64 Z" fill="currentColor"/>',
  presencial: '<path d="M50 16 C64 16 75 27 75 41 C75 58 50 84 50 84 C50 84 25 58 25 41 C25 27 36 16 50 16 Z" stroke="currentColor" stroke-width="4" fill="none" stroke-linejoin="round"/><circle cx="50" cy="41" r="10" stroke="currentColor" stroke-width="4" fill="none"/>',
  exterior: '<circle cx="50" cy="50" r="33" stroke="currentColor" stroke-width="4" fill="none"/><path d="M17 50 H83 M50 17 C61 28 61 72 50 83 C39 72 39 28 50 17 Z" stroke="currentColor" stroke-width="4" fill="none"/>',
  calendar: '<rect x="18" y="24" width="64" height="58" rx="9" stroke="currentColor" stroke-width="4" fill="none"/><path d="M18 42 H82 M34 16 V30 M66 16 V30" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
  clock: '<circle cx="50" cy="50" r="33" stroke="currentColor" stroke-width="4" fill="none"/><path d="M50 31 V50 L64 59" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none"/>',
  chat: '<path d="M50 18 C30 18 16 31 16 48 C16 57 20 64 26 70 L22 83 L37 77 C41 79 45 80 50 80 C70 80 84 67 84 50 C84 33 70 18 50 18 Z" stroke="currentColor" stroke-width="4" fill="none" stroke-linejoin="round"/>',
  mail: '<rect x="15" y="27" width="70" height="46" rx="6" stroke="currentColor" stroke-width="4" fill="none"/><path d="M18 31 L50 54 L82 31" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  write: '<path d="M20 80 L29 78 L66 41 C69 38 69 33 66 30 C63 27 58 27 55 30 L18 67 L16 76 C15 79 17 81 20 80 Z" stroke="currentColor" stroke-width="4" fill="none" stroke-linejoin="round"/><path d="M53 32 L64 43" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>'
};
function iconSVG(name, cls){
  return `<svg class="feature-icon ${cls||''}" viewBox="0 0 100 100" fill="none" aria-hidden="true">${ICONS[name]||''}</svg>`;
}
document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = iconSVG(el.getAttribute('data-icon')));

const grain = document.createElement('div');
grain.className = 'grain';
grain.setAttribute('aria-hidden', 'true');
document.body.appendChild(grain);

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
   10) Carrusel de testimonios (scroll nativo + botones)
--------------------------------------------------------- */
const track = document.querySelector('.testi-track');
const prevBtn = document.querySelector('[data-testi-prev]');
const nextBtn = document.querySelector('[data-testi-next]');
if(track && prevBtn && nextBtn){
  const step = () => track.querySelector('.testi-card')?.offsetWidth + 22 || 380;
  prevBtn.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  nextBtn.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
}

/* ---------------------------------------------------------
   11) Año dinámico en el footer
--------------------------------------------------------- */
document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

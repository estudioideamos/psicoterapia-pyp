/* Scroll suave y continuo con la rueda del mouse (Lenis, ver assets/vendor/lenis).
   El touch queda nativo. Con prefers-reduced-motion no se activa y, si la biblioteca no carga,
   el sitio sigue con el scroll nativo. */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (typeof window.Lenis !== 'function' || reduceMotion.matches) return;

  // Para afinar la sensación (la referencia, werender.framer.website, usa lerp 0.1 y multiplicador 1):
  const LERP = 0.075;           // más bajo = desliza más y frena más lento
  const WHEEL_MULTIPLIER = 0.8; // más bajo = avanza menos por cada giro de rueda

  const lenis = new window.Lenis({
    lerp: LERP,
    wheelMultiplier: WHEEL_MULTIPLIER,
    smoothWheel: true,
    syncTouch: false,
    allowNestedScroll: true, // listas con scroll propio (selector de país, reseñas largas) siguen nativas
    autoRaf: true
  });
  window.pypLenis = lenis;
  let active = true;

  // Si la persona activa "reducir movimiento" con la página abierta, se vuelve al scroll nativo.
  reduceMotion.addEventListener('change', event => {
    if (!event.matches || !active) return;
    active = false;
    lenis.destroy();
    window.pypLenis = undefined;
  });

  // El menú móvil bloquea el scroll con body{overflow:hidden}: Lenis también debe frenarse.
  const syncLock = () => {
    if (!active) return;
    if (document.body.style.overflow === 'hidden') lenis.stop();
    else lenis.start();
  };
  syncLock();
  new MutationObserver(syncLock).observe(document.body, { attributes: true, attributeFilter: ['style'] });

  // Anclas internas (#seccion): el navegador saltaría de golpe y Lenis arrancaría desde la posición
  // vieja (la página iría adelante y volvería). Se cancela el salto nativo y se desliza con Lenis, que
  // ya descuenta el scroll-margin-top de cada sección (header fijo).
  document.addEventListener('click', event => {
    if (!active || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest('a[href*="#"]') : null;
    if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || url.search !== window.location.search || !url.hash) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    event.preventDefault();
    lenis.scrollTo(target);
    if (url.hash !== window.location.hash) window.history.pushState(null, '', url.hash);
    // Accesibilidad: el destino recibe el foco (p. ej. "Saltear al contenido"), sin mover el scroll.
    if (!target.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
})();

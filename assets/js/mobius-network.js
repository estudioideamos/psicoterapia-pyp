/* Psicoterapia P&P — red/malla de la cinta de Moebius, en vivo (WebGL/Three.js)
   Geometría paramétrica real de una banda de Moebius, renderizada como red de
   nodos y conexiones (no una foto ni un video): un objeto abstracto propio.
   Degrada con elegancia: si no hay WebGL, JS o el usuario pidió menos
   movimiento, queda la fotografía estática de fondo. */
(function(){
  const mounts = document.querySelectorAll('[data-mobius-network]');
  if(!mounts.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduceMotion || typeof THREE === 'undefined') return;

  mounts.forEach(initNetwork);

  function initNetwork(mount){
  let renderer, scene, camera, group, raf, resizeObs;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  } catch(e){ return; }

  const canvas = renderer.domElement;
  canvas.className = 'mobius-canvas';
  mount.appendChild(canvas);

  const INK = 0x14150f;
  renderer.setClearColor(INK, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.6, 7.2);
  camera.lookAt(0, 0, 0);

  group = new THREE.Group();
  scene.add(group);

  /* ---------- geometría paramétrica de la cinta de Moebius ---------- */
  const U = 140;               // vueltas alrededor del lazo
  const V = 14;                // segmentos a lo ancho de la banda
  const RADIUS = 2.3;
  const WIDTH = 0.95;

  const colorEdge = new THREE.Color(0xc9b385);   // dorado, borde de la banda
  const colorCore = new THREE.Color(0x6f8f49);   // verde, centro de la banda
  const colorSoft = new THREE.Color(0xa9c084);   // verde claro

  function point(u, v){
    const uu = u * Math.PI * 2;
    const vv = (v - 0.5) * WIDTH;
    const half = uu / 2;
    const r = RADIUS + vv * Math.cos(half);
    const x = r * Math.cos(uu);
    const y = r * Math.sin(uu);
    const z = vv * Math.sin(half);
    return [x, y, z];
  }

  const positions = [];
  const colors = [];
  const grid = [];
  for(let i = 0; i <= U; i++){
    const row = [];
    for(let j = 0; j <= V; j++){
      const [x, y, z] = point(i / U, j / V);
      row.push([x, y, z]);
    }
    grid.push(row);
  }

  // nodos (puntos)
  for(let i = 0; i <= U; i++){
    for(let j = 0; j <= V; j++){
      const [x, y, z] = grid[i][j];
      positions.push(x, y, z);
      const edgeT = Math.abs(j / V - 0.5) * 2; // 0 centro -> 1 borde
      const c = colorCore.clone().lerp(colorEdge, Math.pow(edgeT, 1.6));
      colors.push(c.r, c.g, c.b);
    }
  }
  const pointsGeo = new THREE.BufferGeometry();
  pointsGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  pointsGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const pointsMat = new THREE.PointsMaterial({ size: 0.045, vertexColors: true, transparent: true, opacity: 0.95 });
  const cloud = new THREE.Points(pointsGeo, pointsMat);
  group.add(cloud);

  // conexiones (red): a lo largo del lazo y a lo ancho de la banda
  const linePos = [];
  const lineCol = [];
  function pushLine(a, b, t){
    linePos.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    const c = colorCore.clone().lerp(colorSoft, t);
    lineCol.push(c.r, c.g, c.b, c.r, c.g, c.b);
  }
  for(let i = 0; i < U; i++){
    for(let j = 0; j <= V; j++){
      pushLine(grid[i][j], grid[i + 1][j], j / V);
    }
  }
  for(let i = 0; i <= U; i++){
    for(let j = 0; j < V; j++){
      pushLine(grid[i][j], grid[i][j + 1], j / V);
    }
  }
  const linesGeo = new THREE.BufferGeometry();
  linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
  linesGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineCol, 3));
  const linesMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.22 });
  const net = new THREE.LineSegments(linesGeo, linesMat);
  group.add(net);

  group.rotation.x = 0.55;
  group.rotation.z = 0.18;

  /* ---------- tamaño / resize ---------- */
  function resize(){
    const w = mount.clientWidth, h = mount.clientHeight;
    if(!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);
  if('ResizeObserver' in window){
    resizeObs = new ResizeObserver(resize);
    resizeObs.observe(mount);
  }

  /* ---------- animación continua, cinematográfica y lenta ---------- */
  const clock = new THREE.Clock();
  let visible = true;
  let firstFramePainted = false;
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; });

  function tick(){
    raf = requestAnimationFrame(tick);
    if(!visible) return;
    const t = clock.getElapsedTime();
    group.rotation.y = t * 0.16;
    group.rotation.x = 0.55 + Math.sin(t * 0.12) * 0.08;
    camera.position.x = Math.sin(t * 0.05) * 0.6;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    // recién con el primer frame ya pintado hacemos el fundido cruzado,
    // para no mostrar el canvas vacío mientras la foto todavía se ve
    if(!firstFramePainted){
      firstFramePainted = true;
      requestAnimationFrame(() => mount.classList.add('has-network'));
    }
  }
  tick();
  }
})();

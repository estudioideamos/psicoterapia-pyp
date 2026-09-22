# `assets/vendor/three/three.module.min.js`: build recortado, no el oficial de npm

Este archivo **no** es el `three.module.min.js` que publica el paquete `three` en npm. Es un build
propio armado con [esbuild](https://esbuild.github.io/), que incluye solo las clases que usa
`assets/js/mobius-network.js` (la red de fondo animada del hero) y descarta el resto de la
biblioteca (loaders, controles de cámara, post-procesado, materiales que no usamos, etc.).

Por eso su hash en `docs/dependencies.json` no coincide con el que tendría el archivo oficial de
npm para la misma versión: es esperable, no un error de integridad.

## Por qué

El archivo oficial pesa ~730 KB (min, sin comprimir). El recorte, con las mismas 12 clases que
`mobius-network.js` importa, pesa ~535 KB — sobre todo porque `WebGLRenderer` arrastra buena parte
del núcleo de render sin importar qué materiales se usen; no hay mucho más margen sin reescribir
`mobius-network.js` para usar menos superficie de la API. Ya se carga de forma diferida
(`requestIdleCallback` en `main.js`, después de que el resto de la página cargó), así que esto no
afecta el primer pintado ni la carga percibida — es puro ahorro de transferencia y batería para
quien sí llega a ver la animación.

## Cómo reconstruirlo (por ejemplo, al subir de versión `three`)

```bash
mkdir /tmp/three-build && cd /tmp/three-build
npm init -y
npm install three@<version> esbuild@latest

cat > entry.js <<'EOF'
export {
  BufferGeometry, Clock, Color, Float32BufferAttribute, Group,
  LineBasicMaterial, LineSegments, PerspectiveCamera, Points,
  PointsMaterial, Scene, WebGLRenderer
} from 'three';
EOF

node node_modules/esbuild/bin/esbuild entry.js --bundle --minify --format=esm \
  --outfile=three.custom.min.js
```

Si `assets/js/mobius-network.js` empieza a usar una clase de `THREE` que no está en esa lista
(`grep -oE 'THREE\.[A-Za-z0-9_]+' assets/js/mobius-network.js | sort -u` para confirmar), agregarla
al `entry.js` antes de reconstruir.

Después: copiar `three.custom.min.js` a `assets/vendor/three/three.module.min.js`, actualizar su
hash SHA-256 en `docs/dependencies.json`, y verificar visualmente que la cinta de Moebius se sigue
viendo igual en el navegador (no hay test automático para el render de WebGL).

La licencia (`assets/vendor/three/LICENSE`) sigue siendo la de la versión de `three` instalada —
copiarla del paquete de npm sin modificar.

# Psicoterapia P&P

[![Verificación del sitio](https://github.com/estudioideamos/psicoterapia-pyp/actions/workflows/verify.yml/badge.svg)](https://github.com/estudioideamos/psicoterapia-pyp/actions/workflows/verify.yml)

Sitio institucional: **https://psicoterapiapyp.com/**.
HTML, CSS y JavaScript; formulario PHP en hosting Apache/cPanel. No requiere compilación ni WordPress.

## Estructura
- Páginas públicas: `index.html`, `quienes-somos.html`, `servicios.html`, `preguntas-frecuentes.html`, `contacto.html`.
- Confirmación de contacto: `gracias/index.html`.
- Formulario: `enviar-consulta.php`.
- Recursos y bibliotecas locales: `assets/`.
- Despliegue: `.cpanel.yml`, `scripts/deploy-*.sh`.
- SEO y servidor: `robots.txt`, `sitemap.xml`, `.htaccess`.

## Desarrollo y validación
Para previsualizar las páginas: `python -m http.server 8000`.
Para ejecutar PHP: `php -S localhost:8000` (la entrega de correo depende del hosting).
Antes de integrar cambios: `python scripts/validate-site.py` y `php -l enviar-consulta.php`.
Las reseñas reales requieren el dominio autorizado en Google Cloud; localhost puede mostrar el respaldo.

## Flujo de cambios
Crear una rama `codex/descripcion` o `fix/descripcion`, abrir un pull request y esperar el control **Site checks**. Integrar mediante squash. `main` queda protegida contra borrados, force push y cambios sin PR/verificación, también para administradores. No se exige aprobación de otra persona para no bloquear el mantenimiento individual.

## Publicación
GitHub almacena el código; **la producción se publica en cPanel, no en GitHub Pages**.
1. Integrar el PR en `main` y comprobar Actions.
2. En Git Version Control de cPanel: **Update from Remote**.
3. Comprobar el commit y pulsar **Deploy HEAD Commit**.
4. Revisar la web pública en escritorio y celular: navegación, hero, footer y formulario; confirmar recepción del correo solo con una prueba autorizada.
5. Revisar Analytics con el gestor. Publicar código no publica cambios de GTM.

Los scripts preservan la configuración ajena del hosting. No sustituir `.htaccess` manualmente. Ante una regresión, revertir el cambio mediante PR y volver a desplegar. Mantener además una copia de seguridad del hosting y del correo.

## Mantenimiento y seguridad
- [Política de seguridad](SECURITY.md).
- [Guía de contribución](CONTRIBUTING.md).
- [Formulario y protección contra spam](docs/formulario-antispam.md).
- [Reseñas de Google](docs/google-reviews.md).
- [Inventario de bibliotecas](docs/dependencies.json).
- [Configuración de GitHub](docs/github.md).

El repositorio público no incluye una licencia de reutilización del diseño o del contenido. Se conservan las licencias de las bibliotecas de terceros en `assets/vendor/`. Los informes de cliente se mantienen fuera de Git.

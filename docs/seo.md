# SEO del sitio público

Las cinco páginas públicas tienen títulos y descripciones propios, un H1 descriptivo,
canonical absoluto y metadatos sociales sin duplicados. Organization y WebSite
identifican al equipo; cada página se identifica en JSON-LD y las interiores incluyen
BreadcrumbList. No se incorporan estrellas de reseñas como marcado del negocio.

Los enlaces de inicio apuntan a `/`. `deploy-redirects.sh` consolida `index.html`,
el host `www` y las antiguas rutas sin extensión con redirecciones 301; conserva
los parámetros de consulta y las reglas del hosting. HTTPS ya lo impone el servidor.

El sitemap contiene exclusivamente las cinco páginas públicas. La página de
agradecimiento tiene noindex. El blog sigue en borrador, sin enlaces ni sitemap,
y sus rutas se bloquean mediante `deploy-blog-status.sh`.

La imagen de portada se sirve como WebP (41.264 bytes frente a 78.785 del JPEG),
con precarga coincidente y dimensiones explícitas. Se mantienen los atributos alt
vacíos en imágenes decorativas.

## Comprobaciones y mantenimiento

- Ejecutar `node scripts/check-seo.mjs` antes de publicar (también corre en CI).
- Revisar título, descripción, H1 y JSON-LD juntos cuando cambie una página.
- No agregar servicios, matrículas, direcciones ni credenciales sin confirmación.
- Mantener sitemap y enlaces sincronizados con las páginas realmente públicas.
- En Search Console, revisar indexación, enviar `/sitemap.xml` y observar consultas,
  clics y Core Web Vitals. La prueba local no sustituye las métricas de usuarios reales.
- Antes de publicar contenido psicológico nuevo, solicitar revisión profesional.

Estas mejoras facilitan el rastreo y la comprensión del contenido; no garantizan
posiciones ni plazos de indexación en Google.

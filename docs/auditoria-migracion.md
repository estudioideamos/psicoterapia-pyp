# Revisión técnica — 2026-09-09

## Incluido en esta entrega
- Títulos y descripciones propios por página, canonical y Open Graph con URLs del dominio actual.
- Sitemap con las cinco páginas públicas. Página de gracias con noindex y fuera del sitemap.
- Datos estructurados Organization, WebSite, WebPage y BreadcrumbList. Sin cifras de reseñas estáticas en schema ni especialidad médica incorrecta.
- Contenido principal disponible en HTML para buscadores y lectores automatizados.
- Cuatro imágenes WebP, ahorro combinado de 197.997 bytes frente a sus JPG.
- Three.js 0.186.0 local, carga diferida y menor geometría/resolución en móvil; imagen alternativa sin WebGL.
- intl-tel-input 29.2.3 local, con caché versionada.
- Cabeceras de seguridad, compresión y caché de recursos. Acceso HTTP bloqueado a configuraciones ocultas, logs, copias y directorios de desarrollo.
- El despliegue inserta un bloque de configuración y conserva las reglas existentes de PHP/cPanel y las redirecciones.
- Conservados formulario directo, avisos en página, página de gracias y selectores usados por GTM.
- Conservadas etiquetas, eventos y decisiones de objetivos/conversiones de la agencia.

## Comprobado
- Seis páginas a 390 y 1366 px: sin desbordamiento horizontal, un H1 y JSON-LD válido.
- Hero WebGL y selector telefónico funcionando; validaciones en página. Sin errores JS.
- Enlaces a archivos locales válidos.
- Dos ejecuciones del despliegue de seguridad mantienen las reglas anteriores sin duplicar el bloque.
- npm audit del paquete de dependencias revisado: cero vulnerabilidades conocidas.
- Dominio respondió HTTP 200 antes de desplegar este paquete.
- No se enviaron formularios reales ni eventos a Google durante estas pruebas.

## Comprobación posterior al despliegue
- Verificar cabeceras, compresión, sitemap, robots y bloqueo de logs/configuraciones por HTTP.
- Enviar sitemap.xml desde Search Console.
- Las versiones y actualizaciones del sistema operativo, servidor PHP/correo y panel corresponden al hosting; esta revisión no las certifica.
- Las reseñas siguen sin sincronización automática hasta configurar Google Maps/Places.
- La configuración antispam existente limita envíos y valida en servidor. No implica eliminación absoluta del spam.
- No se garantiza posicionamiento ni aparición en respuestas de IA.

## Fuentes técnicas
https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
https://www.php.net/manual/en/function.mail.php

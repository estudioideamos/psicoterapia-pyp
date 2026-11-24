# Blog editorial de Psicoterapia P&P

Estado: **borrador, retirado del sitio público a pedido del cliente**. Se conservan los cuatro artículos y sus imágenes en el repositorio. No hay enlaces al blog en la navegación pública ni entradas en el sitemap. `scripts/deploy-blog-status.sh` hace que `/blog/`, sus artículos y sus imágenes devuelvan 404, incluso si quedan archivos de un despliegue anterior. `.cpanel.yml` ya no publica la carpeta blog y mantiene esta restricción.

Para volver a publicar se necesita autorización del cliente: quitar el bloque `PYP blog draft` del hosting y su instalador del despliegue, restaurar navegación y sitemap y volver a incluir la copia de `blog/`. Generar las páginas por sí solo no las hace públicas.

## Hosting actual

Verificado el 24 de noviembre de 2026: `psicoterapiapyp.com` apunta a `167.250.5.107`, servidor `roma.servidoraweb.net`, SSH 9022, usuario `psicoterapiapyp`. El document root confirmado por cPanel es `/home2/psicoterapiapyp/public_html` y el repositorio está en `/home2/psicoterapiapyp/repositories/psicoterapia-pyp`. El servidor anterior Apofis (`167.250.5.35`, `/home18/…`) ya no sirve el dominio. No usarlo para publicaciones futuras.

## Edición y publicación

- Contenido: `scripts/blog-content.json`. Cada entrada tiene slug, categoría, título, descripción, imagen, secciones y fuentes.
- Generación: `node scripts/build-blog.mjs`. Produce HTML estático; no necesita JavaScript para indexar o leer los artículos. Toma el header y footer de `quienes-somos.html` y convierte sus recursos a rutas absolutas desde la raíz del dominio.
- Diseño específico: `assets/css/blog.css`. Navegación compartida: `assets/css/style.css`.
- Al agregar una nota, incorporar sus imágenes y URL en `sitemap.xml`; revisar también la fecha editorial del generador. No modificar fechas para simular actualizaciones.
- `.cpanel.yml` incluye la carpeta blog. No se publican scripts, fuentes de contenido ni documentación interna.
- Ejecutar `python scripts/validate-site.py`, `node scripts/build-blog.mjs` y revisión responsive antes de publicar. Validar títulos, enlaces, índice, menú y modo oscuro.

## Contenido y SEO

Canonical individual, título y descripción únicos, Open Graph/Twitter, `BlogPosting`/`BreadcrumbList` en artículos y `CollectionPage`/`ItemList` en portada. Enlaces internos a notas relacionadas, equipo y contacto. No se promete posicionamiento ni se atribuye revisión clínica que no haya ocurrido. Autor editorial: Psicoterapia P&P (organización). Fuentes institucionales enlazadas en cada nota; contenido informativo, sin diagnósticos individuales.

## Imágenes

Cuatro originales generados con Magnific, Google Nano Banana 2.1, 65 créditos cada uno (260 total). Proyecto: Psicoterapia P&P. Son escenas ilustrativas, no testimonios ni fotografías del consultorio real; se explicita en las páginas. Sin textos superpuestos.

- Cuándo empezar: https://www.magnific.com/app/creation/79ClWLLJAL
- Primera entrevista: https://www.magnific.com/app/creation/LwIkZ1KswO
- Terapia online: https://www.magnific.com/app/creation/XmNM5diBfo
- Límites: https://www.magnific.com/app/creation/iGKPXZA3uK

WebP de 480, 960 y 1200 px con `srcset`, dimensiones explícitas y carga diferida excepto la portada visible inicialmente. JPG de 1200 × 630 para compartir en redes. Los archivos servidos son locales, sin depender de URLs temporales de Magnific.

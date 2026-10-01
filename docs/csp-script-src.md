# CSP de scripts: en observación, todavía no bloquea

La auditoría del 30/09/2026 (`docs/auditoria-seguridad-2026-09.md`) dejó `script-src` fuera de la
CSP que ya bloquea (`base-uri`, `object-src`, `frame-ancestors`, `form-action`) porque Google Tag
Manager puede cargar, desde dentro de su contenedor, cualquier script que alguien le haya
configurado — y eso no se ve leyendo el código del sitio.

Para no adivinar, se agregó un segundo encabezado, `Content-Security-Policy-Report-Only`, con un
borrador de `script-src`/`style-src`/`img-src`/`font-src`/`connect-src`/`frame-src`. Un CSP
"Report-Only" **nunca bloquea nada**: el navegador solo avisa en la consola (`Refused to...` /
`violated the following Content Security Policy directive`) cuando algo no está en la lista. Sirve
para ver qué hace falta permitir antes de exigirlo de verdad.

## Qué incluye el borrador y por qué

- `script-src`: `'self'` + `googletagmanager.com`, `google.com`, `gstatic.com` (GTM y reCAPTCHA v3).
  No se necesitó `'unsafe-inline'`: no hay `onclick=` ni similares en el HTML, todo el JS está en
  archivos propios.
- `style-src`: `'self'` + `'unsafe-inline'` + `fonts.googleapis.com`. Hacen falta los estilos en
  línea (`style="..."`): hay 14 en las páginas y reCAPTCHA agrega los suyos.
- `font-src`: `fonts.gstatic.com`.
- `img-src` / `connect-src`: `google.com`/`gstatic.com`/`googletagmanager.com`, para el badge y las
  llamadas de reCAPTCHA y de GTM.
- `frame-src`: `google.com`, por el iframe del desafío de reCAPTCHA.

**Lo que no cubre:** si dentro del contenedor de GTM hay tags de Google Analytics, Ads u otro
proveedor, van a pedir dominios que no están en esta lista (`www.google-analytics.com`,
`analytics.google.com`, `googleads.g.doubleclick.net`, Meta Pixel, etc.). Como es Report-Only, no
van a dejar de funcionar — simplemente van a aparecer como violación en la consola.

## Cómo seguir

1. Quien administre GTM revisa, en Tag Manager, qué tags están publicados y a qué dominios llaman.
2. Navegar el sitio con la consola del navegador abierta (F12 → Console) unos días y anotar
   cualquier línea `Content-Security-Policy-Report-Only` con dominios que falten.
3. Sumar esos dominios al borrador de `.htaccess` (la línea `Content-Security-Policy-Report-Only`).
4. Cuando no aparezcan más violaciones nuevas durante unos días, copiar ese mismo `script-src`
   (y el resto de directivas) a la línea `Content-Security-Policy` de arriba —ya bloqueante— y
   quitar la línea `-Report-Only`.

No hay endpoint de reporte automático (`report-to`) configurado: no hay backend propio para
recibirlos, así que por ahora la revisión es manual, por consola.

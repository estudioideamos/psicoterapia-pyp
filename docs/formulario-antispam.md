# Formulario de contacto: protección contra spam

El formulario de `contacto.html` y de `index.html` envía a `enviar-consulta.php`, que entrega el correo con el `mail()` del hosting a `consultas@psicoterapiapyp.com`.

## Controles activos (sin configuración)
1. **Token firmado de un solo uso.** Al abrirse, el formulario pide `enviar-consulta.php?t=1` y guarda el token en el campo oculto `_t`. El servidor exige que sea auténtico, que tenga entre 3 segundos y 6 horas y que no se haya usado. Un bot que publica directo al handler no lo tiene.
2. **Origin o Referer obligatorio** y de `psicoterapiapyp.com`. Antes solo se comprobaba si el encabezado venía, y los bots simplemente lo omiten.
3. **Honeypot** `_honey` (ya existía).
4. **Filtros de contenido conservadores:** rechaza nombres con URL o email, más de un enlace, HTML (`<a>`, `<script>`, `<iframe>`, `[url=`) y mensajes casi sin letras.
5. **Sin duplicados:** el mismo email con el mismo mensaje en 24 h se responde como enviado, pero no se reenvía el correo.
6. **Límites por hora:** 5 por IP y 30 en total (antes 100). Solo cuentan los envíos que pasaron todos los controles anteriores, por lo que el spam bloqueado no consume el cupo. Si el hosting falla al enviar, el cupo se devuelve.

Se guardan solo contadores y huellas con vencimiento, en `sys_get_temp_dir()/pyp-contact-*` (fuera de `public_html`): la IP y los mensajes no se guardan en claro. Si el hosting limpia esa carpeta se regenera la clave de firma y los formularios que estaban abiertos deben recargarse.

## reCAPTCHA v3 (opcional, se activa sin volver a desplegar)
Sin claves no se carga nada de Google. Para activarlo:

1. Crear claves **reCAPTCHA v3** en <https://www.google.com/recaptcha/admin> para `psicoterapiapyp.com`. Si el sitio anterior usaba v3 con este dominio pueden servir sus claves; con v2 no.
2. Crear en el hosting, **fuera de `public_html`**, el archivo `/home18/psicoterapiapyp/pyp-contact-secrets.php` (permisos `600`; no subirlo a Git):

```php
<?php
define('PYP_RECAPTCHA_SITE_KEY', 'CLAVE_DE_SITIO');
define('PYP_RECAPTCHA_SECRET', 'CLAVE_SECRETA');
// Opcionales:
// define('PYP_RECAPTCHA_MIN_SCORE', 0.5);            // 0.0 a 1.0; más alto = más estricto
// define('PYP_EXTRA_ORIGINS', ['https://staging.ejemplo.com']);
```

3. Recargar la página de contacto: el formulario carga `api.js` de Google y muestra el aviso legal que exige Google (el distintivo flotante se oculta). Para desactivarlo, quitar `PYP_RECAPTCHA_SECRET` del archivo.

Si Google no responde, el envío no se bloquea (quedan el resto de los controles) y se registra un aviso en el `error_log`.

## Verificar tras un despliegue
Ninguna de estas pruebas envía correo:

```bash
curl -s "https://psicoterapiapyp.com/enviar-consulta.php?t=1"          # {"ok":true,"token":"...","recaptcha":null}
curl -s -X POST -H "Accept: application/json" -d "Nombre=x&Email=x@x.com&Mensaje=1234567890" https://psicoterapiapyp.com/enviar-consulta.php   # 403: falta Origin/Referer
```

Una prueba real desde el formulario requiere autorización (llega a la casilla del cliente).

## Límites conocidos
- No elimina el spam de forma absoluta: un bot que abra la página en un navegador real y espere puede pasar los controles sin reCAPTCHA. Por eso conviene activarlo.
- Antes de esta versión, el campo `Teléfono internacional` nunca llegaba al correo (PHP convierte los espacios de los nombres de campo en `_`); ahora llega con el código de país.

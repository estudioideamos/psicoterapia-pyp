# Seguridad y rendimiento — revisión del 30/09/2026

Referencia: [OWASP Top 10:2025](https://top10.owasp.org/2025/). Es una guía de riesgos, no una certificación ni una garantía de seguridad absoluta.

## Cambios aplicados al código

- El formulario responde con error temporal si falla reCAPTCHA configurado, su configuración o el almacenamiento de sus controles; no omite la verificación ante un fallo de red.
- Escritura comprobada de la clave de firma y del estado; un JSON de estado corrupto no reinicia silenciosamente los límites.
- Errores internos genéricos para el visitante, con registro técnico sin nombres, mensajes ni emails.
- Límites de tiempo en solicitudes del navegador y en la verificación externa; se mantiene el texto del usuario ante un fallo.
- Límite de cuerpo de 20.000 bytes en Apache para el formulario, además del control en PHP.
- CSP básica: restringe base URL, objetos, marcos contenedores y destino de formularios. No restringe todavía script-src: requiere inventario y prueba coordinada de las etiquetas de GTM.
- Bloqueo de la carpeta entregables si accidentalmente se copia al sitio.
- Three.js 0.186.1, intl-tel-input 29.5.3, Lenis 1.3.26; versiones exactas y lockfile. Esbuild 0.28.2 reconstruye el vendor recortado.
- Dependabot vigila también npm. CI verifica que las versiones declaradas coincidan con el manifiesto de los archivos copiados.
- La animación WebGL cancela su bucle cuando está fuera de pantalla o la pestaña está oculta y lo reinicia al volver. No se afirma una mejora porcentual de velocidad sin medición de campo.

## Cobertura OWASP

| Riesgo | Evidencia y límite |
| --- | --- |
| A01 Acceso | No hay cuentas de usuario ni panel público en esta aplicación. Origen y tokens del formulario validados; cuentas de hosting/GitHub requieren control aparte. |
| A02 Configuración | Cabeceras, bloqueo de archivos sensibles y límite de solicitud. CSP de scripts y configuración efectiva de PHP pendientes de revisión en servidor. |
| A03 Cadena de suministro | Versiones fijadas, auditoría npm, acciones fijadas por SHA, hashes de vendor y compilación reproducible. |
| A04 Criptografía | HTTPS/HSTS observados en producción; tokens con random_bytes y HMAC. No se auditó TLS del transporte de correo. |
| A05 Inyección | No hay consultas SQL. Email validado contra inyección de cabeceras; validación de tipos/longitudes; reseñas se insertan con textContent. |
| A06 Diseño | Límites por IP y global, expiración, token de un solo uso y deduplicación; no sustituyen un WAF contra ataques distribuidos. |
| A07 Autenticación | No hay login en el sitio; revisar 2FA y permisos de cuentas externas. |
| A08 Integridad | PR obligatorio, CI, lockfile y hashes. El mantenimiento debe reconstruir y revisar vendor al cambiar versiones. |
| A09 Registros | Se registran fallos técnicos sin contenido de consultas. Alertas y retención del hosting no fueron configuradas en esta revisión. |
| A10 Excepciones | Fallos de CAPTCHA, configuración, firma y persistencia detienen el envío; errores genéricos y reintentos controlados. |

## Verificación

GitHub Actions: 32 comprobaciones aisladas del formulario (incluye éxito con mail simulado, origen inválido, tokens reutilizados, duplicados, límites, correo fallido, CAPTCHA inaccesible y estado corrupto), sintaxis PHP/JS/shell, seis páginas y nueve hashes de vendor. Ningún correo real enviado. npm audit de las dependencias de producción: 0 vulnerabilidades conocidas en esta revisión.

Antes de modificar el servidor se observó HTTP 200, no-cache para HTML, HSTS, nosniff, SAMEORIGIN, Referrer-Policy y Permissions-Policy. La comprobación posterior al despliegue confirmó también la nueva CSP y el bloqueo HTTP 403 de /.git/config, /package.json, /docs/ y /entregables/. El endpoint entrega un token firmado, anuncia reCAPTCHA configurado y rechaza un POST de origen ajeno con 403.

## Publicación completada y pendientes externos

1. Publicado por SSH el 30/09/2026: commit 1c807de, después de comprobar sintaxis en PHP 8.3. Respaldo privado previo: backups/pyp-security-20260930-105720.tar.gz, fuera de public_html. Se ejecutaron las mismas tareas revisadas de .cpanel.yml.
2. SSH operativo en apofis.servidoraweb.net:9022, con la clave existente del proyecto. El dominio está asignado a PHP 8.3; el CLI predeterminado usa otra versión, por lo que se validó con el binario ea-php83.
3. Pendiente de revisión del proveedor/titular: parches de Apache/nginx, copias con restauración probada, 2FA y protección del correo en hosting. Esta intervención generó un respaldo de archivos, no una prueba de restauración completa.
4. Google Cloud: comprobar restricciones de dominio/API de la clave pública de Maps y configurar cuotas/avisos de gasto. No se cerró la alerta de esa clave sin verificar Cloud.
5. Acordar una CSP de scripts con quien administra GTM; probar en modo de reporte antes de imponerla.
6. Configurar revisión de logs y avisos operativos del hosting; revisar el tratamiento y conservación de consultas fuera de la web.

No se realizó un pentest invasivo ni una prueba de carga contra producción.

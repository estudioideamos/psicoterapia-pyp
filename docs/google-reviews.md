# Reseñas de Google en producción

El sitio está alojado en cPanel. El navegador consulta Maps JavaScript / Places API (New) al acercarse a la sección de reseñas, una vez por carga de página. No hay sincronización semanal ni caché compartida configurada.

Google devuelve hasta cinco reseñas; el sitio muestra las de cuatro y cinco estrellas sin alterar puntuación ni autoría. Conserva el respaldo si la consulta falla. Una visita que no llega a la sección no debe iniciar esa consulta.

La clave pública está en `assets/js/reviews-config.js`. Verificar en Cloud:
- Restricción de sitios: `https://psicoterapiapyp.com/*` y `https://www.psicoterapiapyp.com/*`.
- APIs permitidas solo según el uso actual: Maps JavaScript API y Places API (New). Revisar si aún se necesita Places heredada antes de retirarla.
- Facturación vinculada, cuotas disponibles y alertas de presupuesto. Las alertas no detienen automáticamente el gasto.

No añadir permisos para localhost o dominios de pruebas a la clave de producción sin una necesidad concreta. No almacenar respuestas ni datos de pacientes en el repositorio.

Referencia: https://developers.google.com/maps/documentation/javascript/place-reviews

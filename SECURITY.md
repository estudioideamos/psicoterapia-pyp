# Seguridad

No publicar contraseñas, tokens, datos de pacientes, mensajes del formulario ni informes privados en issues, PRs o commits.

Para informar una vulnerabilidad, usar **Security → Report a vulnerability** en GitHub. Incluir el archivo afectado, pasos mínimos y alcance; nunca datos reales de pacientes.

La clave de Maps utilizada en el navegador es visible por diseño. Debe estar limitada en Google Cloud a los dominios de producción y a las APIs utilizadas. GitHub no impone esas restricciones ni los límites de facturación. La alerta existente requiere comprobarlas en Cloud; no equivale automáticamente a una credencial de servidor comprometida.

Si se publica un secreto de servidor, revocarlo/rotarlo primero y revisar su uso antes de limpiar el historial. No basta con borrarlo del último commit.

Mantener PHP, hosting y bibliotecas actualizados. GitHub Actions comprueba sintaxis, referencias locales e integridad de bibliotecas; no garantiza ausencia de vulnerabilidades ni reemplaza pruebas funcionales.

Responsables con acceso deben utilizar 2FA y conservar códigos de recuperación. La seguridad de las cuentas y de cPanel se administra por separado.

# Administración de GitHub

- Producción en `main`, integración por PR con control **Site checks** y squash.
- Bloqueados force push y eliminación de `main`; controles aplicables a administradores.
- Actions con token de lectura, acciones fijadas por SHA y tiempo máximo de diez minutos.
- Dependabot semanal para GitHub Actions. Las bibliotecas locales requieren revisión manual.
- Detección de secretos y protección de push; avisos de vulnerabilidades y reportes privados habilitados.
- Los avisos de seguridad abiertos deben evaluarse, no cerrarse para mejorar indicadores.
- Despliegue manual a cPanel: no hay credenciales de producción en Actions.

GitHub no configura la facturación de Google, las restricciones de Maps, la seguridad de cPanel ni la autenticación de los miembros. Revisar esos servicios por separado.

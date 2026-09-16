# Cambios en el sitio

1. Crear una rama desde `main` actualizada.
2. Mantener rutas públicas, IDs y selectores usados por GTM salvo cambio coordinado con el gestor.
3. Probar escritorio y móvil, modos claro/oscuro y movimiento reducido cuando corresponda.
4. Ejecutar `python scripts/validate-site.py`; no incorporar archivos privados ni salidas de pruebas.
5. Abrir PR con problema, solución, validación y necesidad de despliegue. Integrar solo con **Site checks** aprobado.

Las bibliotecas de `assets/vendor/` están copiadas al repositorio. Dependabot actualiza referencias de Actions, pero no esos archivos. Para actualizar bibliotecas: obtener una versión oficial, conservar licencia, revisar avisos de seguridad, probarla y actualizar versiones/hashes de `docs/dependencies.json`. No modificar hashes para ocultar cambios no revisados.

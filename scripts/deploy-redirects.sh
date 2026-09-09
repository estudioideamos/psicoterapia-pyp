#!/bin/bash
set -euo pipefail
target="/home18/psicoterapiapyp/public_html/.htaccess"
marker="# BEGIN PYP legacy redirects"
if [ -f "$target" ] && grep -Fqx "$marker" "$target"; then
  exit 0
fi
if [ -L "$target" ]; then
  echo "Refusing to replace a symbolic link: $target" >&2
  exit 1
fi
tempfile=$(mktemp "/home18/psicoterapiapyp/public_html/.htaccess-pyp.XXXXXX")
trap 'rm -f "$tempfile"' EXIT
cat > "$tempfile" <<'RULES'
# BEGIN PYP legacy redirects
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteRule ^(servicios|contacto|quienes-somos|preguntas-frecuentes)/?$ /$1.html [R=301,L]
</IfModule>
# END PYP legacy redirects

RULES
if [ -f "$target" ]; then
  cat "$target" >> "$tempfile"
fi
chmod 644 "$tempfile"
mv "$tempfile" "$target"
trap - EXIT

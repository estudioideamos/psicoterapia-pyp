#!/bin/bash
set -euo pipefail
target="/home2/psicoterapiapyp/public_html/.htaccess"
marker="# BEGIN PYP legacy redirects"
if [ -L "$target" ]; then
  echo "Refusing to replace a symbolic link: $target" >&2
  exit 1
fi
tempfile=$(mktemp "/home2/psicoterapiapyp/public_html/.htaccess-pyp.XXXXXX")
trap 'rm -f "$tempfile"' EXIT
cat > "$tempfile" <<'RULES'
# BEGIN PYP legacy redirects
<IfModule mod_rewrite.c>
RewriteEngine On
# Only redirect explicit requests for index.html, never DirectoryIndex rewrites.
RewriteCond %{THE_REQUEST} \s/+index\.html(?:[?\s]) [NC]
RewriteRule ^index\.html$ https://psicoterapiapyp.com/ [R=301,L]
RewriteRule ^(servicios|contacto|quienes-somos|preguntas-frecuentes)/?$ https://psicoterapiapyp.com/$1.html [R=301,L]
RewriteCond %{HTTP_HOST} ^www\.psicoterapiapyp\.com(?::[0-9]+)?$ [NC]
RewriteRule ^ https://psicoterapiapyp.com%{REQUEST_URI} [R=301,L]
</IfModule>
# END PYP legacy redirects

RULES
if [ -f "$target" ]; then
  # Replace our block on subsequent deploys, preserving hosting/security rules.
  awk '/^# BEGIN PYP legacy redirects$/{skip=1;next} /^# END PYP legacy redirects$/{skip=0;next} !skip' "$target" >> "$tempfile"
fi
chmod 644 "$tempfile"
mv "$tempfile" "$target"
trap - EXIT

#!/bin/bash
# Blog is a draft: keep source files, but return 404 for public routes.
set -euo pipefail
# nginx may serve static images without consulting Apache's rewrite rules.
# Archive this exact directory outside the document root, without deleting it.
images="/home2/psicoterapiapyp/public_html/assets/img/blog"
if [ -L "$images" ]; then
  echo "Refusing symbolic link: $images" >&2
  exit 1
fi
if [ -d "$images" ]; then
  mkdir -p /home2/psicoterapiapyp/drafts
  archive=$(mktemp -d /home2/psicoterapiapyp/drafts/blog-images.XXXXXX)
  mv -- "$images" "$archive/images"
fi
target="/home2/psicoterapiapyp/public_html/.htaccess"
if [ -L "$target" ]; then
  echo "Refusing symbolic link: $target" >&2
  exit 1
fi
tempfile=$(mktemp "/home2/psicoterapiapyp/public_html/.htaccess-blog.XXXXXX")
trap 'rm -f "$tempfile"' EXIT
{
  echo '# BEGIN PYP blog draft'
  echo '<IfModule mod_rewrite.c>'
  echo 'RewriteEngine On'
  echo 'RewriteRule ^blog(/|$) - [R=404,L]'
  echo 'RewriteRule ^assets/img/blog(/|$) - [R=404,L]'
  echo '</IfModule>'
  echo '# END PYP blog draft'
  if [ -f "$target" ]; then
    awk '/^# BEGIN PYP blog draft$/{skip=1;next} /^# END PYP blog draft$/{skip=0;next} !skip' "$target"
  fi
} > "$tempfile"
chmod 644 "$tempfile"
mv "$tempfile" "$target"
trap - EXIT

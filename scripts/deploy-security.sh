#!/bin/bash
set -euo pipefail
target="/home18/psicoterapiapyp/public_html/.htaccess"
source_file="$(cd "$(dirname "$0")/.." && pwd)/.htaccess"
if [ -L "$target" ]; then
  echo "Refusing to replace symbolic link: $target" >&2
  exit 1
fi
tempfile=$(mktemp "/home18/psicoterapiapyp/public_html/.htaccess-pyp.XXXXXX")
trap 'rm -f "$tempfile"' EXIT
{
  echo "# BEGIN PYP security"
  cat "$source_file"
  echo "# END PYP security"
  echo
  if [ -f "$target" ]; then
    awk '/^# BEGIN PYP security$/{skip=1;next} /^# END PYP security$/{skip=0;next} !skip' "$target"
  fi
} > "$tempfile"
chmod 644 "$tempfile"
mv "$tempfile" "$target"
trap - EXIT

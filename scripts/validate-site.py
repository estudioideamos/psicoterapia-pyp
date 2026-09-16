"""Offline checks: local HTML references and committed vendor integrity."""
import hashlib
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
errors = []
class References(HTMLParser):
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key not in ("src", "href", "action") or not value:
                continue
            url = urlsplit(value)
            if url.scheme or url.netloc or not url.path:
                continue
            target = (ROOT if url.path.startswith("/") else self.page.parent) / unquote(url.path).lstrip("/")
            if not target.exists():
                errors.append(f"{self.page.relative_to(ROOT)}: missing {url.path}")

pages = list(ROOT.glob("*.html")) + list((ROOT / "gracias").glob("*.html"))
for page in pages:
    parser = References()
    parser.page = page
    parser.feed(page.read_text(encoding="utf-8"))
manifest = json.loads((ROOT / "docs/dependencies.json").read_text(encoding="utf-8"))
for name, expected in manifest["sha256"].items():
    path = ROOT / name
    if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != expected:
        errors.append(f"Vendor integrity mismatch: {name}")
if errors:
    raise SystemExit("\n".join(errors))
print(f"OK: {len(pages)} pages and {len(manifest['sha256'])} vendor files")

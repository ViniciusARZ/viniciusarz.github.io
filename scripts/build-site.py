"""Prepare the Pages artifact without modifying source files."""

import os
from pathlib import Path
import re
import shutil


measurement_id = os.environ.get("GA_MEASUREMENT_ID", "")
if not re.fullmatch(r"G-[A-Z0-9]+", measurement_id):
    raise SystemExit("Set GA_MEASUREMENT_ID to a valid GA4 measurement ID before building.")

source = Path(__file__).resolve().parent.parent
destination = source / "_site"
destination.mkdir(exist_ok=True)

for filename in (
    "index.html", "about.html", "header.html", "footer.html",
    "styles.css", "script.js", "robots.txt", "sitemap.xml", "CNAME",
):
    shutil.copy2(source / filename, destination / filename)

for directory in ("assets", "case_studies"):
    shutil.copytree(source / directory, destination / directory, dirs_exist_ok=True)

snippet = f"""
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id={measurement_id}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());
      gtag('config', '{measurement_id}');
    </script>"""

# about.html redirects to the homepage; header/footer are fetched fragments.
pages = [destination / "index.html", *sorted((destination / "case_studies").glob("*.html"))]
for page in pages:
    html = page.read_text(encoding="utf-8")
    page.write_text(html.replace("<head>", "<head>" + snippet, 1), encoding="utf-8")

print(f"Prepared {len(pages)} pages with Analytics in _site/.")

"""Prepare a standalone CalcForge publishing folder for a real origin or subpath."""

import argparse
from pathlib import Path
import re
import shutil
from urllib.parse import urlsplit

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("site_url", help="Public HTTPS URL, including any project subpath")
parser.add_argument("output", type=Path, help="New directory for deployable files")
args = parser.parse_args()

site_url = args.site_url.rstrip("/")
url = urlsplit(site_url)
if (
    url.scheme != "https"
    or not url.hostname
    or url.username is not None
    or url.query
    or url.fragment
    or any(part in (".", "..") for part in url.path.split("/"))
    or not re.fullmatch(r"https://[a-zA-Z0-9.-]+(?::[0-9]+)?(?:/[a-zA-Z0-9._~-]+)*", site_url)
    or url.hostname in {"example.com", "localhost"}
):
    parser.error("Provide a real HTTPS site URL without credentials, query, or fragment.")

source = Path(__file__).resolve().parent
output = args.output.resolve()
if output == source or source in output.parents:
    parser.error("Choose a new output directory outside the static site source folder.")

try:
    output.mkdir(parents=True, exist_ok=False)
except FileExistsError:
    parser.error("The output path already exists. Choose a new directory.")

for path in sorted(source.glob("*.html")):
    content = path.read_text(encoding="utf-8").replace("https://example.com", site_url)
    if path.name == "404.html":
        content = re.sub(r'(href|src)="/(?!/)', lambda match: f'{match[1]}="{url.path}/', content)
    (output / path.name).write_text(content, encoding="utf-8")

for name in ("robots.txt", "sitemap.xml"):
    content = (source / name).read_text(encoding="utf-8")
    (output / name).write_text(content.replace("https://example.com", site_url), encoding="utf-8")

for name in (".nojekyll", "favicon.svg", "script.js", "social.png", "styles.css"):
    shutil.copyfile(source / name, output / name)

print(f"Prepared {output} for {site_url}")

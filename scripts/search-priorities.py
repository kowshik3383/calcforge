"""Rank current calculator URLs using a Search Console Performance Pages.csv export."""

import argparse
import csv
import sys
from pathlib import Path
from urllib.parse import urlsplit
from xml.etree import ElementTree


def page_key(url):
    parsed = urlsplit(url.strip())
    return parsed.netloc, parsed.path.rstrip("/").removesuffix(".html")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pages_csv", type=Path, help="English Search Console Pages.csv")
    parser.add_argument("--sitemap", type=Path, default=Path("out/sitemap.xml"))
    args = parser.parse_args()

    sitemap = ElementTree.parse(args.sitemap)
    published = {
        page_key(url.text): url.text
        for url in sitemap.findall(".//{*}loc")
        if url.text and urlsplit(url.text).path.startswith("/tools/")
    }
    with args.pages_csv.open(encoding="utf-8-sig", newline="") as source:
        reader = csv.DictReader(source)
        page_column = next((name for name in ("Top pages", "Page")
                            if name in (reader.fieldnames or [])), None)
        if not page_column or not {"Clicks", "Impressions"} <= set(reader.fieldnames or []):
            parser.error("Expected an English Pages.csv with Top pages, Clicks, and Impressions.")

        totals = {}
        for row in reader:
            url = published.get(page_key(row[page_column]))
            if not url:
                continue
            clicks, impressions = totals.get(url, (0, 0))
            totals[url] = (
                clicks + int(row["Clicks"].replace(",", "")),
                impressions + int(row["Impressions"].replace(",", "")),
            )

    writer = csv.writer(sys.stdout)
    writer.writerow(["URL", "Impressions", "Clicks", "CTR"])
    for url, (clicks, impressions) in sorted(
        totals.items(), key=lambda item: (-item[1][1], -item[1][0], item[0])
    ):
        if impressions:
            writer.writerow([url, impressions, clicks, f"{clicks / impressions:.2%}"])


if __name__ == "__main__":
    main()

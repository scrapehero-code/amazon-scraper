"""Scraping logic. Used by api.py, no loop and no web code in here."""
from selectorlib import Extractor
import requests
import json
import os
import time
import traceback

# ---- Settings ----
CONFIG_DIR = os.getenv("CONFIG_DIR", "config")
URLS_FILE = os.path.join(CONFIG_DIR, "search_results_urls.json")
YAML_FILE = os.path.join(CONFIG_DIR, "search_results.yml")
OUTPUT_FILE = os.getenv("OUTPUT_FILE", "data/search_results_output.jsonl")
URL_DELAY = float(os.getenv("URL_DELAY", "3"))  # seconds between two URLs

HEADERS = {
    'dnt': '1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-user': '?1',
    'sec-fetch-dest': 'document',
    'referer': 'https://www.amazon.com/',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
}


# ---------- Reading / writing files ----------

def load_entries():
    """Read the URLs file -> [{'category': ..., 'url': ...}, ...]"""
    with open(URLS_FILE, "r", encoding="utf-8") as f:
        raw = json.load(f)

    entries = []
    for item in raw:
        # Remove stray spaces (e.g. "https: //www...") that would break requests
        url = (item.get("url") or "").replace(" ", "").strip()
        if url:
            entries.append({"category": (item.get("category") or "Other").strip(), "url": url})
    return entries


def read_saved():
    """Read the saved output -> {search_url: [products]}"""
    saved = {}
    if not os.path.exists(OUTPUT_FILE):
        return saved
    with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
            except ValueError:
                continue
            saved.setdefault(row.get("search_url"), []).append(row)
    return saved


def write_saved(saved, order):
    """Write the output. A temp file is swapped in so the page never reads half a file."""
    os.makedirs(os.path.dirname(OUTPUT_FILE) or ".", exist_ok=True)
    tmp = OUTPUT_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as out:
        for url in order:
            for row in saved.get(url, []):
                json.dump(row, out, ensure_ascii=False)
                out.write("\n")
    os.replace(tmp, OUTPUT_FILE)


# ---------- Scraping ----------

def scrape_page(url, extractor):
    """Download one search page -> list of products (empty list if blocked or nothing found)."""
    print("Downloading %s" % url, flush=True)
    try:
        r = requests.get(url, headers=HEADERS, timeout=30)
        if r.status_code != 200:
            print("Failed (status %d): %s" % (r.status_code, url), flush=True)
            return []
        data = extractor.extract(r.text)
    except Exception:
        traceback.print_exc()
        return []

    products = (data or {}).get("products") or []
    return [p for p in products if p.get("title")]  # skip ads / empty blocks


def run(mode="new"):
    """
    mode "new": scrape only URLs that are not saved yet. Everything else is kept.
    mode "all": scrape every URL again. URLs removed from the file are dropped.
                If a URL fails, its last good products are kept.
    Returns a short message for the page.
    """
    entries = load_entries()
    saved = read_saved()
    changed = False

    # Keep category labels in sync with the URLs file
    for e in entries:
        for row in saved.get(e["url"], []):
            if row.get("category") != e["category"]:
                row["category"] = e["category"]
                changed = True

    if mode == "all":
        wanted = {e["url"] for e in entries}
        kept = {u: rows for u, rows in saved.items() if u in wanted}
        if len(kept) != len(saved):
            changed = True
        saved = kept
        todo = entries
    else:
        todo = [e for e in entries if e["url"] not in saved]

    extractor = Extractor.from_yaml_file(YAML_FILE) if todo else None
    done = 0
    for i, e in enumerate(todo):
        if i > 0:
            time.sleep(URL_DELAY)
        rows = scrape_page(e["url"], extractor)
        for row in rows:
            row["category"] = e["category"]
            row["search_url"] = e["url"]
        if rows:
            saved[e["url"]] = rows
            done += 1
            changed = True

    if changed and saved:
        order = [e["url"] for e in entries]
        order += [u for u in saved if u not in order]
        write_saved(saved, order)

    if not todo:
        return "No new URLs to scrape."
    return "Scraped %d of %d URLs." % (done, len(todo))
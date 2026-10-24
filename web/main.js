// ================= Settings =================
const DATA_FILE = "data/search_results_output.jsonl";
const POLL_MS = 2000; // how often we ask the API if the scrape is finished

// ================= Elements =================
const $ = (id) => document.getElementById(id);
const grid = $("grid");
const statusEl = $("status");
const countEl = $("count");
const updatedEl = $("updated");
const messageEl = $("message");
const tabsEl = $("tabs");
const searchEl = $("search");
const sortEl = $("sort");
const btnNew = $("btn-new");
const btnAll = $("btn-all");

// ================= State =================
let products = [];
let activeCategory = "All";
let loading = true;     // true while loading data or scraping -> shows placeholder cards
let justLoaded = false; // true when fresh data arrived -> cards fade in once

// ================= Helpers =================
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));

// "$1,299.00" -> 1299, "4.5 out of 5 stars" -> 4.5, "(1,234)" -> 1234
const num = (s) => {
  const n = parseFloat(String(s ?? "").replace(/,/g, "").replace(/[^0-9.]/g, ""));
  return isNaN(n) ? null : n;
};

// Reads JSON Lines (one object per line) or a normal JSON array
function parseData(text) {
  try {
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [data];
  } catch {
    return text.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => JSON.parse(l));
  }
}

function prepare(p) {
  let url = p.url || "";
  if (url.startsWith("/")) url = "https://www.amazon.com" + url;
  return {
    ...p,
    url,
    category: p.category || "Other",
    _price: num(p.price),
    _rating: num(p.rating),
    _reviews: num(p.reviews),
  };
}

// ================= Loading data =================
async function loadData() {
  try {
    const r = await fetch(DATA_FILE, { cache: "no-store" });
    if (!r.ok) throw new Error("no data");
    const text = await r.text();
    products = parseData(text).filter((p) => p && p.title).map(prepare);

    const lm = r.headers.get("Last-Modified");
    updatedEl.textContent = "Data updated: " + (lm ? new Date(lm) : new Date()).toLocaleTimeString();
  } catch {
    products = [];
  }
  justLoaded = true;
  renderTabs();
  renderGrid();
}

// ================= Tabs =================
function renderTabs() {
  const cats = [...new Set(products.map((p) => p.category))];
  if (activeCategory !== "All" && !cats.includes(activeCategory)) activeCategory = "All";

  tabsEl.innerHTML = ["All", ...cats]
    .map((name) => {
      const n = name === "All" ? products.length : products.filter((p) => p.category === name).length;
      const active = name === activeCategory;
      return `<button data-cat="${esc(name)}"
        class="whitespace-nowrap text-sm px-4 py-2 rounded-lg border transition
          ${active
          ? "bg-orange-500 border-orange-500 text-white"
          : "bg-white border-gray-200 text-gray-700 hover:border-orange-400"}">
        ${esc(name)} <span class="${active ? "text-white/80" : "text-gray-400"}">(${n})</span>
      </button>`;
    })
    .join("");

  tabsEl.querySelectorAll("button").forEach((btn) =>
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;
      renderTabs();
      renderGrid();
    })
  );
}

// ================= Cards =================
// Placeholder card shown while data is loading
function skeletonCard() {
  return `
    <article class="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 animate-pulse">
      <div class="h-40 bg-gray-200 rounded-lg"></div>
      <div class="h-5 w-20 bg-orange-100 rounded-full"></div>
      <div class="h-4 bg-gray-200 rounded"></div>
      <div class="h-4 w-3/4 bg-gray-200 rounded"></div>
      <div class="h-6 w-24 bg-orange-100 rounded"></div>
      <div class="h-9 bg-gray-200 rounded-lg mt-2"></div>
    </article>`;
}

const skeletons = (n) => Array.from({ length: n }, skeletonCard).join("");

function card(p, animate) {
  return `
    <article class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3 ${animate ? "fade-in" : ""}">
      ${p.image
      ? `<div class="h-40 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden animate-pulse">
             <img src="${esc(p.image)}" alt="" loading="lazy"
               class="max-h-full object-contain opacity-0 transition-opacity duration-500"
               onload="this.classList.remove('opacity-0'); this.parentElement.classList.remove('animate-pulse', 'bg-gray-100')"
               onerror="this.parentElement.classList.remove('animate-pulse')" />
           </div>`
      : ""}

      <span class="self-start text-xs font-medium bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
        ${esc(p.category)}
      </span>

      <h2 class="font-semibold leading-snug line-clamp-3">${esc(p.title)}</h2>

      <p class="text-xl font-bold ${p.price ? "text-orange-500" : "text-gray-400"}">
        ${esc(p.price || "No price")}
      </p>

      <div class="text-sm text-gray-600 mt-auto space-y-1">
        ${p.rating ? `<p>${esc(p.rating)}</p>` : ""}
        ${p.reviews ? `<p class="text-gray-500">${esc(p.reviews)}</p>` : ""}
      </div>

      ${p.url
      ? `<a href="${esc(p.url)}" target="_blank" rel="noopener"
              class="text-center text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-2 transition">
              View on Amazon
           </a>`
      : ""}
    </article>`;
}

// ================= Filter + sort =================
function sortList(list) {
  const mode = sortEl.value;
  if (mode === "default") return list;

  const [key, dir] = {
    "price-asc": ["_price", 1],
    "price-desc": ["_price", -1],
    "rating-desc": ["_rating", -1],
    "reviews-desc": ["_reviews", -1],
  }[mode];

  // Items without a value always go last
  return [...list].sort((a, b) => {
    if (a[key] === null && b[key] === null) return 0;
    if (a[key] === null) return 1;
    if (b[key] === null) return -1;
    return (a[key] - b[key]) * dir;
  });
}

function renderGrid() {
  const q = searchEl.value.trim().toLowerCase();
  const list = sortList(
    products.filter(
      (p) =>
        (activeCategory === "All" || p.category === activeCategory) &&
        (!q || p.title.toLowerCase().includes(q))
    )
  );

  countEl.textContent = `${list.length} product${list.length === 1 ? "" : "s"}`;

  // Fade the cards in only once, right after fresh data has finished loading
  const animate = justLoaded && !loading;
  if (!loading) justLoaded = false;

  // Loading: products stay visible but dimmed, with placeholder cards added
  grid.classList.toggle("opacity-60", loading && list.length > 0);

  if (loading) {
    statusEl.classList.add("hidden");
    grid.innerHTML = list.map((p) => card(p, false)).join("") + skeletons(list.length ? 3 : 6);
    return;
  }

  if (!list.length) {
    grid.innerHTML = "";
    statusEl.textContent = products.length ? "No products found." : "No data yet.";
    statusEl.classList.remove("hidden");
    return;
  }

  statusEl.classList.add("hidden");
  grid.innerHTML = list.map((p) => card(p, animate)).join("");
}

// ================= Scraping (talks to the API) =================
async function api(path, options) {
  const r = await fetch(path, options);
  if (!r.ok) throw new Error("API error " + r.status);
  return r.json();
}

function setBusy(busy, message) {
  loading = busy;
  btnNew.disabled = busy;
  btnAll.disabled = busy;
  messageEl.textContent = message || "";
  renderGrid();
}

async function waitForScrape() {
  while (true) {
    const s = await api("/api/status");
    if (!s.running) return s;
    await sleep(POLL_MS);
  }
}

// mode: "new" = only new URLs, "all" = every URL again
async function scrape(mode) {
  setBusy(true, mode === "all" ? "Re-scraping all URLs..." : "Checking for new URLs...");
  try {
    const res = await api("/api/scrape?mode=" + mode, { method: "POST" });

    // Refused (cooldown etc.) and nothing is running: just show the reason
    if (!res.started && !res.running) {
      setBusy(false, res.message);
      return;
    }

    const s = await waitForScrape();
    await loadData();
    setBusy(false, s.message);
  } catch {
    setBusy(false, "Scraper is not reachable yet. Wait a few seconds and try again.");
  }
}

// ================= Events + start =================
btnNew.addEventListener("click", () => scrape("new"));
btnAll.addEventListener("click", () => scrape("all"));
searchEl.addEventListener("input", renderGrid);
sortEl.addEventListener("change", renderGrid);

// On every page load: show saved data right away, then check for new URLs in the background
renderGrid(); // placeholder cards right away
loadData().then(() => scrape("new"));
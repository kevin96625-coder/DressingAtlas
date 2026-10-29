/* DressingAtlas — data-driven costume gallery. Vanilla ES modules, zero deps. */
import { applyI18n, detectLang, format, LANGS, UI } from './i18n.js';

const state = {
  lang: detectLang(),
  category: 'all',
  query: '',
  items: [],
  filtered: [],
  categories: new Map(),
  current: -1,
  data: null,
};

const $ = (id) => document.getElementById(id);
const els = {
  grid: $('grid'),
  empty: $('empty'),
  resultCount: $('resultCount'),
  footerMeta: $('footerMeta'),
  categoryTabs: $('categoryTabs'),
  categorySelect: $('categorySelect'),
  searchInput: $('searchInput'),
  filterToggle: $('filterToggle'),
  filters: $('filters'),
  filterBadge: $('filterBadge'),
  clearFilters: $('clearFilters'),
  clearFiltersBar: $('clearFiltersBar'),
  langSwitch: $('langSwitch'),
  info: $('info'),
  modal: $('modal'),
  modalBox: document.querySelector('.modal__box'),
  modalClose: $('modalClose'),
  viewer: document.querySelector('.viewer'),
  viewerImage: $('viewerImage'),
  viewerGhost: $('viewerGhost'),
  viewerSpinner: $('viewerSpinner'),
  viewerError: $('viewerError'),
  prevItem: $('prevItem'),
  nextItem: $('nextItem'),
  modalTitle: $('modalTitle'),
  modalId: $('modalId'),
  modalMeta: $('modalMeta'),
  modalPrompt: $('modalPrompt'),
  copyPrompt: $('copyPrompt'),
  downloadLink: $('downloadLink'),
  originalLink: $('originalLink'),
};

const dict = () => UI[state.lang];
const categoryLabel = (key) => state.categories.get(key)?.names[state.lang] ?? key;
const itemTitle = (item) => `${categoryLabel(item.category)} · ${item.id}`;

/* データ読み込み ------------------------------------------------------------- */
async function loadData() {
  const response = await fetch('data/costumes.json');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function showError() {
  const d = dict();
  els.grid.setAttribute('aria-busy', 'false');
  els.grid.innerHTML = '';
  const box = document.createElement('div');
  box.className = 'empty';
  box.innerHTML = `<p class="empty__title"></p><p class="empty__text"></p>`;
  box.querySelector('.empty__title').textContent = d.loadErrorTitle;
  box.querySelector('.empty__text').textContent = d.loadErrorText;
  els.grid.replaceChildren(box);
}

/* フィルタリング -------------------------------------------------------------- */
function buildHaystack(item) {
  const category = state.categories.get(item.category);
  const names = category ? Object.values(category.names) : [];
  const aliases = category?.aliases ?? [];
  return [item.id, item.id.split('-')[1], ...names, ...aliases, item.keywords]
    .join(' ')
    .toLowerCase();
}

function applyFilters() {
  const query = state.query.trim().toLowerCase();
  state.filtered = state.items.filter((item) => {
    if (state.category !== 'all' && item.category !== state.category) return false;
    if (!query) return true;
    return item.haystack.includes(query);
  });
}

/* 描画 ---------------------------------------------------------------------- */
const lazyObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const img = entry.target;
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
    lazyObserver.unobserve(img);
  }
}, { rootMargin: '600px 0px' });

function renderTabs() {
  const d = dict();
  const tabs = [{ key: 'all', label: d.categoryAll, count: state.items.length },
    ...[...state.categories.values()].map((category) => ({
      key: category.key,
      label: category.names[state.lang],
      count: category.count,
    }))];
  els.categoryTabs.replaceChildren(...tabs.map((tab) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.category = tab.key;
    button.setAttribute('aria-pressed', String(state.category === tab.key));
    button.innerHTML = '<span></span><sup></sup>';
    button.querySelector('span').textContent = tab.label;
    button.querySelector('sup').textContent = tab.count;
    return button;
  }));

  els.categorySelect.replaceChildren(...tabs.map((tab) => {
    const option = document.createElement('option');
    option.value = tab.key;
    option.textContent = `${tab.label} (${tab.count})`;
    return option;
  }));
  els.categorySelect.value = state.category;
}

function renderGrid() {
  const d = dict();
  els.grid.setAttribute('aria-busy', 'false');

  for (const img of els.grid.querySelectorAll('img[data-src]')) lazyObserver.unobserve(img);

  const fragment = document.createDocumentFragment();
  for (const item of state.filtered) {
    const card = document.createElement('figure');
    card.className = 'card';
    card.dataset.id = item.id;
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', format(d.cardAria, { name: itemTitle(item) }));

    const img = document.createElement('img');
    img.dataset.src = item.thumb;
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 360;
    img.height = 540;
    lazyObserver.observe(img);

    const meta = document.createElement('figcaption');
    meta.className = 'card__meta';
    const id = document.createElement('span');
    id.className = 'card__id';
    id.textContent = item.id;
    const cat = document.createElement('span');
    cat.className = 'card__cat';
    cat.textContent = categoryLabel(item.category);
    meta.append(id, cat);

    card.append(img, meta);
    fragment.append(card);
  }
  els.grid.replaceChildren(fragment);

  const count = state.filtered.length;
  els.resultCount.textContent = format(count === 1 ? d.countOne : d.countMany, { n: count });
  els.empty.hidden = count > 0;

  const activeFilters = (state.category !== 'all' ? 1 : 0) + (state.query.trim() ? 1 : 0);
  els.filterBadge.hidden = activeFilters === 0;
  els.filterBadge.textContent = String(activeFilters);
}

function render() {
  applyFilters();
  renderTabs();
  renderGrid();
}

/* 言語 ---------------------------------------------------------------------- */
function setLang(lang, { updateUrl = true } = {}) {
  if (!LANGS.includes(lang)) return;
  state.lang = lang;
  applyI18n(lang);
  for (const button of els.langSwitch.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button.dataset.lang === lang));
  }
  render();
  if (state.current >= 0) fillModal(state.filtered[state.current]);
  if (updateUrl) {
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    window.history.replaceState(null, '', url);
  }
}

/* モーダル -------------------------------------------------------------------- */
const preloads = new Map();

function preload(url) {
  if (preloads.has(url) || !url) return;
  const image = new Image();
  image.src = url;
  preloads.set(url, image);
}

function fillModal(item) {
  const d = dict();
  const title = itemTitle(item);
  document.title = `${title} · DressingAtlas`;

  els.modalTitle.textContent = title;
  els.modalId.textContent = item.id;
  els.viewer.classList.remove('is-loaded');
  els.viewerError.hidden = true;
  els.viewerGhost.src = item.thumb;
  els.viewerImage.alt = format(d.imageAlt, { name: title });
  els.viewerImage.src = item.image;

  const meta = [
    [d.metaCategory, categoryLabel(item.category)],
    [d.metaId, item.id],
    [d.metaSpec, d.specValue],
  ];
  els.modalMeta.replaceChildren(...meta.map(([term, value]) => {
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = term;
    dd.textContent = value;
    return [dt, dd].flat();
  }).flat());

  els.modalPrompt.textContent = item.keywords;
  els.downloadLink.href = item.image;
  els.downloadLink.setAttribute('download', `${item.id}.webp`);
  els.originalLink.href = new URL(item.original, 'https://ai-costume-gallery.pages.dev/').href;

  const previous = state.filtered[state.current - 1];
  const next = state.filtered[state.current + 1];
  preload(previous?.image);
  preload(next?.image);
}

function openModal(index) {
  state.current = index;
  fillModal(state.filtered[index]);
  els.modal.hidden = false;
  document.body.style.overflow = 'hidden';
  els.modalClose.focus();
  const url = new URL(window.location);
  url.searchParams.set('item', state.filtered[index].id);
  window.history.replaceState(null, '', url);
}

function closeModal() {
  els.modal.hidden = true;
  document.body.style.overflow = '';
  state.current = -1;
  const url = new URL(window.location);
  url.searchParams.delete('item');
  window.history.replaceState(null, '', url);
  document.title = dict().docTitle;
}

function move(step) {
  const next = state.current + step;
  if (next < 0 || next >= state.filtered.length) return;
  state.current = next;
  fillModal(state.filtered[next]);
  const url = new URL(window.location);
  url.searchParams.set('item', state.filtered[next].id);
  window.history.replaceState(null, '', url);
}

/* イベント -------------------------------------------------------------------- */
els.categoryTabs.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-category]');
  if (!button) return;
  state.category = button.dataset.category;
  render();
});

els.categorySelect.addEventListener('change', () => {
  state.category = els.categorySelect.value;
  render();
});

let searchTimer;
els.searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.query = els.searchInput.value;
    render();
  }, 120);
});

const clearAll = () => {
  state.category = 'all';
  state.query = '';
  els.searchInput.value = '';
  render();
};
els.clearFilters.addEventListener('click', clearAll);
els.clearFiltersBar.addEventListener('click', clearAll);

els.filterToggle.addEventListener('click', () => {
  const open = els.filters.classList.toggle('is-open');
  els.filterToggle.setAttribute('aria-expanded', String(open));
});

els.langSwitch.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-lang]');
  if (button) setLang(button.dataset.lang);
});

/* 使い方・注意パネル */
for (const tab of els.info.querySelectorAll('.info__tab')) {
  tab.addEventListener('click', () => {
    const panel = document.getElementById(tab.dataset.panel);
    const expand = panel.hidden;
    for (const other of els.info.querySelectorAll('.info__panel')) other.hidden = true;
    for (const other of els.info.querySelectorAll('.info__tab')) other.setAttribute('aria-expanded', 'false');
    panel.hidden = !expand;
    tab.setAttribute('aria-expanded', String(expand));
    if (expand) panel.focus();
  });
}
els.info.addEventListener('click', (event) => {
  if (!event.target.closest('[data-close-panel]')) return;
  for (const panel of els.info.querySelectorAll('.info__panel')) panel.hidden = true;
  for (const tab of els.info.querySelectorAll('.info__tab')) tab.setAttribute('aria-expanded', 'false');
});
document.addEventListener('click', (event) => {
  if (els.info.contains(event.target)) return;
  for (const panel of els.info.querySelectorAll('.info__panel')) panel.hidden = true;
  for (const tab of els.info.querySelectorAll('.info__tab')) tab.setAttribute('aria-expanded', 'false');
});

/* グリッド → モーダル */
els.grid.addEventListener('click', (event) => {
  const card = event.target.closest('.card[data-id]');
  if (!card) return;
  const index = state.filtered.findIndex((item) => item.id === card.dataset.id);
  if (index >= 0) openModal(index);
});
els.grid.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const card = event.target.closest('.card[data-id]');
  if (!card) return;
  event.preventDefault();
  const index = state.filtered.findIndex((item) => item.id === card.dataset.id);
  if (index >= 0) openModal(index);
});

document.querySelector('[data-close-modal]').addEventListener('click', closeModal);
els.modalClose.addEventListener('click', closeModal);
els.prevItem.addEventListener('click', () => move(-1));
els.nextItem.addEventListener('click', () => move(1));

els.viewerImage.addEventListener('load', () => {
  els.viewer.classList.add('is-loaded');
  els.viewerError.hidden = true;
});
els.viewerImage.addEventListener('error', () => {
  els.viewer.classList.add('is-loaded');
  els.viewerError.hidden = false;
});

els.copyPrompt.addEventListener('click', async () => {
  const item = state.filtered[state.current];
  if (!item) return;
  try {
    await navigator.clipboard.writeText(item.keywords);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(els.modalPrompt);
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
  }
  const label = els.copyPrompt.querySelector('span');
  const previous = label.textContent;
  label.textContent = dict().copied;
  setTimeout(() => { label.textContent = dict().copyPrompt || previous; }, 1400);
});

document.addEventListener('keydown', (event) => {
  if (els.modal.hidden) return;
  if (event.key === 'Escape') closeModal();
  else if (event.key === 'ArrowLeft') move(-1);
  else if (event.key === 'ArrowRight') move(1);
});

window.addEventListener('pageshow', () => {
  if (!els.modal.hidden && state.current >= 0) fillModal(state.filtered[state.current]);
});

/* 起動 ---------------------------------------------------------------------- */
async function boot() {
  try {
    state.data = await loadData();
  } catch {
    applyI18n(state.lang);
    showError();
    return;
  }
  state.categories = new Map(state.data.categories.map((category) => [category.key, category]));
  state.items = state.data.items.map((item) => ({ ...item, haystack: buildHaystack(item) }));

  els.footerMeta.textContent = format(dict().footerMeta, {
    items: state.data.totals.items,
    images: state.data.totals.images,
  });

  const params = new URLSearchParams(window.location.search);
  const langParam = params.get('lang');
  setLang(langParam && LANGS.includes(langParam) ? langParam : state.lang, { updateUrl: false });
  if (langParam && LANGS.includes(langParam) && langParam !== detectLang()) {
    // Explicit ?lang= wins over stored preference for this visit.
  }

  const categoryParam = params.get('category');
  if (categoryParam && (categoryParam === 'all' || state.categories.has(categoryParam))) {
    state.category = categoryParam;
  }
  const queryParam = params.get('q');
  if (queryParam) {
    state.query = queryParam;
    els.searchInput.value = queryParam;
  }
  render();

  const itemParam = params.get('item');
  if (itemParam) {
    const index = state.filtered.findIndex((item) => item.id === itemParam);
    if (index < 0 && state.category !== 'all') {
      state.category = 'all';
      render();
    }
    const target = state.filtered.findIndex((item) => item.id === itemParam);
    if (target >= 0) openModal(target);
  }
}

boot();

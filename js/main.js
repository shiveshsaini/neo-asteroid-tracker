// ════════════════════════════════════════════
// main.js — Application entry point and state management
// ════════════════════════════════════════════

import { fetchNEOs, getToday } from './api.js';
import { renderCards }         from './render.js';
import { theme, favorites }    from './storage.js';
import { PAGE_SIZE, DEBOUNCE_MS, COPY_RESET_MS } from './constants.js';
import { getFilteredNEOs, getTotalPages, getStats } from './filters.js';

// ─── Global State ─────────────────────────────────────────────────

let currentNEOs = [];
const appState = {
  query: '',
  filter: 'all',
  sort: 'distance',
  page: 1,
  tab: 'all' // 'all' or 'saved'
};

// ─── Theme (must be first) ────────────────────────────────────────

theme.init();

// ─── Starfield canvas ─────────────────────────────────────────────

(function initStars() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars  = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createStars(count) {
    stars = Array.from({ length: count }, () => ({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      r:       Math.random() * 1.2 + 0.2,
      alpha:   Math.random(),
      speed:   Math.random() * 0.003 + 0.001,
      flicker: Math.random() * Math.PI * 2,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.flicker += s.speed;
      const a = 0.3 + Math.abs(Math.sin(s.flicker)) * 0.7;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 230, 255, ${a * s.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  createStars(200);
  draw();
  window.addEventListener('resize', () => { resize(); createStars(200); });
})();

// ─── Global functions ─────────────────────────────────────────────

/** Toggles an asteroid in favorites */
window.toggleFav = function(id, btn) {
  const added = favorites.toggle(id);
  btn.textContent  = added ? '★ SAVED' : '☆ SAVE';
  btn.className = btn.className
    .replace(/border-\S+/g, '')
    .replace(/text-\S+/g, '')
    .replace(/bg-\S+/g, '')
    .trim();
  if (added) {
    btn.classList.add('border-yellow-500/50', 'text-yellow-400', 'bg-yellow-500/5');
  } else {
    btn.classList.add('border-gray-700', 'text-gray-600',
                      'hover:border-yellow-500/40', 'hover:text-yellow-400');
  }
  updateUI();
};

/** Shares a card text to clipboard */
window.shareCard = function(name, dist, date, vel, btn) {
  const text = \`🚀 Asteroid \${name} will pass Earth at \${dist} km on \${date} at \${vel} km/s. Source: NASA JPL\`;
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = '<span class="text-green-400">✓ COPIED!</span>';
    setTimeout(() => { btn.innerHTML = orig; }, COPY_RESET_MS);
  });
};

// ─── Date picker default ──────────────────────────────────────────

const datePicker = document.getElementById('datePicker');
datePicker.value  = getToday();

function formatWeekRange(startDate) {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  
  const getMonthAndDay = (d) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const year = end.getFullYear();
  return \`WEEK OF \${getMonthAndDay(start).toUpperCase()} – \${getMonthAndDay(end).toUpperCase()}, \${year}\`;
}

// ─── Update UI core ───────────────────────────────────────────────

/** Drives rendering by resolving data through the HOF pipeline */
function updateUI() {
  const favIds = favorites.get();
  const withFavs = currentNEOs.map(n => ({ ...n, isFav: favIds.includes(n.id) }));
  
  document.getElementById('favCount').textContent = favIds.length;

  let sourceData = appState.tab === 'saved' 
    ? withFavs.filter(neo => neo.isFav)
    : withFavs;

  const { paginated, totalCount } = getFilteredNEOs(sourceData, appState);
  
  // Stats rendering (using unfiltered but tabbed data for top stats like before)
  const hazardCount = sourceData.filter(n => n.isHazardous).length;
  let closestDistString = '—';
  if (sourceData.length > 0) {
    const closest = sourceData.reduce((a, b) => a.distKm < b.distKm ? a : b);
    closestDistString = (closest.distKm / 1_000_000).toFixed(2) + 'M km';
  }

  document.getElementById('statTotal').textContent     = sourceData.length;
  document.getElementById('statHazardous').textContent = hazardCount;
  document.getElementById('statClosest').textContent   = closestDistString;
  
  // Ticker text
  const tickerData = appState.tab === 'saved' ? sourceData : withFavs;
  const stats = getStats(tickerData);
  document.getElementById('statsTickerText').textContent = 
    \`Total diameter of all NEOs this week: \${stats.totalDiam.toLocaleString(undefined, {maximumFractionDigits:2})} km · Fastest: \${stats.fastest.toLocaleString()} km/s · Average miss distance: \${(stats.avgDist / 1_000_000).toFixed(2)}M km\`;

  // Pagination display
  const totalPages = getTotalPages(sourceData, appState, PAGE_SIZE);
  document.getElementById('pageDisplay').textContent = \`PAGE \${appState.page} OF \${totalPages}\`;
  document.getElementById('prevBtn').disabled = appState.page <= 1;
  document.getElementById('nextBtn').disabled = appState.page >= totalPages;

  // Result count display
  const startItem = totalCount > 0 ? ((appState.page - 1) * PAGE_SIZE) + 1 : 0;
  const endItem = Math.min(appState.page * PAGE_SIZE, totalCount);
  document.getElementById('resultCount').textContent = \`Showing \${startItem}–\${endItem} of \${totalCount} asteroids\`;

  renderCards(paginated, {
    isFirstPage: appState.page === 1,
    sortType: appState.sort,
    searchQuery: appState.query
  });
}

// ─── Load asteroids ───────────────────────────────────────────────

async function loadAsteroids(startDate) {
  currentNEOs = await fetchNEOs(startDate);
  
  const subTitle = document.getElementById('dateRangeSubtitle');
  subTitle.textContent = formatWeekRange(startDate);
  subTitle.classList.remove('hidden');

  appState.page = 1;
  updateUI();
}

// ─── Event listeners ─────────────────────────────────────────────

document.getElementById('fetchBtn').addEventListener('click', () => {
  if (datePicker.value) loadAsteroids(datePicker.value);
});

// Week navigator
document.getElementById('prevWeekBtn').addEventListener('click', () => {
  const d = new Date(datePicker.value);
  d.setDate(d.getDate() - 7);
  datePicker.value = d.toISOString().split('T')[0];
  loadAsteroids(datePicker.value);
});

document.getElementById('nextWeekBtn').addEventListener('click', () => {
  const d = new Date(datePicker.value);
  d.setDate(d.getDate() + 7);
  datePicker.value = d.toISOString().split('T')[0];
  loadAsteroids(datePicker.value);
});

document.getElementById('themeToggle').addEventListener('click', () => {
  theme.toggle();
});

// Search input
let debounceTimer;
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', (e) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    appState.query = e.target.value;
    appState.page = 1;
    updateUI();
  }, DEBOUNCE_MS);
});

// Keyboard shortcut `/` to focus search
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput.focus();
  }
});

// Filter
document.getElementById('filterSelect').addEventListener('change', (e) => {
  appState.filter = e.target.value;
  appState.page = 1;
  updateUI();
});

// Sort
document.querySelectorAll('.sort-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active', 'border-cyan-400', 'text-cyan-300', 'shadow-[0_0_8px_rgba(34,211,238,0.3)]'));
    e.target.classList.add('active', 'border-cyan-400', 'text-cyan-300', 'shadow-[0_0_8px_rgba(34,211,238,0.3)]');
    appState.sort = e.target.getAttribute('data-sort');
    appState.page = 1;
    updateUI();
  });
});

// Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('active', 'text-cyan-400', 'border-b-2', 'border-cyan-400');
      b.classList.add('text-gray-500');
    });
    const t = e.currentTarget;
    t.classList.remove('text-gray-500');
    t.classList.add('active', 'text-cyan-400', 'border-b-2', 'border-cyan-400');
    appState.tab = t.getAttribute('data-tab');
    appState.page = 1;
    updateUI();
  });
});

// Pagination
document.getElementById('prevBtn').addEventListener('click', () => {
  if (appState.page > 1) {
    appState.page--;
    updateUI();
    document.getElementById('controlsArea').scrollIntoView({ behavior: 'smooth' });
  }
});

document.getElementById('nextBtn').addEventListener('click', () => {
  const favIds = favorites.get();
  const withFavs = currentNEOs.map(n => ({ ...n, isFav: favIds.includes(n.id) }));
  let sourceData = appState.tab === 'saved' ? withFavs.filter(neo => neo.isFav) : withFavs;
  const totalPages = getTotalPages(sourceData, appState, PAGE_SIZE);
  
  if (appState.page < totalPages) {
    appState.page++;
    updateUI();
    document.getElementById('controlsArea').scrollIntoView({ behavior: 'smooth' });
  }
});

// ─── Initializer ──────────────────────────────────────────────────

// Initialize sort UI active state
document.querySelector('[data-sort="distance"]').classList.add('active', 'border-cyan-400', 'text-cyan-300', 'shadow-[0_0_8px_rgba(34,211,238,0.3)]');

loadAsteroids(getToday());
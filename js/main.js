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
  let particles = [];
  
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createStars(count) {
    stars = Array.from({ length: count }, () => ({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      r:       Math.random() * 0.8 + 0.2,
      alpha:   Math.random(),
      speed:   Math.random() * 0.002 + 0.0005,
      flicker: Math.random() * Math.PI * 2,
    }));
  }

  // Track Mouse Spawns
  window.addEventListener('mousemove', (e) => {
    // Spawn 2-3 particles per mouse event
    const spawnCount = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < spawnCount; i++) {
        // Theme aware colors (Deep Google Blue or Pearl/Gold depending on theme, handled dynamically by using neutral-cool luminescence)
        const isDark = document.documentElement.classList.contains('dark');
        const hue = isDark ? (Math.random() * 40 + 30) : (Math.random() * 40 + 200); // Gold/Amber in dark, Blue/Cyan in light

        particles.push({
            x: e.clientX,
            y: e.clientY,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            life: 1.0,                     // Alpha fades from 1 -> 0
            decay: Math.random() * 0.015 + 0.015, // ~1 second decay at 60fps
            size: Math.random() * 2 + 1,
            hue: hue
        });
    }
  });

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Draw Background Stars
    ctx.shadowBlur = 0; // Prevent stars from glowing to save performance
    stars.forEach(s => {
      s.flicker += s.speed;
      const a = 0.2 + Math.abs(Math.sin(s.flicker)) * 0.6;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(250, 250, 250, ${a * s.alpha})`;
      ctx.fill();
    });

    // 2. Draw Interactive Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.shadowBlur = 12;
        ctx.shadowColor = `hsla(${p.hue}, 100%, 60%, ${p.life})`;
        ctx.fillStyle = `hsla(${p.hue}, 100%, 80%, ${p.life})`;
        ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  resize();
  createStars(150);
  draw();
  window.addEventListener('resize', () => { resize(); createStars(150); });
})();

// ─── Utility Helpers (DRY Principle) ──────────────────────────────

/**
 * Returns current dataset with favorites evaluated and tab filters applied.
 * Prevents repeating the sourceData abstraction logic.
 */
function getCurrentSourceData() {
  const favIds = favorites.get();
  const withFavs = currentNEOs.map(n => ({ ...n, isFav: favIds.includes(n.id) }));
  
  return appState.tab === 'saved' 
    ? withFavs.filter(neo => neo.isFav)
    : withFavs;
}

/**
 * Shifts the currently active date by a specified number of days and fetches.
 */
function shiftDateByDays(days) {
  const datePicker = document.getElementById('datePicker');
  const d = new Date(datePicker.value);
  d.setDate(d.getDate() + days);
  datePicker.value = d.toISOString().split('T')[0];
  loadAsteroids(datePicker.value);
}

/**
 * Reusable UI button state swapper
 */
function updateActiveButton(selector, clickedBtn, activeClasses, inactiveClasses) {
  document.querySelectorAll(selector).forEach(b => {
    b.classList.remove(...activeClasses);
    b.classList.add(...inactiveClasses);
  });
  clickedBtn.classList.remove(...inactiveClasses);
  clickedBtn.classList.add(...activeClasses);
}

// ─── Global Window Exposed Logic ──────────────────────────────────

/** Toggles an asteroid in favorites */
window.toggleFav = function(id, btn) {
  favorites.toggle(id);
  updateUI();
};

/** Shares a card text to clipboard */
window.shareCard = function(name, dist, date, vel, btn) {
  const text = `[STELLAR ATLAS]
Asteroid: ${name}
Intercept: ${date}
Distance: ${dist} km
Velocity: ${vel} km/s
Source: NASA JPL`;
  
  navigator.clipboard.writeText(text).then(() => {
    const textSpan = btn.querySelector('.share-text');
    if(textSpan) {
        const orig = textSpan.textContent;
        textSpan.textContent = 'COPIED!';
        textSpan.classList.add('text-emerald');
        setTimeout(() => { 
            textSpan.textContent = orig; 
            textSpan.classList.remove('text-emerald');
        }, COPY_RESET_MS);
    }
  });
};

// ─── Date Formatting ──────────────────────────────────────────────

const datePicker = document.getElementById('datePicker');
datePicker.value  = getToday();

function formatWeekRange(startDate) {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  
  const getMonthAndDay = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const year = end.getFullYear();
  return `Sector Scan // ${getMonthAndDay(start).toUpperCase()} – ${getMonthAndDay(end).toUpperCase()} ${year}`;
}

// ─── UI Rendering Core ────────────────────────────────────────────

/** Drives rendering by resolving data through the HOF pipeline */
function updateUI() {
  const sourceData = getCurrentSourceData();
  const { paginated, totalCount } = getFilteredNEOs(sourceData, appState);
  
  // Fav Tab Count
  document.getElementById('favCount').textContent = favorites.get().length;

  // Stats Bar (Top)
  const hazardCount = sourceData.filter(n => n.isHazardous).length;
  let closestDistString = '—';
  if (sourceData.length > 0) {
    const closest = sourceData.reduce((a, b) => a.distKm < b.distKm ? a : b);
    closestDistString = (closest.distKm / 1_000_000).toFixed(2);
  }

  document.getElementById('statTotal').textContent     = sourceData.length;
  document.getElementById('statHazardous').textContent = hazardCount;
  document.getElementById('statClosest').textContent   = closestDistString;
  
  // Ticker Logic
  const stats = getStats(appState.tab === 'saved' ? sourceData : currentNEOs);
  const tickerStr = `DIAGNOSTIC TELEMETRY • ACTIVE OBJECTS: ${sourceData.length} • COMBINED MASS PROXY (DIAMETER): ${stats.totalDiam.toLocaleString(undefined, {maximumFractionDigits:2})} km • MAX VELOCITY DEVIATION: ${stats.fastest.toLocaleString()} km/s • MEDIAN SEPARATION: ${(stats.avgDist / 1_000_000).toFixed(2)}M km  •  `;
  document.getElementById('statsTickerText').textContent = tickerStr + tickerStr;

  // Pagination Display
  const totalPages = getTotalPages(sourceData, appState, PAGE_SIZE);
  document.getElementById('pageDisplay').textContent = `${appState.page} / ${totalPages}`;
  document.getElementById('prevBtn').disabled = appState.page <= 1;
  document.getElementById('nextBtn').disabled = appState.page >= totalPages;

  // Tracking Counter
  const startItem = totalCount > 0 ? ((appState.page - 1) * PAGE_SIZE) + 1 : 0;
  const endItem = Math.min(appState.page * PAGE_SIZE, totalCount);
  document.getElementById('resultCount').textContent = `TRACKING ${startItem}–${endItem} OF ${totalCount} RECORDS`;

  // Render Grid
  renderCards(paginated, {
    isFirstPage: appState.page === 1,
    sortType: appState.sort,
    searchQuery: appState.query
  });
}

// ─── Network Loading ──────────────────────────────────────────────

async function loadAsteroids(startDate) {
  currentNEOs = await fetchNEOs(startDate);
  
  const subTitle = document.getElementById('dateRangeSubtitle');
  subTitle.textContent = formatWeekRange(startDate);
  subTitle.classList.remove('hidden');
  
  document.getElementById('tickerContainer').classList.remove('hidden');

  appState.page = 1;
  updateUI();
}

// ─── Event Listeners ─────────────────────────────────────────────

document.getElementById('fetchBtn').addEventListener('click', () => {
  if (datePicker.value) loadAsteroids(datePicker.value);
});

document.getElementById('prevWeekBtn').addEventListener('click', () => shiftDateByDays(-7));
document.getElementById('nextWeekBtn').addEventListener('click', () => shiftDateByDays(7));
document.getElementById('themeToggle').addEventListener('click', () => theme.toggle());

// Search Input (Debounced)
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

document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput.focus();
  }
});

// Dropdown Filters
document.getElementById('filterSelect').addEventListener('change', (e) => {
  appState.filter = e.target.value;
  appState.page = 1;
  updateUI();
});

// Sort Buttons
document.querySelectorAll('.sort-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    updateActiveButton('.sort-btn', e.target, ['active', 'bg-white/10', 'text-pearl'], ['text-muted']);
    appState.sort = e.target.getAttribute('data-sort');
    appState.page = 1;
    updateUI();
  });
});

// Tab Buttons
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    updateActiveButton('.tab-btn', e.currentTarget, ['active', 'text-pearl'], ['text-muted']);
    appState.tab = e.currentTarget.getAttribute('data-tab');
    appState.page = 1;
    updateUI();
  });
});

// Pagination Connectors
document.getElementById('prevBtn').addEventListener('click', () => {
  if (appState.page > 1) {
    appState.page--;
    updateUI();
    document.getElementById('controlsArea').scrollIntoView({ behavior: 'smooth' });
  }
});

document.getElementById('nextBtn').addEventListener('click', () => {
  const sourceData = getCurrentSourceData();
  const totalPages = getTotalPages(sourceData, appState, PAGE_SIZE);
  
  if (appState.page < totalPages) {
    appState.page++;
    updateUI();
    document.getElementById('controlsArea').scrollIntoView({ behavior: 'smooth' });
  }
});

// ─── Application Bootstrap ────────────────────────────────────────

// Set initial Sort State cleanly
updateActiveButton('.sort-btn', document.querySelector('[data-sort="distance"]'), ['active', 'bg-white/10', 'text-pearl'], ['text-muted']);

// Initial fetch using current date
loadAsteroids(getToday());
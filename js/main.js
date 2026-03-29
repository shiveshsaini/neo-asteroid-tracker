import { fetchNEOs, getToday } from './api.js';
import { renderCards }         from './render.js';
import { theme, favorites }    from './storage.js';

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

// ─── Favorites toggle (called from card HTML) ─────────────────────
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
};

// ─── Date picker default ──────────────────────────────────────────
const datePicker = document.getElementById('datePicker');
datePicker.value  = getToday();

// ─── Load asteroids ───────────────────────────────────────────────
async function loadAsteroids(startDate) {
  const favIds = favorites.get();
  const neos   = await fetchNEOs(startDate);
  // attach isFav flag
  const withFavs = neos.map(n => ({ ...n, isFav: favIds.includes(n.id) }));
  renderCards(withFavs);
}

// ─── Event listeners ─────────────────────────────────────────────
document.getElementById('fetchBtn').addEventListener('click', () => {
  const date = datePicker.value;
  if (date) loadAsteroids(date);
});

document.getElementById('themeToggle').addEventListener('click', () => {
  theme.toggle();
});

// ─── Auto-load on open ────────────────────────────────────────────
loadAsteroids(getToday());
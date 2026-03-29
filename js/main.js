import { fetchNEOs, getToday } from './api.js';
import { renderCards }         from './render.js';
import { theme }               from './storage.js';

// ─── Apply saved theme before anything renders ──────────────────
theme.init();

// ─── Set date picker to today by default ───────────────────────
const datePicker = document.getElementById('datePicker');
datePicker.value = getToday();

// ─── Load asteroids for a given start date ──────────────────────
async function loadAsteroids(startDate) {
  const neos = await fetchNEOs(startDate);
  renderCards(neos);
}

// ─── Fetch button ───────────────────────────────────────────────
document.getElementById('fetchBtn').addEventListener('click', () => {
  const date = datePicker.value;
  if (!date) return;
  loadAsteroids(date);
});

// ─── Dark mode toggle ───────────────────────────────────────────
document.getElementById('themeToggle').addEventListener('click', () => {
  theme.toggle();
});

// ─── Auto-load today's asteroids on page open ───────────────────
loadAsteroids(getToday());
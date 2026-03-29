// ─── Theme ────────────────────────────────────────────────────────

export const theme = {
  init() {
    const saved = localStorage.getItem('neo-dark');
    // default is dark — only switch to light if explicitly saved
    if (saved === 'false') {
      document.documentElement.classList.remove('dark');
      const btn = document.getElementById('themeToggle');
      if (btn) btn.textContent = '● DARK MODE';
    }
  },
  toggle() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('neo-dark', String(isDark));
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = isDark ? '◐ LIGHT MODE' : '● DARK MODE';
  }
};

// ─── Favorites ────────────────────────────────────────────────────

export const favorites = {
  get() {
    return JSON.parse(localStorage.getItem('neo-favs') || '[]');
  },
  toggle(id) {
    const favs = this.get();
    const idx  = favs.indexOf(id);
    idx === -1 ? favs.push(id) : favs.splice(idx, 1);
    localStorage.setItem('neo-favs', JSON.stringify(favs));
    return idx === -1; // true = just added
  },
  has(id) {
    return this.get().includes(id);
  }
};
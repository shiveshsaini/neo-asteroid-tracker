// ─── Dark mode ─────────────────────────────────────────────────

export const theme = {
  init() {
    if (localStorage.getItem('neo-dark') === 'true') {
      document.documentElement.classList.add('dark');
      document.getElementById('themeToggle').textContent = '☀️ Light';
    }
  },
  toggle() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('neo-dark', String(isDark));
    document.getElementById('themeToggle').textContent = isDark ? '☀️ Light' : '🌙 Dark';
  }
};

// ─── Favorites ─────────────────────────────────────────────────

export const favorites = {
  get() {
    return JSON.parse(localStorage.getItem('neo-favs') || '[]');
  },
  toggle(id) {
    const favs = this.get();
    const idx  = favs.indexOf(id);
    idx === -1 ? favs.push(id) : favs.splice(idx, 1);
    localStorage.setItem('neo-favs', JSON.stringify(favs));
    return idx === -1; // returns true if just added
  },
  has(id) {
    return this.get().includes(id);
  }
};
# Stellar Atlas — Orbital Surveillance Network

A sophisticated, ultra-modern Near-Earth Object (NEO) surveillance dashboard powered by the **NASA JPL NeoWs API**. This project tracks asteroids in real-time, mapping out trajectories, velocities, and threat vectors.

![Stellar Atlas Preview](./preview.png) *(Note: Please add screenshot here)*

## 🚀 Features

- **Real-Time Telemetry Data**: Integrates directly with NASA's live orbital tracking algorithms.
- **Pure Functional Pipeline**: All internal data sorting, searching, and filtering are manipulated using strict array Higher-Order Functions (`.map()`, `.filter()`, `.reduce()`, `.slice()`, `.sort()`). No `for` or `while` loops are used anywhere in the codebase.
- **"Stellar Atlas" Premium UI**: A highly premium "luxury aerospace" user interface featuring:
  - Deep obsidian and pearl aesthetics.
  - Seamless CSS-marquee telemetry tickers.
  - Smooth staggered cubic-bezier card animations.
  - "Breathing Gold" tracking highlights for minimum-distance intercept objects.
- **Search & Filter**: Debounced real-time string matching and threat-level filters securely bound to app state.
- **Composite Hazard Grading**: Calculates threat levels (0-100) dynamically using proximity, speed, and size differentials.
- **Favorites System**: Keep track of bookmarked objects via LocalStorage cache.
- **Sector Scanning**: Effortless week-to-week timeframe shifts via the UI control panel.
- **1-Click Intelligence Sharing**: Copies structured briefing data directly to your clipboard.

## ⚙️ Technologies

- **HTML5 & CSS3**
- **Vanilla JavaScript (ES6 Modules)**
- **Tailwind CSS** (via CDN for sleek, class-based rapid prototyping)
- **NASA NeoWs API**

## 💡 Functional Programming (HOF) Example

This application adheres strictly to functional transformation principles (Milestone 3 constraint). Here is how we filter, sort, and paginate the asteroid data without side effects or primitive loops:

```javascript
export function getFilteredNEOs(allNEOs, { query, filter, sort, page, pageSize }) {
  let pipeline = allNEOs.filter(neo => {
    if (filter === 'safe') return !neo.isHazardous;
    if (filter === 'hazardous') return neo.isHazardous;
    return true;
  });

  if (query) {
    const q = query.toLowerCase();
    pipeline = pipeline.filter(neo => neo.name.toLowerCase().includes(q));
  }

  pipeline = [...pipeline].sort((a, b) => {
    if (sort === 'distance') return a.distKm - b.distKm;
    if (sort === 'velocity') return b.velocity - a.velocity;
    if (sort === 'diameter') return b.diameter - a.diameter;
    if (sort === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const totalCount = pipeline.length;
  const startIndex = (page - 1) * pageSize;
  const paginated = pipeline.slice(startIndex, startIndex + pageSize);

  return { paginated, totalCount };
}
```

## 🛠️ Deployment & Setup

This is a fully static client-side application. No node modules or build steps are strictly necessary beyond the integrated CDN scripts.

1. Clone the repository to your local machine.
2. Open `index.html` in your web browser or serve it using any simple static host (e.g., `python3 -m http.server`, VSCode Live Server).
3. **Deployment**: Can be deployed seamlessly to platforms like Vercel, Netlify, or GitHub Pages. Just point the publish directory to the project root.

---
*Developed for Milestone 4 Requirements — "Classy Design Specs".*

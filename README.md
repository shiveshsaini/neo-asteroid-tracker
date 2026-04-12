# 🛰️ Stellar Atlas — Orbital Surveillance Network

<p align="center">
  <strong><a href="https://shiveshsaini.github.io/neo-asteroid-tracker">🚀 EXPLORE THE LIVE DEPLOYMENT (DEMO) 🚀</a></strong>
</p>

A sophisticated, ultra-modern Near-Earth Object (NEO) surveillance dashboard engineered strictly using vanilla JavaScript, HTML5 Canvas, and Tailwind CSS. Powered by the **NASA JPL NeoWs API**, this project tracks asteroids in real-time to analyze trajectories, velocities, and threat vectors.

![Stellar Atlas Preview](./preview.png) *(Note: Please add screenshot here)*

---

## ✨ Cutting-Edge Features

- **Prism Glass Light Theme**: A stunning paradigm shift transitioning from a dark "Obsidian" mission-control UI to a pristine, light "Glassmorphism" interface mimicking cutting-edge conceptual AI Dashboards. Features an animated iridescent color mesh and deep frosted glass (`backdrop-filter`) rendering.
- **Interactive HTML5 Canvas Particles**: Features a custom-built vanilla JS Canvas engine tracking your mouse movements, spawning theme-contextual, physically drifting, and dissolving glowing trace particles completely independent of UI layering blockages. 
- **Real-Time Telemetry Data**: Integrates directly with NASA's live tracking algorithms caching optimally in `localStorage`.
- **Pure Functional Data Pipeline**: All internal arrays (sorting, searching, pagination, filtering) strictly utilize Higher-Order Functions (`.map()`, `.filter()`, `.reduce()`, `.slice()`, `.sort()`). No primitive `for` or `while` loops are ever used.
- **Composite Hazard Grading**: Calculates combined threat levels (0-100) dynamically using proximity, velocity, and size formulas.
- **Breathing Closest-Asteroid AI**: A dedicated CSS keyframe animation pulses gently to immediately identify the asteroid closing in at the minimal distance.
- **Data Modularity (DRY Principle)**: Implements rigorous "Clean Code" conventions cleanly separating Network, Render, Filtering, Memory, and Global App State routines.

## ⚙️ Technologies

- **HTML5 & CSS3** (Includes strict CSS-Variables for instant theme swapping)
- **Vanilla JavaScript (ES6 Modules)**
- **Tailwind CSS** (via CDN for sleek semantic layouts)
- **NASA NeoWs API**

## 💡 Functional Programming (HOF) Architecture

This application rigorously adheres to pristine functional principles. Here is an example isolated out of `js/filters.js` detailing how we extract pagination seamlessly without mutating origin arrays or utilizing primitive iterations:

```javascript
export function getFilteredNEOs(allNEOs, { query, filter, sort, page, pageSize }) {
  // 1. Array Element Verification via Object Keys
  let pipeline = allNEOs.filter(neo => {
    if (filter === 'safe') return !neo.isHazardous;
    if (filter === 'hazardous') return neo.isHazardous;
    return true;
  });

  // 2. Debounced Substring Filtering
  if (query) {
    const q = query.toLowerCase();
    pipeline = pipeline.filter(neo => neo.name.toLowerCase().includes(q));
  }

  // 3. Multi-Tier Destructured Sorting
  pipeline = [...pipeline].sort((a, b) => {
    if (sort === 'distance') return a.distKm - b.distKm;
    if (sort === 'velocity') return b.velocity - a.velocity;
    if (sort === 'diameter') return b.diameter - a.diameter;
    if (sort === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  // 4. Mathematical Array Slicing
  const totalCount = pipeline.length;
  const startIndex = (page - 1) * pageSize;
  const paginated = pipeline.slice(startIndex, startIndex + pageSize);

  return { paginated, totalCount };
}
```

## 🛠️ Deployment Instructions

Stellar Atlas is a fully static client-side application. No intricate build processes or module bundle resolutions (`node_modules`) are needed.

1. Clone or clone-download the repository to your host instance.
2. Initialize an HTTP Server against the base directory (`python3 -m http.server 8000` or VSCode Live Server). *NOTE: Due to high-tier `ES6 module ("type=module")` sandboxing, you cannot run this off `file:///` protocols locally.*
3. **Deployment**: Pushing this directly to **GitHub Pages**, **Vercel**, or **Netlify** requires absolute zero configuration. Ensure that your root routing hits `index.html`.

---
*Architected & Redesigned to exceed standard front-end data interaction thresholds.*

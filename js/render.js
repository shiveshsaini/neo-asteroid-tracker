// ─── Build one asteroid card ─────────────────────────────────────

function buildCard(neo, index) {
  const isHazardous = neo.isHazardous;

  const badge = isHazardous
    ? `<span class="font-mono text-xs px-2 py-0.5 rounded border border-red-500/40
                    bg-red-950/40 text-red-400 tracking-widest">
         ⚠ HAZARD
       </span>`
    : `<span class="font-mono text-xs px-2 py-0.5 rounded border border-green-500/30
                    bg-green-950/30 text-green-400 tracking-widest">
         ✓ SAFE
       </span>`;

  const borderClass = isHazardous
    ? 'border-red-500/15 bg-[#050d1a]/90'
    : 'border-cyan-500/15 bg-[#050d1a]/90';

  const hazardClass = isHazardous ? 'hazardous' : '';

  // staggered animation delay
  const delay = `animation-delay: ${index * 60}ms`;

  return `
    <div class="neo-card ${hazardClass} rounded-xl border ${borderClass} p-5 flex flex-col gap-4 cursor-default"
         style="${delay}">

      <!-- Card header -->
      <div class="flex items-start justify-between gap-2">
        <div>
          <div class="text-xs font-mono text-gray-600 tracking-widest mb-1">OBJECT ID: ${neo.id}</div>
          <h2 class="font-display text-sm font-bold text-white leading-snug">${neo.name}</h2>
        </div>
        ${badge}
      </div>

      <!-- Divider -->
      <div class="h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>

      <!-- Data rows -->
      <div class="flex flex-col">
        <div class="data-row">
          <span class="data-label">MISS DISTANCE</span>
          <span class="data-value accent">${neo.distKm.toLocaleString()} km</span>
        </div>
        <div class="data-row">
          <span class="data-label">LUNAR DIST</span>
          <span class="data-value">${neo.distLunar} LD</span>
        </div>
        <div class="data-row">
          <span class="data-label">DIAMETER EST.</span>
          <span class="data-value">~${neo.diameter} km</span>
        </div>
        <div class="data-row">
          <span class="data-label">VELOCITY</span>
          <span class="data-value ${isHazardous ? 'danger' : ''}">${neo.velocity} km/s</span>
        </div>
        <div class="data-row">
          <span class="data-label">CLOSE APPROACH</span>
          <span class="data-value">${neo.date}</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between mt-auto">
        <a href="${neo.nasaUrl}" target="_blank" rel="noopener noreferrer"
          class="font-mono text-xs text-cyan-500/60 hover:text-cyan-400 transition-colors tracking-wider">
          NASA JPL →
        </a>
        <button
          onclick="window.toggleFav('${neo.id}', this)"
          class="fav-btn font-mono text-xs px-2 py-1 border rounded transition-all tracking-wider
                 ${neo.isFav
                   ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/5'
                   : 'border-gray-700 text-gray-600 hover:border-yellow-500/40 hover:text-yellow-400'}"
          data-id="${neo.id}">
          ${neo.isFav ? '★ SAVED' : '☆ SAVE'}
        </button>
      </div>
    </div>
  `;
}

// ─── Render all cards ─────────────────────────────────────────────

export function renderCards(neos) {
  const grid       = document.getElementById('cardsGrid');
  const emptyState = document.getElementById('emptyState');
  const statsBar   = document.getElementById('statsBar');

  if (neos.length === 0) {
    grid.innerHTML = '';
    emptyState.classList.remove('hidden');
    emptyState.classList.add('flex');
    statsBar.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  emptyState.classList.remove('flex');
  statsBar.classList.remove('hidden');

  // Stats
  const hazardCount = neos.filter(n => n.isHazardous).length;
  const closest     = neos.reduce((a, b) => a.distKm < b.distKm ? a : b);

  document.getElementById('statTotal').textContent     = neos.length;
  document.getElementById('statHazardous').textContent = hazardCount;
  document.getElementById('statClosest').textContent   =
    (closest.distKm / 1_000_000).toFixed(2) + 'M km';

  // Render using .map()
  grid.innerHTML = neos.map((neo, i) => buildCard(neo, i)).join('');
}
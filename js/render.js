// ════════════════════════════════════════════
// render.js — UI rendering logic for NEO cards
// ════════════════════════════════════════════

import { MAX_DIST_REF, MAX_VEL_REF, MAX_DIAM_REF } from './constants.js';

/**
 * Builds the HTML string for a single NEO card.
 * @param {Object} neo - The NEO data object
 * @param {number} index - Index in the array for animation delay
 * @param {boolean} isClosest - Determines if this is the closest asteroid to highlight
 * @returns {string} HTML string for the card
 */
function buildCard(neo, index, isClosest) {
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

  // Closest highlight classes
  const closestBadgeHTML = isClosest 
    ? `<div class="absolute -top-3 -right-3 font-mono text-[10px] px-2 py-0.5 rounded border border-cyan-400 bg-cyan-900 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.5)] z-10 uppercase tracking-widest animate-pulse">Closest</div>`
    : '';
  const closestAnimClass = isClosest ? 'closest-highlight' : '';

  // Hazard meter
  const proxScore = Math.max(0, 100 - (neo.distKm / MAX_DIST_REF * 100));
  const velScore = Math.min(100, (neo.velocity / MAX_VEL_REF * 100));
  const diamScore = Math.min(100, (neo.diameter / MAX_DIAM_REF * 100));
  const hazardScore = Math.round((proxScore * 0.4) + (velScore * 0.3) + (diamScore * 0.3));

  let meterColor = 'bg-green-500';
  if (hazardScore >= 30) meterColor = 'bg-yellow-500';
  if (hazardScore > 60) meterColor = 'bg-red-500';

  const hazardMeterHTML = `
    <div class="mt-2 flex flex-col gap-1">
      <div class="flex justify-between items-center text-[10px] font-mono tracking-widest text-gray-500">
        <span>THREAT SCORE:</span>
        <span class="${hazardScore > 60 ? 'text-red-400' : hazardScore >= 30 ? 'text-yellow-400' : 'text-green-400'}">${hazardScore}</span>
      </div>
      <div class="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
        <div class="h-full ${meterColor}" style="width: ${hazardScore}%"></div>
      </div>
    </div>
  `;

  // staggered animation delay
  const delay = `animation-delay: ${index * 60}ms`;

  return `
    <div class="neo-card ${hazardClass} ${closestAnimClass} rounded-xl border ${borderClass} p-5 flex flex-col gap-4 cursor-default"
         style="${delay}">
      ${closestBadgeHTML}

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

      ${hazardMeterHTML}

      <!-- Footer -->
      <div class="flex items-center justify-between mt-auto pt-2">
        <button
          onclick="window.shareCard('${neo.name}', '${neo.distKm.toLocaleString()}', '${neo.date}', '${neo.velocity}', this)"
          class="font-mono text-xs px-2 py-1 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 rounded transition-colors tracking-wider">
          🔗 SHARE
        </button>
        <div class="flex items-center gap-3">
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
    </div>
  `;
}

/**
 * Renders the provided NEO array to the DOM.
 * @param {Array} neos - Sliced array of NEOs to render
 * @param {Object} ctx - Render context containing state flags like isFirstPage, sortType.
 */
export function renderCards(neos, ctx) {
  const grid       = document.getElementById('cardsGrid');
  const emptyState = document.getElementById('emptyState');
  const statsBar   = document.getElementById('statsBar');
  const pagination = document.getElementById('pagination');

  if (neos.length === 0) {
    grid.innerHTML = '';
    emptyState.classList.remove('hidden');
    emptyState.classList.add('flex');
    pagination.classList.add('hidden');
    
    // Hide empty state search specific message
    const emptyStateText = emptyState.querySelector('p');
    if (ctx.searchQuery) {
        emptyStateText.textContent = `No results for '${ctx.searchQuery}'`;
    } else {
        emptyStateText.textContent = 'NO OBJECTS DETECTED IN RANGE';
    }
    return;
  }

  emptyState.classList.add('hidden');
  emptyState.classList.remove('flex');
  statsBar.classList.remove('hidden');
  pagination.classList.remove('hidden');

  let closestId = null;
  if (ctx.isFirstPage && ctx.sortType === 'distance' && neos.length > 0) {
     closestId = neos[0].id; // Arrays are pre-sorted in data pipeline
  }

  // Render using .map()
  grid.innerHTML = neos.map((neo, i) => buildCard(neo, i, neo.id === closestId)).join('');
}
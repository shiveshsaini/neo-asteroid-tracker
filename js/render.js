// ════════════════════════════════════════════
// render.js — UI rendering logic for NEO cards
// ════════════════════════════════════════════

import { MAX_DIST_REF, MAX_VEL_REF, MAX_DIAM_REF } from './constants.js';

/**
 * Builds the HTML string for a single NEO card under the Stellar Atlas design language.
 * @param {Object} neo - The NEO data object
 * @param {number} index - Index in the array for animation delay
 * @param {boolean} isClosest - Determines if this is the closest asteroid to highlight
 * @returns {string} HTML string for the card
 */
function buildCard(neo, index, isClosest) {
  const isHazardous = neo.isHazardous;

  // Hazard / Safe Badge
  const badgeHTML = isHazardous
    ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-crimson/20 bg-crimson/5 text-[9px] font-mono font-medium tracking-[0.1em] text-crimson uppercase">
         <div class="w-1 h-1 bg-crimson rounded-full animate-pulse"></div>
         Hazard
       </span>`
    : `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-emerald/20 bg-emerald/5 text-[9px] font-mono font-medium tracking-[0.1em] text-emerald uppercase">
         <div class="w-1 h-1 bg-emerald rounded-full"></div>
         Safe
       </span>`;

  // Base card styling
  const borderClass = isHazardous ? 'border-crimson/15' : 'border-white/5';
  const closestAnimClass = isClosest ? 'closest-highlight z-10' : 'border-white/5';

  // Closest Badge (Gold ribbon)
  const closestBadgeHTML = isClosest 
    ? `<div class="absolute top-0 right-6 px-3 py-1 bg-gold text-obsidian text-[8px] font-mono font-bold tracking-[0.2em] uppercase rounded-b-md shadow-[0_5px_15px_rgba(212,175,55,0.4)]">
         Primary Intercept
       </div>`
    : '';

  // Calculate Threat Score (0-100)
  const proxScore = Math.max(0, 100 - (neo.distKm / MAX_DIST_REF * 100));
  const velScore = Math.min(100, (neo.velocity / MAX_VEL_REF * 100));
  const diamScore = Math.min(100, (neo.diameter / MAX_DIAM_REF * 100));
  const hazardScore = Math.round((proxScore * 0.4) + (velScore * 0.3) + (diamScore * 0.3));

  let meterColor = 'bg-emerald';
  let meterShadow = 'shadow-[0_0_5px_rgba(42,157,143,0.5)]';
  if (hazardScore >= 30) {
    meterColor = 'bg-gold';
    meterShadow = 'shadow-[0_0_5px_rgba(212,175,55,0.5)]';
  }
  if (hazardScore > 60) {
    meterColor = 'bg-crimson';
    meterShadow = 'shadow-[0_0_5px_rgba(230,57,70,0.5)]';
  }

  // Elegant Threat Meter
  const hazardMeterHTML = `
    <div class="mt-4 pt-4 border-t border-white/5">
      <div class="flex justify-between items-end mb-2">
        <span class="text-[9px] font-mono text-muted uppercase tracking-[0.15em]">Threat Evaluation</span>
        <span class="text-xs font-mono ${hazardScore > 60 ? 'text-crimson' : hazardScore >= 30 ? 'text-gold' : 'text-emerald'}">${hazardScore}<span class="text-muted text-[9px]">/100</span></span>
      </div>
      <div class="w-full h-[3px] bg-obsidian rounded-full overflow-hidden border border-white/5">
        <div class="h-full ${meterColor} ${meterShadow} threat-stripes transition-all duration-1000 ease-out" style="width: ${hazardScore}%"></div>
      </div>
    </div>
  `;

  // Staggered animation delay
  const delay = `animation-delay: ${index * 80}ms`;

  const btnFavClass = neo.isFav
    ? 'text-gold hover:text-pearl'
    : 'text-muted hover:text-pearl';

  const favIcon = neo.isFav 
    ? `<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
    : `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>`;

  return `
    <div class="stellar-card bg-surface/40 backdrop-blur-md rounded-2xl border ${borderClass} ${closestAnimClass} p-6 flex flex-col cursor-default group" style="${delay}">
      ${closestBadgeHTML}

      <!-- Header -->
      <div class="flex items-start justify-between mb-5">
        <div>
          <div class="text-[9px] font-mono text-muted tracking-[0.2em] uppercase mb-1.5 flex items-center gap-1.5">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path></svg>
            ${neo.id}
          </div>
          <h2 class="font-display text-lg font-medium text-pearl tracking-wide leading-tight group-hover:text-gold transition-colors">${neo.name}</h2>
        </div>
        ${badgeHTML}
      </div>

      <!-- Data Grid (2 columns for clean look) -->
      <div class="grid grid-cols-2 gap-y-4 gap-x-2 mt-2">
        
        <div class="flex flex-col">
          <span class="text-[9px] font-mono text-muted tracking-widest uppercase mb-1 line-clamp-1">Proximity</span>
          <span class="text-sm font-sans font-light text-pearl">
            ${(neo.distKm / 1_000_000).toFixed(2)}<span class="text-[10px] text-muted ml-0.5 font-mono">M km</span>
          </span>
        </div>

        <div class="flex flex-col">
          <span class="text-[9px] font-mono text-muted tracking-widest uppercase mb-1 line-clamp-1">Velocity</span>
          <span class="text-sm font-sans font-light ${isHazardous ? 'text-crimson' : 'text-pearl'}">
            ${neo.velocity}<span class="text-[10px] text-muted ml-0.5 font-mono">km/s</span>
          </span>
        </div>

        <div class="flex flex-col">
          <span class="text-[9px] font-mono text-muted tracking-widest uppercase mb-1 line-clamp-1">Diameter</span>
          <span class="text-sm font-sans font-light text-pearl">
            ${neo.diameter}<span class="text-[10px] text-muted ml-0.5 font-mono">km</span>
          </span>
        </div>

        <div class="flex flex-col">
          <span class="text-[9px] font-mono text-muted tracking-widest uppercase mb-1 line-clamp-1">Intercept Date</span>
          <span class="text-[11px] font-mono text-pearl mt-0.5">
            ${neo.date}
          </span>
        </div>

      </div>

      ${hazardMeterHTML}

      <!-- Footer Actions -->
      <div class="flex items-center justify-between mt-5 pt-3">
        <button
          onclick="window.shareCard('${neo.name}', '${neo.distKm.toLocaleString()}', '${neo.date}', '${neo.velocity}', this)"
          class="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-muted hover:text-gold transition-colors px-2 py-1 -ml-2 rounded hover:bg-white/5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
          <span class="share-text">Copy Link</span>
        </button>
        
        <div class="flex items-center gap-2">
          <a href="${neo.nasaUrl}" target="_blank" rel="noopener noreferrer"
             class="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-muted hover:text-pearl transition-colors px-2 py-1 rounded hover:bg-white/5">
            JPL
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
          </a>
          
          <button
            onclick="window.toggleFav('${neo.id}', this)"
            class="fav-btn flex items-center justify-center w-8 h-8 rounded-full border border-white/5 bg-charcoal/50 hover:bg-surface transition-all ${btnFavClass}"
            data-id="${neo.id}" title="Toggle Bookmark">
            ${favIcon}
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
        emptyStateText.textContent = `No matches found for '${ctx.searchQuery}' in current trajectory data.`;
    } else {
        emptyStateText.textContent = 'Space appears vacant under current parameters.';
    }
    return;
  }

  emptyState.classList.add('hidden');
  emptyState.classList.remove('flex');
  statsBar.classList.remove('hidden');
  pagination.classList.remove('hidden');
  pagination.classList.add('flex'); // Ensuring it sets to flex

  let closestId = null;
  if (ctx.isFirstPage && ctx.sortType === 'distance' && neos.length > 0) {
     closestId = neos[0].id; // Arrays are pre-sorted in data pipeline
  }

  // Render using .map()
  grid.innerHTML = neos.map((neo, i) => buildCard(neo, i, neo.id === closestId)).join('');
}
// ─── Build a single asteroid card ──────────────────────────────

function buildCard(neo) {
  const hazardBadge = neo.isHazardous
    ? `<span class="text-xs font-medium px-2 py-0.5 rounded-full
                    bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400
                    border border-red-200 dark:border-red-800">
         Hazardous
       </span>`
    : `<span class="text-xs font-medium px-2 py-0.5 rounded-full
                    bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400
                    border border-green-200 dark:border-green-800">
         Safe
       </span>`;

  const cardBorder = neo.isHazardous
    ? 'border-red-200 dark:border-red-900'
    : 'border-gray-200 dark:border-gray-800';

  return `
    <div class="neo-card bg-white dark:bg-gray-900 rounded-2xl border ${cardBorder} p-5 flex flex-col gap-4">

      <!-- Header -->
      <div class="flex items-start justify-between gap-2">
        <h2 class="font-semibold text-gray-900 dark:text-white text-base leading-tight">
          ${neo.name}
        </h2>
        ${hazardBadge}
      </div>

      <!-- Stats grid -->
      <div class="grid grid-cols-2 gap-3">

        <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
          <p class="text-xs text-gray-400 mb-1">Distance</p>
          <p class="text-sm font-medium text-gray-800 dark:text-gray-200">
            ${neo.distKm.toLocaleString()} km
          </p>
          <p class="text-xs text-gray-400">${neo.distLunar} lunar</p>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
          <p class="text-xs text-gray-400 mb-1">Diameter</p>
          <p class="text-sm font-medium text-gray-800 dark:text-gray-200">
            ~${neo.diameter} km
          </p>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
          <p class="text-xs text-gray-400 mb-1">Velocity</p>
          <p class="text-sm font-medium text-gray-800 dark:text-gray-200">
            ${neo.velocity} km/s
          </p>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
          <p class="text-xs text-gray-400 mb-1">Close approach</p>
          <p class="text-sm font-medium text-gray-800 dark:text-gray-200">
            ${neo.date}
          </p>
        </div>

      </div>

      <!-- NASA link -->
      <a href="${neo.nasaUrl}" target="_blank" rel="noopener noreferrer"
        class="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400
               hover:underline mt-auto">
        View on NASA JPL →
      </a>

    </div>
  `;
}

// ─── Render all cards into the grid ────────────────────────────

export function renderCards(neos) {
  const grid       = document.getElementById('cardsGrid');
  const emptyState = document.getElementById('emptyState');
  const statsBar   = document.getElementById('statsBar');

  if (neos.length === 0) {
    grid.innerHTML = '';
    emptyState.classList.remove('hidden');
    statsBar.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  // Update stats bar
  statsBar.classList.remove('hidden');
  const hazardCount = neos.filter(n => n.isHazardous).length;
  const closest     = neos.reduce((a, b) => a.distKm < b.distKm ? a : b);

  document.getElementById('statTotal').textContent     = neos.length;
  document.getElementById('statHazardous').textContent = hazardCount;
  document.getElementById('statClosest').textContent   =
    (closest.distKm / 1000000).toFixed(2) + 'M km';

  // Render cards using .map()
  grid.innerHTML = neos.map(neo => buildCard(neo)).join('');
}
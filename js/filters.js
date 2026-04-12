// ════════════════════════════════════════════
// filters.js — HOF pipeline for search/filter/sort/paginate
// ════════════════════════════════════════════

import { PAGE_SIZE } from './constants.js';

/**
 * Filters, sorts and paginates the NEO array. Returns sliced results.
 * @param {Array} allNEOs - Array of all loaded NEO objects
 * @param {Object} options - Search and structure filters { query, filter, sort, page, pageSize }
 * @returns {Object} { paginated, totalCount }
 */
export function getFilteredNEOs(allNEOs, { query = '', filter = 'all', sort = 'distance', page = 1, pageSize = PAGE_SIZE }) {
  // 1. .filter() — by hazardous/safe/all
  let pipeline = allNEOs.filter(neo => {
    if (filter === 'safe') return !neo.isHazardous;
    if (filter === 'hazardous') return neo.isHazardous;
    return true; // 'all'
  });

  // 2. .filter() — by search query (name includes query, case-insensitive)
  if (query) {
    const q = query.toLowerCase();
    pipeline = pipeline.filter(neo => neo.name.toLowerCase().includes(q));
  }

  // 3. .sort() — by distance, velocity, name, or diameter
  pipeline = [...pipeline].sort((a, b) => {
    if (sort === 'distance') return a.distKm - b.distKm;
    if (sort === 'velocity') return b.velocity - a.velocity;
    if (sort === 'diameter') return b.diameter - a.diameter;
    if (sort === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  // 4. Return total count before slicing (for pagination display)
  const totalCount = pipeline.length;

  // 5. .slice() — paginate (pageSize = 12 per page)
  const startIndex = (page - 1) * pageSize;
  const paginated = pipeline.slice(startIndex, startIndex + pageSize);

  return { paginated, totalCount };
}

/**
 * Calculates total pages based on filtered count
 * @param {Array} allNEOs - Array of all loaded NEO objects
 * @param {Object} filters - Current UI filter options
 * @param {number} pageSize - Number of items per page
 * @returns {number} Total number of pages (minimum 1)
 */
export function getTotalPages(allNEOs, filters, pageSize = PAGE_SIZE) {
  const { totalCount } = getFilteredNEOs(allNEOs, { ...filters, page: 1, pageSize: 999999999 });
  return Math.max(1, Math.ceil(totalCount / pageSize));
}

/**
 * Calculates aggregate stats from NEOs data pipeline using filter/map/reduce
 * @param {Array} allNEOs - Array of NEO objects to extract summary metrics from
 * @returns {Object} Extracted stats { totalDiam, fastest, avgDist }
 */
export function getStats(allNEOs) {
  if (!allNEOs || allNEOs.length === 0) return { totalDiam: 0, fastest: 0, avgDist: 0 };

  const totalDiam = allNEOs
    .map(neo => neo.diameter)
    .reduce((a, b) => a + b, 0);

  const fastest = allNEOs
    .map(neo => neo.velocity)
    .reduce((a, b) => Math.max(a, b), 0);

  const totalDist = allNEOs
    .map(neo => neo.distKm)
    .reduce((a, b) => a + b, 0);

  const avgDist = totalDist / allNEOs.length;

  return { totalDiam, fastest, avgDist };
}

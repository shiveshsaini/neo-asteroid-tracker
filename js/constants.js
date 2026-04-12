// ════════════════════════════════════════════
// constants.js — Application-wide constants
// ════════════════════════════════════════════

/** Number of NEO cards per page */
export const PAGE_SIZE     = 12;

/** Time to live for local storage cache in milliseconds (1 hour) */
export const CACHE_TTL     = 60 * 60 * 1000;

/** Distance reference (km) for hazard meter calculation */
export const MAX_DIST_REF  = 100_000_000;

/** Velocity reference (km/s) for hazard meter calculation */
export const MAX_VEL_REF   = 50;

/** Diameter reference (km) for hazard meter calculation */
export const MAX_DIAM_REF  = 3;

/** Debounce time in milliseconds for search input */
export const DEBOUNCE_MS   = 300;

/** Reset timeout for share button copy text in milliseconds */
export const COPY_RESET_MS = 2000;

const API_KEY    = '4kfIqzOJhKE7Gfbm8ewYIM4feSWgzIEtl1RtcAhP';
const BASE_URL   = 'https://api.nasa.gov/neo/rest/v1/feed';
const CACHE_TTL  = 60 * 60 * 1000; // 1 hour
const CACHE_PFX  = 'neo-cache-';

// ─── Date helpers ─────────────────────────────────────────────────

export function getToday() {
  return new Date().toISOString().split('T')[0];
}

function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

// ─── Cache ────────────────────────────────────────────────────────

function setCache(date, neos) {
  try {
    localStorage.setItem(CACHE_PFX + date, JSON.stringify({ timestamp: Date.now(), data: neos }));
  } catch (e) {
    console.warn('Cache write failed:', e);
  }
}

function getCache(date) {
  try {
    const raw = localStorage.getItem(CACHE_PFX + date);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_PFX + date);
      return null;
    }
    return entry.data;
  } catch (e) {
    return null;
  }
}

// ─── Parser ───────────────────────────────────────────────────────

function parseNEOs(data) {
  return Object.values(data.near_earth_objects)
    .flat()
    .map(neo => ({
      id:          neo.id,
      name:        neo.name.replace(/[()]/g, '').trim(),
      isHazardous: neo.is_potentially_hazardous_asteroid,
      diameter: parseFloat((
        (Math.abs(neo.estimated_diameter.kilometers.estimated_diameter_min) +
        Math.abs(neo.estimated_diameter.kilometers.estimated_diameter_max)) / 2
        ).toFixed(3)),  
      distKm:      Math.round(parseFloat(neo.close_approach_data[0].miss_distance.kilometers)),
      distLunar:   parseFloat(parseFloat(neo.close_approach_data[0].miss_distance.lunar).toFixed(2)),
      velocity:    parseFloat(parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_second).toFixed(2)),
      date:        neo.close_approach_data[0].close_approach_date,
      nasaUrl:     neo.nasa_jpl_url,
    }));
}

// ─── Fetch (cache-first) ──────────────────────────────────────────

export async function fetchNEOs(startDate = getToday()) {
  const cached = getCache(startDate);
  if (cached) {
    console.log('Cache hit:', startDate);
    return cached;
  }

  const url      = `${BASE_URL}?start_date=${startDate}&end_date=${addDays(startDate, 6)}&api_key=${API_KEY}`;
  const loader   = document.getElementById('loader');
  const errorDiv = document.getElementById('error');
  const errorTxt = document.getElementById('errorText');

  loader.classList.remove('hidden');
  loader.classList.add('flex');
  errorDiv.classList.add('hidden');

  try {
    const res  = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} — check your API key`);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    const neos = parseNEOs(data);
    setCache(startDate, neos);
    return neos;
  } catch (err) {
    errorTxt.textContent = err.message;
    errorDiv.classList.remove('hidden');
    return [];
  } finally {
    loader.classList.add('hidden');
    loader.classList.remove('flex');
  }
}
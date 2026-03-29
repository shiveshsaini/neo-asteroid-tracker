const API_KEY = 'DEMO_KEY'; // Replace with your key from api.nasa.gov
const BASE_URL = 'https://api.nasa.gov/neo/rest/v1/feed';

const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const CACHE_PREFIX = 'neo-cache-';

// ─── Date helpers ───────────────────────────────────────────────

export function getToday() {
  return new Date().toISOString().split('T')[0];
}

function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

// ─── Cache helpers ──────────────────────────────────────────────

function setCache(date, neos) {
  try {
    const entry = { timestamp: Date.now(), data: neos };
    localStorage.setItem(CACHE_PREFIX + date, JSON.stringify(entry));
  } catch (e) {
    console.warn('Cache write failed:', e);
  }
}

function getCache(date) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + date);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_PREFIX + date);
      return null;
    }
    return entry.data;
  } catch (e) {
    return null;
  }
}

// ─── Parser — flatten the deeply nested NASA response ───────────

function parseNEOs(data) {
  return Object.values(data.near_earth_objects)
    .flat()
    .map(neo => ({
      id:          neo.id,
      name:        neo.name.replace(/[()]/g, '').trim(),
      isHazardous: neo.is_potentially_hazardous_asteroid,
      diameter:    parseFloat((
        (neo.estimated_diameter.kilometers.estimated_diameter_min +
         neo.estimated_diameter.kilometers.estimated_diameter_max) / 2
      ).toFixed(3)),
      distKm:      parseFloat(
        parseFloat(neo.close_approach_data[0].miss_distance.kilometers).toFixed(0)
      ),
      distLunar:   parseFloat(
        parseFloat(neo.close_approach_data[0].miss_distance.lunar).toFixed(2)
      ),
      velocity:    parseFloat(
        parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_second).toFixed(2)
      ),
      date:        neo.close_approach_data[0].close_approach_date,
      nasaUrl:     neo.nasa_jpl_url,
    }));
}

// ─── Main fetch (cache-first) ───────────────────────────────────

export async function fetchNEOs(startDate = getToday()) {
  const cached = getCache(startDate);
  if (cached) {
    console.log('Serving from cache:', startDate);
    return cached;
  }

  const endDate = addDays(startDate, 6);
  const url = `${BASE_URL}?start_date=${startDate}&end_date=${endDate}&api_key=${API_KEY}`;

  const loader   = document.getElementById('loader');
  const errorDiv = document.getElementById('error');
  const errorTxt = document.getElementById('errorText');

  loader.classList.remove('hidden');
  errorDiv.classList.add('hidden');

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`NASA API error: HTTP ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error.message || 'API key error');
    const neos = parseNEOs(data);
    setCache(startDate, neos);
    return neos;
  } catch (err) {
    errorTxt.textContent = err.message;
    errorDiv.classList.remove('hidden');
    return [];
  } finally {
    loader.classList.add('hidden');
  }
}
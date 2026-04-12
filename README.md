# neo-asteroid-tracker

A web app that shows you real asteroids flying past Earth right now — built with the NASA NeoWs API.

---

## About

I built this because I wanted to see what asteroids are actually passing Earth this week. You can search them by name, filter the dangerous ones, sort by how close they are, and save your favorites. All data is live from NASA.

---

## Live Demo

🔗 [Check it out here](https://shiveshsaini.github.io/neo-asteroid-tracker/) *(deploy link)*

---

## Features

- 🔍 **Search** asteroids by name
- ☣️ **Filter** by hazardous / non-hazardous
- 📏 **Sort** by distance, size, or name
- ⭐ **Favorites** — save asteroids, persists on refresh
- 🌙 **Dark mode** — remembers your preference
- ⚡ **Cached responses** — won't re-fetch the same data for 1 hour
- 📄 **Pagination** — 10 asteroids per page

---

## Tech Stack

- HTML, CSS, JavaScript
- Tailwind CSS
- NASA NeoWs API
- localStorage

---

## Getting Started

1. Clone the repo
   ```bash
   git clone https://github.com/your-username/neo-asteroid-tracker.git
   cd neo-asteroid-tracker
   ```

2. Get a free API key at [api.nasa.gov](https://api.nasa.gov)

3. Open `js/api.js` and replace `'DEMO_KEY'` with your key
   ```js
   const API_KEY = 'your_key_here';
   ```

4. Open `index.html` in your browser — that's it, no installs needed

---

## Project Structure

```
neo-asteroid-tracker/
├── index.html
├── style.css
├── js/
│   ├── api.js        # NASA API calls + caching
│   ├── storage.js    # localStorage (favorites, dark mode)
│   ├── filters.js    # search, filter, sort logic
│   ├── render.js     # card rendering
│   └── main.js       # entry point
└── README.md
```

---

## API

Uses the [NASA NeoWs API](https://api.nasa.gov) — completely free, just needs an email signup for a key.

Endpoint: `https://api.nasa.gov/neo/rest/v1/feed?start_date=YYYY-MM-DD&api_key=YOUR_KEY`

---

## Author

Made by **Shivesh Saini** — [GitHub](https://github.com/shiveshsaini)

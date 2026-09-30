# pupmap 🐾

A cozy, responsive NYC dog-license explorer. Built with React, Vite, Leaflet, Lucide icons, locally hosted Fredoka and DM Sans fonts, and original SVG puppy illustrations.

## Run locally

```sh
npm install
npm run dev
```

Open the localhost URL Vite prints. `npm run build` produces a deployable static site in `dist/`; `npm run preview` previews it. No API key, backend, runtime data request to NYC, or external map tile provider is required. A ZIP opens directly at `/?zip=11222`.

## Data provenance and method

- Licenses: https://data.cityofnewyork.us/d/nu7n-tubp (NYC DOHMH).
- ZIP geometry: https://data.cityofnewyork.us/d/35j5-n34v (NYC-published Census ZCTAs).
- Shoreline and boroughs: https://data.cityofnewyork.us/d/gthc-hcne (NYC Department of City Planning).
- Retrieved September 30, 2026. Source metadata describes each row as an active license period and explicitly warns that renewals create more than one record per dog.
- The available extract years were 2026, 2024, 2023, 2022, 2018, 2017, and 2016. We select **2024**, the latest available completed calendar year, excluding the in-progress 2026 extract. No 2025 extract was available and the publisher does not independently certify completeness.
- 105,974 rows in the 2024 extract; 843 exact duplicate rows removed across **all eight original source columns**, before normalization. The remaining 105,131 rows are license records, not unique dogs. Distinct license periods are never merged just because dog details match.
- 104,575 retained records in 236 NYC ZIP groups, with 211 clipped map areas. NYC ZIP prefix groups 100–104, 111–114, and 116, plus Queens postal ZIPs 11004 and 11005, are used to screen license records. Source ZIP entries are not independently USPS-validated. Other source ZIPs are excluded; geometry is additionally restricted to land within the five boroughs.
- Capitalization and whitespace are normalized. All excluded placeholders and clear breed label synonyms are listed in `scripts/build_data.py` and `public/data/summary.json`. Mixed-breed categories are not merged into purebreds. Breed varieties remain separate.
- Names are independently ranked across all eligible named records in each ZIP. Unknown breeds do not disqualify otherwise eligible names. First-place ties include **every** tied name and breed. “More neighborhood pups” includes the next two distinct count ranks and all ties at those ranks.
- A ranking requires 5 records with known breeds. Fewer than 30 total license records is marked as a small sample. These are product display thresholds, not statistical significance claims.
- Census ZCTAs approximate postal ZIP areas. They are clipped to NYC shoreline polygons and simplified at 0.000025 degrees for display. Borough labels reflect geographic intersections greater than 1% of the clipped ZIP area. Multiple boroughs can be shown; unmatched ZIPs get results without an inferred borough or polygon.
- Only summaries and public geometry are sent to the browser. Source license rows stay outside the project. Raw names are never shipped as records; only aggregate winning names are included.

## Refresh the data

Requires Python 3 and Shapely. The script's current annual extract is intentionally pinned to 2024; inspect the source metadata and available years before changing it. Query limits are checked to avoid silently truncating the license extract.

```sh
python3 -m venv .venv
.venv/bin/pip install shapely
.venv/bin/python scripts/build_data.py --download
```

Without `--download`, it reads cached source files from `/tmp/pupmap-{records,geo,boroughs}.json`. Update the retrieval date, year, and documentation together when refreshing. `summary.json` includes audit counts, source URLs, exclusion lists, and alias mappings.

## Verification

```sh
npx playwright install chromium
npm run dev -- --port 5174
npm test
```

Tests cover real 11222 counts and name, mouse/keyboard map interaction, hover, reset, surprise, URL restoration, invalid/outside ZIPs, small samples, missing polygons, ties, recoverable loading errors, sharing and manual-copy fallback, mobile overflow and sheet placement, reduced motion, and accessibility. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to use an existing Chromium binary and `PLAYWRIGHT_BASE_URL` for a different preview URL.

Keyboard users can search with Enter, activate ZIP polygons with Enter/Space, use map zoom controls, close results with Escape, and expand native details. The result panel has a focus target. Reduced-motion preferences disable animation. Mobile sheets expand, scroll internally, and reserve map space for the selected area. Portraits have meaningful alternative text; unsupported and mixed categories clearly use a generic illustration.

## Deployment

Serve `dist/` with any static host after `npm run build`. The current preview runs locally; no public deployment is configured. Fonts are bundled locally under their Google Fonts open-source licenses. Leaflet is BSD-2-Clause, Lucide is ISC, React is MIT.

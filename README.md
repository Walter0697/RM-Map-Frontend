# RM-Map
- ![](https://raw.githubusercontent.com/Walter0697/RM-Map-Frontend/beer/title.png)

### Introduction
- RoMarker Map, an application to store location that we want to visit. Hopefully using PWA for offline usage, still investigating the possibilities of these technologies. Just a personal project for myself to have practical usage. Please do't judge my drawing skill

### Technologies
- React
- PWA
- React-Spring
- TomTom Map (Google Map costs more so nah)

### Preview
- ![](https://raw.githubusercontent.com/Walter0697/RM-Map-Frontend/beer/preview/001.gif)
- Browse your saved markers!
- ![](https://raw.githubusercontent.com/Walter0697/RM-Map-Frontend/beer/preview/002.gif)
- Search nearby location to create marker!

### Environment
- Get API Key from TomTom Site and enter in `REACT_APP_MAP_APIKEY` in `.env`

### GitHub Actions Delivery
- Delivery runs only when the pushed branch equals the repository default branch.
- Frontend image is published to GHCR as `ghcr.io/<owner>/rm-map-frontend` with three tags:
  - commit SHA (first 12 chars)
  - version extracted from `package.json`
  - `latest`

### Required GitHub Variables / Secrets
- `TOMTOM_MAP_APIKEY` (secret or variable)
- `FRONTEND_BACKEND_BASE_URL` (secret or variable), for example `https://api.example.com`

### Auto-Derived Frontend Endpoints
- App env only needs `REACT_APP_BACKEND_BASE_URL` for backend host.
- Frontend derives these in code:
  - GraphQL: `${REACT_APP_BACKEND_BASE_URL}/query`
  - Auth/API key: `${REACT_APP_BACKEND_BASE_URL}/auth`
  - Image links: `${REACT_APP_BACKEND_BASE_URL}`

### Travel Plan Delete UX
- New settings entry: `Travel Plans` opens `/travel-plans`.
- Each plan includes a `Delete Plan` action with confirmation prompt.
- Each daily item includes a `Delete Item` action with confirmation prompt.
- After either delete action succeeds, UI refreshes list/detail so soft-deleted records disappear from active view.

### Security Note for TomTom Key
- Even if stored in GitHub Secrets, this key is embedded into the browser bundle at build time.
- Treat it as managed public configuration, not a confidential secret.
- Restrict usage with provider controls (allowed referrers/domains, quota, and monitoring).

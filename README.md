# KillTheNoise Front-end

React + TypeScript SPA.

## Local dev

```bash
cp .env.sample .env
npm i
npm start
```

## API contract

```
GET /api/hubspot/status → { connected: bool }
POST /api/hubspot/sync → triggers HS sync
GET /api/issues?source=hubspot&limit=5 → latest HS tickets
```

When backend is absent the UI serves mock data. 
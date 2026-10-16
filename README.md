# Project X prototype

A League-first multi-game companion prototype with a working dashboard, champion explorer, match review, and cosmetic collection.

## Included
- A responsive dark workspace with lime accents and keyboard-accessible navigation.
- Twelve champions with official artwork, descriptions, ability overviews, and a local favorite pool.
- Eight showcase skins with manual ownership, wishlisting, search, filters, and full artwork previews.
- Six explicitly fictional matches with example decisions, timelines, derived statistics, and selectable next-game focus.
- Device-local preferences in versioned browser storage. No Riot account connection, live match import, or automated analysis.

## Development
This project uses the bundled Vinext/React starter. Install with `npm run install:ci`, and build with `npm run build`. Preserve the Sites build integration and `.openai/hosting.json` identity.

## Game data
Artwork and champion descriptions: Riot Games Data Dragon 16.17.1. See `public/asset-credits.json` for provenance. The catalog is a fixed prototype subset; role and practice notes are introductory guidance, not current build recommendations. Match observations and initial collection ownership are sample content.

## Prototype boundaries
Only League of Legends is implemented. Other games are represented as planned in the game selector. Data stays in the browser where the prototype is used, with an in-memory fallback if storage is unavailable. Clearing browser data resets local changes.

## Riot match history
Set `RIOT_API_KEY` as a secret using Sites runtime environment settings, then redeploy. No key is included in source or browser code. Development keys expire; a public app should use a Riot-approved production key. `/api/riot/history` resolves Riot ID through Account-V1 and fetches five Match-V5 records per page. Supports regional routing, queue filtering, pagination, missing/expired credentials, not-found accounts, timeouts and rate-limit responses. Custom games are excluded. Data Dragon supplies artwork; it cannot provide player history or skin ownership. Live results and the existing illustrative coaching matches are labeled separately.

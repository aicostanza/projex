# Project X

A League-first gaming companion with a dashboard, champion and skin galleries, match review, cosmetic collections, and a server-side Riot match-history handler.

## Installation

See [INSTALLATION.md](INSTALLATION.md) for requirements, local setup, build commands, Riot API configuration, troubleshooting, and Vercel migration requirements.

## Hosting

This repository is an export of the ChatGPT Site source. Its current scripts use Vinext and Cloudflare Workers. Vercel deployment requires adapting the build and server endpoints; the installation guide explains the remaining work.

## Data and credentials

Data Dragon supplies champion and skin artwork. Live player history uses Riot APIs through a server-side `RIOT_API_KEY`, configured separately in the hosting environment. No live runtime credentials are included in this repository. Data Dragon does not provide a player's skin ownership.

Favorites, collection selections, and preferences use browser-local storage. Illustrative match content is separate from live match results. See `public/asset-credits.json` for bundled artwork credits.

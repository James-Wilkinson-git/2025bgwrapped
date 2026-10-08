# 2025 BG Wrapped

A polished, data-driven year-in-review experience for board game enthusiasts that turns a BoardGameGeek (BGG) profile into a shareable storytelling experience.

This project is designed as both a useful consumer app and a strong portfolio piece: it combines frontend development, API integration, UX design, and product thinking into a single experience that feels social, personalized, and intuitive.

## Why this project exists

BoardGameGeek users accumulate a large amount of play data over time, but that data is often fragmented, difficult to interpret, and not especially engaging to revisit. I wanted to transform raw gaming history into a narrative format that feels like a modern annual recap.

The result is a web app that turns a player's stats into a visual “wrapped” style summary: favorite games, top mechanics, categories, designers, publishers, and broader community trends, all presented in a card-based storytelling flow.

## What the app does

- Accepts a BGG username and loads that player's board game activity
- Aggregates and displays a personalized year summary
- Highlights the most-played games and major category trends
- Surfaces top mechanics, designers, artists, and publishers
- Shows community-level context with popular games from the broader BGG ecosystem
- Supports shareable, URL-based user views
- Provides a clean, card-by-card browsing experience that feels similar to social media recap products

## Product snapshot

This app is built around a “story mode” experience: a user enters their BGG username, the app fetches their data, and a set of themed cards showcase their board game habits in a visually engaging sequence. The interface is intentionally lightweight and easy to navigate, emphasizing clarity over clutter.

## Tech stack

- React
- Vite
- React Router
- JavaScript / JSX
- REST API integration with a backend service
- Node.js backend for data processing and analytics
- Render for deployment and hosting
- CSS for responsive, polished card-based presentation

## Architecture

The frontend is a single-page React application that handles:

- username input and route-based user flows
- fetching analytics data from a backend service
- state management for loading, error handling, and refresh cycles
- interactive card navigation and storytelling UI

The app depends on a backend service that retrieves and normalizes BoardGameGeek plays, calculates analytics, and serves the frontend a ready-to-display summary model. This architecture keeps the client focused on user experience while the server handles data retrieval, transformation, enrichment, and the heavier computational work.

The frontend communicates with the backend over HTTP routes such as:

- user stats endpoints
- most-played game endpoints
- analytics summary endpoints
- optional refresh or refetch flows when data needs to be recalculated

This gives the project a realistic full-stack pattern: the UI requests structured data, the backend fetches and transforms external data, and the client renders the results with a clean interactive layer.

## Backend API design and service responsibilities

The backend service in the companion project, [bgg-app-backend](https://github.com/James-Wilkinson-git/bgg-app-backend), is a purpose-built API layer that abstracts the messy BoardGameGeek data pipeline. It is implemented with Express and MongoDB, and it exposes a small but well-defined set of routes that the frontend consumes.

GitHub: https://github.com/James-Wilkinson-git/bgg-app-backend

The key API routes are:

- GET /api/plays/:username
  - Fetches a user's 2025 BGG plays, paginates through the BoardGameGeek XML API, normalizes each play entry, stores it in MongoDB, and supports optional refetch and BGA exclusion.

- GET /api/analytics/:username/most-played
  - Aggregates play counts by game, computes top mechanics, categories, publishers, designers, and artists, and returns a structured payload ready for the wrapped experience.

- GET /api/analytics/:username/stats
  - Summarizes total plays, unique games, monthly activity, weighted average game age, and other high-level metrics for the player profile.

- GET /api/analytics/popular-games
  - Aggregates all 2025 plays across users to determine the most popular games in the broader community and returns thumbnails plus engagement counts.

- GET /api/bgg/collection/:username
  - Proxies BoardGameGeek's XML collection endpoint server-side so the app can avoid exposing the BGG API token in the frontend.

- GET /api/proxy-image
  - Fetches external thumbnails and images through the server to bypass browser CORS issues and standardize asset delivery.

- GET /api/games/2026
  - Returns a curated list of 2026 game data from the Mongo-backed catalog, with an optional sinceLastRun filter for incremental updates.

This API design is intentionally split around service responsibilities:

- data acquisition from BoardGameGeek
- transformation and enrichment of raw XML data
- persistence in MongoDB for caching and re-use
- aggregated analytics for the frontend
- proxy endpoints to protect credentials and handle remote resources cleanly

That separation makes the project feel much more like a real product architecture than a simple frontend fetch script.

## DevOps and deployment

The app is deployed on Render, and the frontend depends on the hosted backend service to fetch live data. This means the project demonstrates practical deployment thinking, not just local development work.

The deployment model includes:

- a frontend client for the wrapped storytelling experience
- a separate backend service handling BoardGameGeek integration and analytics
- CORS configuration for trusted origins and secure cross-domain access
- environment variables for secrets such as the BGG API token and MongoDB connection
- cloud-hosted services that keep the app available without exposing internal credentials to clients

This is important for a portfolio because it shows awareness of how modern web applications are structured in production: a UI layer, an API layer, external service integration, and a deployment environment working together. The companion backend repository is available here: https://github.com/James-Wilkinson-git/bgg-app-backend

## Key technical decisions

### 1. User-centric product experience
The UI is designed to feel more like a year-end recap product than a traditional dashboard. I focused on pacing, visual hierarchy, and a “one card at a time” storytelling pattern that makes the experience feel premium and discoverable.

### 2. Robust data flow
The app is built to handle a real-world challenge: BGG data may be missing, stale, or require a refresh. The logic includes fetch checks, analytics fallback paths, and refresh flows so the product remains resilient when data isn’t immediately available.

### 3. UI/UX as a differentiator
The difference between a good data app and a memorable one is often the user experience. This project emphasizes clarity, motion, card transitions, and concise summaries that help users understand their habits without needing to read raw tables.

## Project structure

```text
2025bgwrapped/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── components/
│   │   ├── UsernameInput.jsx
│   │   ├── WrappedCards.jsx
│   │   └── cards/
│   ├── index.css
│   └── main.jsx
└── README.md
```

## Getting started

### Prerequisites

- Node.js 18+
- npm

### Install and run

```bash
npm install
npm run dev
```

Then open the local Vite URL in your browser.

> Note: This app depends on the BGG analytics backend service to retrieve user data. If that service is unavailable, the app will show an error state rather than fail silently.

## What this project demonstrates

This project shows that I can:

- build a productized frontend experience from scratch
- connect a React app to live data sources through a backend API layer
- design and consume REST endpoints for analytics and user summaries
- turn raw data into understandable, visually compelling insights
- think beyond “just a page” and design around user flow, engagement, and product polish
- deploy and operate a web app in a cloud-hosted environment using Render
- create something shareable, interactive, and aligned with modern web product patterns

## Lessons and strengths

- Strong understanding of component-driven UI architecture
- Comfortable with asynchronous data fetching, error handling, and client-side resilience
- Experience working with backend-driven data flows and API integration
- Ability to translate a data-heavy concept into a clean user experience
- Product-minded thinking: balancing utility, polish, and user delight
- Awareness of deployment and hosting concerns for frontend-backend systems in production

## Future improvements

- Add persistent caching to improve performance and reduce repeated requests
- Improve filtering and comparison views across multiple time periods
- Add a stronger export/share experience for social media use cases
- Add test coverage for fetch states, refresh flows, and empty-data handling

## Summary

2025 BG Wrapped is a portfolio-ready example of combining data, UX, backend integration, and deployment thinking into a product users can actually enjoy and share. It reflects the kind of work I enjoy building: interactive, user-focused, and grounded in real data.

The central story is not just that it looks polished—it is that the app successfully bridges a frontend experience with a backend data pipeline and a hosted deployment model. That makes it a stronger full-stack case study: a modern web app that turns messy external data into a meaningful, shareable user experience.

# School website redesign notes

This update applies a visual refresh to the existing School & College Digital Platform while retaining its existing API, database, authentication, CMS, and route structure.

## What changed

- Reworked the public homepage into a modern editorial-style school landing page with hero, introduction, quick links, institutional story, academic programme highlights, campus-life banner, news, upcoming events, staff highlights, and contact call-to-action.
- Replaced the global dark public-site palette with a clean white, navy, and warm-gold visual system.
- Redesigned the public navigation and footer, including responsive mobile navigation styling.
- Added responsive layouts, hover interactions, entrance motion, and reduced-motion accessibility handling.
- Added shared visual treatment for CMS-authored informational pages and existing public catalogues.
- Preserved the admin dashboard's existing dark workspace appearance while harmonizing its controls and cards.
- Added About and Facilities as content areas intended to be created and published through the existing CMS. The homepage's About links point to its on-page story section so they do not depend on an unpublished CMS page.

## Important notes

- The existing project did not contain a dedicated facilities data model/API. Facilities and other additional informational sections should be authored as CMS pages/sections using the existing CMS capability, rather than introducing an unrelated management system.
- Homepage programme, news, events, and staff highlights continue to load from the existing public API. Empty states are shown when no content is published.
- Hero and editorial photography use remote Unsplash image URLs as visual defaults. Replace these with institution-owned images before production deployment.
- No database schema or API behavior was intentionally changed.

## Run locally

Install dependencies from the repository root:

```bash
npm ci
```

Configure environment variables using `.env.example`, then follow the existing database and API setup instructions in `README.md`.

Start both applications:

```bash
npm run dev
```

The web application is served on port 3000 and the API on port 4000 by the existing scripts.

## Verification

A production build could not be completed in the editing environment because dependency installation did not finish before the environment's command timeout (`next` was therefore unavailable). Run the following after `npm ci` completes locally:

```bash
npm run build:shared
npm run build:db
npm run build --workspace=@school/web
```

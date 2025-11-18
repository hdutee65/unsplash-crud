# Unsplash CRUD

A React 19 + Vite + Tailwind project that showcases a polished Unsplash photo search, responsive gallery, local favorites with notes, modals, toasts, and deployment-ready configuration for GitHub Pages or Vercel. It is intentionally portfolio-friendly: modern visuals, mobile-first UI, TypeScript throughout, and zero server requirements.

## ✨ Features
- **Unsplash API integration** powered by `fetch` with loading states, pagination, error handling, and lazy-loaded images.
- **Responsive gallery** with glassmorphism cards, hover reveals, and keyboard-friendly modals for saving notes.
- **Local CRUD** for image notes/favorites plus a dedicated Notes page with sorting, searching (`/`), ordering (↑/↓), and modals.
- **Product-ready UI**: Tailwind 4, gradients, transitions, toasts, modals, keyboard shortcuts, and spinner/empty states.
- **Data utilities**: import/export JSON for notes, configurable gallery page size, localStorage persistence helpers.
- **Deployment ready**: configured `homepage` + `vite.config.ts` base for GitHub Pages and compatible defaults for Vercel.

## 🚀 Quick Start
```bash
git clone <repo-url>
cd unsplash-crud
npm install
cp .env.example .env          # add your Unsplash API key (see below)
npm run dev
```
The development server runs at `http://localhost:5173`.

### Environment variables
Create a `.env` file (already gitignored) based on `.env.example`:
```
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```
This key can live in client-side code (Unsplash treats it as a public access key). You can rotate it anytime from the Unsplash dashboard.

## 📦 Useful Scripts
- `npm run dev` – start Vite in development mode.
- `npm run build` – type-check (`tsc -b`) and produce a production build in `build/`.
- `npm run preview` – preview the production build locally.
- `npm run lint` – run ESLint (JS/TS) checks.

## 🖼️ Unsplash Gallery
The `Gallery` route handles:
- Keyword search (form submit) with adjustable page size (6–24 items).
- Fetching via `searchUnsplashPhotos` with AbortController, debouncing per dependency, and descriptive errors.
- Responsive grid of `UnsplashPhoto` cards with hover gradients, author attribution, deep links to Unsplash, and lazy-loaded images.
- Favorites CRUD: save/edit/remove notes stored in localStorage, surfaced immediately in a “Saved notes” section.

## 🗒️ Notes & Favorites
- `Notes` route provides create/read/update/delete, ordering, search via keyboard (`/`), and detail pages with autosave.
- `Settings` lets you tune gallery page size, clear favorites, and import/export notes JSON for backups or migration.

## 🌐 Deployment
### GitHub Pages
1. The repo already sets `homepage` in `package.json` and `base` in `vite.config.ts`. Ensure both match your `<username>.github.io/<repo>` URL.
2. Build locally: `npm run build`.
3. Deploy the `build/` folder to the `gh-pages` branch. You can:
   - Use [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages) via GitHub Actions, or
   - Install `gh-pages` and run `npx gh-pages -d build`.
4. Add `VITE_UNSPLASH_ACCESS_KEY` to a `.env` file before building (GH Pages is static, so the value must be committed or injected at build time).

### Vercel (recommended for secrets)
1. Import the GitHub repo into Vercel.
2. Set Environment Variables → `VITE_UNSPLASH_ACCESS_KEY`.
3. Build Command: `npm run build`, Output Directory: `build`.
4. Trigger a deploy – Vercel handles previews, HTTPS, and custom domains automatically.

## 🧠 Ideas to Extend
- Add auth + Supabase/Firebase to sync favorites across devices.
- Introduce drag-and-drop ordering or Kanban-like organization for notes.
- Generate downloadable storyboards/collages from selected favorites.
- Add light/dark theme toggle synced to OS preference.
- Implement infinite scroll for the gallery with IntersectionObserver.

Enjoy building! If you use this as a starter, feel free to credit or modify it however you like. 

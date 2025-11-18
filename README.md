# Unsplash CRUD

A React 19 + Vite + Tailwind project that showcases a polished Unsplash photo search, responsive gallery, local favorites with notes, modals, toasts, and deployment-ready configuration for GitHub Pages or Vercel. It is intentionally portfolio-friendly: modern visuals, mobile-first UI, TypeScript throughout, and zero server requirements.

## ✨ Features
- **Unsplash API integration** powered by `fetch` with loading states, error handling, search history chips, and optional infinite-scroll auto loading.
- **Responsive gallery** with glassmorphism cards, hover reveals, lazy loading, favorites CRUD, and cloud sync powered by Supabase auth.
- **Storyboard builder**: drag-and-drop boards (via `@dnd-kit`), JSON export, and shareable links that encode the board layout.
- **Local CRUD** for image notes plus a dedicated Notes page with sorting, searching (`/`), ordering (↑/↓), and modal create/delete flows.
- **Product-ready UI**: Tailwind 4, theme toggle (Midnight ↔ Sunrise), gradients, modals, keyboard shortcuts, spinner/empty states, toasts.
- **Data utilities**: import/export JSON for notes, configurable gallery page size, favorites sync/refresh buttons, and storyboard downloads.
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
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
Unsplash access keys are public. Supabase keys should be anon/public keys scoped to your project.

#### Supabase setup
1. Create a new Supabase project and enable **Email/Password** auth.
2. In the SQL editor, create a `favorites` table:
   ```sql
   create table if not exists public.favorites (
     id uuid primary key default gen_random_uuid(),
     user_id uuid references auth.users not null,
     note text not null,
     photo jsonb not null,
     created_at timestamptz not null default now(),
     updated_at timestamptz not null default now()
   );

   create policy "Favorites are readable by owner"
     on public.favorites for select using (auth.uid() = user_id);

   create policy "Favorites are manageable by owner"
     on public.favorites for all using (auth.uid() = user_id);
   ```
3. Paste the project URL + anon key in `.env`.
4. Visits to `/gallery` will now persist favorites to Supabase after sign-in, and Settings provides manual sync controls.

## 📦 Useful Scripts
- `npm run dev` – start Vite in development mode.
- `npm run build` – type-check (`tsc -b`) and produce a production build in `build/`.
- `npm run preview` – preview the production build locally.
- `npm run lint` – run ESLint (JS/TS) checks.

## 🖼️ Unsplash Gallery
The `Gallery` route handles:
- Keyword search with adjustable page size (6–24 items) and recent history chips you can click to re-run.
- Auto-pagination via IntersectionObserver (toggleable) plus fallback “Load more” button.
- Fetching via `searchUnsplashPhotos` with AbortController, loading spinners, error toasts, and graceful empty states.
- Responsive grid of `UnsplashPhoto` cards with hover gradients, author attribution, deep links to Unsplash, and lazy-loaded images.
- Favorites CRUD with cloud sync: save/edit/remove notes, instant modals, and a live favorites panel with clear-all + sync-now actions.

## 🗒️ Notes, Storyboards & Themes
- `Notes` route provides create/read/update/delete, ordering, search via keyboard (`/`), and detail pages with autosave.
- `Storyboard` route lets you drag favorites onto a board, reorder them (`@dnd-kit`), export JSON, or copy a shareable link.
- `Settings` lets you tune gallery page size, clear favorites (local or cloud), refresh from Supabase, and import/export notes JSON.
- Theme toggle (Midnight ↔ Sunrise) updates gradients, accent colors, and header glass. Preference persists via `localStorage`.

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
- Add sharing of Supabase boards (multi-user), or collaborative editing via Supabase realtime.
- Introduce drag-and-drop ordering or Kanban-like organization for notes, similar to the storyboard UX.
- Generate downloadable PDFs/storyboards or export to Canva-ready templates.
- Add OS-synced theme detection and more granular theming (fonts, accent palettes).
- Implement AI-powered prompts (e.g., generate search keywords or captions based on saved notes).

Enjoy building! If you use this as a starter, feel free to credit or modify it however you like. 

import React from 'react'
import { HashRouter, Routes, Route, NavLink, useNavigate, useParams, useLocation } from 'react-router-dom'
import { useToast } from './components/ToastProvider'
import { Modal } from './components/Modal'
import { searchUnsplashPhotos } from './lib/unsplash'
import type { UnsplashPhoto } from './lib/unsplash'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useAuth } from './context/AuthContext'
import { useFavorites, type Favorite } from './context/FavoritesContext'
import { useTheme } from './context/ThemeContext'
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Item = { id: string; title: string; notes?: string; createdAt?: number }

const sectionClass = 'mx-auto w-full max-w-6xl px-4 py-12'

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/gallery', label: 'Gallery' },
  { to: '/storyboard', label: 'Storyboard' },
  { to: '/items', label: 'Notes' },
  { to: '/about', label: 'About' },
  { to: '/settings', label: 'Settings' },
]

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

function Layout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  return (
    <div className={`flex min-h-screen flex-col theme-${theme}`}>
      <header className="header-glass sticky top-0 z-20 border-b border-white/10 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Unsplash CRUD
            </span>
            <span className="hidden text-sm text-muted sm:inline">React + Vite + Tailwind</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <nav className="flex flex-wrap items-center gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-1.5 text-sm font-medium transition ${
                      isActive
                        ? 'bg-foreground text-background shadow-lg shadow-accent/20'
                        : 'text-muted hover:bg-surface hover:text-foreground'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <ThemeToggleButton />
            <AuthControls />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/5 py-6 text-center text-xs text-muted">
        © {new Date().getFullYear()} Unsplash CRUD · Built with React, Vite, Tailwind, and the Unsplash API
      </footer>
    </div>
  )
}

function HomePage() {
  return (
    <section className={sectionClass}>
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-300">Creative Playground</p>
          <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
            Search Unsplash, build image notes, and ship a polished experience.
          </h1>
          <p className="text-lg text-white/80">
            This demo pairs the Unsplash API with local favorites, CRUD notes, modals, toasts, and deployment-ready configuration. It&apos;s a perfect
            portfolio piece that feels premium on desktop and mobile.
          </p>
          <div className="flex flex-wrap gap-3">
            <NavLink
              to="/gallery"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-slate-900 shadow-lg shadow-emerald-500/40 transition hover:-translate-y-0.5 hover:bg-emerald-300"
            >
              Explore Gallery
              <span aria-hidden>→</span>
            </NavLink>
            <NavLink
              to="/items"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-white transition hover:border-white/50 hover:bg-white/5"
            >
              Manage Notes
            </NavLink>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'API-backed', value: 'Unsplash Search' },
              { label: 'Favorites', value: 'Notes + CRUD' },
              { label: 'Hosted', value: 'Vercel or GH Pages' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">{stat.label}</p>
                <p className="mt-2 text-lg font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900 to-slate-950/80 p-8 shadow-2xl">
          <p className="text-sm text-emerald-200">Instant highlights</p>
          <ul className="mt-6 space-y-5 text-white/80">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">1</span>
              Set your Unsplash API key in `.env` and start searching live data instantly.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">2</span>
              Save your favorite shots, attach custom notes, and edit them later with modal forms.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">3</span>
              Deploy to GitHub Pages or Vercel with a single command thanks to the ready-to-ship config.
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

function ItemsPage() {
  const { show } = useToast()
  const [items, setItems] = React.useState<Item[]>(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('items') : null
    const parsed: Item[] = raw ? JSON.parse(raw) : []
    return parsed.map((i) => (i.createdAt ? i : { ...i, createdAt: Date.now() }))
  })
  const [title, setTitle] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [query, setQuery] = React.useState('')
  const searchRef = React.useRef<HTMLInputElement>(null)
  const [openAdd, setOpenAdd] = React.useState(false)
  const [confirmId, setConfirmId] = React.useState<string | null>(null)
  const [sort, setSort] = React.useState<'newest' | 'oldest' | 'title-asc' | 'title-desc'>(() => {
    return ((typeof window !== 'undefined' ? localStorage.getItem('sort') : null) as any) || 'newest'
  })

  React.useEffect(() => {
    localStorage.setItem('items', JSON.stringify(items))
  }, [items])

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key.toLowerCase() === 'n' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setOpenAdd(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  React.useEffect(() => {
    localStorage.setItem('sort', sort)
  }, [sort])

  const filteredItems = React.useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      if (sort === 'newest') return (b.createdAt || 0) - (a.createdAt || 0)
      if (sort === 'oldest') return (a.createdAt || 0) - (b.createdAt || 0)
      if (sort === 'title-asc') return a.title.localeCompare(b.title)
      return b.title.localeCompare(a.title)
    })
    const q = query.trim().toLowerCase()
    if (!q) return sorted
    return sorted.filter((item) => item.title.toLowerCase().includes(q) || (item.notes || '').toLowerCase().includes(q))
  }, [items, sort, query])

  function addItem() {
    if (!title.trim()) {
      show({ title: 'Title is required', tone: 'error' })
      return
    }
    setItems([{ id: createId(), title: title.trim(), notes: notes.trim() || undefined, createdAt: Date.now() }, ...items])
    setTitle('')
    setNotes('')
    setOpenAdd(false)
    show({ title: 'Item added', tone: 'success' })
  }

  function updateItem(id: string, patch: Partial<Item>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
    setConfirmId(null)
    show({ title: 'Item deleted', tone: 'info' })
  }

  function moveItem(id: string, direction: 'up' | 'down') {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id)
      if (idx < 0) return prev
      const swapWith = direction === 'up' ? idx - 1 : idx + 1
      if (swapWith < 0 || swapWith >= prev.length) return prev
      const copy = [...prev]
      ;[copy[idx], copy[swapWith]] = [copy[swapWith], copy[idx]]
      return copy
    })
  }

  return (
    <section className={sectionClass}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-300">Image notes</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Quick notes & favorites</h2>
            <p className="text-sm text-white/70">Press “/” to search or “n” to add a new note.</p>
          </div>
          <button
            onClick={() => setOpenAdd(true)}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-slate-900 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5"
          >
            + New note
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-slate-900/60 lg:flex-row lg:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
              <span className="text-sm text-white/50">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="flex-1 bg-transparent text-white focus:outline-none"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="title-asc">Title A–Z</option>
                <option value="title-desc">Title Z–A</option>
              </select>
            </div>
            <div className="relative flex-1">
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes (press / to focus)"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 px-2 py-0.5 text-xs text-white/70">
                /
              </span>
            </div>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <EmptyState title="No notes yet" description="Create your first note from the Unsplash gallery or the button above." />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {filteredItems.map((item) => (
              <li key={item.id} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-900/60 transition hover:-translate-y-1">
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/90 px-3 py-2 text-slate-900 focus:outline-none"
                  value={item.title}
                  onChange={(e) => updateItem(item.id, { title: e.target.value })}
                />
                <textarea
                  rows={3}
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-white/80 px-3 py-2 text-slate-900 focus:outline-none"
                  value={item.notes || ''}
                  onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                />
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <NavLink to={`/items/${item.id}`} className="rounded-full border border-white/20 px-4 py-1 hover:bg-white/10">
                    Open
                  </NavLink>
                  <button onClick={() => moveItem(item.id, 'up')} className="rounded-full border border-white/20 px-3 py-1 hover:bg-white/10">
                    ↑
                  </button>
                  <button onClick={() => moveItem(item.id, 'down')} className="rounded-full border border-white/20 px-3 py-1 hover:bg-white/10">
                    ↓
                  </button>
                  <button
                    onClick={() => setConfirmId(item.id)}
                    className="rounded-full border border-rose-400/50 bg-rose-500/20 px-4 py-1 text-rose-100 hover:bg-rose-500/40"
                  >
                    Delete
                  </button>
                </div>
                <div className="mt-3 text-xs text-white/60">Created {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'recently'}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        title="Create new note"
        actions={
          <>
            <button onClick={() => setOpenAdd(false)} className="rounded px-3 py-1 text-sm text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button onClick={addItem} className="rounded bg-emerald-500 px-4 py-2 text-white shadow hover:bg-emerald-400">
              Save note
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes"
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </div>
      </Modal>

      <Modal
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        title="Delete this note?"
        actions={
          <>
            <button onClick={() => setConfirmId(null)} className="rounded px-3 py-1 text-sm text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button onClick={() => confirmId && removeItem(confirmId)} className="rounded bg-rose-500 px-4 py-2 text-white shadow hover:bg-rose-400">
              Delete
            </button>
          </>
        }
      >
        This action cannot be undone.
      </Modal>
    </section>
  )
}

function GalleryPage() {
  const { show } = useToast()
  const { favorites, saveFavorite, removeFavorite, clearFavorites, syncing, syncError, lastSyncedAt, refreshFromCloud, isCloudEnabled } = useFavorites()
  const [searchInput, setSearchInput] = React.useState('nature')
  const [query, setQuery] = React.useState('nature')
  const [page, setPage] = React.useState(1)
  const [photos, setPhotos] = React.useState<UnsplashPhoto[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [hasMore, setHasMore] = React.useState(true)
  const [perPage, setPerPage] = useLocalStorage<number>('gallery-per-page', 12)
  const [history, setHistory] = useLocalStorage<string[]>('gallery-search-history', ['nature', 'ocean', 'city lights'])
  const [autoLoad, setAutoLoad] = useLocalStorage<boolean>('gallery-autoload', true)
  const [activePhoto, setActivePhoto] = React.useState<UnsplashPhoto | null>(null)
  const [noteDraft, setNoteDraft] = React.useState('')
  const loadMoreRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    let ignore = false
    const controller = new AbortController()
    async function load() {
      if (!query.trim()) {
        setPhotos([])
        setHasMore(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const data = await searchUnsplashPhotos({ query, page, perPage, signal: controller.signal })
        if (!ignore) {
          setPhotos((prev) => (page === 1 ? data.results : [...prev, ...data.results]))
          setHasMore(page < data.total_pages)
        }
      } catch (err) {
        if (!ignore && (err as Error).name !== 'AbortError') {
          setError((err as Error).message)
          show({ title: 'Unsplash error', description: (err as Error).message, tone: 'error' })
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
      controller.abort()
    }
  }, [query, page, perPage, show])

  React.useEffect(() => {
    if (!activePhoto) {
      setNoteDraft('')
      return
    }
    const existing = favorites.find((fav) => fav.photo.id === activePhoto.id)
    setNoteDraft(existing?.note ?? '')
  }, [activePhoto, favorites])

  React.useEffect(() => {
    if (!autoLoad) return
    const target = loadMoreRef.current
    if (!target) return
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1)
        }
      },
      { rootMargin: '300px' },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [autoLoad, hasMore, loading])

  const favoriteLookup = React.useMemo(() => new Map(favorites.map((fav) => [fav.photo.id, fav])), [favorites])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = searchInput.trim()
    if (!trimmed) {
      show({ title: 'Enter a search term', tone: 'error' })
      return
    }
    setQuery(trimmed)
    setPage(1)
    setHistory((prev) => [trimmed, ...prev.filter((term) => term !== trimmed)].slice(0, 6))
  }

  const handleHistorySelect = (term: string) => {
    setSearchInput(term)
    setQuery(term)
    setPage(1)
  }

  const clearHistory = () => setHistory([])

  const handleChangePerPage = (value: number) => {
    setPerPage(value)
    setPage(1)
  }

  const openNoteModal = (photo: UnsplashPhoto) => {
    setActivePhoto(photo)
  }

  const closeNoteModal = () => setActivePhoto(null)

  const handleSaveFavorite = async () => {
    if (!activePhoto) return
    if (!noteDraft.trim()) {
      show({ title: 'Add a note before saving', tone: 'error' })
      return
    }
    try {
      await saveFavorite(activePhoto, noteDraft)
      show({ title: 'Note saved', tone: 'success' })
      closeNoteModal()
    } catch (err) {
      show({ title: 'Could not save', description: (err as Error).message, tone: 'error' })
    }
  }

  const handleRemoveFavorite = async (photoId: string) => {
    try {
      await removeFavorite(photoId)
      show({ title: 'Removed from favorites', tone: 'info' })
    } catch (err) {
      show({ title: 'Could not remove', description: (err as Error).message, tone: 'error' })
    }
  }

  const handleClearFavorites = async () => {
    try {
      await clearFavorites()
      show({ title: 'Cleared favorites', tone: 'info' })
    } catch (err) {
      show({ title: 'Unable to clear', description: (err as Error).message, tone: 'error' })
    }
  }

  const handleRefreshCloud = async () => {
    try {
      await refreshFromCloud()
      show({ title: 'Synced favorites', tone: 'success' })
    } catch (err) {
      show({ title: 'Sync failed', description: (err as Error).message, tone: 'error' })
    }
  }

  return (
    <section className={sectionClass}>
      <div className="space-y-10">
        <div className="rounded-[32px] border border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-8 shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-300">Unsplash Gallery</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Search millions of photos in real time.</h2>
              <p className="mt-2 text-white/70">Responsive grid, lazy loading / auto-scroll, search history chips, and synced notes.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/80">
                API status:{' '}
                <span className="font-semibold text-emerald-300">{import.meta.env.VITE_UNSPLASH_ACCESS_KEY ? 'Ready' : 'Missing key'}</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/80">
                Favorites:{' '}
                <span className="font-semibold text-emerald-300">
                  {isCloudEnabled ? (syncing ? 'Syncing…' : 'Synced to cloud') : 'Stored locally'}
                </span>
                {lastSyncedAt ? <div className="text-xs text-white/60">Updated {new Date(lastSyncedAt).toLocaleTimeString()}</div> : null}
                {isCloudEnabled ? (
                  <button onClick={handleRefreshCloud} className="mt-2 text-xs text-white underline-offset-4 hover:underline">
                    Sync now
                  </button>
                ) : null}
              </div>
            </div>
          </div>
          <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-4 lg:flex-row">
            <div className="flex flex-1 items-center rounded-2xl border border-white/10 bg-white/5 px-4">
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search mountains, portraits, cities..."
                className="h-14 flex-1 bg-transparent text-white placeholder:text-white/40 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              <label htmlFor="perPage">Per page</label>
              <select
                id="perPage"
                value={perPage}
                onChange={(e) => handleChangePerPage(Number(e.target.value))}
                className="rounded-xl border border-white/10 bg-white/10 px-3 py-1 text-white focus:outline-none"
              >
                {[6, 12, 18, 24].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="h-14 rounded-2xl bg-white px-10 text-base font-semibold text-slate-900 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5"
            >
              Search
            </button>
          </form>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/70">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={autoLoad} onChange={(e) => setAutoLoad(e.target.checked)} />
              Auto load on scroll
            </label>
            {history.length ? (
              <>
                <span>Recent:</span>
                {history.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleHistorySelect(term)}
                    className="rounded-full border border-white/20 px-3 py-1 text-white/80 hover:bg-white/10"
                  >
                    {term}
                  </button>
                ))}
                <button onClick={clearHistory} className="text-white/60 underline-offset-4 hover:underline">
                  Clear
                </button>
              </>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="rounded-3xl border border-rose-400/30 bg-rose-500/10 p-6 text-rose-100">
            <p className="font-semibold">Unsplash error</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : null}
        {syncError ? (
          <div className="rounded-3xl border border-amber-400/50 bg-amber-500/10 p-6 text-amber-100">
            <p className="font-semibold">Sync issue</p>
            <p className="text-sm">{syncError}</p>
          </div>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => {
            const favorite = favoriteLookup.get(photo.id)
            return (
              <article
                key={photo.id}
                className="group relative overflow-hidden rounded-[28px] border border-white/5 bg-white/5 shadow-xl shadow-slate-950/70"
              >
                <img
                  src={photo.urls.regular}
                  alt={photo.alt_description || 'Unsplash'}
                  loading="lazy"
                  className="h-80 w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent opacity-80" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-lg font-semibold">{photo.description || photo.alt_description || 'Untitled photo'}</p>
                  <p className="text-sm text-white/70">
                    by{' '}
                    <a href={photo.user.links.html} target="_blank" rel="noreferrer noopener" className="underline decoration-white/30 underline-offset-2">
                      {photo.user.name}
                    </a>
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm">
                    <button
                      onClick={() => openNoteModal(photo)}
                      className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur transition hover:bg-white/20"
                    >
                      {favorite ? 'Edit note' : 'Save note'}
                    </button>
                    <a
                      href={photo.links.html}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur transition hover:bg-white/20"
                    >
                      Open on Unsplash
                    </a>
                    {favorite ? (
                      <button
                        onClick={() => handleRemoveFavorite(photo.id)}
                        className="rounded-full border border-rose-400/50 bg-rose-500/30 px-3 py-1.5 text-rose-50 transition hover:bg-rose-500/60"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {photos.length === 0 && !loading ? (
          <EmptyState title="No photos yet" description="Try a different keyword to see curated Unsplash results." />
        ) : null}

        {loading ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : null}

        {!loading && hasMore && photos.length > 0 ? (
          <div className="flex flex-col items-center gap-3">
            {!autoLoad ? (
              <button
                onClick={() => setPage((prev) => prev + 1)}
                className="rounded-full border border-white/20 px-8 py-3 text-white transition hover:border-white/60 hover:bg-white/10"
              >
                Load more
              </button>
            ) : (
              <p className="text-sm text-white/60">Scroll to auto-load more results</p>
            )}
            <div ref={loadMoreRef} className="h-px w-full" aria-hidden />
          </div>
        ) : null}

        {favorites.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-300">Saved notes</p>
                <h3 className="text-2xl font-semibold text-white">Favorites ({favorites.length})</h3>
              </div>
              <button onClick={handleClearFavorites} className="text-sm text-white/60 underline-offset-4 hover:text-white hover:underline">
                Clear all
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {favorites.map((fav) => (
                <div key={fav.id} className="flex gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-slate-900/60">
                  <img
                    src={fav.photo.urls.small}
                    alt={fav.photo.alt_description || 'Saved favorite'}
                    className="h-24 w-24 flex-shrink-0 rounded-2xl object-cover"
                    loading="lazy"
                  />
                  <div className="flex flex-1 flex-col gap-2">
                    <p className="text-sm font-semibold text-white">{fav.photo.description || fav.photo.alt_description || 'Untitled photo'}</p>
                    <p className="text-xs text-white/60">Note updated {new Date(fav.updatedAt).toLocaleString()}</p>
                    <p className="rounded-2xl bg-white/10 p-2 text-sm text-white/80">{fav.note}</p>
                    <div className="flex gap-2 text-sm">
                      <button
                        onClick={() => openNoteModal(fav.photo)}
                        className="rounded-full border border-white/20 px-3 py-1 hover:bg-white/10"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveFavorite(fav.photo.id)}
                        className="rounded-full border border-rose-400/40 px-3 py-1 text-rose-100 hover:bg-rose-500/30"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <Modal
        open={!!activePhoto}
        onClose={closeNoteModal}
        title={favoriteLookup.get(activePhoto?.id || '') ? 'Update note' : 'Save to favorites'}
        actions={
          <>
            {activePhoto && favoriteLookup.get(activePhoto.id) ? (
              <button
                onClick={() => {
                  if (activePhoto) handleRemoveFavorite(activePhoto.id)
                  closeNoteModal()
                }}
                className="rounded bg-slate-100 px-4 py-2 text-sm text-slate-800 hover:bg-slate-200"
              >
                Remove
              </button>
            ) : null}
            <button onClick={closeNoteModal} className="rounded px-3 py-1 text-sm text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button onClick={handleSaveFavorite} className="rounded bg-emerald-500 px-4 py-2 text-white shadow hover:bg-emerald-400">
              Save
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            rows={4}
            placeholder="Why do you love this photo? What story should you tell?"
            className="w-full rounded-2xl border border-slate-200 px-3 py-2"
          />
        </div>
      </Modal>
    </section>
  )
}

function StoryboardPage() {
  const { favorites } = useFavorites()
  const { show } = useToast()
  const location = useLocation()
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { pressDelay: 120, activationConstraint: { distance: 6 } }),
  )
  const [boardIds, setBoardIds] = React.useState<string[]>([])
  const [shareCopied, setShareCopied] = React.useState(false)

  React.useEffect(() => {
    setBoardIds((prev) => {
      const filtered = prev.filter((id) => favorites.some((fav) => fav.id === id))
      const missing = favorites.map((fav) => fav.id).filter((id) => !filtered.includes(id))
      return filtered.concat(missing)
    })
  }, [favorites])

  const boardFavorites = React.useMemo(
    () => boardIds.map((id) => favorites.find((fav) => fav.id === id)).filter((fav): fav is Favorite => Boolean(fav)),
    [boardIds, favorites],
  )

  const sharedPreview = React.useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(location.search)
    const raw = params.get('data')
    if (!raw) return null
    try {
      const decoded = decodeURIComponent(window.atob(raw))
      const parsed = JSON.parse(decoded) as {
        createdAt: number
        items: { note: string; photo: { id: string; regular: string; thumb?: string; alt?: string } }[]
      }
      if (!parsed.items?.length) return null
      return parsed
    } catch (error) {
      console.warn('Invalid storyboard data', error)
      return null
    }
  }, [location.search])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setBoardIds((items) => {
      const oldIndex = items.indexOf(String(active.id))
      const newIndex = items.indexOf(String(over.id))
      return arrayMove(items, oldIndex, newIndex)
    })
  }

  const toggleSelection = (id: string) => {
    setBoardIds((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]))
  }

  const downloadStoryboard = () => {
    if (!boardFavorites.length) {
      show({ title: 'Select cards first', tone: 'error' })
      return
    }
    const payload = {
      generatedAt: new Date().toISOString(),
      items: boardFavorites.map((fav) => ({
        note: fav.note,
        photo: {
          id: fav.photo.id,
          description: fav.photo.description ?? fav.photo.alt_description,
          urls: fav.photo.urls,
          author: fav.photo.user.name,
          link: fav.photo.links.html,
        },
      })),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `storyboard-${Date.now()}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    show({ title: 'Storyboard downloaded', tone: 'success' })
  }

  const copyShareLink = async () => {
    if (!boardFavorites.length) {
      show({ title: 'Select cards first', tone: 'error' })
      return
    }
    if (typeof window === 'undefined') return
    const payload = {
      createdAt: Date.now(),
      items: boardFavorites.map((fav) => ({
        note: fav.note,
        photo: {
          id: fav.photo.id,
          regular: fav.photo.urls.regular,
          thumb: fav.photo.urls.thumb,
          alt: fav.photo.alt_description ?? fav.photo.description ?? undefined,
        },
      })),
    }
    const encoded = window.btoa(encodeURIComponent(JSON.stringify(payload)))
    const base = `${window.location.origin}${window.location.pathname}#/storyboard`
    const fullUrl = `${base}?data=${encoded}`
    await navigator.clipboard?.writeText(fullUrl)
    setShareCopied(true)
    show({ title: 'Share link copied', tone: 'success' })
    setTimeout(() => setShareCopied(false), 2000)
  }

  return (
    <section className={sectionClass}>
      <div className="space-y-8">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-300">Storyboard</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Drag, reorder, and share curated image narratives.</h2>
              <p className="text-white/70">Pick any favorites, arrange them via drag-and-drop, export JSON, or share a view-only link.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={downloadStoryboard}
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10"
              >
                Download JSON
              </button>
              <button
                onClick={copyShareLink}
                className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:-translate-y-0.5"
              >
                {shareCopied ? 'Link copied!' : 'Copy share link'}
              </button>
            </div>
          </div>
          <div className="mt-4 flex gap-6 text-sm text-white/70">
            <div>{favorites.length} favorites saved</div>
            <div>{boardFavorites.length} cards on board</div>
          </div>
        </div>

        {favorites.length === 0 ? (
          <EmptyState title="No favorites yet" description="Save photos from the gallery to build a storyboard." />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-slate-900/60">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Select cards</h3>
                <span className="text-xs text-white/60">{boardFavorites.length} selected</span>
              </div>
              <div className="mt-4 max-h-[420px] space-y-3 overflow-auto pr-2 text-sm">
                {favorites.map((fav) => {
                  const selected = boardIds.includes(fav.id)
                  return (
                    <label
                      key={fav.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2 ${
                        selected ? 'border-emerald-400/70 bg-emerald-500/10' : 'border-white/10'
                      }`}
                    >
                      <input type="checkbox" checked={selected} onChange={() => toggleSelection(fav.id)} />
                      <span className="flex-1 text-white">{fav.photo.description || fav.photo.alt_description || 'Untitled photo'}</span>
                    </label>
                  )
                })}
              </div>
            </div>
            <div className="space-y-4">
              {boardFavorites.length === 0 ? (
                <EmptyState title="No cards selected" description="Toggle favorites on the left to add them to the board." />
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={boardFavorites.map((fav) => fav.id)} strategy={rectSortingStrategy}>
                    <div className="grid gap-4 md:grid-cols-2">
                      {boardFavorites.map((fav) => (
                        <SortableBoardCard key={fav.id} favorite={fav} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        )}

        {sharedPreview ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/60">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">Shared storyboard preview</h3>
                <p className="text-sm text-white/70">
                  Created {new Date(sharedPreview.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <button
                onClick={() => typeof window !== 'undefined' && navigator.clipboard?.writeText(window.location.href)}
                className="text-sm text-white/70 underline-offset-4 hover:underline"
              >
                Copy link
              </button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {sharedPreview.items.map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-white/10 p-3 text-sm text-white/80">
                  <img
                    src={item.photo.thumb || item.photo.regular}
                    alt={item.photo.alt || 'Shared storyboard'}
                    className="mb-3 h-36 w-full rounded-xl object-cover"
                  />
                  <p>{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function AboutPage() {
  return (
    <section className={sectionClass}>
      <div className="mx-auto max-w-3xl space-y-6 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-300">About the project</p>
        <h2 className="text-3xl font-semibold">Production-ready starter</h2>
        <p className="text-white/80">
          This project demonstrates how to pair a public API with delightful client-side features: optimistic UI, toasts, modals, glassmorphism surfaces,
          responsive grids, and progressive enhancement (lazy loading, keyboard shortcuts, import/export). Everything lives in TypeScript with React
          19, Vite 7, Tailwind 4, and ESLint 9.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-lg font-semibold">Tech stack</h3>
            <ul className="mt-2 space-y-1 text-sm text-white/70">
              <li>React 19 + React Router 7</li>
              <li>TypeScript + Vite + Tailwind</li>
              <li>Unsplash REST API via fetch</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-lg font-semibold">UX touches</h3>
            <ul className="mt-2 space-y-1 text-sm text-white/70">
              <li>Toast notifications</li>
              <li>Keyboard shortcuts</li>
              <li>Modals, hover states, transitions</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function SettingsPage() {
  const { show } = useToast()
  const { favorites, clearFavorites, refreshFromCloud, syncing, isCloudEnabled } = useFavorites()
  const [perPage, setPerPage] = useLocalStorage<number>('gallery-per-page', 12)
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null)

  function exportItems() {
    const raw = localStorage.getItem('items') || '[]'
    const blob = new Blob([raw], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    setDownloadUrl(url)
  }

  function importItems(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = String(reader.result)
        const parsed = JSON.parse(text)
        if (Array.isArray(parsed)) {
          localStorage.setItem('items', JSON.stringify(parsed))
          show({ title: 'Items imported', tone: 'success' })
        } else {
          show({ title: 'Invalid file', tone: 'error' })
        }
      } catch (error) {
        console.error(error)
        show({ title: 'Could not import items', tone: 'error' })
      }
    }
    reader.readAsText(file)
  }

  return (
    <section className={sectionClass}>
      <div className="mx-auto max-w-3xl space-y-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/60">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-300">Gallery defaults</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Results per page</h2>
            <input
              type="range"
              min={6}
              max={30}
              step={3}
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="mt-6 w-full accent-emerald-400"
            />
            <p className="mt-2 text-sm text-white/70">Currently showing {perPage} photos per page in the gallery.</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/60">
            <h3 className="text-xl font-semibold text-white">Favorites</h3>
            <p className="text-sm text-white/70">
              {isCloudEnabled ? 'Cloud sync is enabled. You can clear or refresh your favorites.' : 'Currently stored in localStorage.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={async () => {
                  try {
                    await clearFavorites()
                    show({ title: 'Favorites cleared', tone: 'info' })
                  } catch (error) {
                    show({ title: 'Failed to clear', description: (error as Error).message, tone: 'error' })
                  }
                }}
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
              >
                Clear favorites ({favorites.length})
              </button>
              {isCloudEnabled ? (
                <button
                  onClick={async () => {
                    try {
                      await refreshFromCloud()
                      show({ title: 'Favorites synced', tone: 'success' })
                    } catch (error) {
                      show({ title: 'Sync failed', description: (error as Error).message, tone: 'error' })
                    }
                  }}
                  disabled={syncing}
                  className="rounded-full border border-emerald-400/50 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100 hover:bg-emerald-500/20 disabled:opacity-60"
                >
                  {syncing ? 'Syncing…' : 'Refresh from cloud'}
                </button>
              ) : null}
            </div>
          </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/60">
          <h3 className="text-xl font-semibold text-white">Items backup</h3>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <button onClick={exportItems} className="rounded-full border border-white/20 px-4 py-2 text-white hover:bg-white/10">
              Export JSON
            </button>
            {downloadUrl ? (
              <a
                href={downloadUrl}
                download={`items-${Date.now()}.json`}
                className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-4 py-2 text-emerald-50 hover:bg-emerald-500/40"
              >
                Download
              </a>
            ) : null}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-white hover:bg-white/10">
              Import JSON
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => e.target.files && importItems(e.target.files[0])}
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  )
}

function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [title, setTitle] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [found, setFound] = React.useState(false)

  React.useEffect(() => {
    if (!id) return
    const raw = localStorage.getItem('items')
    const arr: Item[] = raw ? JSON.parse(raw) : []
    const match = arr.find((item) => item.id === id)
    if (match) {
      setTitle(match.title)
      setNotes(match.notes || '')
      setFound(true)
    } else {
      setFound(false)
    }
  }, [id])

  React.useEffect(() => {
    if (!id || !found) return
    const raw = localStorage.getItem('items')
    const arr: Item[] = raw ? JSON.parse(raw) : []
    const idx = arr.findIndex((item) => item.id === id)
    if (idx >= 0) {
      arr[idx] = { ...arr[idx], title, notes }
      localStorage.setItem('items', JSON.stringify(arr))
    }
  }, [id, title, notes, found])

  if (!found) {
    return (
      <section className={sectionClass}>
        <EmptyState title="Note not found" description="Return to the notes list to create a new entry." />
        <button onClick={() => navigate('/items')} className="mt-4 rounded-full border border-white/20 px-4 py-2 text-white hover:bg-white/10">
          Back to notes
        </button>
      </section>
    )
  }

  return (
    <section className={sectionClass}>
      <div className="mx-auto max-w-3xl space-y-4">
        <h2 className="text-3xl font-semibold text-white">Edit note</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/80 px-4 py-3 text-slate-900 focus:outline-none"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={6}
          className="w-full rounded-2xl border border-white/10 bg-white/80 px-4 py-3 text-slate-900 focus:outline-none"
        />
        <button onClick={() => navigate(-1)} className="rounded-full border border-white/20 px-4 py-2 text-white hover:bg-white/10">
          Done
        </button>
      </div>
    </section>
  )
}

function NotFoundPage() {
  return <EmptyState title="Page not found" description="Use the navigation above to explore the app." />
}

function Spinner() {
  return (
    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/20 border-t-emerald-300 animate-spin" aria-label="Loading" />
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white shadow-lg shadow-slate-900/60">
      <h3 className="text-2xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-white/70">{description}</p>
    </div>
  )
}

function SortableBoardCard({ favorite }: { favorite: Favorite }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: favorite.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-3xl border border-white/10 bg-white/5 p-4 text-white shadow-lg shadow-slate-900/60 ${
        isDragging ? 'opacity-70 ring-2 ring-emerald-300' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <img src={favorite.photo.urls.small} alt={favorite.photo.alt_description || 'Storyboard card'} className="h-32 w-full rounded-2xl object-cover" />
      <div className="mt-3 space-y-1">
        <p className="text-sm font-semibold">{favorite.note}</p>
        <p className="text-xs text-white/60">{favorite.photo.description || favorite.photo.alt_description || 'Untitled photo'}</p>
      </div>
    </div>
  )
}

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme()
  const next = theme === 'midnight' ? 'sunrise' : 'midnight'
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-muted transition hover:bg-surface"
      aria-label="Toggle theme"
    >
      {theme === 'midnight' ? '☀️ Sunrise mode' : '🌙 Midnight mode'}
      <span className="sr-only">Switch to {next} theme</span>
    </button>
  )
}

function AuthControls() {
  const { user, loading, isSupabaseConfigured, signIn, signUp, signOut } = useAuth()
  const { show } = useToast()
  const [open, setOpen] = React.useState(false)
  const [mode, setMode] = React.useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  const handleSubmit = async () => {
    if (!email || !password) {
      show({ title: 'Enter email and password', tone: 'error' })
      return
    }
    setSubmitting(true)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
        show({ title: 'Signed in', tone: 'success' })
      } else {
        await signUp(email, password)
        show({ title: 'Check your inbox to confirm', tone: 'info' })
      }
      setOpen(false)
      setEmail('')
      setPassword('')
    } catch (error) {
      show({ title: 'Auth error', description: (error as Error).message, tone: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      show({ title: 'Signed out', tone: 'info' })
    } catch (error) {
      show({ title: 'Sign out failed', description: (error as Error).message, tone: 'error' })
    }
  }

  if (!isSupabaseConfigured) {
    return <span className="rounded-full border border-dashed border-white/20 px-4 py-1 text-xs text-white/60">Cloud disabled</span>
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-surface px-3 py-1 text-xs text-muted">{user.email}</span>
        <button onClick={handleSignOut} className="rounded-full border border-white/10 px-3 py-1 text-sm text-muted hover:bg-surface">
          Sign out
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={loading}
        className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-muted transition hover:bg-surface disabled:opacity-60"
      >
        Sign in
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={mode === 'signin' ? 'Sign in to sync favorites' : 'Create an account'}
        actions={
          <>
            <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="rounded px-3 py-1 text-sm text-slate-600 hover:bg-slate-100">
              {mode === 'signin' ? 'Need an account?' : 'Have an account?'}
            </button>
            <button onClick={handleSubmit} disabled={submitting} className="rounded bg-emerald-500 px-4 py-2 text-white shadow hover:bg-emerald-400 disabled:opacity-60">
              {submitting ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
            autoComplete="email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          />
        </div>
      </Modal>
    </>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/storyboard" element={<StoryboardPage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/items/:id" element={<ItemDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}

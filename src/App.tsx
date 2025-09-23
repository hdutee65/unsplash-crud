import React from 'react'
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom'
import { useToast } from './components/ToastProvider'
import { Modal } from './components/Modal'

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="backdrop-blur bg-black/30 sticky top-0 z-10">
        <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4 text-white">
          <span className="font-semibold tracking-wide">Unsplash CRUD</span>
          <NavLink to="/" className={({ isActive }) => `${isActive ? 'underline' : ''} hover:opacity-80`} end>
            Home
          </NavLink>
          <NavLink to="/items" className={({ isActive }) => `${isActive ? 'underline' : ''} hover:opacity-80`}>
            Items
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `${isActive ? 'underline' : ''} hover:opacity-80`}>
            About
          </NavLink>
          <NavLink to="/gallery" className={({ isActive }) => `${isActive ? 'underline' : ''} hover:opacity-80`}>
            Gallery
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `${isActive ? 'underline' : ''} hover:opacity-80`}>
            Settings
          </NavLink>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="text-center text-xs text-white/70 py-4">© {new Date().getFullYear()} Unsplash CRUD</footer>
    </div>
  )
}

function BgWrapper({ children }: { children: React.ReactNode }) {
  const seed = Math.floor(Math.random() * 100000)
  const url = `https://source.unsplash.com/random/1920x1080?sig=${seed}&orientation=landscape&content_filter=high`
  const overlay = (() => {
    const v = localStorage.getItem('overlayOpacity')
    const n = v ? Number(v) : 0.5
    return isNaN(n) ? 0.5 : Math.min(0.85, Math.max(0.2, n))
  })()
  return (
    <div className="relative">
      <img src={url} alt="background" className="fixed inset-0 h-full w-full object-cover -z-10" />
      <div className="fixed inset-0 -z-10" style={{ backgroundColor: `rgba(0,0,0,${overlay})` }} />
      {children}
    </div>
  )
}

function HomePage() {
  return (
    <BgWrapper>
      <section className="mx-auto max-w-4xl px-4 py-16 text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome</h1>
        <p className="text-white/80">A multi-page CRUD app with random Unsplash backgrounds on each reload.</p>
      </section>
    </BgWrapper>
  )
}

type Item = { id: string; title: string; notes?: string; createdAt?: number }

function ItemsPage() {
  const { show } = useToast()
  const [items, setItems] = React.useState<Item[]>(() => {
    const raw = localStorage.getItem('items')
    const parsed: Item[] = raw ? JSON.parse(raw) : []
    // backfill createdAt
    return parsed.map((i) => (i.createdAt ? i : { ...i, createdAt: Date.now() }))
  })
  const [title, setTitle] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [query, setQuery] = React.useState('')
  const searchRef = React.useRef<HTMLInputElement>(null)
  const [openAdd, setOpenAdd] = React.useState(false)
  const [confirmId, setConfirmId] = React.useState<string | null>(null)
  const [sort, setSort] = React.useState<'newest' | 'oldest' | 'title-asc' | 'title-desc'>(() => {
    return (localStorage.getItem('sort') as any) || 'newest'
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

  function addItem() {
    if (!title.trim()) return
    setItems([{ id: crypto.randomUUID(), title: title.trim(), notes: notes.trim() || undefined, createdAt: Date.now() }, ...items])
    setTitle('')
    setNotes('')
    setOpenAdd(false)
    show({ title: 'Item added', tone: 'success' })
  }
  function removeItem(id: string) {
    setItems(items.filter((i) => i.id !== id))
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

  React.useEffect(() => {
    localStorage.setItem('sort', sort)
  }, [sort])
  function updateItem(id: string, patch: Partial<Item>) {
    setItems(items.map((i) => (i.id === id ? { ...i, ...patch } : i)))
    // subtle feedback when typing is not necessary
  }

  return (
    <BgWrapper>
      <section className="mx-auto max-w-5xl px-4 py-12 text-white">
        <h2 className="text-3xl font-semibold mb-6">Items</h2>
        <button onClick={() => setOpenAdd(true)} className="inline-flex items-center gap-2 rounded bg-emerald-500 px-4 py-2 font-medium hover:bg-emerald-600 shadow-lg shadow-emerald-900/30">
          New (n)
        </button>
        <div className="mt-8 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-white/80">Sort</label>
            <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="rounded bg-white/90 text-black px-2 py-1">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title-asc">Title A–Z</option>
              <option value="title-desc">Title Z–A</option>
            </select>
          </div>
          <div className="relative max-w-md">
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search (press / to focus)"
              className="w-full rounded bg-white/90 text-black px-3 py-2 pr-10"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-black/60">/</span>
          </div>
        </div>
        <ul className="mt-4 grid gap-3">
          {items
            .slice()
            .sort((a, b) => {
              if (sort === 'newest') return (b.createdAt || 0) - (a.createdAt || 0)
              if (sort === 'oldest') return (a.createdAt || 0) - (b.createdAt || 0)
              if (sort === 'title-asc') return a.title.localeCompare(b.title)
              return b.title.localeCompare(a.title)
            })
            .filter((i) => {
              const q = query.trim().toLowerCase()
              if (!q) return true
              return i.title.toLowerCase().includes(q) || (i.notes || '').toLowerCase().includes(q)
            })
            .map((i) => (
            <li key={i.id} className="rounded bg-white/10 backdrop-blur p-4 border border-white/10 hover:border-white/20 transition">
              <input
                value={i.title}
                onChange={(e) => updateItem(i.id, { title: e.target.value })}
                className="w-full rounded bg-white/90 text-black px-2 py-1 mb-2"
              />
              <textarea
                value={i.notes || ''}
                onChange={(e) => updateItem(i.id, { notes: e.target.value })}
                className="w-full rounded bg-white/90 text-black px-2 py-1"
                rows={2}
              />
              <div className="mt-2 flex gap-2">
                <NavLink to={`/items/${i.id}`} className="rounded bg-white/20 px-3 py-1 hover:bg-white/30">Open</NavLink>
                <button onClick={() => moveItem(i.id, 'up')} className="rounded bg-white/20 px-3 py-1 hover:bg-white/30">▲</button>
                <button onClick={() => moveItem(i.id, 'down')} className="rounded bg-white/20 px-3 py-1 hover:bg-white/30">▼</button>
                <button onClick={() => setConfirmId(i.id)} className="rounded bg-rose-500 px-3 py-1 hover:bg-rose-600">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
        <Modal
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          title="Create item"
          actions={
            <>
              <button onClick={() => setOpenAdd(false)} className="rounded px-3 py-1 bg-black/10 hover:bg-black/20">Cancel</button>
              <button onClick={addItem} className="rounded px-3 py-1 bg-emerald-500 text-white hover:bg-emerald-600">Create</button>
            </>
          }
        >
          <div className="grid gap-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="px-3 py-2 rounded bg-white text-black" />
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" className="px-3 py-2 rounded bg-white text-black" />
          </div>
        </Modal>
        <Modal
          open={!!confirmId}
          onClose={() => setConfirmId(null)}
          title="Delete item?"
          actions={
            <>
              <button onClick={() => setConfirmId(null)} className="rounded px-3 py-1 bg-black/10 hover:bg-black/20">Cancel</button>
              <button onClick={() => removeItem(confirmId!)} className="rounded px-3 py-1 bg-rose-500 text-white hover:bg-rose-600">Delete</button>
            </>
          }
        >
          This action cannot be undone.
        </Modal>
      </section>
    </BgWrapper>
  )
}

function AboutPage() {
  return (
    <BgWrapper>
      <section className="mx-auto max-w-3xl px-4 py-16 text-white">
        <h2 className="text-3xl font-semibold mb-4">About</h2>
        <p className="text-white/80">This app demonstrates client-side CRUD with advanced visuals using Tailwind and Unsplash backgrounds.</p>
      </section>
    </BgWrapper>
  )
}

function GalleryPage() {
  const [seed, setSeed] = React.useState(() => Math.floor(Math.random() * 100000))
  const imgs = Array.from({ length: 12 }, (_, idx) => `https://source.unsplash.com/random/400x300?sig=${seed + idx}`)
  return (
    <BgWrapper>
      <section className="mx-auto max-w-6xl px-4 py-12 text-white">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-3xl font-semibold">Gallery</h2>
          <button onClick={() => setSeed(Math.floor(Math.random() * 100000))} className="rounded bg-white/20 px-3 py-1 hover:bg-white/30">Reload</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {imgs.map((src, i) => (
            <img key={i} src={src} alt="unsplash" className="w-full h-56 object-cover rounded-lg shadow-lg" />
          ))}
        </div>
      </section>
    </BgWrapper>
  )
}

function SettingsPage() {
  const [opacity, setOpacity] = React.useState(() => {
    const v = localStorage.getItem('overlayOpacity')
    const n = v ? Number(v) : 0.5
    return isNaN(n) ? 0.5 : n
  })
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null)
  React.useEffect(() => {
    localStorage.setItem('overlayOpacity', String(opacity))
  }, [opacity])
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
          location.href = '/items'
        }
      } catch {}
    }
    reader.readAsText(file)
  }
  return (
    <BgWrapper>
      <section className="mx-auto max-w-xl px-4 py-16 text-white">
        <h2 className="text-3xl font-semibold mb-6">Settings</h2>
        <label className="block mb-2">Background overlay</label>
        <input type="range" min={0.2} max={0.85} step={0.01} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full" />
        <div className="mt-2 text-white/80">Opacity: {opacity.toFixed(2)}</div>
        <div className="mt-8 grid gap-3">
          <div className="font-medium">Data</div>
          <div className="flex items-center gap-3">
            <button onClick={exportItems} className="rounded bg-white/20 px-3 py-1 hover:bg-white/30">Export JSON</button>
            {downloadUrl ? (
              <a href={downloadUrl} download={`items-${Date.now()}.json`} className="rounded bg-emerald-500 px-3 py-1 hover:bg-emerald-600">Download</a>
            ) : null}
          </div>
          <label className="inline-flex items-center gap-2">
            <span className="rounded bg-white/20 px-3 py-1">Import JSON</span>
            <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files && importItems(e.target.files[0])} />
          </label>
        </div>
      </section>
    </BgWrapper>
  )
}

function ItemDetailPage() {
  const params = (window as any).location.pathname.split('/')
  const id = params[params.length - 1]
  const [item, setItem] = React.useState<Item | null>(() => {
    const raw = localStorage.getItem('items')
    const arr: Item[] = raw ? JSON.parse(raw) : []
    return arr.find((x) => x.id === id) || null
  })
  const [title, setTitle] = React.useState(item?.title || '')
  const [notes, setNotes] = React.useState(item?.notes || '')
  React.useEffect(() => {
    const raw = localStorage.getItem('items')
    const arr: Item[] = raw ? JSON.parse(raw) : []
    const idx = arr.findIndex((x) => x.id === id)
    if (idx >= 0) {
      arr[idx] = { ...arr[idx], title, notes }
      localStorage.setItem('items', JSON.stringify(arr))
    }
  }, [id, title, notes])
  if (!item) return (
    <BgWrapper>
      <section className="mx-auto max-w-3xl px-4 py-16 text-white">Item not found.</section>
    </BgWrapper>
  )
  return (
    <BgWrapper>
      <section className="mx-auto max-w-3xl px-4 py-16 text-white">
        <h2 className="text-3xl font-semibold mb-6">Item Details</h2>
        <div className="grid gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="px-3 py-2 rounded bg-white/90 text-black" />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={6} className="px-3 py-2 rounded bg-white/90 text-black" />
        </div>
      </section>
    </BgWrapper>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/items/:id" element={<ItemDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}

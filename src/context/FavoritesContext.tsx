import React from 'react'
import { supabase, type DatabaseFavoriteRow } from '../lib/supabase'
import type { UnsplashPhoto } from '../lib/unsplash'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useAuth } from './AuthContext'

export type Favorite = {
  id: string
  photo: UnsplashPhoto
  note: string
  createdAt: number
  updatedAt: number
  cloudId?: string
}

type FavoritesContextValue = {
  favorites: Favorite[]
  saveFavorite: (photo: UnsplashPhoto, note: string) => Promise<void>
  removeFavorite: (photoId: string) => Promise<void>
  clearFavorites: () => Promise<void>
  syncing: boolean
  syncError: string | null
  lastSyncedAt: number | null
  refreshFromCloud: () => Promise<void>
  isCloudEnabled: boolean
}

const FavoritesContext = React.createContext<FavoritesContextValue | undefined>(undefined)

function mapRow(row: DatabaseFavoriteRow): Favorite {
  const created = Date.parse(row.created_at)
  const updated = Date.parse(row.updated_at)
  return {
    id: row.id,
    cloudId: row.id,
    note: row.note,
    photo: row.photo as UnsplashPhoto,
    createdAt: Number.isNaN(created) ? Date.now() : created,
    updatedAt: Number.isNaN(updated) ? Date.now() : updated,
  }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useLocalStorage<Favorite[]>('photo-favorites', [])
  const [syncing, setSyncing] = React.useState(false)
  const [syncError, setSyncError] = React.useState<string | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = React.useState<number | null>(null)
  const favoritesRef = React.useRef(favorites)
  favoritesRef.current = favorites

  const { user, isSupabaseConfigured } = useAuth()
  const isCloudEnabled = Boolean(user && supabase && isSupabaseConfigured)

  const syncFromCloud = React.useCallback(async () => {
    if (!isCloudEnabled) return
    setSyncing(true)
    setSyncError(null)
    try {
      const localUnsynced = favoritesRef.current.filter((fav) => !fav.cloudId)
      if (localUnsynced.length) {
        const payload = localUnsynced.map((fav) => ({
          user_id: user!.id,
          note: fav.note,
          photo: fav.photo,
          created_at: new Date(fav.createdAt).toISOString(),
          updated_at: new Date(fav.updatedAt).toISOString(),
        }))
        const { error } = await supabase!.from('favorites').insert(payload)
        if (error) throw error
      }
      const { data, error } = await supabase!
        .from('favorites')
        .select('*')
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false })
      if (error) throw error
      setFavorites(data.map(mapRow))
      setLastSyncedAt(Date.now())
    } catch (err) {
      console.error(err)
      setSyncError((err as Error).message)
    } finally {
      setSyncing(false)
    }
  }, [isCloudEnabled, user, setFavorites])

  React.useEffect(() => {
    if (!isCloudEnabled) return
    syncFromCloud()
  }, [isCloudEnabled, syncFromCloud])

  const saveFavorite = React.useCallback(
    async (photo: UnsplashPhoto, note: string) => {
      const trimmed = note.trim()
      if (!trimmed) throw new Error('Note is required')
      const timestamp = Date.now()
      const existing = favoritesRef.current.find((fav) => fav.photo.id === photo.id)
      if (isCloudEnabled) {
        if (existing?.cloudId) {
          const { data, error } = await supabase!
            .from('favorites')
            .update({ note: trimmed, photo, updated_at: new Date(timestamp).toISOString() })
            .eq('id', existing.cloudId)
            .select()
            .single()
          if (error) throw error
          setFavorites((prev) => prev.map((fav) => (fav.photo.id === photo.id ? mapRow(data) : fav)))
        } else {
          const { data, error } = await supabase!
            .from('favorites')
            .insert({ user_id: user!.id, note: trimmed, photo })
            .select()
            .single()
          if (error) throw error
          const mapped = mapRow(data)
          setFavorites((prev) => {
            const filtered = prev.filter((fav) => fav.photo.id !== photo.id)
            return [mapped, ...filtered]
          })
        }
        setLastSyncedAt(Date.now())
        return
      }
      const updated: Favorite = existing
        ? { ...existing, note: trimmed, updatedAt: timestamp }
        : {
            id: crypto.randomUUID(),
            note: trimmed,
            photo,
            createdAt: timestamp,
            updatedAt: timestamp,
          }
      setFavorites((prev) => {
        const others = prev.filter((fav) => fav.photo.id !== photo.id)
        return [updated, ...others]
      })
    },
    [isCloudEnabled, setFavorites, user],
  )

  const removeFavorite = React.useCallback(
    async (photoId: string) => {
      const target = favoritesRef.current.find((fav) => fav.photo.id === photoId)
      if (!target) return
      if (isCloudEnabled && target.cloudId) {
        const { error } = await supabase!.from('favorites').delete().eq('id', target.cloudId)
        if (error) throw error
      }
      setFavorites((prev) => prev.filter((fav) => fav.photo.id !== photoId))
    },
    [isCloudEnabled, setFavorites],
  )

  const clearFavorites = React.useCallback(async () => {
    if (isCloudEnabled) {
      const { error } = await supabase!.from('favorites').delete().eq('user_id', user!.id)
      if (error) throw error
    }
    setFavorites([])
  }, [isCloudEnabled, setFavorites, user])

  const value = React.useMemo(
    () => ({
      favorites,
      saveFavorite,
      removeFavorite,
      clearFavorites,
      syncing,
      syncError,
      lastSyncedAt,
      refreshFromCloud: syncFromCloud,
      isCloudEnabled,
    }),
    [favorites, saveFavorite, removeFavorite, clearFavorites, syncing, syncError, lastSyncedAt, syncFromCloud, isCloudEnabled],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const ctx = React.useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}

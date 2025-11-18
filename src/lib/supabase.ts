import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export type DatabaseFavoriteRow = {
  id: string
  user_id: string
  note: string
  photo: unknown
  created_at: string
  updated_at: string
}

export const supabase =
  typeof url === 'string' && url.length > 0 && typeof anonKey === 'string' && anonKey.length > 0
    ? createClient(url, anonKey, {
        auth: {
          detectSessionInUrl: true,
          persistSession: true,
        },
      })
    : null

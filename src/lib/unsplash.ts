const API_BASE_URL = 'https://api.unsplash.com'

export type UnsplashPhoto = {
  id: string
  alt_description: string | null
  description: string | null
  width: number
  height: number
  color: string | null
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  user: {
    name: string
    username: string
    links: {
      html: string
    }
  }
  links: {
    html: string
  }
}

type SearchOptions = {
  query: string
  page?: number
  perPage?: number
  orientation?: 'landscape' | 'portrait' | 'squarish'
  signal?: AbortSignal
}

type SearchResponse = {
  results: UnsplashPhoto[]
  total: number
  total_pages: number
}

function getAccessKey() {
  const key = import.meta.env.VITE_UNSPLASH_ACCESS_KEY
  if (!key) {
    throw new Error('Unsplash API key is missing. Set VITE_UNSPLASH_ACCESS_KEY in your .env file.')
  }
  return key
}

export async function searchUnsplashPhotos({
  query,
  page = 1,
  perPage = 12,
  orientation = 'landscape',
  signal,
}: SearchOptions): Promise<SearchResponse> {
  const params = new URLSearchParams({
    query,
    page: String(page),
    per_page: String(perPage),
    orientation,
    content_filter: 'high',
  })

  const response = await fetch(`${API_BASE_URL}/search/photos?${params.toString()}`, {
    headers: {
      Authorization: `Client-ID ${getAccessKey()}`,
    },
    signal,
  })

  if (!response.ok) {
    const message = response.status === 401 ? 'Invalid Unsplash API key' : `Unsplash request failed (${response.status})`
    throw new Error(message)
  }

  const data = (await response.json()) as SearchResponse
  return data
}

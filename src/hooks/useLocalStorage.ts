import * as React from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = React.useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const stored = window.localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initialValue
    } catch (error) {
      console.warn(`Failed to parse localStorage key "${key}"`, error)
      return initialValue
    }
  })

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Failed to save localStorage key "${key}"`, error)
    }
  }, [key, value])

  return [value, setValue] as const
}

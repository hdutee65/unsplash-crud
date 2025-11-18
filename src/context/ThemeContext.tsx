import React from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

type Theme = 'midnight' | 'sunrise'

type ThemeContextValue = {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useLocalStorage<Theme>('app-theme', 'midnight')

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === 'midnight' ? 'sunrise' : 'midnight')
  }, [theme, setTheme])

  const value = React.useMemo(() => ({ theme, toggleTheme, setTheme }), [theme, toggleTheme, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

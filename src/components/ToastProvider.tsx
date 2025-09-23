import React from 'react'

type Toast = { id: string; title: string; description?: string; tone?: 'success' | 'error' | 'info' }

type ToastContextValue = {
  toasts: Toast[]
  show: (toast: Omit<Toast, 'id'>) => void
  remove: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const show = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const t: Toast = { id: crypto.randomUUID(), ...toast }
    setToasts((prev) => [...prev, t])
    setTimeout(() => remove(t.id), 3500)
  }, [])

  const remove = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, show, remove }}>
      {children}
      <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
        <div className="flex w-full max-w-md flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`backdrop-blur rounded-lg px-4 py-3 text-sm shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-2
                ${t.tone === 'error' ? 'bg-rose-500/80 text-white' : t.tone === 'success' ? 'bg-emerald-500/80 text-white' : 'bg-black/70 text-white'}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="font-medium">{t.title}</div>
                  {t.description ? <div className="text-white/80">{t.description}</div> : null}
                </div>
                <button
                  aria-label="Close"
                  onClick={() => remove(t.id)}
                  className="rounded px-2 py-1 hover:bg-white/10"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}



import React from 'react'

export function Modal({ open, onClose, title, children, actions }: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  React.useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-4 w-full max-w-lg overflow-hidden rounded-xl bg-white/95 p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="mb-3 text-lg font-semibold">{title}</div>
        <div>{children}</div>
        {actions ? <div className="mt-6 flex justify-end gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}



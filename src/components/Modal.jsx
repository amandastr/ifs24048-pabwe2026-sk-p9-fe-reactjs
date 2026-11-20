import { useEffect, useRef } from 'react'

export default function Modal({ title, titleId, onClose, footer, children }) {
  const ref = useRef(null)
  useEffect(() => {
    ref.current.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2">
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex h-[96vh] w-full max-w-[96vw] flex-col overflow-hidden rounded-xl"
        style={{ background: 'var(--surface)', color: 'var(--text)' }}
      >
        <header className="px-6 py-4" style={{ background: 'var(--head)', color: 'var(--on-head)' }}>
          <h2 id={titleId} className="text-xl font-bold">{title}</h2>
        </header>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        <footer className="flex justify-end gap-3 border-t px-6 py-4" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
          {footer}
        </footer>
      </div>
    </div>
  )
}

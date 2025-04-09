import { useEffect } from 'react'

export function Dialog({ children, open, onOpenChange }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 text-[#011A39]">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative shadow">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  )
}

export function DialogTrigger({ asChild, children }) {
  return children
}

export function DialogContent({ children }) {
  return <div>{children}</div>
}

export function DialogHeader({ children }) {
  return <div className="mb-4">{children}</div>
}

export function DialogTitle({ children }) {
  return <h2 className="text-lg font-semibold text-[#011A39]">{children}</h2>
}

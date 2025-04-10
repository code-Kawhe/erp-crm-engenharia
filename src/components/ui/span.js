export function Span({ children, className = '', variant = 'def', ...props }) {
    const base = 'px-4 py-2 rounded text-sm font-medium transition'
    const variants = {
      verde1: 'px-2 py-1 bg-green-200/50 text-green-700 rounded',
    }
  
    return (
      <span
        className={`${base} ${variants[variant] || variants.default} ${className}`}
        {...props}
      >
        {children}
      </span>
    )
  }
  
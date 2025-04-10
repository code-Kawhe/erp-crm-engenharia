export function Button({ children, className = '', variant = 'def', ...props }) {
  const base = 'px-4 py-2 rounded text-sm font-medium transition'
  const variants = {
    def: 'bg-[#045CBA] text-white hover:bg-[#034a96]',
    def2: 'mt-2 text-blue-500',
    edit: 'bg-yellow-500 text-white hover:bg-yellow-600',
    delet: 'bg-red-500 text-white hover:bg-red-600',
    delet2: 'text-red-500 font-bold ml-2',
    final: 'bg-green-600 text-white px-4 py-2 rounded mr-2 hover:bg-green-700',
  }

  return (
    <button
      className={`${base} ${variants[variant] || variants.default} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

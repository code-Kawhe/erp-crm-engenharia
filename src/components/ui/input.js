export function Input({ className = '', ...props }) {
    return (
      <input
        className={`text-[#011A39] w-full border border-[#6B6B6B] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#045CBA] ${className}`}
        {...props}
      />
    )
  }
  
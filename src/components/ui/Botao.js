'use client'

export default function Botao({ children, onClick, cor = 'azul', ...props }) {
  const cores = {
    azul: 'bg-blue-600 hover:bg-blue-700',
    vermelho: 'bg-red-600 hover:bg-red-700',
    verde: 'bg-green-600 hover:bg-green-700',
    cinza: 'bg-gray-600 hover:bg-gray-700',
  }

  return (
    <button
      onClick={onClick}
      className={`text-white px-4 py-2 rounded ${cores[cor]}`}
      {...props}
    >
      {children}
    </button>
  )
}
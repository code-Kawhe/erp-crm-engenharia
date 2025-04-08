'use client'
import UsuariosLista from '@/components/modules/usuarios/UsuariosLista'

export default function UsuariosPage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="flex-1 overflow-y-auto p-4">
        <UsuariosLista />
      </main>
    </div>
  )
}

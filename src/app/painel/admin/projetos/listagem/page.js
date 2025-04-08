'use client'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import ProjetosLista from '@/components/modules/projetos/ProjetosLista'

export default function ProjetosPage() {
  return (
    <div className="flex">
      <main className="flex-1 overflow-y-auto p-4 int">
        <ProjetosLista />
      </main>
    </div>
  )
}

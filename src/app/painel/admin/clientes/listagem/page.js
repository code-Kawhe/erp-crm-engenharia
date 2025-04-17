'use client'

import ClienteLista from "@/components/modules/clientes/clienteLista"

export default function ProjetosPage() {
  return (
    <div className="flex">
      <main className="flex-1 overflow-y-auto p-4 int">
        <ClienteLista/>
      </main>
    </div>
  )
}
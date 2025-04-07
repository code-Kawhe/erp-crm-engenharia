'use client'
import useAuth from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function PainelAdmin() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.perfil !== 'tecnico')) {
      router.push('/login')
    }
  }, [user, loading])

  if (loading || !user) return <p>Carregando...</p>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Painel do Administrador</h1>
      {/* Conteúdo do painel */}
    </div>
  )
}
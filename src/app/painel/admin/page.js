'use client'
import useAuth from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function PainelAdmin() {
  const { user, loading, perfil } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || perfil !== 'admin')) {
      router.push('/login')
    }
  }, [user, loading])

  if (loading || !user) return <p>Carregando...</p>

  return (
    <div className="p-4">
      
    </div>
  )
}
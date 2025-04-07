'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario(user)
        const email = user.email || ''
        if (email.includes('admin')) router.push('/painel/admin')
        else if (email.includes('gestor')) router.push('/painel/gestor')
        else if (email.includes('tecnico')) router.push('/painel/tecnico')
        else router.push('/painel/cliente')
      } else {
        setUsuario(null)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#010721] text-[#B2B8BE]">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#010721] text-[#B2B8BE] px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Bem-vindo ao Sistema ERP/CRM</h1>
      <p className="mb-4 text-center text-[#B2B8BE]">Acesse sua conta para continuar.</p>
      <button
        onClick={() => router.push('/login')}
        className="bg-[#045CA] hover:bg-[#0346a3] text-white px-6 py-2 rounded-md transition duration-300"
      >
        Fazer login
      </button>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'

export default function PainelLayout({ children }) {
  const [perfil, setPerfil] = useState(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth     , (user) => {
      if (!user) {
        router.push('/login')
      } else {
        setEmail(user.email)

        if (user.email.includes('admin')) setPerfil('admin')
        else if (user.email.includes('gestor')) setPerfil('gestor')
        else if (user.email.includes('tecnico')) setPerfil('tecnico')
        else if (user.email.includes('cliente')) setPerfil('cliente')

        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  if (loading || !perfil) {
    return <div className="text-center p-10">Carregando...</div>
  }

  return (
    <div className="flex h-screen">
      <Sidebar perfil={perfil} />
      <div className="flex-1 bg-gray-100">
        <Header perfil={perfil} email={email} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

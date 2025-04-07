'use client'

import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'

export default function Header({ perfil, email }) {
  const router = useRouter()

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  return (
    <header className="bg-[#010721] text-[#B2B8BE] p-4 flex justify-between items-center shadow-md">
      <div>
        <h1 className="text-xl font-bold capitalize">Painel do {perfil}</h1>
        <p className="text-sm">
          Logado como:{' '}
          <span className="font-semibold text-[#045CA]">{email}</span>
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="bg-[#6B6B6B] hover:bg-[#3C3C3C] text-white px-4 py-2 rounded-md transition shadow"
      >
        Sair
      </button>
    </header>
  )
}

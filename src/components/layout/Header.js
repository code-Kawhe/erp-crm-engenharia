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
      <div className='flex'>
        <button onClick={() => router.back()} className='mr-4'>
          <svg className='w-7 h-7 fill-[#B2B8BE]' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M459.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29l0-320c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4L288 214.3l0 41.7 0 41.7L459.5 440.6zM256 352l0-96 0-128 0-32c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160C4.2 237.5 0 246.5 0 256s4.2 18.5 11.5 24.6l192 160c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29l0-64z" /></svg>
        </button>
        <div>
          <h1 className="text-xl font-bold capitalize">Painel do {perfil}</h1>
          <p className="text-sm">
            Logado como:{' '}
            <span className="font-semibold text-[#045CA]">{email}</span>
          </p>
        </div>
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

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, senha)
      if (email.includes('admin')) router.push('/painel/admin')
      else if (email.includes('cliente')) router.push('/painel/cliente')
      else if (email.includes('gestor')) router.push('/painel/gestor')
      else if (email.includes('tecnico')) router.push('/painel/tecnico')
      else router.push('/painel')
    } catch (err) {
      alert('Credenciais inválidas.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#010721]">
      <div className="bg-[#011A39] shadow-lg rounded-xl p-8 w-full max-w-sm border border-[#045CA]">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#B2B8BE]">Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 bg-[#010721] text-white border border-[#3C3C3C] rounded-md placeholder-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#045CA]"
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="w-full px-4 py-2 bg-[#010721] text-white border border-[#3C3C3C] rounded-md placeholder-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#045CA]"
          />
          <button
            type="submit"
            className="w-full bg-[#045CA] text-white py-2 rounded-md hover:bg-[#0346a3] transition duration-300"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}

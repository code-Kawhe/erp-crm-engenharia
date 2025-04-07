'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function CadastroPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [perfil, setPerfil] = useState('cliente')

  const handleCadastro = async (e) => {
    e.preventDefault()
    try {
      await createUserWithEmailAndPassword(auth, email, senha)

      if (perfil === 'admin') router.push('/painel/admin')
      else if (perfil === 'gestor') router.push('/painel/gestor')
      else if (perfil === 'tecnico') router.push('/painel/tecnico')
      else router.push('/painel/cliente')
    } catch (err) {
      alert('Erro ao cadastrar: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#010721]">
      <div className="bg-[#011A39] shadow-lg rounded-xl p-8 w-full max-w-sm border border-[#045CA]">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#B2B8BE]">Cadastro</h1>
        <form onSubmit={handleCadastro} className="space-y-4">
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
          <select
            value={perfil}
            onChange={(e) => setPerfil(e.target.value)}
            className="w-full px-4 py-2 bg-[#010721] text-white border border-[#3C3C3C] rounded-md focus:outline-none focus:ring-2 focus:ring-[#045CA]"
          >
            <option value="cliente">Cliente</option>
            <option value="admin">Admin</option>
            <option value="gestor">Gestor</option>
            <option value="tecnico">Técnico</option>
          </select>
          <button
            type="submit"
            className="w-full bg-[#045CA] text-white py-2 rounded-md hover:bg-[#0346a3] transition duration-300"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  )
}

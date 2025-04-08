'use client'
import { useState, useEffect } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'

export default function UsuariosForm({ onClose, usuario }) {
  const isEditando = !!usuario

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    perfil: 'tecnico'
  })

  useEffect(() => {
    if (isEditando) {
      setFormData({
        nome: usuario.nome || '',
        email: usuario.email || '',
        senha: '',
        perfil: usuario.perfil || 'tecnico'
      })
    }
  }, [usuario])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (isEditando) {
        await setDoc(doc(db, 'usuarios', usuario.id), {
          nome: formData.nome,
          email: formData.email,
          perfil: formData.perfil,
          atualizadoEm: new Date()
        })
        alert('Usuário atualizado com sucesso!')
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.senha
        )

        await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
          nome: formData.nome,
          email: formData.email,
          perfil: formData.perfil,
          criadoEm: new Date()
        })

        alert('Usuário criado com sucesso!')
      }

      onClose()
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
      alert('Erro ao salvar usuário. Verifique os dados e tente novamente.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-[#010721]">
          {isEditando ? 'Editar Usuário' : 'Novo Usuário'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="nome"
            placeholder="Nome"
            value={formData.nome}
            onChange={handleChange}
            className="w-full border border-[#6B6B6B] rounded px-3 py-2 bg-white text-[#010721] text-[#011A39]"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-[#6B6B6B] rounded px-3 py-2 bg-white text-[#010721] text-[#011A39]"
            required
            disabled={isEditando} // desabilita edição do email
          />
          {!isEditando && (
            <input
              name="senha"
              type="password"
              placeholder="Senha"
              value={formData.senha}
              onChange={handleChange}
              className="w-full border border-[#6B6B6B] rounded px-3 py-2 bg-white text-[#010721] text-[#011A39]"
              required
            />
          )}
          <select
            name="perfil"
            value={formData.perfil}
            onChange={handleChange}
            className="w-full border border-[#6B6B6B] rounded px-3 py-2 bg-white text-[#010721] text-[#011A39]"
          >
            <option value="admin">Admin</option>
            <option value="gestor">Gestor</option>
            <option value="tecnico">Técnico</option>
            <option value="cliente">Cliente</option>
          </select>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-[#045CBA] text-white px-4 py-2 rounded"
            >
              {isEditando ? 'Salvar Alterações' : 'Salvar'} 
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

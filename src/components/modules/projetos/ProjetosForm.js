'use client'
import { useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export default function ProjetosForm({ onClose }) {
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    escopo: '',
    equipe: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await addDoc(collection(db, 'projetos'), {
        ...formData,
        status: 'aberto',
        criadoEm: serverTimestamp()
      })
      alert('Projeto criado com sucesso!')
      onClose()
    } catch (error) {
      console.error('Erro ao criar projeto:', error)
      alert('Erro ao criar projeto. Tente novamente.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl">
        <h2 className="text-xl font-bold mb-4">Novo Projeto</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="nome"
            placeholder="Nome do projeto"
            value={formData.nome}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            name="tipo"
            placeholder="Tipo de serviço (ex: estrutural)"
            value={formData.tipo}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          <textarea
            name="escopo"
            placeholder="Descrição do escopo"
            value={formData.escopo}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
          <input
            name="equipe"
            placeholder="Equipe técnica"
            value={formData.equipe}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />

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
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

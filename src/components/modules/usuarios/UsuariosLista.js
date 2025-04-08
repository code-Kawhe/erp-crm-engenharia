'use client'
import { useEffect, useState } from 'react'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import UsuariosForm from './UsuariosForm'

export default function UsuariosLista() {
  const [usuarios, setUsuarios] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null)

  const fetchUsuarios = async () => {
    const snapshot = await getDocs(collection(db, 'usuarios'))
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setUsuarios(lista)
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const handleDelete = async (id) => {
    const confirm = window.confirm('Tem certeza que deseja excluir este usuário?')
    if (!confirm) return

    try {
      await deleteDoc(doc(db, 'usuarios', id))
      fetchUsuarios()
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      alert('Erro ao excluir usuário.')
    }
  }

  const handleEdit = (usuario) => {
    setUsuarioSelecionado(usuario)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setUsuarioSelecionado(null)
    fetchUsuarios()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#011A39]">Usuários</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#045CBA] text-white px-4 py-2 rounded"
        >
          Novo Usuário
        </button>
      </div>

      {usuarios.length === 0 ? (
        <p>Nenhum usuário encontrado.</p>
      ) : (
        <ul className="space-y-2">
          {usuarios.map(usuario => (
            <li key={usuario.id} className="text-[#011A39] border p-4 rounded bg-white shadow flex justify-between items-center">
              <div>
                <strong>{usuario.nome}</strong> — {usuario.email} ({usuario.perfil})
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(usuario)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(usuario.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <UsuariosForm
          onClose={handleCloseForm}
          usuario={usuarioSelecionado}
        />
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import confirmar from '@/utils/confirm'
import { toast } from 'react-toastify'

export default function TiposProjetosPage() {
  const [tipos, setTipos] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [alise, setAlise] = useState('')
  const [editando, setEditando] = useState(null)

  const tiposRef = collection(db, 'tiposProjeto')

  useEffect(() => {
    buscarTipos()
  }, [])

  async function buscarTipos() {
    const snapshot = await getDocs(tiposRef)
    const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    setTipos(lista)
  }

  async function salvarTipo() {
    const toastId = toast.loading(editando ? 'Atualizando...' : 'Salvando...')
    if (nome.trim() === '' || alise.trim() === '') return
    if (editando) {
      const tipoRef = doc(db, 'tiposProjeto', editando.id)
      await updateDoc(tipoRef, { nome, alise }).then(() => {
        toast.update(toastId, {
          render: 'Tipo atualizado com sucesso!',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
      })
    } else {
      await addDoc(tiposRef, { nome, alise }).then(() => {
        toast.update(toastId, {
          render: 'Tipo adicionado com sucesso!',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
      })
    }

    setNome('')
    setAlise('')
    setEditando(null)
    setModalOpen(false)
    buscarTipos()
  }

  async function excluirTipo(id) {
    await deleteDoc(doc(db, 'tiposProjeto', id))
    buscarTipos()
  }

  function abrirEdicao(tipo) {
    setEditando(tipo)
    setNome(tipo.nome)
    setAlise(tipo.alise || '')
    setModalOpen(true)
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 int">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#011A39]">
          Tipos de Projetos
        </h1>
        <Button onClick={() => {
          setEditando(null);
          setNome('');
          setAlise('');
          setModalOpen(true);
        }
        }
        >+ Novo Tipo</Button>
      </div>

      {
        tipos.length === 0 ? (
          <p className="text-gray-500">Nenhum tipo de projeto cadastrado.</p>
        ) : (
          <table className="min-w-full bg-white border rounded shadow-md">
            <thead className="bg-[#011A39] text-white text-left">
              <tr>
                <th className="px-4 py-2">Nome</th>
                <th className="px-4 py-2">Alias</th>
                <th className="px-4 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {tipos.length !== 0 ? (
                tipos.map((tipo, index) => (
                  <tr key={tipo.id} className="border-t hover:bg-[#F1F5F9] text-[#011A39]">
                    <td className="px-4 py-2">{tipo.nome}</td>
                    <td className="px-4 py-2">{tipo.alise || '-'}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <Button
                        className="text-sm"
                        variant="edit"
                        onClick={() => abrirEdicao(tipo)}
                      >
                        Editar
                      </Button>
                      <Button
                        className="text-sm"
                        variant="delet"
                        onClick={() => confirmar("deseja excluir este tipo", () => { excluirTipo(tipo.id) })}
                      >
                        Excluir
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={99} className="text-center text-gray-500 py-4">
                    Nenhum tipo cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )
      }

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editando ? 'Editar Tipo de Projeto' : 'Novo Tipo de Projeto'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nome do tipo de projeto"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <Input
              placeholder="Alise (ex: projeto-arquitetonico)"
              value={alise}
              onChange={(e) => setAlise(e.target.value)}
            />
            <Button className="w-full" onClick={salvarTipo}>
              {editando ? 'Salvar Alterações' : 'Adicionar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  )
}

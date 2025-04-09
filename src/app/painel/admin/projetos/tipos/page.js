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
    if (nome.trim() === '' || alise.trim() === '') return

    if (editando) {
      const tipoRef = doc(db, 'tiposProjeto', editando.id)
      await updateDoc(tipoRef, { nome, alise })
    } else {
      await addDoc(tiposRef, { nome, alise })
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
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#011A39]">
          Tipos de Projetos
        </h1>
        <Button onClick={() => setModalOpen(true)}>+ Novo Tipo</Button>
      </div>

      {tipos.length === 0 ? (
        <p className="text-gray-500">Nenhum tipo de projeto cadastrado.</p>
      ) : (
        <ul className="space-y-2">
          {tipos.map((tipo) => (
            <li
              key={tipo.id}
              className="flex items-center justify-between bg-white shadow px-4 py-3 rounded border"
            >
              <div>
                <p className="text-[#011A39] font-medium">{tipo.nome}</p>
                <p className="text-sm text-gray-500">Alias: {tipo.alise || '-'}</p>
              </div>
              <div className="space-x-2">
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
                  onClick={() => excluirTipo(tipo.id)}
                >
                  Excluir
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

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
    </div>
  )
}

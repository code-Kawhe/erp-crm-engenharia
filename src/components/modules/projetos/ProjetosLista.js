'use client'
import { useEffect, useState } from 'react'
import { auth, db, storage } from '@/lib/firebase'
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore'
import ProjetosForm from './ProjetosForm'
import { useRouter } from 'next/navigation'
import { deleteObject, listAll, ref } from 'firebase/storage'
import confirmar from '@/utils/confirm'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'

export default function ProjetosLista() {
  const router = useRouter()
  const [projetos, setProjetos] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [projetoSelecionado, setProjetoSelecionado] = useState(null)

  const carregarProjetos = async () => {
    const querySnapshot = await getDocs(collection(db, 'projetos'))
    const lista = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
    setProjetos(lista)
  }

  useEffect(() => {
    carregarProjetos()
  }, [])

  const excluirProjeto = async (id) => {
    const toastId = toast.loading('Excluindo...')
    try {
      // 1. Deletar todos os arquivos da "pasta" no Storage
      const pastaRef = ref(storage, `projetos/${id}`)
      const lista = await listAll(pastaRef)

      const promisesDeletar = lista.items.map((arquivoRef) => deleteObject(arquivoRef))
      await Promise.all(promisesDeletar)

      // 2. Deletar o documento no Firestore
      await deleteDoc(doc(db, 'projetos', id))

      // 3. Atualizar a listagem
      carregarProjetos()
      toast.update(toastId, {
        render: "Deletado com sucesso",
        type: 'success',
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      })
    } catch (erro) {
      console.error('Erro ao excluir projeto e arquivos:', erro)
      toast.update(toastId, {
        render: 'Erro ao excluir o projeto. Verifique o console para mais detalhes.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      })
    }
  }

  function Vizualizar(id) {
    router.push(`listagem/${id}`)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-[#011A39]">Projetos</h1>
        <Button
          onClick={() => setMostrarForm(true)}
        >
          Novo Projeto
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow-md">
          <thead className="bg-[#011A39] text-white text-left">
            <tr>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Cliente</th>
              <th className="px-4 py-2">Engenheiro</th>
              <th className="px-4 py-2">CREA</th>
              <th className="px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {projetos.map((projeto) => (
              <tr
                key={projeto.id}
                className="border-t hover:bg-[#F1F5F9] text-[#011A39]"
              >
                <td className="px-4 py-2">{projeto.nome}</td>
                <td className="px-4 py-2">{projeto.tipo}</td>
                <td className="px-4 py-2">{projeto.cliente}</td>
                <td className="px-4 py-2">{projeto.engenheiro}</td>
                <td className="px-4 py-2">{projeto.crea}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button
                    variant='edit'
                    onClick={() => {
                      setProjetoSelecionado(projeto)
                      setMostrarForm(true)
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant='delet'
                    onClick={() =>
                      confirmar("Deseja excluir este projeto?", () => {
                        excluirProjeto(projeto.id)
                      })
                    }
                  >
                    Excluir
                  </Button>
                  <Button
                    onClick={() => Vizualizar(projeto.id)}
                  >
                    Visualizar
                  </Button>
                </td>
              </tr>
            ))}
            {projetos.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-[#6B6B6B]">
                  Nenhum projeto cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {mostrarForm && (
        <ProjetosForm
          onClose={() => {
            setMostrarForm(false)
            setProjetoSelecionado(null)
            carregarProjetos()
          }}
          projeto={projetoSelecionado}
        />
      )}
    </div>
  )
}

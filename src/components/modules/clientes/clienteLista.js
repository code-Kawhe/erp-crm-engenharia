'use client'
import { useEffect, useState } from 'react'
import { auth, db, storage } from '@/lib/firebase'
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { deleteObject, listAll, ref } from 'firebase/storage'
import confirmar from '@/utils/confirm'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import ClienteForm from './clienteForm'

export default function ClienteLista() {
  const router = useRouter()
  const [clientes, setclientes] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [clienteSelecionado, setclienteSelecionado] = useState(null)

  const carregarclientes = async () => {
    const querySnapshot = await getDocs(collection(db, 'clientes'))
    const lista = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
    setclientes(lista)
  }

  useEffect(() => {
    carregarclientes()
  }, [])

  const excluircliente = async (id) => {
    const toastId = toast.loading('Excluindo...')
    try {
      // 1. Deletar todos os arquivos da "pasta" no Storage
      const pastaRef = ref(storage, `clientes/${id}`)
      const lista = await listAll(pastaRef)

      const promisesDeletar = lista.items.map((arquivoRef) => deleteObject(arquivoRef))
      await Promise.all(promisesDeletar)

      // 2. Deletar o documento no Firestore
      await deleteDoc(doc(db, 'clientes', id))

      // 3. Atualizar a listagem
      carregarclientes()
      toast.update(toastId, {
        render: "Deletado com sucesso",
        type: 'success',
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      })
    } catch (erro) {
      console.error('Erro ao excluir cliente e arquivos:', erro)
      toast.update(toastId, {
        render: 'Erro ao excluir o cliente. Verifique o console para mais detalhes.',
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

  console.log(clientes)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-[#011A39]">Clientes</h1>
        <Button
          onClick={() => setMostrarForm(true)}
        >
          Novo Cliente
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
            {clientes.map((cliente) => (
              <tr
                key={cliente.id}
                className="border-t hover:bg-[#F1F5F9] text-[#011A39]"
              >
                <td className="px-4 py-2">{cliente.nome}</td>
                <td className="px-4 py-2">{cliente.tipo}</td>
                <td className="px-4 py-2">{cliente.cliente}</td>
                <td className="px-4 py-2">{cliente.engenheiro}</td>
                <td className="px-4 py-2">{cliente.crea}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button
                    variant='edit'
                    onClick={() => {
                      setclienteSelecionado(cliente)
                      setMostrarForm(true)
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant='delet'
                    onClick={() =>
                      confirmar("Deseja excluir este cliente?", () => {
                        excluircliente(cliente.id)
                      })
                    }
                  >
                    Excluir
                  </Button>
                  <Button
                    onClick={() => Vizualizar(cliente.id)}
                  >
                    Visualizar
                  </Button>
                </td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-[#6B6B6B]">
                  Nenhum cliente cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {mostrarForm && (
        <ClienteForm
          onClose={() => {
            setMostrarForm(false)
            setclienteSelecionado(null)
            carregarclientes()
          }}
          cliente={clienteSelecionado}
        />
      )}
    </div>
  )
}
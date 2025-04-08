'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getDownloadURL, listAll, ref } from 'firebase/storage'
import { storage } from '@/lib/firebase'

export default function ProjetoDetalhes() {
  const { id } = useParams()
  const [projeto, setProjeto] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjeto = async () => {
      try {
        const docRef = doc(db, 'projetos', id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setProjeto({ id: docSnap.id, ...docSnap.data() })
        }

      } catch (error) {
        console.error('Erro ao carregar projeto:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchProjeto()
  }, [id])

  if (loading) return <div className="text-gray-500">Carregando...</div>
  if (!projeto) return <div className="text-red-500">Projeto não encontrado.</div>


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#011A39] mb-4">Detalhes do Projeto</h1>

      <div className="bg-white p-4 rounded shadow mb-6 text-[#011A39]">
        <h2 className="text-xl font-semibold text-[#011A39] mb-2">{projeto.nome}</h2>
        <p><strong>Tipo:</strong> {projeto.tipo}</p>
        <p><strong>Escopo:</strong> {projeto.escopo}</p>
        <p><strong>Equipe:</strong> {projeto.equipe}</p>
        <p><strong>Engenheiro:</strong> {projeto.engenheiro}</p>
        <p><strong>CREA:</strong> {projeto.crea}</p>
        <p><strong>Cliente:</strong> {projeto.cliente}</p>
      </div>

      {/* Arquivos do Projeto */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2 text-[#011A39]">Arquivos Enviados</h3>
        {projeto.arquivos.length > 0 ? (
          <ul className="list-disc ml-5 text-sm">
            {projeto.arquivos.map((arquivo, i) => (
              <li key={i}>
                <a
                  href={`${id}/arquivo/${encodeURIComponent(arquivo.nome)}`}
                  className="text-blue-600 underline"
                >
                  {arquivo.nome}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Nenhum arquivo enviado.</p>
        )}
      </div>
    </div>
  )
}

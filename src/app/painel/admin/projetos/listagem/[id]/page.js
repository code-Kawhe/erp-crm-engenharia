'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

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

  const atualizarProjeto = async (tarefasAtualizadas) => {
    const docRef = doc(db, 'projetos', id)
    await updateDoc(docRef, { tarefas: tarefasAtualizadas })
    setProjeto(prev => ({ ...prev, tarefas: tarefasAtualizadas }))
  }

  const iniciarSubtarefa = (grupoIndex, tarefaIndex, subtarefaIndex) => {
    const novasTarefas = [...projeto.tarefas]
    const grupo = novasTarefas[grupoIndex]
    const tarefa = grupo.tarefas[tarefaIndex]
    const subtarefa = tarefa.subtarefas[subtarefaIndex]

    if (subtarefa.status !== 'pendente') return

    subtarefa.status = 'em progresso'
    subtarefa.inicio = new Date().toISOString()

    if (!tarefa.status || tarefa.status === 'pendente') {
      tarefa.status = 'em progresso'
      tarefa.inicio = new Date().toISOString()
    }

    atualizarProjeto(novasTarefas)
  }

  const finalizarSubtarefa = (grupoIndex, tarefaIndex, subtarefaIndex) => {
    const novasTarefas = [...projeto.tarefas]
    const grupo = novasTarefas[grupoIndex]
    const tarefa = grupo.tarefas[tarefaIndex]
    const subtarefa = tarefa.subtarefas[subtarefaIndex]

    if (subtarefa.status !== 'em progresso') return

    subtarefa.status = 'finalizado'
    subtarefa.fim = new Date().toISOString()

    const todasFinalizadas = tarefa.subtarefas.every(s => s.status === 'finalizado')
    if (todasFinalizadas) {
      tarefa.status = 'finalizado'
      tarefa.fim = new Date().toISOString()
    }

    atualizarProjeto(novasTarefas)
  }

  const iniciarTarefa = (grupoIndex, tarefaIndex) => {
    const novasTarefas = [...projeto.tarefas]
    const grupo = novasTarefas[grupoIndex]
    const tarefa = grupo.tarefas[tarefaIndex]

    if (tarefa.status !== 'pendente') return

    tarefa.status = 'em progresso'
    tarefa.inicio = new Date().toISOString()

    atualizarProjeto(novasTarefas)
  }

  const finalizarTarefa = (grupoIndex, tarefaIndex) => {
    const novasTarefas = [...projeto.tarefas]
    const grupo = novasTarefas[grupoIndex]
    const tarefa = grupo.tarefas[tarefaIndex]

    if (tarefa.status !== 'em progresso') return

    tarefa.status = 'finalizado'
    tarefa.fim = new Date().toISOString()

    atualizarProjeto(novasTarefas)
  }

  if (loading) return <div className="text-gray-500">Carregando...</div>
  if (!projeto) return <div className="text-red-500">Projeto não encontrado.</div>

  return (
    <div className="p-6 text-[#011A39] int">
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

      {/* Arquivos */}
      <div className="bg-white p-4 rounded shadow mt-8">
        <h3 className="text-lg font-semibold mb-2 text-[#011A39]">Arquivos Enviados</h3>
        {projeto.arquivos?.length > 0 ? (
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

      {projeto.tarefas?.map((grupo, grupoIndex) => (
        <div key={grupoIndex} className="border border-gray-300 p-3 rounded mb-3">
          <h3 className="text-lg font-bold text-[#011A39] mb-2">
            Tipo: {grupo.tipo}
          </h3>

          {grupo.tarefas?.map((tarefa, tarefaIndex) => (
            <div key={tarefaIndex} className="border border-gray-300 p-3 rounded mb-3">
              <p className="font-semibold">{tarefa.nome}</p>
              <p>Status: <span className="capitalize">{tarefa.status || 'pendente'}</span></p>

              {/* Tarefa sem subtarefas ou subtarefas vazias */}
              {(!tarefa.subtarefas || tarefa.subtarefas.length === 0) && (
                <div className="flex gap-2 mt-2">
                  {tarefa.status === 'pendente' && (
                    <button
                      onClick={() => iniciarTarefa(grupoIndex, tarefaIndex)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded"
                    >
                      Iniciar
                    </button>
                  )}
                  {tarefa.status === 'em progresso' && (
                    <button
                      onClick={() => finalizarTarefa(grupoIndex, tarefaIndex)}
                      className="px-2 py-1 bg-green-600 text-white rounded"
                    >
                      Finalizar
                    </button>
                  )}
                  {tarefa.status === 'finalizado' && (
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded">
                      Finalizada
                    </span>
                  )}
                </div>
              )}


              {/* Subtarefas */}
              {tarefa.subtarefas?.map((sub, subIndex) => (
                <div key={subIndex} className="ml-4 mt-2 p-2 border-l-2 border-gray-400">
                  <p>{sub.nome}</p>
                  <p className="text-sm text-gray-600">Status: <span className="capitalize">{sub.status || 'pendente'}</span></p>
                  <div className="flex gap-2 mt-1">
                    {sub.status === 'pendente' && (
                      <button
                        onClick={() => iniciarSubtarefa(grupoIndex, tarefaIndex, subIndex)}
                        className="px-2 py-1 text-white bg-yellow-500 rounded"
                      >
                        Iniciar
                      </button>
                    )}
                    {sub.status === 'em progresso' && (
                      <button
                        onClick={() => finalizarSubtarefa(grupoIndex, tarefaIndex, subIndex)}
                        className="px-2 py-1 text-white bg-green-600 rounded"
                      >
                        Finalizar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { arrayUnion, collection, doc, Firestore, getDoc, getDocs, updateDoc } from 'firebase/firestore'
import { db, storage } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import AddTasksModal from '@/components/modules/projetos/AddTasksModal'
import { Span } from '@/components/ui/span'
import DropdownMenu from '@/components/ui/dropDown'
import confirmar from '@/utils/confirm'
import { deleteObject, getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage'
import { toast } from 'react-toastify'

export default function ProjetoDetalhes() {
  const { id } = useParams()
  const [projeto, setProjeto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [tipoModal, setTipoModal] = useState(null)
  const [grupoSelecionado, setGrupoSelecionado] = useState(null)
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null)
  const [showModalTemplate, setShowModalTemplate] = useState(false)
  const [templatesDisponiveis, setTemplatesDisponiveis] = useState([])
  const [templateSelecionado, setTemplateSelecionado] = useState('')
  const [arquivoOpen, setArquivoOpen] = useState(false)
  const [pjOpen, setPjOpen] = useState(false)
  const [modalAbertoCampoPersonalizado, setModalAbertoCampoPersonalizado] = useState(false)

  const camposPerzonalizado = [
    { label: "Texto", value: "text" },
    { label: "Texto longo", value: "longText" },
    { label: "Data", value: "date" },
    { label: "Numero", value: "Number" },
    { label: "Etiquetas", value: "tags" },
    { label: "Dinheiro", value: "money" },
    { label: "Site", value: "url" },
    { label: "E-mail", value: "mail" },
    { label: "Telefone", value: "cell" },
    { label: "Localização", value: "location" },
    { label: "Avaliação", value: "assessment" },
    { label: "Assinatura", value: "Sign" },
    { label: "Checkbox", value: "checkbox" },
  ]

  const inputArquivoRef = useRef(null)

  const handleUploadArquivo = async (e) => {
    const toastId = toast.loading('Enviando...')
    const arquivos = Array.from(e.target.files)
    if (!arquivos.length) return

    const urlsArquivos = []
    const arquivosExistentes = projeto.arquivos || []

    for (const file of arquivos) {
      const labelJaExiste = arquivosExistentes.some(a => a.label === file.name)
      if (labelJaExiste) {
        toast.warning(`Arquivo duplicado: "${file.name}" foi ignorado.`)
        continue
      }

      const storagePath = `projetos/${id}/${file.name}`
      const storageRef = ref(storage, storagePath)
      const uploadTask = uploadBytesResumable(storageRef, file)

      await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          null,
          reject,
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref)
            const arquivoData = { label: file.name, url }
            urlsArquivos.push(arquivoData)
            resolve()
          }
        )
      })
    }

    if (urlsArquivos.length > 0) {
      try {
        const projetoRef = doc(db, 'projetos', id)
        await updateDoc(projetoRef, {
          arquivos: arrayUnion(...urlsArquivos),
        })

        toast.update(toastId, {
          render: 'Enviado com sucesso!',
          value: 'success',
          isLoading: false,
          autoClose: 3000,
        })

        // Atualize os dados localmente se necessário
      } catch (error) {
        console.error('Erro ao salvar arquivos no Firestore:', error)
        toast.update(toastId, {
          render: 'Erro ao salvar arquivos no projeto.',
          value: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
    }

    e.target.value = ''
  }

  //alimenta os "tamplates disponiveis"
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!projeto || !projeto.tarefas) return // <- proteção aqui

      const snapshot = await getDocs(collection(db, 'templates'))
      const templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      const TD = templates.filter(template => {
        return !projeto.tarefas.some(grupo => grupo.tipo === template.tipo)
      })

      setTemplatesDisponiveis(TD)
    }

    fetchTemplates()
  }, [projeto])

  const adicionarTemplateAoProjeto = async () => {
    if (!templateSelecionado) return

    const templateRef = doc(db, 'templates', templateSelecionado)
    const templateSnap = await getDoc(templateRef)

    if (!templateSnap.exists()) return

    const template = templateSnap.data()

    const jaExiste = (projeto.tarefas || []).some(
      grupo => grupo.tipo === template.tipo
    )

    if (jaExiste) {
      alert('Este template já foi adicionado ao projeto.')
      return
    }

    const novasTarefas = [
      ...(projeto.tarefas || []),
      {
        tipo: template.tipo,
        label: template.label,
        tarefas: template.tarefas.map(tarefa => ({
          ...tarefa,
          status: 'pendente',
          campos: [],
          subtarefas: (tarefa.subtasks || []).map(sub => ({
            ...sub,
            status: 'pendente',
            campos: []
          }))
        }))
      }
    ]

    const novosTipos = [
      ...(projeto.projetos || []),
      template.tipo
    ]

    await updateDoc(doc(db, 'projetos', id), {
      tarefas: novasTarefas,
      projetos: novosTipos
    })

    setProjeto(prev => ({
      ...prev,
      tarefas: novasTarefas,
      projetos: novosTipos
    }))

    setShowModalTemplate(false)
    setTemplateSelecionado('')
  }

  //alimenta o "projeto"
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
  }, [id, projeto])

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

  const abrirModal = (tipo, grupoIndex, tarefaIndex = null) => {
    setTipoModal(tipo)
    setGrupoSelecionado(grupoIndex)
    setTarefaSelecionada(tarefaIndex)
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setGrupoSelecionado(null)
    setTarefaSelecionada(null)
  }

  const adicionarTarefa = (grupoIndex, label) => {
    const novasTarefas = [...projeto.tarefas]
    const novaTarefa = {
      label,
      status: 'pendente',
      subtarefas: []
    }
    novasTarefas[grupoIndex].tarefas.push(novaTarefa)
    atualizarProjeto(novasTarefas)
  }

  const adicionarSubtarefa = (grupoIndex, tarefaIndex, label) => {
    const novasTarefas = [...projeto.tarefas]
    const novaSub = {
      label,
      status: 'pendente'
    }

    if (!novasTarefas[grupoIndex].tarefas[tarefaIndex].subtarefas) {
      novasTarefas[grupoIndex].tarefas[tarefaIndex].subtarefas = []
    }

    novasTarefas[grupoIndex].tarefas[tarefaIndex].subtarefas.push(novaSub)
    atualizarProjeto(novasTarefas)
  }

  const removerTarefa = (grupoIndex, tarefaIndex) => {
    const novasTarefas = [...projeto.tarefas]
    novasTarefas[grupoIndex].tarefas.splice(tarefaIndex, 1)
    atualizarProjeto(novasTarefas)
  }

  const removerSubtarefa = (grupoIndex, tarefaIndex, subtarefaIndex) => {
    const novasTarefas = [...projeto.tarefas]
    novasTarefas[grupoIndex].tarefas[tarefaIndex].subtarefas.splice(subtarefaIndex, 1)
    atualizarProjeto(novasTarefas)
  }

  const removerTemplateDoProjeto = async (tipoTemplate) => {
    const novasTarefas = (projeto.tarefas || []).filter(grupo => grupo.tipo !== tipoTemplate)
    const novosTipos = (projeto.projetos || []).filter(tipo => tipo !== tipoTemplate)

    await updateDoc(doc(db, 'projetos', id), {
      tarefas: novasTarefas,
      projetos: novosTipos
    })

    setProjeto(prev => ({
      ...prev,
      tarefas: novasTarefas,
      projetos: novosTipos
    }))
  }

  const abrirModalSubtarefa = (grupoIndex, tarefaIndex) => {
    abrirModal('subtarefa', grupoIndex, tarefaIndex)
  }

  const handleRemoverArquivo = async (arquivo) => {
    const toastId = toast.loading('Excluindo...')

    try {
      // 🔥 Remover do Storage
      const storageRef = ref(storage, `projetos/${projeto.id}/${arquivo.label}`)
      await deleteObject(storageRef)

      // 🧼 Filtrar e atualizar no Firestore
      const novosArquivos = projeto.arquivos.filter(a => a.label.trim() !== arquivo.label.trim())

      const projetoRef = doc(db, 'projetos', projeto.id)
      await updateDoc(projetoRef, { arquivos: novosArquivos })

      toast.update(toastId, {
        render: 'Excluído com sucesso!',
        value: 'success',
        isLoading: false,
        autoClose: 3000,
      })
    } catch (error) {
      console.error('❌ Erro:', error)
      toast.update(toastId, {
        render: 'Erro ao remover o arquivo.',
        value: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }
  }

  function HandleOpenArquivos() {
    setArquivoOpen(!arquivoOpen)
  }
  function HandleOpenPj() {
    setPjOpen(!pjOpen)
  }

  const handleAddCampoInTerefa = () => {

  }
  const handleAddCampoInSubTerefa = () => {

  }



  const abrirModalCampoPersonalizado = () => {
    setModalAbertoCampoPersonalizado(true)
  }

  const fecharModalCampoPersonalizado = () => {
    setModalAbertoCampoPersonalizado(false)
  }

  return (
    <div className="p-6 text-[#011A39] int">
      <h1 className="text-2xl font-bold text-[#011A39] mb-4">Detalhes do Projeto</h1>

      <div className="bg-white p-4 rounded shadow mb-6 text-[#011A39]">
        <h2 className="text-xl font-semibold text-[#011A39] mb-2">{projeto.label}</h2>
        <p><strong>Tipo:</strong> {projeto.tipo}</p>
        <p><strong>Escopo:</strong> {projeto.escopo}</p>
        <p><strong>Equipe:</strong> {projeto.equipe}</p>
        <p><strong>Engenheiro:</strong> {projeto.engenheiro}</p>
        <p><strong>CREA:</strong> {projeto.crea}</p>
        <p><strong>Cliente:</strong> {projeto.cliente}</p>
      </div>

      {/* Arquivos ------ */}
      <div className="bg-white p-4 rounded shadow mt-5 mb-5">
        <h3 className="flex items-center text-lg font-semibold mb-2 text-[#011A39]">Arquivos Enviados <span onClick={HandleOpenArquivos} className='ml-5'>{arquivoOpen ? <svg className='w-5' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z" /></svg> : <svg className='w-5' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512"><path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z" /></svg>}</span></h3>
        {arquivoOpen ?
          <>

            {projeto.arquivos?.length > 0 ? (
              <ul className="list-disc ml-5 text-sm">
                {projeto.arquivos.map((arquivo, i) => (
                  <li key={i}>
                    <a
                      href={`${id}/arquivo/${encodeURIComponent(arquivo.label)}`}
                      className="text-blue-600 underline"
                    >
                      {arquivo.label}
                    </a>
                    <Button
                      onClick={() => confirmar("deseja excluir este arquivo", () => handleRemoverArquivo(arquivo))}
                      variant='delet2'
                    >
                      Excluir
                    </Button>
                  </li>
                ))}
                <input
                  value="file"
                  onChange={handleUploadArquivo}
                  ref={inputArquivoRef}
                  className="hidden"
                />
                <Button
                  variant="def"
                  onClick={() => inputArquivoRef.current?.click()}
                  className="mb-3"
                >
                  + Adicionar Arquivo
                </Button>
              </ul>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-5">Nenhum arquivo enviado.</p>
                <input
                  value="file"
                  onChange={handleUploadArquivo}
                  ref={inputArquivoRef}
                  className="hidden"
                />
                <Button
                  variant="def"
                  onClick={() => inputArquivoRef.current?.click()}
                  className="mb-3"
                >
                  + Adicionar Arquivo
                </Button>
              </>
            )}
          </>
          :
          <>
          </>
        }
      </div>
      {/* Arquivos ------ */}

      {/* Tarefas ------ */}
      <div className="bg-white p-4 rounded shadow mt-5 mb-5">


        <h2 className='flex items-center text-lg font-semibold mb-2 text-[#011A39]'>Tarefas <span onClick={HandleOpenPj} className='ml-5'>{pjOpen ? <svg className='w-5' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z" /></svg> : <svg className='w-5' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512"><path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z" /></svg>}</span></h2>
        {pjOpen ?
          <>

            <AddTasksModal
              aberto={modalAberto}
              onClose={fecharModal}
              titulo={tipoModal === 'tarefa' ? 'Nova Tarefa' : 'Nova Subtarefa'}
              onSalvar={(label) => {
                if (tipoModal === 'tarefa') {
                  adicionarTarefa(grupoSelecionado, label)
                } else if (tipoModal === 'subtarefa') {
                  adicionarSubtarefa(grupoSelecionado, tarefaSelecionada, label)
                }
              }}
            />
            <Button
              onClick={() => setShowModalTemplate(true)}
              className="mb-4"
            >
              + Adicionar Template
            </Button>
            {projeto.tarefas?.map((grupo, grupoIndex) => (
              <div key={grupoIndex} className="border border-gray-300 p-3 rounded mb-3">

                <h3 className=" flex text-lg font-bold text-[#011A39] mb-2">
                  {grupo.label}:<div className='w-auto flex gap-3 mx-2'><p>-</p><p>-</p><p>-</p></div>
                  <DropdownMenu
                    title=". . ."
                    items={[
                      { label: 'Adicionar Tarefa', onClick: () => abrirModal('tarefa', grupoIndex), variant: "if" },
                      { label: 'Remover Tamplate', onClick: () => confirmar("deseja excluir este Tamplate", () => removerTemplateDoProjeto(grupo.tipo)), variant: "dan" }
                    ]}
                    variant='out'
                  />
                </h3>

                {grupo.tarefas?.map((tarefa, tarefaIndex) => (
                  <div key={tarefaIndex} className="border border-gray-300 p-3 rounded mb-3">
                    <div className='flex'>
                      <div className='mr-8'>
                        <p className="font-semibold">{tarefa.label}</p>
                        <p>Status: <span className="capitalize">{tarefa.status || 'pendente'}</span></p>
                      </div>
                      <DropdownMenu
                        title=". . ."
                        items={[
                          (tarefa.status === 'pendente' && { label: 'Adicionar Tarefa', onClick: () => abrirModalSubtarefa(grupoIndex, tarefaIndex), variant: "if" }),
                          { label: 'Remover Tarefa', onClick: () => confirmar("deseja excluir esta Tarefa", () => removerTarefa(grupoIndex, tarefaIndex)), variant: "dan" },
                          { label: 'Adicionar campo', onClick: abrirModalCampoPersonalizado, variant: "if" }
                        ]}
                        variant='out'
                      />
                    </div>
                    {/* Tarefa sem subtarefas ou subtarefas vazias */}
                    {(!tarefa.subtarefas || tarefa.subtarefas.length === 0) && (
                      <div className="flex gap-2 mt-2">
                        {tarefa.status === 'pendente' && (
                          <Button
                            onClick={() => iniciarTarefa(grupoIndex, tarefaIndex)}
                            variant='final'
                            className='pd-2'
                          >
                            Iniciar
                          </Button>
                        )}
                        {tarefa.status === 'em progresso' && (
                          <Button
                            onClick={() => finalizarTarefa(grupoIndex, tarefaIndex)}
                            variant='final'
                          >
                            Finalizar
                          </Button>
                        )}
                        {tarefa.status === 'finalizado' && (
                          <Span variant='verde1'>
                            Finalizada
                          </Span>
                        )}
                      </div>
                    )}


                    {/* Subtarefas */}
                    {tarefa.subtarefas?.map((sub, subIndex) => (
                      <div key={subIndex} className="ml-4 mt-2 p-2 border-l-2 border-t-2 rounded-tl-lg border-gray-400">
                        <div className='flex'>
                          <div className="mr-8">
                            <p>{sub.label}</p>
                            <p className="text-sm text-gray-600">Status: <span className="capitalize">{sub.status || 'pendente'}</span></p>
                          </div>
                          <DropdownMenu
                            title=". . ."
                            items={[
                              { label: 'Remover Subtarefa', onClick: () => confirmar("deseja excluir esta subtarefa", () => removerSubtarefa(grupoIndex, tarefaIndex, subIndex)), variant: "dan" },
                              { label: 'Adicionar campo', onClick: abrirModalCampoPersonalizado, variant: "if" }
                            ]}
                            variant='out'
                          />
                        </div>
                        <div className="flex gap-2 mt-1">
                          {sub.status === 'pendente' && (
                            <Button
                              onClick={() => iniciarSubtarefa(grupoIndex, tarefaIndex, subIndex)}
                              variant='final'
                            >
                              Iniciar
                            </Button>
                          )}
                          {sub.status === 'em progresso' && (
                            <Button
                              onClick={() => finalizarSubtarefa(grupoIndex, tarefaIndex, subIndex)}
                              variant='final'
                            >
                              Finalizar
                            </Button>
                          )}
                          {sub.status === 'finalizado' && (
                            <Span variant='verde1'>
                              Finalizada
                            </Span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
            {showModalTemplate && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded shadow w-full max-w-md">
                  <h2 className="text-lg font-semibold mb-4">Selecionar Template</h2>

                  <select
                    value={templateSelecionado}
                    onChange={(e) => setTemplateSelecionado(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded mb-4"
                  >
                    <option value="">Selecione um template</option>
                    {templatesDisponiveis.map((t, index) => (
                      <option key={index} value={t.id}>{t.label}</option>
                    ))}
                  </select>

                  <div className="flex justify-end gap-2">
                    <Button onClick={() => setShowModalTemplate(false)} variant="out">Cancelar</Button>
                    <Button onClick={adicionarTemplateAoProjeto} disabled={!templateSelecionado}>Adicionar</Button>
                  </div>
                </div>
              </div>
            )}
          </>
          :
          <>
          </>
        }
      </div>

      {modalAbertoCampoPersonalizado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Adicionar Campo</h2>
            {/* Formulário do campo aqui */}
            <input placeholder="label do campo" className="border w-full p-2 rounded mb-2" />
            <select className="border w-full p-2 rounded mb-4">
              {camposPerzonalizado.map((e) => (
                <>
                  <option value={e.value}>{e.label}</option>
                </>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <Button onClick={fecharModalCampoPersonalizado} variant='out' >Cancelar</Button>
              <Button onClick={() => { fecharModal() }} variant='final' >Salvar</Button>
            </div>
          </div>
        </div>
      )}
      {/* Tarefas ------ */}
    </div>
  )
}

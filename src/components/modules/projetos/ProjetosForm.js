'use client'
import { useEffect, useState } from 'react'
import { db, storage } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, updateDoc, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable, deleteObject } from 'firebase/storage'
import { toast } from 'react-toastify'
import confirmar from '@/utils/confirm'
import Select from 'react-select';
import { customStyles } from '@/styles/select'
import { buscarTiposProjeto } from '@/types/tipoProjetos'

export default function ProjetosForm({ onClose, projeto }) {
  const [arquivosExistentes, setArquivosExistentes] = useState(projeto?.arquivos || [])

  const [tiposProjeto, setTiposProjeto] = useState([])

  useEffect(() => {
    async function carregarTipos() {
      const tipos = await buscarTiposProjeto()
      setTiposProjeto(tipos)
    }
    carregarTipos()
  }, [])

  const opt = tiposProjeto.map((tipo) => ({
    value: tipo.alise,
    label: tipo.nome
  }))

  const [formData, setFormData] = useState({
    nome: projeto?.nome || '',
    escopo: projeto?.escopo || '',
    equipe: projeto?.equipe || '',
    cliente: projeto?.cliente || '',
    engenheiro: projeto?.engenheiro || '',
    crea: projeto?.crea || '',
    projetos: projeto?.projetos?.map(nome => {
      const optEncontrada = opt.find(o => o.label === nome || o.value === nome)
      return optEncontrada || { value: nome, label: nome }
    }) || [],
  })

  const [arquivos, setArquivos] = useState([])
  const [uploading, setUploading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    setArquivos(Array.from(e.target.files))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const toastId = toast.loading(projeto ? 'Atualizando...' : 'Salvando...')
    setUploading(true)

    try {
      if (projeto) {
        // Atualização
        const projetoRef = doc(db, 'projetos', projeto.id)

        // Upload dos novos arquivos (evitando duplicados)
        const novosArquivos = []

        for (const file of arquivos) {
          const nomeJaExiste = arquivosExistentes.some(a => a.nome === file.name)

          if (nomeJaExiste) {
            toast.warning(`O arquivo "${file.name}" já existe e foi ignorado.`)
            continue
          }

          const storageRef = ref(storage, `projetos/${projeto.id}/${file.name}`)
          const uploadTask = uploadBytesResumable(storageRef, file)

          await new Promise((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              null,
              reject,
              async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref)
                novosArquivos.push({ nome: file.name, url })
                resolve()
              }
            )
          })
        }

        // Atualiza Firestore com arquivos existentes (já filtrados) + novos
        const arquivosAtualizados = [...arquivosExistentes, ...novosArquivos]

        await updateDoc(projetoRef, {
          ...formData,
          projetos: formData.projetos.map(p => p.label),
          arquivos: arquivosAtualizados,
        })

        toast.update(toastId, {
          render: 'Projeto atualizado com sucesso!',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
      } else {
        // Criação de novo projeto
        const projetoRef = await addDoc(collection(db, 'projetos'), {
          ...formData,
          projetos: formData.projetos.map(p => p.value),
          status: 'aberto',
          criadoEm: serverTimestamp(),
          arquivos: [],
        })

        // Buscar templates de tarefa
        // Dentro do bloco de criação de novo projeto:
        const tarefasAgrupadas = [];

        const tiposSelecionados = formData.projetos.map(p => p.value);

        for (const tipo of tiposSelecionados) {
          const q = query(collection(db, 'templates'), where('tipo', '==', tipo));
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            const template = snapshot.docs[0].data();

            if (Array.isArray(template.tarefas)) {
              const tarefasDoTipo = template.tarefas.map(tarefa => ({
                nome: tarefa.nome,
                status: "pendente",
                subtarefas: tarefa.subtasks?.map(sub => ({
                  nome: typeof sub === 'string' ? sub : sub.nome,
                  status: "pendente"
                })) || []
              }));

              tarefasAgrupadas.push({
                tipo,
                nome: template.nome,
                tarefas: tarefasDoTipo
              });
            } else {
              toast.warn(`⚠️ Template para "${tipo}" não tem tarefas válidas.`);
            }
          } else {
            toast.warn(`⚠️ Nenhum template encontrado para o tipo: "${tipo}"`);
          }
        }

        await updateDoc(projetoRef, {
          tarefas: tarefasAgrupadas
        })

        const urlsArquivos = []

        for (const file of arquivos) {
          const nomeJaExiste = urlsArquivos.some(a => a.nome === file.name)
          if (nomeJaExiste) {
            toast.warning(`Arquivo duplicado: "${file.name}" foi ignorado.`)
            continue
          }

          const storageRef = ref(storage, `projetos/${projetoRef.id}/${file.name}`)
          const uploadTask = uploadBytesResumable(storageRef, file)

          await new Promise((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              null,
              reject,
              async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref)
                urlsArquivos.push({ nome: file.name, url })
                resolve()
              }
            )
          })
        }

        await updateDoc(projetoRef, { arquivos: urlsArquivos })

        toast.update(toastId, {
          render: 'Projeto criado com sucesso!',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
      }

      onClose()
    } catch (error) {
      console.error('Erro ao salvar projeto:', error)
      toast.update(toastId, {
        render: 'Erro ao salvar projeto.',
        type: 'error',
        isLoading: false,
        autoClose: 5000,
      })
    } finally {
      setUploading(false)
    }
  }


  const handleRemoverArquivo = async (arquivo) => {
    const toastId = toast.loading('Excluindo...')

    try {
      // 🔥 Remover do Storage
      const storageRef = ref(storage, `projetos/${projeto.id}/${arquivo.nome}`)
      await deleteObject(storageRef)

      // 🧠 Log dos arquivos antes do filtro
      console.log('ANTES:', arquivosExistentes)

      // 🧼 Filtrar
      const novosArquivos = arquivosExistentes.filter(a => a.nome.trim() !== arquivo.nome.trim())
      console.log('DEPOIS DO FILTRO:', novosArquivos)

      // 🔄 Atualizar Firestore
      const projetoRef = doc(db, 'projetos', projeto.id)
      await updateDoc(projetoRef, {
        arquivos: novosArquivos
      })

      // 📥 Verificar se realmente atualizou
      const atualizado = await getDoc(projetoRef)
      console.log('📦 Documento atualizado:', atualizado.data())

      // ✅ Atualizar estado local
      setArquivosExistentes(novosArquivos)

      toast.update(toastId, {
        render: 'Excluído com sucesso!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      })

    } catch (error) {
      console.error('❌ Erro:', error)
      toast.update(toastId, {
        render: 'Erro ao remover o arquivo.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }
  }

  const handleSelectChange = (selectedOptions, actionMeta) => {
    setFormData({
      ...formData,
      [actionMeta.name]: selectedOptions
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-3xl max-h-9/10 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#011A39]">Novo Projeto</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="nome"
            placeholder="Nome do projeto"
            value={formData.nome}
            onChange={handleChange}
            className="w-full border border-[#6B6B6B] rounded px-3 py-2 bg-white text-[#011A39]"
            required
          />
          <Select
            name='projetos'
            closeMenuOnSelect={false}
            isMulti
            styles={customStyles}
            options={opt}
            placeholder="Tipos de projetos..."
            onChange={handleSelectChange}
            value={formData.projetos}
            isDisabled={projeto ? true : false}
          />

          <input
            name="equipe"
            placeholder="Equipe técnica"
            value={formData.equipe}
            onChange={handleChange}
            className="w-full border border-[#6B6B6B] rounded px-3 py-2 bg-white text-[#011A39]"
          />
          <input
            name="cliente"
            placeholder="Cliente"
            value={formData.cliente}
            onChange={handleChange}
            className="w-full border border-[#6B6B6B] rounded px-3 py-2 bg-white text-[#011A39]"
          />
          <input
            name="engenheiro"
            placeholder="Engenheiro responsável"
            value={formData.engenheiro}
            onChange={handleChange}
            className="w-full border border-[#6B6B6B] rounded px-3 py-2 bg-white text-[#011A39]"
          />
          <input
            name="crea"
            placeholder="CREA"
            value={formData.crea}
            onChange={handleChange}
            className="w-full border border-[#6B6B6B] rounded px-3 py-2 bg-white text-[#011A39]"
          />

          {/* Upload de arquivos */}
          <div>
            <label className="font-semibold text-[#011A39]">Arquivos do Projeto:</label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full border border-[#6B6B6B] rounded px-3 py-2 bg-white text-[#011A39]"
            />
          </div>

          {arquivosExistentes.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-1">Arquivos existentes:</h4>
              <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
                {arquivosExistentes.map((arquivo, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <a href={arquivo.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {arquivo.nome}
                    </a>
                    <button
                      type="button"
                      onClick={() => confirmar("Deseja escluir este arquivo?", () => { handleRemoverArquivo(arquivo) })}
                      className="text-red-600 text-sm ml-4 hover:underline"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}



          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#6B6B6B] text-white px-4 py-2 rounded"
              disabled={uploading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-[#045CBA] text-white px-4 py-2 rounded"
              disabled={uploading}
            >
              {uploading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

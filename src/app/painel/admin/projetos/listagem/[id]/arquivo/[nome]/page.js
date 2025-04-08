import { getDownloadURL, ref } from 'firebase/storage'
import { storage } from '@/lib/firebase'

export default async function VisualizarArquivo({ params }) {
  const { id, nome } = params

  const storageRef = ref(storage, `projetos/${id}/${decodeURIComponent(nome)}`)
  const url = await getDownloadURL(storageRef)

  const ext = nome.split('.').pop().toLowerCase()
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
  const isPDF = ext === 'pdf'

  return (
    <div className="p-6 bg-white rounded shadow text-[#011A39] int">
      <h1 className="text-1xl font-bold mb-4">Visualização do Arquivo</h1>

      {isImage && (
        <img src={url} alt={nome} className="max-w-full rounded" />
      )}

      {isPDF && (
        <iframe src={url} className="w-full h-[80vh]" />
      )}

      {!isImage && !isPDF && (
        <div>
          <p className="mb-2">Visualização não suportada para este tipo de arquivo.</p>
          <a href={url} download className="text-blue-600 underline">
            Baixar {nome}
          </a>
        </div>
      )}
    </div>
  )
}

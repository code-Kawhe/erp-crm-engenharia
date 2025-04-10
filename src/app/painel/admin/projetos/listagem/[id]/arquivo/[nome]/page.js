import { getDownloadURL, ref } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import VisualizadorImagemComZoom from '@/components/modules/projetos/VisualizadorImagemComZoom'
import VisualizadorCADForge from '@/components/modules/projetos/VisualizadorCADForge'

export default async function VisualizarArquivo({ params, searchParams }) {
  const { id, nome } = params
  const urn = searchParams?.urn || null

  const storageRef = ref(storage, `projetos/${id}/${decodeURIComponent(nome)}`)
  const url = await getDownloadURL(storageRef)

  const ext = nome.split('.').pop().toLowerCase()
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
  const isCad = ['dwg', 'dxf', 'dwf', 'step', 'stl', 'rvt'].includes(ext)
  const isPDF = ext === 'pdf'

  return (
    <div className="p-0 bg-white text-[#011A39] int">
      {isImage && <VisualizadorImagemComZoom url={url} />}

      {isPDF && (
        <iframe
          src={url}
          className="w-full h-full border-2 border-[#011A39] shadow-lg"
        />
      )}

      {isCad && urn && <VisualizadorCADForge urn={urn} />}

      {!isImage && !isPDF && !isCad && (
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

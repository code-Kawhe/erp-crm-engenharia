import { getDownloadURL, ref } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import VisualizadorImagemComZoom from '@/components/modules/projetos/VisualizadorImagemComZoom'
import TextViewer from '@/components/modules/projetos/TextViewer'
import * as XLSX from 'xlsx'
import ExcelViewer from '@/components/modules/projetos/ExcelViewer'

export default async function VisualizarArquivo({ params }) {
  const { id, nome } = params
  const decodedNome = decodeURIComponent(nome)
  const ext = decodedNome.split('.').pop().toLowerCase()

  const storageRef = ref(storage, `projetos/${id}/${decodedNome}`)
  const url = await getDownloadURL(storageRef)

  // Define os tipos de arquivos
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
  const isPDF = ext === 'pdf'
  const isText = ['txt', 'md', 'json', 'csv', 'log', 'xml', 'html', 'js'].includes(ext)
  const isWord = ['doc', 'docx'].includes(ext)
  const isExcel = ['xls', 'xlsx'].includes(ext)

  if (isText) {
    const response = await fetch(url)
    const conteudo = await response.text()
    return (
      <div className="p-2">
        <TextViewer conteudo={conteudo} nome={decodedNome} url={url} />
      </div>
    )
  }

  if (isExcel) {
    const res = await fetch(url)
    const buffer = await res.arrayBuffer()

    const base64 = Buffer.from(buffer).toString('base64')

    return (
      <div className="p-2">
        <ExcelViewer base64={base64} nome={decodedNome} />
      </div>
    )
  }

  return (
    <div className="p-0 bg-white text-[#011A39] int h-screen">
      {/* Visualizador de imagem */}
      {isImage && <VisualizadorImagemComZoom url={url} />}

      {/* Visualizador PDF */}
      {isPDF && (
        <iframe
          src={url}
          className="w-full h-full border-2 border-[#011A39] shadow-lg"
        />
      )}

      {isWord && (
        <iframe
          src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
          className="w-full h-full border border-[#011A39]"
          allowFullScreen
        />
      )}


      {/* Outros arquivos não suportados */}
      {!isImage && !isPDF && !isText && !isWord && (
        <div className="p-6 text-center">
          <p className="mb-2">Visualização não suportada para este tipo de arquivo.</p>
          <a
            href={url}
            download
            className="text-blue-600 underline hover:text-blue-800"
          >
            Baixar {decodedNome}
          </a>
        </div>
      )}
    </div>
  )
}
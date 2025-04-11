import { getDownloadURL, ref } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import VisualizadorImagemComZoom from '@/components/modules/projetos/VisualizadorImagemComZoom'
import IfcViewer from '@/components/modules/projetos/IfcViewer'
import { doc, getDoc } from 'firebase/firestore'

export default async function VisualizarArquivo({ params: { id, nome } }) {
  // const { id, nome } = params
  const decodedNome = decodeURIComponent(nome)
  const ext = decodedNome.split('.').pop().toLowerCase()

  const storageRef = ref(storage, `projetos/${id}/${decodedNome}`)
  const url = await getDownloadURL(storageRef)

  // Define os tipos de arquivos
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
  const isPDF = ext === 'pdf'
  const isCAD = ['dwg', 'dxf', 'dwf', 'step', 'stl', 'rvt', 'skp'].includes(ext)
  const isIFC = ext === 'ifc'

  // Busca dados do projeto
  let ifcUrl = null
  try {
    const docRef = doc(db, 'projetos', id)
    const projetoSnap = await getDoc(docRef)

    if (projetoSnap.exists()) {
      const projeto = projetoSnap.data()
      const arquivoInfo = projeto.arquivos?.find(a => a.nome === decodedNome)
      ifcUrl = arquivoInfo?.ifcUrl || null
    }
  } catch (err) {
    console.error('Erro ao buscar dados do Firestore:', err)
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

      {/* Visualizador IFC */}
      {isIFC && <IfcViewer url={url} />}

      {/* Arquivo CAD com conversão IFC disponível */}
      {isCAD && ifcUrl && (
        <div className="h-full">
          <IfcViewer url={ifcUrl} />
        </div>
      )}

      {/* Arquivo CAD sem conversão ainda */}
      {isCAD && !ifcUrl && (
        <div className="p-6 text-center text-red-600">
          <p className="font-semibold text-lg mb-2">Este arquivo ainda não foi convertido para IFC.</p>
          <p>Envie novamente para que seja processado ou aguarde o processamento automático.</p>
        </div>
      )}

      {/* Outros arquivos não suportados */}
      {!isImage && !isPDF && !isCAD && !isIFC && (
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

import { getDownloadURL, ref } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import VisualizadorImagemComZoom from '@/components/modules/projetos/VisualizadorImagemComZoom'
import ForgeViewer from '@/components/modules/projetos/ForgeViewer'
import { doc, getDoc } from 'firebase/firestore'

export default async function VisualizarArquivo({ params, searchParams }) {
  const { id, nome } = params

  const storageRef = ref(storage, `projetos/${id}/${decodeURIComponent(nome)}`)
  const url = await getDownloadURL(storageRef)

  const decodedNome = decodeURIComponent(nome)
  const ext = decodedNome.split('.').pop().toLowerCase()
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
  const isCad = ['dwg', 'dxf', 'dwf', 'step', 'stl', 'rvt'].includes(ext)
  const isPDF = ext === 'pdf'

  // Buscar URN no Firestore, se for CAD
  let urn = null
  if (isCad) {
    const docRef = doc(db, 'projetos', id)
    const projetoSnap = await getDoc(docRef)
    const projeto = projetoSnap.exists() ? projetoSnap.data() : null
    urn = projeto?.urns?.[decodedNome] || null
  }


  return (
    <div className="p-0 bg-white text-[#011A39] int">
      {isImage && <VisualizadorImagemComZoom url={url} />}

      {isPDF && (
        <iframe
          src={url}
          className="w-full h-full border-2 border-[#011A39] shadow-lg"
        />
      )}

      {isCad && urn && <ForgeViewer urn={urn} />}
      {isCad && !urn && (
        <div className="text-red-600 p-4">
          <p>Este arquivo ainda não foi processado pelo Autodesk Forge.</p>
          <p>Faça o envio para o Forge primeiro.</p>
        </div>
      )}

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

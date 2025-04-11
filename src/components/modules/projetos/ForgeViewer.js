'use client'
import { useEffect, useState } from 'react'

const ForgeViewer = ({ urn }) => {
  const [viewerLoaded, setViewerLoaded] = useState(false)

  useEffect(() => {
    const initViewer = async () => {
      const res = await fetch('/api/forge/token')
      const { access_token } = await res.json()

      const options = {
        env: 'AutodeskProduction',
        accessToken: access_token,
      }

      Autodesk.Viewing.Initializer(options, () => {
        const viewerDiv = document.getElementById('forgeViewer')
        const viewer = new Autodesk.Viewing.GuiViewer3D(viewerDiv)
        viewer.start()

        const documentId = 'urn:' + urn
        Autodesk.Viewing.Document.load(documentId, (doc) => {
          const defaultModel = doc.getRoot().getDefaultGeometry()
          viewer.loadDocumentNode(doc, defaultModel)
        })

        setViewerLoaded(true)
      })
    }

    if (!viewerLoaded && typeof window !== 'undefined' && window.Autodesk) {
      initViewer()
    } else if (!window.Autodesk) {
      const script = document.createElement('script')
      script.src = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.js'
      script.onload = () => initViewer()
      document.head.appendChild(script)

      const style = document.createElement('link')
      style.rel = 'stylesheet'
      style.href = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.css'
      document.head.appendChild(style)
    }
  }, [urn, viewerLoaded])

  return <div id="forgeViewer" style={{ width: '100%', height: '600px' }} />
}

export default ForgeViewer

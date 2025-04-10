'use client'
import { useEffect, useRef } from 'react'

export default function VisualizadorCADForge({ urn }) {
  const viewerRef = useRef(null)

  useEffect(() => {
    if (!urn || !viewerRef.current) return

    const options = {
      env: 'TQYPYJ4MT89zmGugUyPAAPP1XknGZ91GOw7yA9tw9rnqOGO78Qd01L9zzT9o0eGM',
      accessToken: 'yAocMOetK4knSlSjgQUOKVOGcuudyG0RAIulK7vPADqp7YBm'
    }

    Autodesk.Viewing.Initializer(options, () => {
      const viewer = new Autodesk.Viewing.GuiViewer3D(viewerRef.current)
      viewer.start()

      const documentId = `urn:${urn}`
      Autodesk.Viewing.Document.load(
        documentId,
        (doc) => {
          const defaultModel = doc.getRoot().getDefaultGeometry()
          viewer.loadDocumentNode(doc, defaultModel)
        },
        (error) => console.error('Erro ao carregar modelo:', error)
      )
    })
  }, [urn])

  return (
    <div
      ref={viewerRef}
      style={{ width: '100%', height: '80vh', borderRadius: '10px', overflow: 'hidden' }}
    />
  )
}

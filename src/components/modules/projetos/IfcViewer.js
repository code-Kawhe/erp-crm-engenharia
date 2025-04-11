"use client"
import { useEffect, useRef } from 'react'
import { Color } from 'three'
import * as WebIFCViewer from 'web-ifc-viewer'

export default function IfcViewer({ url }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const initViewer = async () => {
      const viewer = new WebIFCViewer.IfcViewerAPI({
        container: containerRef.current,
        backgroundColor: new Color(0xf0f0f0),
      })

      viewer.axes.setAxes()
      viewer.grid.setGrid()
      viewer.IFC.setWasmPath('https://unpkg.com/web-ifc@0.0.43/')

      await viewer.IFC.loadIfcUrl(url)
    }

    if (containerRef.current) {
      initViewer()
    }
  }, [url])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100vh', backgroundColor: '#f0f0f0' }}
    />
  )
}

'use client'
import { useRef, useState } from 'react'

export default function VisualizadorImagem({ url }) {
  const containerRef = useRef(null)
  const imgRef = useRef(null)

  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState(null)

  const handleWheel = (e) => {
    e.preventDefault()

    const scaleAmount = 0.1
    const newScale = e.deltaY < 0 ? scale + scaleAmount : scale - scaleAmount
    if (newScale < 0.2 || newScale > 10) return

    const rect = containerRef.current.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top

    const dx = (offsetX - position.x) / scale
    const dy = (offsetY - position.y) / scale

    const newX = offsetX - dx * newScale
    const newY = offsetY - dy * newScale

    setPosition({ x: newX, y: newY })
    setScale(newScale)
  }

  const handleMouseDown = (e) => {
    e.preventDefault()
    setDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e) => {
    if (!dragging || !lastMousePos) return

    const dx = e.clientX - lastMousePos.x
    const dy = e.clientY - lastMousePos.y

    setPosition(prev => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }))

    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setDragging(false)
    setLastMousePos(null)
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden bg-gray-100 relative"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <img
        ref={imgRef}
        src={url}
        alt="Imagem"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'top left',
          transition: dragging ? 'none' : 'transform 0.1s ease-out',
          cursor: dragging ? 'grabbing' : 'grab',
        }}
        className="select-none"
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
      />
    </div>
  )
}

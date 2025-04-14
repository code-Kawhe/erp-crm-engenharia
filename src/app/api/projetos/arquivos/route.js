'use client'

import { useEffect, useState } from 'react'

export default function TextViewer({ url, fileName }) {
  const [conteudo, setConteudo] = useState('')
  const [erro, setErro] = useState(null)

  useEffect(() => {
    const carregarTexto = async () => {
      try {
        console.log('Buscando arquivo:', url)
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'text/plain',
          },
        })
        if (!res.ok) throw new Error('Falha ao carregar o arquivo')
        const texto = await res.text()
        setConteudo(texto)
      } catch (err) {
        console.error('Erro ao carregar texto:', err)
        setErro('Erro ao carregar o conteúdo do arquivo.')
      }
    }

    if (url) carregarTexto()
  }, [url])

  if (erro) return <div className="p-4 text-red-600">{erro}</div>

  return (
    <div className="p-6 text-sm whitespace-pre-wrap bg-gray-100 text-black max-h-[90vh] overflow-auto rounded shadow-inner">
      <h2 className="font-bold mb-2">{fileName}</h2>
      {conteudo || 'Carregando...'}
    </div>
  )
}

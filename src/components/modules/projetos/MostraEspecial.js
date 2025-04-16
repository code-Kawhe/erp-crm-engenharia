'use client'

import { useEffect, useState } from 'react'

export default function MostraEspecial({ url, inputFormat, outputFormat}) {
    const [downloadUrl, setDownloadUrl] = useState(null)
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState(null)
    const [enviado, setEnviado] = useState(false)

    useEffect(() => {
        if (enviado) return
        setEnviado(true)
        async function converterArquivo() {
            try {
                const res = await fetch('/api/projetos/CloudConverter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        url,
                        inputFormat,
                        outputFormat,
                    })
                })

                if (!res.ok) throw new Error('Erro na conversão.')

                const data = await res.json()
                setDownloadUrl(data.downloadUrl)
            } catch (err) {
                console.error(err)
                setErro('Falha na conversão do arquivo.')
            } finally {
                setLoading(false)
            }
        }

        converterArquivo()
    }, [url])

    if (loading) return <p className="p-4">Convertendo o arquivo...</p>
    if (erro) return <p className="p-4 text-red-600">{erro}</p>

    return (
        <iframe
            src={downloadUrl}
            className="w-full h-full border border-[#011A39]"
            allowFullScreen
        />
    )
}

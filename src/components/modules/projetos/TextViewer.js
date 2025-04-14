'use client'
import { useEffect, useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function TextViewer({ conteudo, nome, url }) {
    const [parsedTable, setParsedTable] = useState(null)
    const [formattedCode, setFormattedCode] = useState(null)
    const [language, setLanguage] = useState('text')

    useEffect(() => {
        const isTable = nome.endsWith('.csv') || nome.endsWith('.tsv')
        const ext = nome.split('.').pop().toLowerCase()

        if (isTable) {
            const lines = conteudo.trim().split('\n')
            const delimiter = nome.endsWith('.tsv') ? '\t' : ','
            const headers = lines[0].split(delimiter)
            const rows = lines.slice(1).map(line => line.split(delimiter))
            setParsedTable({ headers, rows })
        } else {
            // tenta detectar linguagem
            if (['json', 'js'].includes(ext)) setLanguage(ext)
            else if (['html', 'xml'].includes(ext)) setLanguage('html')
            else if (ext === 'md') setLanguage('markdown')
            else if (ext === 'log') setLanguage('bash')
            else setLanguage('text')

            if (ext === 'json' || ext === 'js') {
                try {
                    const parsed = eval(`(${conteudo})`)
                    setFormattedCode(JSON.stringify(parsed, null, 2))
                } catch {
                    setFormattedCode(conteudo)
                }
            } else {
                setFormattedCode(conteudo)
            }
        }
    }, [conteudo, nome])

    if (parsedTable) {
        return (
            <div className=" int3 overflow-auto max-h-[90vh]">
                <a className="text-[#011A39]" href={url}>Vizualizando: {nome} <sub>(clique para baixar)</sub></a>
                <table className="min-w-full bg-white border border-gray-300 text-sm text-left text-[#011A39]">
                    <thead>
                        <tr>
                            {parsedTable.headers.map((header, index) => (
                                <th key={index} className="px-4 py-2 border border-gray-300">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {parsedTable.rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, colIndex) => (
                                    <td key={colIndex} className="px-4 py-2 border border-gray-300 text-[#011A39]">
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    return (
        <>
            <a className="text-[#011A39]" href={url}>Vizualizando: {nome} <sub>(clique para baixar)</sub></a>
            {/* <pre className=" int3 whitespace-pre-wrap break-words bg-gray-100 p-4 rounded-md max-h-[90vh] overflow-auto border border-gray-300 text-sm text-[#011A39]">
                {conteudo}
            </pre> */}
            <SyntaxHighlighter className="int3 border border-gray-300 m-0" language={language} style={prism} wrapLongLines>
                {formattedCode || conteudo}
            </SyntaxHighlighter>
        </>
    )
}

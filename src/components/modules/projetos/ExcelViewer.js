'use client'

import * as XLSX from 'xlsx'
import { useEffect, useState } from 'react'

export default function ExcelViewer({ base64 }) {
    const [sheets, setSheets] = useState([])
    const [activeSheet, setActiveSheet] = useState('')
    const [sheetData, setSheetData] = useState([])
    const [zoom, setZoom] = useState(100)

    useEffect(() => {
        if (base64) {
            const binary = atob(base64)
            const len = binary.length
            const bytes = new Uint8Array(len)
            for (let i = 0; i < len; i++) {
                bytes[i] = binary.charCodeAt(i)
            }

            const workbook = XLSX.read(bytes, { type: 'array' })
            const sheetNames = workbook.SheetNames
            setSheets(sheetNames)

            const initialSheet = sheetNames[0]
            setActiveSheet(initialSheet)

            const data = XLSX.utils.sheet_to_json(workbook.Sheets[initialSheet], { header: 1 })
            setSheetData(data)
        }
    }, [base64])

    const handleSheetChange = (sheetName) => {
        const binary = atob(base64)
        const len = binary.length
        const bytes = new Uint8Array(len)
        for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i)
        }

        const workbook = XLSX.read(bytes, { type: 'array' })
        const newData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })

        setActiveSheet(sheetName)
        setSheetData(newData)
    }

    if (sheetData.length === 0) return <p className="p-4">Carregando planilha...</p>

    return (
        <div className="p-2 text-[#011A39] int5">
            {/* Controle de abas */}
            <div className="mb-4 flex flex-wrap gap-2">
                {sheets.map((name) => (
                    <button
                        key={name}
                        onClick={() => handleSheetChange(name)}
                        className={`px-3 py-1 rounded-full border text-sm ${name === activeSheet
                                ? 'bg-[#011A39] text-white'
                                : 'border-[#011A39] text-[#011A39] hover:bg-[#011A39]/10'
                            }`}
                    >
                        {name}
                    </button>
                ))}
            </div>

            {/* Controle de zoom */}
            <div className="mb-4 flex items-center gap-2">
                <label htmlFor="zoom">Zoom:</label>
                <input
                    id="zoom"
                    type="range"
                    min="50"
                    max="200"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-40"
                />
                <span>{zoom}%</span>
            </div>

            {/* Tabela com scroll só nela */}
            <div className="int4 border border-[#011A39] rounded-lg">
                <table
                    className="table-auto text-sm text-left w-full"
                    style={{ fontSize: `${zoom}%` }}
                >
                    <tbody>
                        {sheetData.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-b border-gray-300">
                                {row.map((cell, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className="px-3 py-2 border-r border-gray-200 whitespace-nowrap"
                                    >
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

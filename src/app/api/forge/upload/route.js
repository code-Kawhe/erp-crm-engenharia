import { NextResponse } from 'next/server'
import { getForgeToken } from '@/lib/forge/auth'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request) {
    try {
        const { path, fileName, projetoId } = await request.json()

        if (!path || !fileName || !projetoId) {
            return NextResponse.json({ error: 'Dados ausentes.' }, { status: 400 })
        }

        const { access_token } = await getForgeToken()

        // Criar nome seguro para o Forge
        const sanitizedFileName = fileName.replace(/\s+/g, '_').replace(/[^\w.-]/g, '')
        const objectName = `${uuidv4()}-${sanitizedFileName}`
        const bucketKey = 'your-bucket-id' // substitua pelo seu bucket real

        // Pegar o corpo do arquivo via stream da URL do Firebase
        const firebaseRes = await fetch(path)
        if (!firebaseRes.ok || !firebaseRes.body) {
            return NextResponse.json({ error: 'Falha ao baixar arquivo do Firebase.' }, { status: 500 })
        }

        const uploadRes = await fetch(`https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${objectName}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/octet-stream',
            },
            body: firebaseRes.body,
            duplex: 'half', // ✅ necessário no Node.js com streams
        })

        if (!uploadRes.ok) {
            const erroTexto = await uploadRes.text()
            console.error('Resposta inesperada do Forge:', erroTexto)
            return NextResponse.json({ error: 'Falha ao enviar para o Forge.' }, { status: 500 })
        }

        const uploadData = await uploadRes.json()
        const urn = Buffer.from(uploadData.objectId).toString('base64')

        // Iniciar conversão
        await fetch('https://developer.api.autodesk.com/modelderivative/v2/designdata/job', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input: { urn },
                output: {
                    formats: [
                        {
                            type: 'svf',
                            views: ['2d', '3d'],
                        },
                    ],
                },
            }),
        })

        return NextResponse.json({ urn })
    } catch (error) {
        console.error('Erro interno ao enviar para o Forge:', error)
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
    }
}

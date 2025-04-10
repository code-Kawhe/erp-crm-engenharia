import { NextResponse } from 'next/server'
import { getAccessToken, uploadFileToForge, translateFile } from '@/lib/forge'

export async function POST(req) {
  try {
    const { firebaseFileUrl, fileName } = await req.json()

    if (!firebaseFileUrl || !fileName) {
      return NextResponse.json({ error: 'URL e nome do arquivo são obrigatórios.' }, { status: 400 })
    }

    // 1. Obter token do Forge
    const accessToken = await getAccessToken()

    // 2. Enviar o arquivo hospedado no Firebase para o Forge
    const objectId = await uploadFileToForge(accessToken, firebaseFileUrl, fileName)

    // 3. Traduzir o arquivo para uso no viewer
    const urn = await translateFile(accessToken, objectId)

    return NextResponse.json({ urn }, { status: 200 })
  } catch (error) {
    console.error('Erro no upload para Forge:', error)
    return NextResponse.json({ error: 'Erro ao enviar para o Forge.' }, { status: 500 })
  }
}

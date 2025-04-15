// src/app/api/projetos/CloudConverter/route.js
import { NextResponse } from 'next/server'

export async function POST(req) {
  const body = await req.json()
  const { fileUrl, format } = body

  try {
    const response = await fetch('https://api.cloudconvert.com/v2/jobs', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CLOUDCONVERT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tasks: {
          import: {
            operation: 'import/url',
            url: fileUrl
          },
          convert: {
            operation: 'convert',
            input: 'import',
            output_format: format || 'pdf'
          },
          export: {
            operation: 'export/url',
            input: 'convert'
          }
        }
      })
    })

    const data = await response.json()
    const exportTask = data.data.tasks.find(task => task.name === 'export')
    const downloadUrl = exportTask.result.files[0].url

    return NextResponse.json({ downloadUrl })
  } catch (error) {
    console.error('[CloudConvert Error]', error)
    return NextResponse.json({ error: 'Erro na conversão' }, { status: 500 })
  }
}
  
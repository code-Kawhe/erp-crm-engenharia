import CloudConvert from 'cloudconvert'

const cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY)

export async function POST(req) {
    try {
        const { url, inputFormat, outputFormat } = await req.json()
        console.log('Enviando para CloudConvert:', {
            url,
            inputFormat,
            outputFormat,
          })
        const job = await cloudConvert.jobs.create({
          tasks: {
            import_file: {
              operation: 'import/url',
              url,
            },
            convert_file: {
              operation: 'convert',
              input: 'import_file',
              input_format: inputFormat,
              output_format: outputFormat,
            },
            export_file: {
              operation: 'export/url',
              input: 'convert_file',
            },
          },
        })
        
        console.log('Job created:', job)
      
        const exportTask = job.tasks.find(task => task.name === 'export_file')
        const fileUrl = exportTask?.result?.files?.[0]?.url
      
        if (!fileUrl) {
          throw new Error('Falha na exportação do arquivo')
        }
      
        return Response.json({ success: true, url: fileUrl })
      } catch (error) {
        const responseData = error.response?.data
        console.error('Erro na conversão:', JSON.stringify(responseData, null, 2))
      
        return Response.json(
          {
            success: false,
            error: responseData?.message || error.message || 'Erro geral',
            detalhes: responseData || null,
          },
          { status: 500 }
        )
      }
      
}

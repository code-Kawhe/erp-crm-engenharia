import FormData from 'form-data'
import fs from 'fs'
import axios from 'axios'
import path from 'path'

// Substitua pela URL real do seu BIMserver
const BIMSERVER_URL = 'http://localhost:8082/json'

export async function convertToIFC(localPath, nomeOriginal) {
  try {
    const fileData = fs.readFileSync(localPath)

    // 1. Login no BIMserver
    const { data: loginRes } = await axios.post(BIMSERVER_URL, {
      request: {
        interface: 'AuthInterface',
        method: 'login',
        parameters: {
          username: 'admin@bimserver.org',
          password: 'admin'
        }
      }
    })

    const token = loginRes.response.result

    // 2. Criar projeto temporário no BIMserver
    const { data: projectRes } = await axios.post(BIMSERVER_URL, {
      request: {
        interface: 'ServiceInterface',
        method: 'addProject',
        parameters: {
          name: `Conversao-${Date.now()}`,
          schema: 'ifc2x3tc1'
        },
        token
      }
    })

    const poid = projectRes.response.result.oid

    // 3. Upload do arquivo original
    const uploadForm = new FormData()
    uploadForm.append('file', fileData, { filename: nomeOriginal })

    const uploadRes = await axios.post(
      `${BIMSERVER_URL}/upload`,
      uploadForm,
      {
        headers: uploadForm.getHeaders(),
        params: { token }
      }
    )

    const uoid = uploadRes.data

    // 4. Iniciar a conversão/importação
    await axios.post(BIMSERVER_URL, {
      request: {
        interface: 'ServiceInterface',
        method: 'checkin',
        parameters: {
          poid,
          comment: 'IFC upload automático',
          deserializerOid: 1,
          fileName: nomeOriginal,
          uoid,
          merge: false,
          compressed: false
        },
        token
      }
    })

    // 5. Exportar como IFC novamente
    const { data: serializerRes } = await axios.post(BIMSERVER_URL, {
      request: {
        interface: 'ServiceInterface',
        method: 'getAllSerializers',
        parameters: {},
        token
      }
    })

    const ifcSerializer = serializerRes.response.result.find(s =>
      s.name.toLowerCase().includes('ifc') &&
      s.name.toLowerCase().includes('step') // Ex: "IFC Step 2x3"
    )

    if (!ifcSerializer) throw new Error('Nenhum serializador IFC encontrado')

    const { data: exportRes } = await axios.post(BIMSERVER_URL, {
      request: {
        interface: 'ServiceInterface',
        method: 'download',
        parameters: {
          roid: 1,
          serializerOid: ifcSerializer.oid,
          query: null
        },
        token
      }
    })

    const topicId = exportRes.response.result.topicId

    // Esperar a exportação completar (simplificado)
    await new Promise(res => setTimeout(res, 5000))

    const { data: downloadRes } = await axios.post(`${BIMSERVER_URL}/download`, null, {
      params: { topicId, token },
      responseType: 'arraybuffer'
    })

    const ifcPath = localPath.replace(path.extname(localPath), '.ifc')
    fs.writeFileSync(ifcPath, downloadRes)

    return ifcPath
  } catch (err) {
    console.error('[BIM_CONVERSAO_ERRO]', err)
    return null
  }
}

import axios from 'axios'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { v4 as uuidv4 } from 'uuid'
import { storage } from '@/lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const BIM_URL = process.env.BIM_URL
const BIM_USERNAME = process.env.BIM_USERNAME
const BIM_PASSWORD = process.env.BIM_PASSWORD

export async function convertToIFC(originalUrl, nomeOriginal, projetoId) {
  try {
    // 1. Baixar o arquivo original
    const tempFilePath = path.join(os.tmpdir(), `${uuidv4()}_${nomeOriginal}`)
    const writer = fs.createWriteStream(tempFilePath)
    const response = await axios.get(originalUrl, { responseType: 'stream' })

    await new Promise((resolve, reject) => {
      response.data.pipe(writer)
      writer.on('finish', resolve)
      writer.on('error', reject)
    })

    // 2. Login no BIMserver
    const { data: loginRes } = await axios.post(`${BIM_URL}/json`, {
      request: {
        interface: 'AuthInterface',
        method: 'login',
        parameters: {
          username: BIM_USERNAME,
          password: BIM_PASSWORD,
        },
      },
    })

    const token = loginRes.response.result

    // 3. Criar projeto no BIMserver
    const { data: projectRes } = await axios.post(`${BIM_URL}/json`, {
      request: {
        interface: 'ServiceInterface',
        method: 'addProject',
        parameters: {
          name: nomeOriginal,
          schemaIdentifier: 'ifc2x3tc1', // ou 'ifc4' se suportar
        },
        token,
      },
    })

    const projectId = projectRes.response.result.oid

    // 4. Ler o arquivo local e converter em base64
    const fileBuffer = fs.readFileSync(tempFilePath)
    const fileBase64 = fileBuffer.toString('base64')

    // 5. Enviar arquivo para o BIMserver
    const { data: uploadRes } = await axios.post(`${BIM_URL}/json`, {
      request: {
        interface: 'ServiceInterface',
        method: 'upload',
        parameters: {
          fileName: nomeOriginal,
          fileSize: fileBuffer.length,
          fileContent: fileBase64,
          deserializerOid: 1, // garantir que esteja configurado corretamente no BIMserver
          projectId,
        },
        token,
      },
    })

    const { roid, revisionId } = uploadRes.response.result

    // 6. Fazer download do IFC convertido
    const downloadRes = await axios.post(`${BIM_URL}/json`, {
      request: {
        interface: 'ServiceInterface',
        method: 'download',
        parameters: {
          roid,
          revisionId,
        },
        token,
      },
      responseType: 'arraybuffer',
    })

    const ifcTempPath = tempFilePath.replace(path.extname(tempFilePath), '.ifc')
    fs.writeFileSync(ifcTempPath, downloadRes.data)

    // 7. Fazer upload do IFC convertido pro Firebase
    const firebasePath = `projetos/${projetoId}/convertidos/${uuidv4()}_${path.basename(ifcTempPath)}`
    const firebaseRef = ref(storage, firebasePath)
    const ifcBuffer = fs.readFileSync(ifcTempPath)

    await uploadBytes(firebaseRef, ifcBuffer)
    const downloadUrl = await getDownloadURL(firebaseRef)

    // 8. Limpar arquivos temporários
    fs.unlinkSync(tempFilePath)
    fs.unlinkSync(ifcTempPath)

    return downloadUrl
  } catch (error) {
    console.error('[CONVERT_TO_IFC_ERROR]', error)
    throw new Error('Erro ao converter o arquivo para IFC.')
  }
}

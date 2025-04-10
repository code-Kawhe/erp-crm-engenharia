const FORGE_CLIENT_ID = process.env.FORGE_CLIENT_ID
const FORGE_CLIENT_SECRET = process.env.FORGE_CLIENT_SECRET
const BUCKET_KEY = 'seu-bucket-unique-id' // pode ser seu nome de projeto + sufixo

export async function getAccessToken() {
  const res = await fetch('https://developer.api.autodesk.com/authentication/v1/authenticate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: FORGE_CLIENT_ID,
      client_secret: FORGE_CLIENT_SECRET,
      grant_type: 'client_credentials',
      scope: 'data:read data:write data:create bucket:create bucket:read'
    })
  })

  const data = await res.json()
  return data.access_token
}

export async function uploadFileToForge(token, fileUrl, fileName) {
  // Criar bucket (ignorar erro se já existir)
  await fetch(`https://developer.api.autodesk.com/oss/v2/buckets/${BUCKET_KEY}/details`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  }).catch(async () => {
    await fetch('https://developer.api.autodesk.com/oss/v2/buckets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bucketKey: BUCKET_KEY,
        policyKey: 'transient' // temporário (24h), use 'persistent' se quiser manter
      })
    })
  })

  // Baixar o arquivo do Firebase
  const fileRes = await fetch(fileUrl)
  const fileBuffer = await fileRes.arrayBuffer()

  // Enviar para Forge
  const uploadRes = await fetch(`https://developer.api.autodesk.com/oss/v2/buckets/${BUCKET_KEY}/objects/${fileName}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream'
    },
    body: fileBuffer
  })

  const uploadData = await uploadRes.json()
  return uploadData.objectId
}

export async function translateFile(token, objectId) {
  const urn = Buffer.from(objectId).toString('base64')

  await fetch('https://developer.api.autodesk.com/modelderivative/v2/designdata/job', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: { urn },
      output: {
        formats: [{ type: 'svf', views: ['2d', '3d'] }]
      }
    })
  })

  return urn
}

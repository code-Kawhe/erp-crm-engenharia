export async function getForgeToken() {
    const clientId = process.env.FORGE_CLIENT_ID
    const clientSecret = process.env.FORGE_CLIENT_SECRET
  
    const response = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        scope: [
          'data:read',
          'data:write',
          'bucket:create',
          'bucket:read',
          'viewables:read',
        ]
      }),
    })
  
    const data = await response.text()
    console.log('Resposta bruta do Forge:', data)
  
    if (!response.ok) {
      throw new Error('Falha ao obter token do Forge')
    }
  
    return JSON.parse(data)
  }
  
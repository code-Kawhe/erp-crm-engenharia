export async function GET(req) {
    const clientId = process.env.FORGE_CLIENT_ID
    const clientSecret = process.env.FORGE_CLIENT_SECRET
  
    const res = await fetch('https://developer.api.autodesk.com/authentication/v1/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        scope: 'viewables:read',
      }),
    })
  
    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Falha ao obter token Forge' }), {
        status: 500,
      })
    }
  
    const data = await res.json()
    return new Response(JSON.stringify({ access_token: data.access_token }), {
      status: 200,
    })
  }
  
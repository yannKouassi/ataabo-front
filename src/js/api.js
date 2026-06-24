// =============================================
// API — Client HTTP centralisé
// =============================================

const BASE = '/api'

function getToken() {
  return localStorage.getItem('accessToken')
}

function getLangue() {
  return localStorage.getItem('langue') || navigator.language?.slice(0, 2) || 'fr'
}

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json', 'Accept-Language': getLangue() }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  })

  if (res.status === 401) {
    // Token expiré — on essaie de rafraîchir
    const refreshed = await tryRefresh()
    if (!refreshed) {
      localStorage.clear()
      window.location.href = '/login.html'
      return
    }
    // Réessayer avec le nouveau token
    headers['Authorization'] = `Bearer ${getToken()}`
    return request(method, path, body)
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erreur serveur' }))
    throw new Error(err.message || 'Erreur serveur')
  }

  if (res.status === 204) return null
  return res.json()
}

async function tryRefresh() {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return false
  try {
    const res = await fetch(BASE + '/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })
    if (!res.ok) return false
    const data = await res.json()
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    return true
  } catch {
    return false
  }
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),

  // Upload multipart
  async upload(path, formData) {
    const token = getToken()
    const headers = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(BASE + path, { method: 'POST', headers, body: formData })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erreur upload' }))
      throw new Error(err.message || 'Erreur upload')
    }
    return res.json()
  }
}

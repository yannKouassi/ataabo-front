// =============================================
// API — Client HTTP centralisé
// =============================================

const BASE = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? 'https://ataabo-api-production.up.railway.app/api'
  : '/api'

function getToken() {
  return localStorage.getItem('accessToken') || localStorage.getItem('_tmp_token')
}

function getLangue() {
  return localStorage.getItem('langue') || navigator.language?.slice(0, 2) || 'fr'
}

// fetch() échoue sans réponse HTTP (serveur injoignable, connexion coupée, upload trop lourd
// interrompu par le serveur) → le navigateur lève "Failed to fetch". On traduit en message clair.
const MSG_RESEAU = 'Impossible de contacter le serveur. Vérifiez votre connexion internet et réessayez. Si vous envoyiez des fichiers, réduisez leur taille.'

async function fetchOuErreurReseau(url, options) {
  try {
    return await fetch(url, options)
  } catch {
    throw new Error(MSG_RESEAU)
  }
}

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json', 'Accept-Language': getLangue() }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetchOuErreurReseau(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  })

  if (res.status === 401) {
    const refreshed = await tryRefresh()
    if (!refreshed) {
      localStorage.clear()
      window.location.href = '/login.html'
      return
    }
    headers['Authorization'] = `Bearer ${getToken()}`
    return request(method, path, body)
  }

  if (res.status === 403) {
    const err = await res.json().catch(() => ({}))
    // Si c'est un vrai refus d'accès métier (désactivé, banni…), on lance l'erreur
    // pour que la page l'affiche. Sinon, session invalide → login.
    if (err.error === 'ACCES_REFUSE') {
      throw new Error(err.message || 'Accès refusé')
    }
    localStorage.clear()
    window.location.href = '/login.html'
    return
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erreur serveur' }))
    throw new Error(err.message || 'Erreur serveur')
  }

  if (res.status === 204) return null
  const text = await res.text()
  return text ? JSON.parse(text) : null
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

  // Upload multipart (method optionnel, 'POST' par défaut)
  async upload(path, formData, method = 'POST') {
    const token = getToken()
    const headers = { 'Accept-Language': getLangue() }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetchOuErreurReseau(BASE + path, { method, headers, body: formData })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erreur upload' }))
      throw new Error(err.message || 'Erreur upload')
    }
    if (res.status === 204) return null
    const text = await res.text()
    return text ? JSON.parse(text) : null
  }
}

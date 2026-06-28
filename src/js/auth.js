// =============================================
// AUTH — Gestion de la session utilisateur
// =============================================

export function isLoggedIn() {
  return !!localStorage.getItem('accessToken')
}

export function getUser() {
  const raw = localStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
}

export function getContexte() {
  const raw = localStorage.getItem('contexte')
  return raw ? JSON.parse(raw) : null
}

export function saveLogin(data) {
  localStorage.setItem('accessToken', data.accessToken)
  localStorage.setItem('refreshToken', data.refreshToken)
  localStorage.setItem('user', JSON.stringify({
    email: data.email,
    nom: data.nom,
    prenom: data.prenom,
    role: data.role || 'USER'
  }))
}

export function isAdminPlateforme() {
  const user = getUser()
  return user?.role === 'ADMIN'
}

export function saveContexte(ctx) {
  if (!ctx) return
  localStorage.setItem('contexte', JSON.stringify(ctx))
  if (ctx.couleurPrimaire) {
    applyOrgColor(ctx.couleurPrimaire)
  }
}

export function applyOrgColor(couleur) {
  document.documentElement.style.setProperty('--primary', couleur)
  // Générer automatiquement la version light
  document.documentElement.style.setProperty('--primary-light', couleur + '18')
}

export function logout() {
  localStorage.clear()
  window.location.href = '/login.html'
}

export function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = '/login.html'
    return false
  }
  return true
}

/**
 * Retourne les permissions pour un sous-menu donné (par son URL).
 * Exemple : getPermission('/adherents/demandes')
 * → { peutLire: true, peutEcrire: false, peutSupprimer: false }
 */
export function getPermission(url) {
  const ctx = getContexte()
  if (!ctx || !ctx.menus) return { peutLire: false, peutEcrire: false, peutSupprimer: false }
  for (const menu of ctx.menus) {
    for (const sous of (menu.sousMenus || [])) {
      if (sous.url === url) return { peutLire: sous.peutLire, peutEcrire: sous.peutEcrire, peutSupprimer: sous.peutSupprimer }
    }
    if (menu.url === url) return { peutLire: menu.peutLire ?? true, peutEcrire: menu.peutEcrire ?? false, peutSupprimer: menu.peutSupprimer ?? false }
  }
  return { peutLire: true, peutEcrire: false, peutSupprimer: false }
}

export function requireContexte() {
  if (!isLoggedIn()) {
    window.location.href = '/login.html'
    return false
  }
  if (!getContexte()) {
    window.location.href = '/choisir-org.html'
    return false
  }
  return true
}

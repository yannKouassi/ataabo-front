// =============================================
// AUTH — Gestion de la session utilisateur
// =============================================
import '/src/js/responsive.js'

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
  const hex = couleur.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  const dark  = (f) => `rgb(${Math.round(r*f)},${Math.round(g*f)},${Math.round(b*f)})`
  const alpha = (a) => `rgba(${r},${g},${b},${a})`

  const d = document.documentElement
  d.style.setProperty('--primary',          couleur)
  d.style.setProperty('--primary-light',    alpha(0.1))
  d.style.setProperty('--primary-dark',     dark(0.72))
  d.style.setProperty('--primary-darker',   dark(0.45))
  d.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${couleur} 0%, ${dark(0.72)} 100%)`)
  d.style.setProperty('--primary-glow',     `0 0 0 3px ${alpha(0.18)}`)
  d.style.setProperty('--sidebar-bg-top',   dark(0.38))
  d.style.setProperty('--sidebar-bg-bot',   dark(0.22))
  d.style.setProperty('--sidebar-active-shadow', alpha(0.4))
}

export function logout() {
  localStorage.clear()
  window.location.href = '/login.html'
}

export function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = '/loginnpm run dev.html'
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
  // Si l'organisation est bloquée par le système pour raison d'abonnement,
  // seule la page mon-abonnement.html reste accessible
  const ctx = getContexte()
  if (ctx?.isBloqueParSysteme && ctx?.motifBlocage?.toLowerCase().includes('abonnement')) {
    const pageCourante = window.location.pathname
    if (!pageCourante.includes('mon-abonnement')) {
      afficherOverlayBlocage(ctx.motifBlocage)
      return false
    }
  }
  return true
}

function afficherOverlayBlocage(motif) {
  // Supprimer un éventuel overlay existant
  const existant = document.getElementById('overlay-blocage-abonnement')
  if (existant) existant.remove()

  const overlay = document.createElement('div')
  overlay.id = 'overlay-blocage-abonnement'
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;
    display:flex;align-items:center;justify-content:center;padding:24px;
  `
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:16px;max-width:480px;width:100%;padding:32px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.3);">
      <div style="width:64px;height:64px;border-radius:50%;background:#fee2e2;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
        <svg width="32" height="32" fill="none" stroke="#dc2626" stroke-width="2" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <div style="font-size:20px;font-weight:800;color:#111;margin-bottom:10px;">Acces suspendu</div>
      <div style="font-size:14px;color:#6b7280;margin-bottom:8px;">${motif || 'Votre organisation est suspendue par le systeme.'}</div>
      <div style="font-size:13px;color:#9ca3af;margin-bottom:28px;">
        Pour retablir l'acces, souscrivez a un abonnement depuis votre espace.
      </div>
      <a href="/src/pages/mon-abonnement.html"
         style="display:inline-flex;align-items:center;gap:8px;background:#dc2626;color:#fff;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
        Gerer mon abonnement
      </a>
    </div>
  `
  document.body.appendChild(overlay)
}

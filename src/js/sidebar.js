// =============================================
// SIDEBAR — Construction dynamique depuis le contexte
// =============================================

import { getContexte, logout } from './auth.js'
import { api } from './api.js'

const ICONS = {
  '/dashboard':           `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>`,
  '/adherents':           `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  '/paiements':           `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  '/dons':                `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  '/evenements':          `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  '/activites':           `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  '/moi':                 `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  '/admin/plateforme':    `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
  '/organisation/params': `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
  '/utilisateurs':        `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  '/habilitations':       `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  '/audit':               `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  '/sauvegardes':         `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="21 15 21 21 3 21 3 15"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`
}

function getIcon(url) {
  return ICONS[url] || `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>`
}

export function buildSidebar() {
  const ctx = getContexte()
  if (!ctx) return

  // ── Topbar : notification + user ──────────────────────────────
  const actionsEl = document.getElementById('topbar-actions') || document.querySelector('.topbar-actions')
  if (actionsEl) {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const nom = user.nom || user.nomPersonne || ''
    const prenom = user.prenom || user.prenPersonne || ''
    const email = user.email || user.emailPersonne || ''
    const initiales = ((prenom[0] || '') + (nom[0] || '')).toUpperCase()
    const urlPhoto = user.urlPhoto || ''
    const avatarContent = urlPhoto
      ? `<img src="${urlPhoto}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`
      : initiales
    actionsEl.innerHTML = `
      <button class="topbar-icon-btn" id="btn-notif" title="Notifications">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </button>
      <div class="topbar-user" id="topbar-user" style="cursor:default;">
        <div class="topbar-avatar" id="topbar-avatar">${avatarContent}</div>
        <div class="topbar-user-info">
          <div class="topbar-user-name" id="topbar-name">${prenom} ${nom}</div>
          ${email ? `<div class="topbar-user-email" id="topbar-email">${email}</div>` : ''}
        </div>
      </div>`

    // Récupérer la photo depuis le serveur si pas encore dans localStorage
    if (!urlPhoto) {
      api.get('/moi/profil').then(p => {
        if (p?.urlPhotoDemandeur) {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
          storedUser.urlPhoto = p.urlPhotoDemandeur
          localStorage.setItem('user', JSON.stringify(storedUser))
          const avatarEl = document.getElementById('topbar-avatar')
          if (avatarEl) {
            avatarEl.innerHTML = `<img src="${p.urlPhotoDemandeur}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`
          }
        }
      }).catch(() => {})
    }
  }

  // Logo + nom organisation
  const logoEl = document.getElementById('sidebar-org-logo')
  const nameEl = document.getElementById('sidebar-org-name')

  if (ctx.urlLogo) {
    logoEl.innerHTML = `<img src="${ctx.urlLogo}" alt="logo" class="sidebar-logo">`
  } else {
    const initiale = ctx.nomOrganisation?.[0]?.toUpperCase() || 'A'
    logoEl.innerHTML = `<div class="sidebar-logo-placeholder">${initiale}</div>`
  }
  if (nameEl) nameEl.textContent = ctx.nomOrganisation

  // Construire les menus
  const nav = document.getElementById('sidebar-nav')
  if (!nav) return
  nav.innerHTML = ''

  // Reverse-mapping page HTML → URL logique (pour détecter le menu actif)
  const currentPage = window.location.pathname
  const activeLogical = Object.entries(NAV_PAGES)
      .find(([, page]) => currentPage.endsWith(page.replace(/^\//, '')))?.[0]
      || sessionStorage.getItem('lastNavUrl')
      || ''

  ctx.menus.forEach(menu => {
    if (menu.sousMenus && menu.sousMenus.length > 0) {
      // Menu avec sous-menus
      const hasActive = menu.sousMenus.some(s => activeLogical.startsWith(s.url))

      const item = document.createElement('div')
      item.className = `nav-item${hasActive ? ' open' : ''}`
      item.innerHTML = `
        ${getIcon(menu.url)}
        <span>${menu.libelle}</span>
        <svg class="nav-chevron" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      `

      const submenu = document.createElement('div')
      submenu.className = `nav-submenu${hasActive ? ' open' : ''}`

      menu.sousMenus.forEach(sub => {
        const subItem = document.createElement('div')
        const isActive = activeLogical.startsWith(sub.url)
        subItem.className = `nav-subitem${isActive ? ' active' : ''}`
        subItem.textContent = sub.libelle
        subItem.dataset.url = sub.url
        subItem.addEventListener('click', () => navigate(sub.url))
        submenu.appendChild(subItem)
      })

      item.addEventListener('click', () => {
        item.classList.toggle('open')
        submenu.classList.toggle('open')
      })

      nav.appendChild(item)
      nav.appendChild(submenu)
    } else {
      // Menu direct sans sous-menus
      const isActive = activeLogical.startsWith(menu.url)
      const item = document.createElement('div')
      item.className = `nav-item${isActive ? ' active' : ''}`
      item.innerHTML = `${getIcon(menu.url)}<span>${menu.libelle}</span>`
      item.addEventListener('click', () => navigate(menu.url))
      nav.appendChild(item)
    }
  })
}

const NAV_PAGES = {
    // Dashboard
    '/dashboard':                     '/dashboard.html',
    '/dashboard/organisation':        '/dashboard.html',
    '/dashboard/systeme':             '/src/pages/dashboard-systeme.html',
    '/dashboard/opportunites':        '/src/pages/opportunites.html',
    // Adhérents
    '/adherents/liste':               '/src/pages/adherents.html',
    '/adherents/demandes':            '/src/pages/demandes-adhesion.html',
    '/adherents/filiation':           '/src/pages/filiations.html',
    '/adherents/beneficiaires':       '/src/pages/beneficiaires.html',
    // Paiements
    '/paiements/cotisations':         '/src/pages/cotisations.html',
    '/paiements/recouvrement':        '/src/pages/recouvrement.html',
    '/paiements/adhesion-plateforme': '/src/pages/cotisations.html',
    '/paiements/adhesion-organisation':'/src/pages/demandes-adhesion.html',
    // Dons
    '/dons/emission':                 '/src/pages/dons-emission.html',
    '/dons/reception':                '/src/pages/dons-reception.html',
    // Événements
    '/evenements/admin':              '/src/pages/evenements-admin.html',
    '/evenements/adherent':           '/src/pages/evenements-adherent.html',
    // Mon espace
    '/moi/profil':                    '/src/pages/mon-profil.html',
    '/moi/cotisations':               '/src/pages/mes-cotisations.html',
    '/moi/filiations':                '/src/pages/mes-filiations.html',
    '/moi/beneficiaires':             '/src/pages/mes-beneficiaires.html',
    '/moi/evenements':                '/src/pages/mes-evenements.html',
    // Admin plateforme
    '/admin/plateforme/infos':        '/src/pages/admin-plateforme.html',
    '/admin/type-organisation':       '/src/pages/admin-referentiel.html?type=types-organisation',
    '/admin/statuts':                 '/src/pages/admin-referentiel.html?type=statuts',
    '/admin/sexe':                    '/src/pages/admin-referentiel.html?type=sexe',
    '/admin/filiation':               '/src/pages/admin-referentiel.html?type=filiation',
    '/admin/situation-matrimoniale':  '/src/pages/admin-referentiel.html?type=situation-matrimoniale',
    '/admin/type-evenements':         '/src/pages/admin-referentiel.html?type=types-evenements',
    '/admin/messages':                '/src/pages/admin-messages.html',
    // Organisation
    '/organisation/params/infos':     '/src/pages/params-organisation.html',
    '/organisation/params/groupes':   '/src/pages/groupes-organisation.html',
    // Utilisateurs & habilitations
    '/utilisateurs/liste':            '/src/pages/utilisateurs.html',
    '/utilisateurs/groupes':          '/src/pages/groupes-organisation.html',
    '/habilitations/droits':          '/src/pages/habilitations.html',
    // Activités
    '/activites':                     '/src/pages/audit.html',
    // Admin plateforme
    '/admin/organisations-en-attente': '/src/pages/admin-organisations-attente.html',
    '/admin/organisations':            '/src/pages/admin-organisations-attente.html',
    // Audit & sauvegardes
    '/audit':                         '/src/pages/audit.html',
    '/sauvegardes':                   '/src/pages/sauvegardes.html',
}

function navigate(url) {
  sessionStorage.setItem('lastNavUrl', url)
  const page = NAV_PAGES[url]
  if (page) window.location.href = page
}

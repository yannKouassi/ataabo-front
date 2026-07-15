// =============================================
// SIDEBAR — Construction dynamique depuis le contexte
// =============================================

import { getContexte, saveContexte, logout, getPermission, hasMenu } from './auth.js'
import { api } from './api.js'
import { buildComboboxPays, chargerTraductions, appliquerTraductions } from './i18n.js'
import { getTheme, appliquerTheme, initTheme } from './theme.js'
import { initTraductionAuto } from './translator.js'

const ICONS = {
  '/dashboard':           `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>`,
  '/adherents':           `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  '/paiements':           `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  '/dons':                `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  '/admin/dons':          `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
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

// Appliquer le thème immédiatement au chargement
appliquerTheme(getTheme())

export async function buildSidebar() {
  const ctx = getContexte()
  if (!ctx) return

  // Traductions — applique data-i18n (uniquement les éléments statiques marqués)
  await chargerTraductions()
  appliquerTraductions()

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
      <button class="topbar-icon-btn" id="btn-theme" title="Mode nuit">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      </button>
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

    // Bouton mode nuit
    initTheme()

    // Notifications
    if (ctx?.orgId && ctx.orgId !== 'PLATEFORME') {
      const btnNotif = document.getElementById('btn-notif')
      if (btnNotif) {
        // Panneau notifications (inséré après le bouton)
        const panel = document.createElement('div')
        panel.id = 'notif-panel'
        panel.style.cssText = `
          display:none;position:absolute;top:52px;right:0;min-width:280px;
          background:var(--surface);border:1px solid var(--border);border-radius:12px;
          box-shadow:0 8px 24px rgba(0,0,0,.12);z-index:200;overflow:hidden;
        `
        panel.innerHTML = `
          <div style="padding:14px 16px;border-bottom:1px solid var(--border);font-weight:700;font-size:13px;">Notifications</div>
          <div id="notif-list" style="padding:8px 0;max-height:320px;overflow-y:auto;"></div>
        `
        // Enveloppe autonome (bouton + panneau) pour pouvoir déplacer les deux ensemble
        // (ex: vers la sidebar mobile) sans casser le positionnement du panneau.
        const notifWrapper = document.createElement('span')
        notifWrapper.id = 'topbar-notif-wrapper'
        notifWrapper.style.cssText = 'position:relative;display:inline-flex;'
        btnNotif.parentElement.insertBefore(notifWrapper, btnNotif)
        notifWrapper.appendChild(btnNotif)
        notifWrapper.appendChild(panel)

        // Toggle panneau
        btnNotif.addEventListener('click', (e) => {
          e.stopPropagation()
          panel.style.display = panel.style.display === 'none' ? 'block' : 'none'
        })
        document.addEventListener('click', () => { panel.style.display = 'none' })

        // Charger et afficher le badge
        const peutVoirRecouvrement = hasMenu('/paiements/recouvrement')
        const peutGererEvenements  = hasMenu('/evenements')

        async function chargerNotifications() {
          try {
            const [cotis, decl] = await Promise.allSettled([
              api.get(`/cotisations/notifications?orgId=${ctx.orgId}`),
              api.get(`/activites/notifications?orgId=${ctx.orgId}`),
            ])
            const dataCotis = cotis.status === 'fulfilled' ? cotis.value : {}
            const dataDecl  = decl.status  === 'fulfilled' ? decl.value  : {}

            const notifItems = []

            // ── Cotisations ───────────────────────────────────────────
            if (peutVoirRecouvrement && dataCotis.cotisationsEnRetard > 0) {
              notifItems.push({ type: 'cotis-org', count: dataCotis.cotisationsEnRetard })
            }
            if (dataCotis.mesCotisationsEnAttente > 0) {
              notifItems.push({ type: 'cotis-perso', count: dataCotis.mesCotisationsEnAttente })
            }

            // ── Événements de vie ─────────────────────────────────────
            if (peutGererEvenements && dataDecl.declarationsEnAttente > 0) {
              notifItems.push({ type: 'decl-admin', count: dataDecl.declarationsEnAttente })
            }
            const cleVu = `notif_decl_vues_${ctx.orgId}`
            const vuCount = parseInt(localStorage.getItem(cleVu) || '0', 10)
            const nouvelles = (dataDecl.mesDeclarationsRepondues || 0) - vuCount
            if (nouvelles > 0) {
              notifItems.push({ type: 'decl-perso', count: nouvelles })
            }

            const total = notifItems.reduce((s, n) => s + n.count, 0)

            // Badge
            let badge = document.getElementById('notif-badge')
            if (!badge) {
              badge = document.createElement('span')
              badge.id = 'notif-badge'
              badge.style.cssText = `
                position:absolute;top:-4px;right:-4px;
                background:#ef4444;color:#fff;border-radius:50%;
                width:17px;height:17px;font-size:10px;font-weight:700;
                display:flex;align-items:center;justify-content:center;
                line-height:1;
              `
              btnNotif.style.position = 'relative'
              btnNotif.appendChild(badge)
            }
            badge.textContent = total > 99 ? '99+' : total
            badge.style.display = total > 0 ? 'flex' : 'none'

            // Contenu du panneau
            const list = document.getElementById('notif-list')
            if (!list) return
            if (notifItems.length === 0) {
              list.innerHTML = `<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:13px;">Aucune notification</div>`
              return
            }

            const iconeAvertissement = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
            const iconeEvenement    = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`

            const configs = {
              'cotis-org':   { href: '/src/pages/recouvrement.html',    bg: '#fef3c7', color: '#d97706', icon: iconeAvertissement, titre: n => `${n.count} membre(s) en retard de cotisation`, sous: 'Voir le recouvrement' },
              'cotis-perso': { href: '/src/pages/mes-cotisations.html', bg: '#fef3c7', color: '#d97706', icon: iconeAvertissement, titre: _ => 'Votre cotisation est en attente',             sous: 'Régularisez votre situation' },
              'decl-admin':  { href: '/src/pages/activites.html',       bg: '#ede9fe', color: '#7c3aed', icon: iconeEvenement,    titre: n => `${n.count} déclaration(s) en attente de traitement`, sous: 'Voir la gestion des événements' },
              'decl-perso':  { href: '/src/pages/mes-evenements.html',  bg: '#ede9fe', color: '#7c3aed', icon: iconeEvenement,    titre: n => `${n.count} de vos déclarations ont été traitées`, sous: 'Consulter mes événements' },
            }

            list.innerHTML = ''
            for (const n of notifItems) {
              const cfg = configs[n.type]
              if (!cfg) continue
              const item = document.createElement('a')
              item.href = cfg.href
              item.style.cssText = `display:flex;align-items:flex-start;gap:12px;padding:12px 16px;text-decoration:none;color:var(--text);transition:background .15s;cursor:pointer;`
              item.onmouseenter = () => item.style.background = 'var(--bg)'
              item.onmouseleave = () => item.style.background = ''
              if (n.type === 'decl-perso') {
                item.addEventListener('click', () => {
                  localStorage.setItem(cleVu, String(dataDecl.mesDeclarationsRepondues || 0))
                })
              }
              item.innerHTML = `
                <div style="width:36px;height:36px;border-radius:8px;background:${cfg.bg};color:${cfg.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;">${cfg.icon}</div>
                <div>
                  <div style="font-size:13px;font-weight:600;">${cfg.titre(n)}</div>
                  <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${cfg.sous}</div>
                </div>`
              list.appendChild(item)
            }
          } catch(_) {}
        }

        chargerNotifications()
        setInterval(chargerNotifications, 60000)
      }
    }

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

  // ── Sur mobile, regrouper les icônes du topbar (thème, notifications, profil)
  // dans la sidebar plutôt que de les laisser éparpillées dans le bandeau du haut —
  // elles deviennent accessibles via le même bouton hamburger que la navigation.
  // On déplace les éléments réels (pas des clones) pour conserver leurs handlers.
  const mqMobile = window.matchMedia('(max-width: 767px)')
  function ajusterControlesMobile(e) {
    const estMobile = e.matches
    const sidebarFooter = document.querySelector('.sidebar-footer')
    const btnTheme = document.getElementById('btn-theme')
    const notifWrapper = document.getElementById('topbar-notif-wrapper')
    const topbarUser = document.getElementById('topbar-user')
    if (!sidebarFooter || !btnTheme) return

    if (estMobile) {
      let host = document.getElementById('sidebar-mobile-controls')
      if (!host) {
        host = document.createElement('div')
        host.id = 'sidebar-mobile-controls'
        host.className = 'sidebar-mobile-controls'
        sidebarFooter.insertBefore(host, sidebarFooter.firstChild)
      }
      if (btnTheme) host.appendChild(btnTheme)
      if (notifWrapper) host.appendChild(notifWrapper)
      if (topbarUser) host.appendChild(topbarUser)
    } else {
      const actionsEl = document.getElementById('topbar-actions') || document.querySelector('.topbar-actions')
      if (actionsEl) {
        if (btnTheme) actionsEl.appendChild(btnTheme)
        if (notifWrapper) actionsEl.appendChild(notifWrapper)
        if (topbarUser) actionsEl.appendChild(topbarUser)
      }
    }
  }
  ajusterControlesMobile(mqMobile)
  mqMobile.addEventListener('change', ajusterControlesMobile)

  // ── Topbar : logo plateforme + pays (armoiries) ─────────────────
  // Injecté en JS pour éviter de toucher le markup de chaque page. Placé tout à
  // gauche de la topbar, devant la barre de recherche (qui reste inchangée).
  const topbarEl = document.querySelector('.topbar')
  if (topbarEl && ctx.orgId !== 'PLATEFORME' && !document.getElementById('topbar-brand')) {
    const brand = document.createElement('div')
    brand.id = 'topbar-brand'
    brand.className = 'topbar-brand'
    const logoImg = ctx.urlLogoPlateforme
      ? `<img src="${ctx.urlLogoPlateforme}" alt="" class="topbar-brand-logo" title="${ctx.nomPlateforme || 'UnioNova'}"/>`
      : ''
    const armoiriesImg = ctx.urlArmoiries
      ? `<img src="${ctx.urlArmoiries}" alt="" class="topbar-brand-armoiries"/>`
      : ''
    const paysNom = ctx.libPays
      ? `<span class="topbar-brand-pays">${ctx.libPays}</span>`
      : ''
    brand.innerHTML = `${logoImg}${armoiriesImg}${paysNom}`
    topbarEl.insertBefore(brand, topbarEl.firstChild)

    // Certaines pages réservent un emplacement de recherche vide (jamais utilisé,
    // simplement invisible) — il laisse un grand vide à côté du nouveau bloc. On ne
    // le masque que s'il est réellement vide, pour ne pas toucher aux pages qui ont
    // une vraie barre de recherche fonctionnelle.
    const searchEl = document.querySelector('.topbar-search')
    if (searchEl && !searchEl.children.length) {
      searchEl.style.display = 'none'
    }
  }

  // Logo + nom organisation
  const logoEl = document.getElementById('sidebar-org-logo')
  const nameEl = document.getElementById('sidebar-org-name')

  const _initiale = ctx.nomOrganisation?.[0]?.toUpperCase() || 'A'

  function afficherPlaceholder() {
    if (!logoEl) return
    logoEl.innerHTML = `<div class="sidebar-logo-placeholder">${_initiale}</div>`
  }

  function afficherLogo(urlLogo) {
    if (!logoEl) return
    if (!urlLogo) { afficherPlaceholder(); return }
    logoEl.innerHTML = `<img src="${urlLogo}" alt="logo" class="sidebar-logo" onerror="this.style.display='none';this.parentElement.innerHTML='<div class=\\'sidebar-logo-placeholder\\'>${_initiale}</div>'">`
  }

  // Afficher le placeholder immédiatement, puis charger l'image
  afficherPlaceholder()
  if (nameEl) nameEl.textContent = ctx.nomOrganisation

  // Toujours récupérer le logo depuis le serveur pour garantir la fraîcheur
  if (ctx.orgId) {
    const ctxUrl = ctx.orgId === 'PLATEFORME' ? '/contexte/plateforme' : `/contexte/${ctx.orgId}`
    api.get(ctxUrl).then(freshCtx => {
      if (freshCtx?.urlLogo) {
        if (freshCtx.urlLogo !== ctx.urlLogo) {
          saveContexte({ ...ctx, urlLogo: freshCtx.urlLogo })
        }
        afficherLogo(freshCtx.urlLogo)
      }
    }).catch(() => {
      // Fallback : essayer avec l'URL déjà dans le contexte local
      if (ctx.urlLogo) afficherLogo(ctx.urlLogo)
    })
  } else if (ctx.urlLogo) {
    afficherLogo(ctx.urlLogo)
  }

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

  // Traduction automatique — lancée après que tout le DOM (sidebar + page) est construit
  initTraductionAuto()
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
    '/paiements/droits-entree':       '/src/pages/paiements-adhesion.html',
    '/paiements/recouvrement':        '/src/pages/recouvrement.html',
    '/paiements/adhesion-organisation':'/src/pages/demandes-adhesion.html',
    // Dons
    '/dons/emission':                 '/src/pages/dons-emission.html',
    '/dons/reception':                '/src/pages/dons-reception.html',
    '/dons/demandes':                 '/src/pages/dons-demandes.html',
    // Événements de vie (déclarations adhérents) — menu direct /evenements
    // Activités org (admin) — menu direct /activites
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
    '/admin/utilisateurs':            '/src/pages/admin-utilisateurs.html',
    // Organisation
    '/organisation/params/infos':     '/src/pages/params-organisation.html',
    '/organisation/params/groupes':   '/src/pages/groupes-organisation.html',
    '/organisation/params/conditions-adhesion': '/src/pages/conditions-adhesion.html',
    '/organisation/abonnement':       '/src/pages/mon-abonnement.html',
    // Utilisateurs & habilitations
    '/utilisateurs/liste':            '/src/pages/utilisateurs.html',
    '/utilisateurs/groupes':          '/src/pages/groupes-organisation.html',
    '/habilitations/droits':          '/src/pages/habilitations.html',
    // Audit & sauvegardes
    '/audit':                         '/src/pages/audit.html',
    '/sauvegardes':                   '/src/pages/sauvegardes.html',
    '/activites/admin':               '/src/pages/evenements-admin.html',
    '/activites':                     '/src/pages/evenements-admin.html',
    // Événements de vie (adhérents) — anciennement activites
    '/evenements':                    '/src/pages/activites.html',
    // Admin plateforme
    '/admin/organisations-en-attente': '/src/pages/admin-organisations-attente.html',
    '/admin/organisations':            '/src/pages/admin-organisations-attente.html',
    '/admin/paiements-activation':     '/src/pages/admin-paiements-activation.html',
    '/admin/dons':                     '/src/pages/admin-demandes-dons.html',
    '/admin/abonnements':              '/src/pages/admin-abonnements.html',
}

function navigate(url) {
  sessionStorage.setItem('lastNavUrl', url)
  const page = NAV_PAGES[url]
  if (page) window.location.href = page
}

/**
 * Première page du menu à laquelle l'utilisateur a réellement un accès en lecture
 * (parcourt ctx.menus, pas de fallback permissif comme getPermission). Utilisé pour
 * rediriger silencieusement hors d'une page dont l'accès vient d'être retiré, plutôt
 * que d'afficher une page d'erreur. `excludePage` évite de rediriger vers la page
 * courante elle-même (ex: plusieurs URLs logiques pointent vers le même fichier).
 */
export function getFirstAccessiblePage(excludePage) {
  const ctx = getContexte()
  if (!ctx || !ctx.menus) return '/choisir-org.html'
  for (const menu of ctx.menus) {
    if (menu.sousMenus && menu.sousMenus.length > 0) {
      for (const sous of menu.sousMenus) {
        const page = NAV_PAGES[sous.url]
        if (sous.peutLire && page && page !== excludePage) return page
      }
    } else {
      const page = NAV_PAGES[menu.url]
      if (menu.peutLire && page && page !== excludePage) return page
    }
  }
  return '/choisir-org.html'
}

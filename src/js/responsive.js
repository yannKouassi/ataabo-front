// Gestion responsive : hamburger sidebar + modals mobile
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('.sidebar')
  const topbar  = document.querySelector('.topbar')

  // ── Sidebar hamburger (pages avec layout) ──────────────
  if (sidebar && topbar) {
    const backdrop = document.createElement('div')
    backdrop.className = 'sidebar-backdrop'
    backdrop.addEventListener('click', closeSidebar)
    document.body.appendChild(backdrop)

    const btn = document.createElement('button')
    btn.className = 'topbar-hamburger'
    btn.setAttribute('aria-label', 'Ouvrir le menu')
    btn.innerHTML = iconMenu()
    btn.addEventListener('click', () => {
      document.body.classList.contains('sidebar-open') ? closeSidebar() : openSidebar()
    })
    topbar.prepend(btn)

    sidebar.addEventListener('click', e => {
      if (e.target.closest('.nav-item, .nav-subitem')) closeSidebar()
    })

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeSidebar()
    })

    function openSidebar() {
      document.body.classList.add('sidebar-open')
      btn.innerHTML = iconClose()
      btn.setAttribute('aria-label', 'Fermer le menu')
    }

    function closeSidebar() {
      document.body.classList.remove('sidebar-open')
      btn.innerHTML = iconMenu()
      btn.setAttribute('aria-label', 'Ouvrir le menu')
    }

    function iconMenu() {
      return `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <line x1="3" y1="6"  x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>`
    }

    function iconClose() {
      return `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <line x1="4" y1="4" x2="20" y2="20"/>
        <line x1="20" y1="4" x2="4" y2="20"/>
      </svg>`
    }
  }

  // ── Mise en page responsive : empilement des conteneurs flex/grid ──
  // Sur mobile, tout conteneur flex ou grid inline qui est parent direct
  // de .card doit empiler ses enfants verticalement.
  if (window.matchMedia('(max-width: 767px)').matches) {
    document.querySelectorAll('.card').forEach(card => {
      const parent = card.parentElement
      if (!parent) return
      const s = parent.getAttribute('style') || ''
      const isFlexRow = (s.includes('display:flex') || s.includes('display: flex')) &&
                        !s.includes('flex-direction:column') && !s.includes('flex-direction: column')
      const isGrid = s.includes('grid-template-columns')
      if (isFlexRow || isGrid) {
        parent.style.flexDirection = 'column'
        parent.style.maxWidth = '100%'
        // S'assurer que chaque carte prend toute la largeur
        parent.querySelectorAll(':scope > .card').forEach(c => {
          c.style.width = '100%'
          c.style.flex = 'none'
        })
      }
    })
  }

  // ── Modals inline-stylés → classes responsive + body scroll lock ──
  // Tous les modals ont position:fixed et inset:0 en style inline.
  // On leur ajoute une classe CSS pour les gérer via media query,
  // et on bloque le scroll du body quand un modal est ouvert.

  const modals = []
  document.querySelectorAll('[id^="modal"]').forEach(el => {
    const s = el.getAttribute('style') || ''
    if (s.includes('position:fixed') || s.includes('position: fixed')) {
      el.classList.add('ataabo-modal-overlay')
      const inner = el.querySelector('div')
      if (inner) inner.classList.add('ataabo-modal-box')
      modals.push(el)
    }
  })

  // MutationObserver : surveille l'attribut style de chaque modal
  // pour détecter l'ouverture (display:flex) et la fermeture (display:none)
  function updateBodyScroll() {
    const anyOpen = modals.some(m => {
      const disp = m.style.display
      return disp && disp !== 'none'
    })
    document.body.style.overflow = anyOpen ? 'hidden' : ''
  }

  if (modals.length > 0) {
    const obs = new MutationObserver(updateBodyScroll)
    modals.forEach(m => obs.observe(m, { attributes: true, attributeFilter: ['style'] }))
  }
})

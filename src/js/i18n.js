// =============================================
// I18N — Gestion langue / pays
// =============================================

const BASE = '/api'

// SVG icônes inline (style stroke du projet)
const SVG_GLOBE = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="10"/>
  <line x1="2" y1="12" x2="22" y2="12"/>
  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
</svg>`

const SVG_MAP_PIN = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
  <circle cx="12" cy="10" r="3"/>
</svg>`

const SVG_CHEVRON = `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
  <polyline points="6 9 12 15 18 9"/>
</svg>`

const SVG_CHECK = `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
  <polyline points="20 6 9 17 4 12"/>
</svg>`

// ── Langue / pays ────────────────────────────────────────────────────────────

export function getLangue() {
  return localStorage.getItem('langue') || navigator.language?.slice(0, 2) || 'fr'
}

export function getCodePays() {
  return localStorage.getItem('pays') || null
}

export function changerPays(codePays, codeLangue) {
  localStorage.setItem('pays', codePays)
  localStorage.setItem('langue', codeLangue)
  // Vider TOUS les caches i18n pour forcer le rechargement
  Object.keys(sessionStorage)
    .filter(k => k.startsWith('i18n_cache_'))
    .forEach(k => sessionStorage.removeItem(k))
  window.location.reload()
}

// ── Traductions ──────────────────────────────────────────────────────────────

let _traductions = {}

export async function chargerTraductions() {
  const langue = getLangue()
  // Fichiers JSON locaux (UI statique)
  try {
    const resp = await fetch(`/src/i18n/${langue}.json`)
    _traductions = resp.ok ? await resp.json() : {}
  } catch { _traductions = {} }
  return _traductions
}

// Retourne la traduction ou le fallback français
export function t(code, fallback) {
  return _traductions[code] || fallback || code
}

// Traduit automatiquement TOUS les éléments [data-i18n] de la page
export function appliquerTraductions() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const code = el.getAttribute('data-i18n')
    const traduction = _traductions[code]
    if (!traduction) return
    // Autoriser le HTML (ex: <span> dans le titre)
    if (el.hasAttribute('data-i18n-html')) {
      el.innerHTML = traduction
    } else {
      el.textContent = traduction
    }
  })
  // Attributs placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const code = el.getAttribute('data-i18n-placeholder')
    const traduction = _traductions[code]
    if (traduction) el.placeholder = traduction
  })
}

// ── API pays ─────────────────────────────────────────────────────────────────

export async function chargerPaysLangues() {
  try {
    const resp = await fetch(`${BASE}/referentiel/pays-langues`)
    return resp.ok ? await resp.json() : []
  } catch { return [] }
}

// ── Combobox pays (custom dropdown SVG) ─────────────────────────────────────

// CSS injecté une seule fois
let _cssInjecte = false
function _injecterCSS() {
  if (_cssInjecte) return
  _cssInjecte = true
  const style = document.createElement('style')
  style.textContent = `
    .pays-combobox { position: relative; display: inline-block; }
    .pays-combobox-btn {
      display: flex; align-items: center; gap: 6px;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 13px; font-weight: 600;
      background: var(--surface);
      color: var(--text);
      cursor: pointer;
      transition: border-color .15s;
      white-space: nowrap;
    }
    .pays-combobox-btn:hover { border-color: var(--primary); }
    .pays-combobox-btn.ouvert { border-color: var(--primary); }
    .pays-combobox-label { max-width: 130px; overflow: hidden; text-overflow: ellipsis; }
    .pays-combobox-dropdown {
      position: absolute;
      top: calc(100% + 4px);
      right: 0;
      min-width: 200px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0,0,0,.12);
      z-index: 9999;
      overflow: hidden;
      display: none;
    }
    .pays-combobox-dropdown.ouvert { display: block; }
    .pays-combobox-item {
      display: flex; align-items: center; gap: 8px;
      padding: 9px 14px;
      font-size: 13px; font-weight: 500;
      cursor: pointer;
      color: var(--text);
      transition: background .12s;
    }
    .pays-combobox-item:hover { background: var(--bg-subtle, #f3f4f6); }
    .pays-combobox-item.actif { color: var(--primary); font-weight: 700; }
    .pays-combobox-item .pays-check { margin-left: auto; color: var(--primary); opacity: 0; }
    .pays-combobox-item.actif .pays-check { opacity: 1; }
    .pays-combobox-item .pays-pin { color: var(--text-muted); flex-shrink: 0; }
  `
  document.head.appendChild(style)
}

// Langue officielle par pays (fallback si DB ne retourne pas les langues)
const PAYS_LANGUE_DEFAULT = {
  CIV: 'fr', BEN: 'fr', MLI: 'fr', NGA: 'en', MDG: 'mg'
}

// Crée le combobox custom et l'injecte dans containerId
export async function buildComboboxPays(containerId) {
  const container = document.getElementById(containerId)
  if (!container) return

  _injecterCSS()
  const paysList = await chargerPaysLangues()
  const paysActuel = getCodePays()
  const paysChoisi = paysList.find(p => p.codePays === paysActuel)
  const labelBtn = paysChoisi ? paysChoisi.libPays : 'Pays'

  container.innerHTML = `
    <div class="pays-combobox" id="pays-combobox-root">
      <button class="pays-combobox-btn" id="pays-combobox-btn" type="button">
        ${SVG_GLOBE}
        <span class="pays-combobox-label" id="pays-combobox-label">${labelBtn}</span>
        ${SVG_CHEVRON}
      </button>
      <div class="pays-combobox-dropdown" id="pays-combobox-dropdown">
        ${paysList.map(p => {
          const lang = p.langues?.[0]?.code || PAYS_LANGUE_DEFAULT[p.codePays] || 'fr'
          const actif = p.codePays === paysActuel
          return `<div class="pays-combobox-item${actif ? ' actif' : ''}"
            data-code="${p.codePays}" data-lang="${lang}">
            <span class="pays-pin">${SVG_MAP_PIN}</span>
            ${p.libPays}
            <span class="pays-check">${SVG_CHECK}</span>
          </div>`
        }).join('')}
      </div>
    </div>`

  const btn = document.getElementById('pays-combobox-btn')
  const dropdown = document.getElementById('pays-combobox-dropdown')

  btn.addEventListener('click', (e) => {
    e.stopPropagation()
    btn.classList.toggle('ouvert')
    dropdown.classList.toggle('ouvert')
  })

  dropdown.querySelectorAll('.pays-combobox-item').forEach(item => {
    item.addEventListener('click', () => {
      changerPays(item.dataset.code, item.dataset.lang)
    })
  })

  document.addEventListener('click', () => {
    btn.classList.remove('ouvert')
    dropdown.classList.remove('ouvert')
  }, { capture: true, once: false })
}

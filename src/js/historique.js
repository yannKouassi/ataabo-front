import { api } from './api.js'
import { getContexte } from './auth.js'

/**
 * Affiche les N dernières actions de l'organisation dans un conteneur.
 * Usage : buildHistorique('container-id', 5)
 */
export async function buildHistorique(containerId, limit = 5) {
  const ctx = getContexte()
  if (!ctx) return
  const el = document.getElementById(containerId)
  if (!el) return

  el.innerHTML = `<div style="display:flex;align-items:center;gap:6px;padding:2px 0 10px;"><span style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;">Mes actions récentes</span></div>
    <div id="${containerId}-inner" style="font-size:12.5px;color:var(--text-muted);">Chargement…</div>`

  try {
    // Filtrer par utilisateur connecté si idUtilisateur est disponible dans le contexte
    const endpoint = ctx.idUtilisateur
      ? `/audit/utilisateur/${ctx.idUtilisateur}`
      : `/audit/organisation/${ctx.orgId}`

    const items = await api.get(endpoint)
    const recent = (Array.isArray(items) ? items : []).slice(0, limit)
    const inner = document.getElementById(`${containerId}-inner`)

    if (!recent.length) {
      inner.innerHTML = `<span style="font-style:italic;">Aucune action enregistrée.</span>`
      return
    }

    inner.innerHTML = recent.map(t => {
      const date = t.dateAction ? new Date(t.dateAction).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—'
      const changement = t.valeurPrecedente
        ? `<span style="color:#6b7280;">${t.valeurPrecedente} → ${t.nouvelleValeur || '—'}</span>`
        : (t.nouvelleValeur ? `<span style="color:#6b7280;">${t.nouvelleValeur}</span>` : '')
      return `
        <div style="display:flex;align-items:baseline;gap:10px;padding:5px 0;border-bottom:1px solid var(--border);">
          <span style="min-width:120px;color:var(--text-muted);">${date}</span>
          <span style="font-weight:600;color:var(--text);">${t.libelleTrait || '—'}</span>
          ${changement}
        </div>`
    }).join('')
  } catch {
    document.getElementById(`${containerId}-inner`).innerHTML = `<span style="font-style:italic;">Historique indisponible.</span>`
  }
}

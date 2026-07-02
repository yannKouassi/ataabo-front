import { api } from './api.js'
import { getContexte } from './auth.js'

const _chargeurs = {}

export function rafraichirHistorique(containerId) {
  if (_chargeurs[containerId]) _chargeurs[containerId]()
}

export async function buildHistorique(containerId, limit = 50, module = null) {
  const ctx = getContexte()
  if (!ctx) return
  const el = document.getElementById(containerId)
  if (!el) return

  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding-bottom:12px;border-bottom:1px solid var(--border);margin-bottom:12px;">
      <span style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;">Mes actions récentes</span>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <label style="font-size:12px;color:var(--text-muted);">Du</label>
        <input type="date" id="${containerId}-debut" style="font-size:12px;padding:4px 8px;border:1px solid var(--border);border-radius:6px;background:var(--surface);color:var(--text);"/>
        <label style="font-size:12px;color:var(--text-muted);">Au</label>
        <input type="date" id="${containerId}-fin" style="font-size:12px;padding:4px 8px;border:1px solid var(--border);border-radius:6px;background:var(--surface);color:var(--text);"/>
        <button id="${containerId}-filtrer" class="btn btn-secondary" style="font-size:12px;padding:4px 12px;">Filtrer</button>
        <button id="${containerId}-imprimer" class="btn btn-secondary" style="font-size:12px;padding:4px 12px;">🖨 Imprimer</button>
      </div>
    </div>
    <div id="${containerId}-inner" style="font-size:12.5px;color:var(--text-muted);">Chargement…</div>`

  let _cache = []

  const charger = async () => {
    const inner = document.getElementById(`${containerId}-inner`)
    inner.innerHTML = 'Chargement…'
    _cache = []

    try {
      const debut = document.getElementById(`${containerId}-debut`).value
      const fin   = document.getElementById(`${containerId}-fin`).value
      let url = `/audit/moi`
      const params = []
      if (debut) params.push(`debut=${debut}`)
      if (fin)   params.push(`fin=${fin}`)
      if (params.length) url += '?' + params.join('&')

      const items = await api.get(url)
      let all = Array.isArray(items) ? items : []
      if (module) {
        if (Array.isArray(module)) {
          const keys = module.map(m => m.toLowerCase())
          all = all.filter(t => t.libelleTrait && keys.some(k => t.libelleTrait.toLowerCase().includes(k)))
        } else {
          all = all.filter(t => t.libelleTrait && t.libelleTrait.toLowerCase().includes(module.toLowerCase()))
        }
      }
      _cache = all.slice(0, limit)

      if (!_cache.length) {
        inner.innerHTML = `<span style="font-style:italic;">Aucune action enregistrée.</span>`
        return
      }

      inner.innerHTML = `
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="border-bottom:2px solid var(--border);">
              <th style="text-align:left;padding:6px 10px;color:var(--text-muted);font-weight:600;white-space:nowrap;">Date / Heure</th>
              <th style="text-align:left;padding:6px 10px;color:var(--text-muted);font-weight:600;">Action</th>
              <th style="text-align:left;padding:6px 10px;color:var(--text-muted);font-weight:600;">Avant</th>
              <th style="text-align:left;padding:6px 10px;color:var(--text-muted);font-weight:600;">Après</th>
            </tr>
          </thead>
          <tbody>
            ${_cache.map(t => {
              const date = t.dateAction
                ? new Date(t.dateAction).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
                : '—'
              return `<tr style="border-bottom:1px solid var(--border);">
                <td style="padding:8px 10px;color:var(--text-muted);white-space:nowrap;">${date}</td>
                <td style="padding:8px 10px;font-weight:600;color:var(--text);">${t.libelleTrait || '—'}</td>
                <td style="padding:8px 10px;color:var(--text-muted);">${t.valeurPrecedente || '—'}</td>
                <td style="padding:8px 10px;color:var(--text-muted);">${t.nouvelleValeur || '—'}</td>
              </tr>`
            }).join('')}
          </tbody>
        </table>`
    } catch {
      inner.innerHTML = `<span style="font-style:italic;">Historique indisponible.</span>`
    }
  }

  document.getElementById(`${containerId}-filtrer`).addEventListener('click', charger)

  document.getElementById(`${containerId}-imprimer`).addEventListener('click', () => {
    if (!_cache.length) { alert('Aucune donnée à imprimer.'); return }
    const win = window.open('', '_blank')
    win.document.write(`<html><head><title>Historique de mes actions</title>
      <style>
        body { font-family: sans-serif; font-size: 13px; padding: 24px; }
        h2 { margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
        th { background: #f3f4f6; font-weight: 600; }
        tr:nth-child(even) { background: #fafafa; }
      </style></head><body>
      <h2>Mes actions récentes</h2>
      <table>
        <thead><tr><th>Date</th><th>Action</th><th>Avant</th><th>Après</th></tr></thead>
        <tbody>
          ${_cache.map(t => `<tr>
            <td>${t.dateAction ? new Date(t.dateAction).toLocaleString('fr-FR') : '—'}</td>
            <td>${t.libelleTrait || '—'}</td>
            <td>${t.valeurPrecedente || '—'}</td>
            <td>${t.nouvelleValeur || '—'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </body></html>`)
    win.document.close()
    win.print()
  })

  _chargeurs[containerId] = charger
  await charger()
}

// Génère et affiche un reçu de paiement (cotisation, abonnement...) dans une fenêtre modale
// directement sur la page — pas de window.open() : plusieurs navigateurs (Brave, Firefox strict...)
// bloquent l'ouverture d'une nouvelle fenêtre, surtout après un appel réseau (await) qui casse
// la chaîne du geste utilisateur. L'impression se fait via window.print() sur la page courante,
// avec des règles @media print qui n'affichent que le reçu.

function echapper(txt) {
  return String(txt ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

function formaterMontant(montant, devise) {
  const n = Number(montant) || 0
  return `${n.toLocaleString('fr-FR')} ${devise || 'XOF'}`
}

function formaterDate(date) {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return String(date)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

const OVERLAY_ID = 'recu-modal-overlay'

function assurerStyles() {
  if (document.getElementById('recu-modal-styles')) return
  const style = document.createElement('style')
  style.id = 'recu-modal-styles'
  style.textContent = `
    #${OVERLAY_ID} {
      position: fixed; inset: 0; background: rgba(15,20,30,.55); z-index: 3000;
      display: flex; align-items: flex-start; justify-content: center;
      padding: 32px 16px; overflow-y: auto;
    }
    #${OVERLAY_ID} .recu-modal-box {
      background: #fff; border-radius: 16px; width: 100%; max-width: 620px;
      box-shadow: 0 12px 48px rgba(0,0,0,.28); overflow: hidden; margin: auto;
      font-family: 'Segoe UI', Arial, sans-serif; color: #1e2530;
    }
    #${OVERLAY_ID} .recu-close {
      position: absolute; top: 14px; right: 18px; background: rgba(255,255,255,.25);
      border: none; color: #fff; font-size: 20px; width: 32px; height: 32px; border-radius: 50%;
      cursor: pointer; line-height: 1;
    }
    #${OVERLAY_ID} .recu-entete { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 24px 52px 24px 28px; color: #fff; }
    #${OVERLAY_ID} .recu-entete-org { display: flex; align-items: center; gap: 12px; }
    #${OVERLAY_ID} .recu-entete-org img { width: 48px; height: 48px; object-fit: contain; border-radius: 8px; background: #fff; padding: 4px; }
    #${OVERLAY_ID} .recu-entete-org-nom { font-size: 16px; font-weight: 700; max-width: 260px; }
    #${OVERLAY_ID} .recu-entete-plateforme { text-align: right; font-size: 11px; opacity: .9; }
    #${OVERLAY_ID} .recu-entete-plateforme img { width: 28px; height: 28px; object-fit: contain; border-radius: 6px; background: #fff; padding: 2px; vertical-align: middle; margin-left: 6px; }
    #${OVERLAY_ID} .recu-titre { text-align: center; padding: 22px 28px 6px; }
    #${OVERLAY_ID} .recu-titre h1 { font-size: 18px; letter-spacing: .04em; margin: 0 0 4px; text-transform: uppercase; color: #1e2530; }
    #${OVERLAY_ID} .recu-titre .numero { font-size: 13px; color: #6b7280; }
    #${OVERLAY_ID} .recu-badge { display: inline-block; margin-top: 10px; padding: 4px 14px; border-radius: 999px; background: #e8f5e9; color: #1b5e20; font-size: 12px; font-weight: 700; letter-spacing: .03em; }
    #${OVERLAY_ID} .recu-corps { padding: 20px 28px 8px; }
    #${OVERLAY_ID} table.recu-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    #${OVERLAY_ID} table.recu-table td { padding: 10px 0; border-bottom: 1px solid #eef0f2; font-size: 13.5px; }
    #${OVERLAY_ID} table.recu-table td:first-child { color: #6b7280; width: 45%; }
    #${OVERLAY_ID} table.recu-table td:last-child { text-align: right; font-weight: 600; color: #1e2530; }
    #${OVERLAY_ID} .recu-pied { padding: 18px 28px 24px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px dashed #dde1e7; margin-top: 10px; }
    #${OVERLAY_ID} .recu-actions { display: flex; gap: 10px; justify-content: center; padding: 0 28px 24px; }
    #${OVERLAY_ID} .recu-actions button { border: none; border-radius: 8px; padding: 10px 22px; font-size: 13px; font-weight: 600; cursor: pointer; }
    #${OVERLAY_ID} .recu-btn-fermer { background: #eef0f2; color: #1e2530; }

    @media print {
      body > *:not(#${OVERLAY_ID}) { display: none !important; }
      #${OVERLAY_ID} { position: static !important; background: none !important; padding: 0 !important; display: block !important; }
      #${OVERLAY_ID} .recu-modal-box { box-shadow: none !important; max-width: none !important; margin: 0 !important; }
      #${OVERLAY_ID} .recu-actions, #${OVERLAY_ID} .recu-close { display: none !important; }
    }
  `
  document.head.appendChild(style)
}

/**
 * @param {Object} opts
 * @param {'Cotisation'|'Abonnement'} opts.type
 * @param {string} opts.reference       référence de transaction (sert de base au n° de reçu)
 * @param {string} opts.payeur          nom du payeur (adhérent ou organisation)
 * @param {number} opts.montant
 * @param {string} [opts.devise]
 * @param {string} [opts.moyenPaye]
 * @param {string|Date} opts.date       date à afficher comme "date du paiement"
 * @param {string} [opts.dateLabel]     libellé de cette date (par défaut "Date")
 * @param {Array<{label:string, value:string}>} [opts.details]  lignes supplémentaires
 * @param {{nom:string, urlLogo?:string, couleurPrimaire?:string}} opts.organisation
 * @param {{nom?:string, urlLogoPlateforme?:string}} [opts.plateforme]
 */
export function imprimerRecu(opts) {
  const {
    type, reference, payeur, montant, devise = 'XOF', moyenPaye,
    date, dateLabel = 'Date', details = [], organisation = {}, plateforme = {},
  } = opts

  const couleur = organisation.couleurPrimaire || '#2E7D32'
  const numeroRecu = `REC-${reference || Date.now()}`
  const maintenant = new Date()

  const lignesDetails = [
    { label: 'Payeur', value: payeur || '—' },
    { label: 'Type', value: type },
    { label: 'Montant', value: formaterMontant(montant, devise) },
    { label: 'Moyen de paiement', value: moyenPaye || '—' },
    { label: 'Référence', value: reference || '—' },
    { label: dateLabel, value: formaterDate(date) },
    ...details,
  ]

  assurerStyles()

  document.getElementById(OVERLAY_ID)?.remove()
  const overlay = document.createElement('div')
  overlay.id = OVERLAY_ID
  overlay.innerHTML = `
    <div class="recu-modal-box">
      <div class="recu-entete" style="background:${couleur};">
        <button class="recu-close" type="button" aria-label="Fermer">&times;</button>
        <div class="recu-entete-org">
          ${organisation.urlLogo ? `<img src="${echapper(organisation.urlLogo)}" alt="Logo"/>` : ''}
          <div class="recu-entete-org-nom">${echapper(organisation.nom || 'Organisation')}</div>
        </div>
        <div class="recu-entete-plateforme">
          Propulsé par<br/>${echapper(plateforme.nom || 'UnioNova')}
          ${plateforme.urlLogoPlateforme ? `<img src="${echapper(plateforme.urlLogoPlateforme)}" alt="UnioNova"/>` : ''}
        </div>
      </div>
      <div class="recu-titre">
        <h1>Reçu de paiement</h1>
        <div class="numero">N° ${echapper(numeroRecu)}</div>
        <div class="recu-badge">✓ Paiement confirmé</div>
      </div>
      <div class="recu-corps">
        <table class="recu-table">
          ${lignesDetails.map(l => `<tr><td>${echapper(l.label)}</td><td>${echapper(l.value)}</td></tr>`).join('')}
        </table>
      </div>
      <div class="recu-pied">
        Document généré automatiquement le ${formaterDate(maintenant)} à ${maintenant.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} — ${echapper(plateforme.nom || 'UnioNova')}
      </div>
      <div class="recu-actions">
        <button type="button" class="recu-btn-fermer">Fermer</button>
        <button type="button" class="recu-btn-imprimer" style="background:${couleur};color:#fff;">Imprimer / Enregistrer en PDF</button>
      </div>
    </div>`

  document.body.appendChild(overlay)

  const fermer = () => overlay.remove()
  overlay.querySelector('.recu-close').addEventListener('click', fermer)
  overlay.querySelector('.recu-btn-fermer').addEventListener('click', fermer)
  overlay.addEventListener('click', (e) => { if (e.target === overlay) fermer() })
  overlay.querySelector('.recu-btn-imprimer').addEventListener('click', () => window.print())
}

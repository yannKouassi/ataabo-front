// Génère et imprime un reçu de paiement (cotisation, abonnement...) dans une fenêtre dédiée.
// Fenêtre séparée = ne charge pas main.css, donc tout est en styles inline pour rester
// cohérent avec les couleurs de l'organisation (même approche que imprimerCarte()).

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

  const win = window.open('', '_blank', 'width=650,height=800')
  if (!win) { alert("Le navigateur a bloqué l'ouverture du reçu (pop-up)."); return }

  win.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<title>Reçu — ${echapper(numeroRecu)}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    color: #1e2530;
    padding: 32px;
    max-width: 620px;
    margin: 0 auto;
    background: #fff;
  }
  .recu-cadre {
    border: 1px solid #dde1e7;
    border-radius: 14px;
    overflow: hidden;
  }
  .recu-entete {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 24px 28px;
    background: ${couleur};
    color: #fff;
  }
  .recu-entete-org { display: flex; align-items: center; gap: 12px; }
  .recu-entete-org img { width: 48px; height: 48px; object-fit: contain; border-radius: 8px; background: #fff; padding: 4px; }
  .recu-entete-org-nom { font-size: 16px; font-weight: 700; max-width: 280px; }
  .recu-entete-plateforme { text-align: right; font-size: 11px; opacity: .9; }
  .recu-entete-plateforme img { width: 28px; height: 28px; object-fit: contain; border-radius: 6px; background: #fff; padding: 2px; vertical-align: middle; margin-left: 6px; }
  .recu-titre {
    text-align: center;
    padding: 22px 28px 6px;
  }
  .recu-titre h1 { font-size: 18px; letter-spacing: .04em; margin: 0 0 4px; text-transform: uppercase; color: #1e2530; }
  .recu-titre .numero { font-size: 13px; color: #6b7280; }
  .recu-badge {
    display: inline-block;
    margin-top: 10px;
    padding: 4px 14px;
    border-radius: 999px;
    background: #e8f5e9;
    color: #1b5e20;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .03em;
  }
  .recu-corps { padding: 20px 28px 8px; }
  table.recu-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  table.recu-table td { padding: 10px 0; border-bottom: 1px solid #eef0f2; font-size: 13.5px; }
  table.recu-table td:first-child { color: #6b7280; width: 45%; }
  table.recu-table td:last-child { text-align: right; font-weight: 600; color: #1e2530; }
  .recu-montant-row td { font-size: 17px !important; font-weight: 700 !important; color: ${couleur} !important; }
  .recu-pied {
    padding: 18px 28px 24px;
    text-align: center;
    font-size: 11px;
    color: #9ca3af;
    border-top: 1px dashed #dde1e7;
    margin-top: 10px;
  }
  .recu-actions { text-align: center; margin-top: 20px; }
  .recu-actions button {
    background: ${couleur}; color: #fff; border: none; border-radius: 8px;
    padding: 10px 22px; font-size: 13px; font-weight: 600; cursor: pointer;
  }
  @media print {
    .recu-actions { display: none; }
    body { padding: 0; max-width: none; }
    .recu-cadre { border: none; border-radius: 0; }
  }
</style>
</head>
<body>
  <div class="recu-cadre">
    <div class="recu-entete">
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
  </div>
  <div class="recu-actions">
    <button onclick="window.print()">Imprimer / Enregistrer en PDF</button>
  </div>
</body>
</html>`)
  win.document.close()

  win.addEventListener('load', () => {
    const imgs = win.document.querySelectorAll('img')
    if (!imgs.length) return
    let charges = 0
    const verifier = () => { charges++ }
    imgs.forEach(img => {
      if (img.complete) verifier()
      else { img.addEventListener('load', verifier); img.addEventListener('error', verifier) }
    })
  })
}

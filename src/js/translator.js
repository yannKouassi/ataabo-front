// =============================================
// TRANSLATOR — Traduction automatique de page
// Utilise l'API Google Translate (gratuite, sans clé)
// Cache dans sessionStorage pour éviter les appels répétés
// =============================================

const BASE_LANG = 'fr'

function decodeEntities(text) {
  const ta = document.createElement('textarea')
  ta.innerHTML = text
  return ta.value
}

async function traduireTexte(texte, targetLang) {
  const trimmed = texte.trim()
  if (!trimmed || trimmed.length < 2) return texte

  const cacheKey = `tr|${targetLang}|${trimmed}`
  const cached = sessionStorage.getItem(cacheKey)
  if (cached !== null) return texte.replace(trimmed, cached)

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${BASE_LANG}&tl=${targetLang}&dt=t&q=${encodeURIComponent(trimmed)}`
    const res = await fetch(url)
    const data = await res.json()
    const translated = decodeEntities(data[0]?.map(i => i[0]).join('') || trimmed)
    sessionStorage.setItem(cacheKey, translated)
    return texte.replace(trimmed, translated)
  } catch {
    return texte
  }
}

let _observerActif = false

export async function initTraductionAuto() {
  const lang = localStorage.getItem('langue')
  if (!lang || lang === 'fr') return
  await traduirePage(lang)
  _demarrerObserver(lang)
}

function _demarrerObserver(lang) {
  if (_observerActif) return
  _observerActif = true

  let _timer = null
  let _enCours = false

  const observer = new MutationObserver(() => {
    if (_enCours) return
    clearTimeout(_timer)
    _timer = setTimeout(async () => {
      _enCours = true
      observer.disconnect()
      await traduirePage(lang)
      observer.observe(document.body, { childList: true, subtree: true })
      _enCours = false
    }, 300)
  })

  observer.observe(document.body, { childList: true, subtree: true })
}

export async function traduirePage(targetLang) {
  if (!targetLang || targetLang === BASE_LANG) return

  // Collecter tous les nœuds texte de la page
  const textNodes = []
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const t = node.textContent.trim()
      if (t.length < 2) return NodeFilter.FILTER_REJECT
      const el = node.parentElement
      if (!el) return NodeFilter.FILTER_REJECT
      if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE'].includes(el.tagName)) return NodeFilter.FILTER_REJECT
      if (el.closest('[translate="no"], .notranslate')) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    }
  })
  while (walker.nextNode()) textNodes.push(walker.currentNode)

  // Collecter les placeholders des inputs/textareas
  const placeholders = [...document.querySelectorAll('[placeholder]')]

  // Collecter les title des boutons/éléments si utile
  const titles = [...document.querySelectorAll('[data-translate-title]')]

  // Traduire tout en parallèle (simultané, plus rapide)
  const promises = [
    ...textNodes.map(node =>
      traduireTexte(node.textContent, targetLang).then(t => { node.textContent = t })
    ),
    ...placeholders.map(el =>
      traduireTexte(el.placeholder, targetLang).then(t => { el.placeholder = t })
    ),
    ...titles.map(el =>
      traduireTexte(el.title, targetLang).then(t => { el.title = t })
    )
  ]

  await Promise.all(promises)
}

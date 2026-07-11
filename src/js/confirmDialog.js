// =============================================
// CONFIRM DIALOG — Remplace window.confirm() natif par un modal stylé
// =============================================

export function confirmDialog(message, options = {}) {
  return new Promise(resolve => {
    const overlay = document.createElement('div')
    overlay.className = 'modal-overlay'
    overlay.style.display = 'flex'
    overlay.innerHTML = `
      <div class="modal" style="max-width:420px;">
        <div class="modal-body" style="padding-top:26px;">
          <p style="font-size:14px;color:var(--text);line-height:1.6;margin:0;white-space:pre-wrap;">${message}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="confirm-dialog-cancel">${options.cancelText || 'Annuler'}</button>
          <button id="confirm-dialog-ok" style="${options.danger
            ? 'background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;'
            : 'background:var(--primary);color:#fff;border:none;'}
            border-radius:8px;padding:9px 18px;font-size:13.5px;font-weight:700;cursor:pointer;">${options.okText || 'Confirmer'}</button>
        </div>
      </div>`
    document.body.appendChild(overlay)

    const cleanup = (result) => { overlay.remove(); resolve(result) }
    overlay.querySelector('#confirm-dialog-cancel').addEventListener('click', () => cleanup(false))
    overlay.querySelector('#confirm-dialog-ok').addEventListener('click', () => cleanup(true))
    overlay.addEventListener('click', (e) => { if (e.target === overlay) cleanup(false) })
    document.addEventListener('keydown', function onEsc(e) {
      if (e.key === 'Escape') { document.removeEventListener('keydown', onEsc); cleanup(false) }
    })
  })
}

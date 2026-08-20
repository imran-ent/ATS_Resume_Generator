/**
 * PDF export uses the browser's print engine to produce a real A4 PDF:
 * selectable text, correct margins and page breaks — never a screenshot.
 * A temporary print view is rendered, then the print dialog is invoked.
 */

const PRINT_READY_DELAY = 120

export interface PrintSession {
  cleanup: () => void
}

export function startPrintSession(): PrintSession {
  document.body.classList.add('printing')
  let cleaned = false

  const cleanup = () => {
    if (cleaned) return
    cleaned = true
    document.body.classList.remove('printing')
    window.removeEventListener('afterprint', cleanup)
    window.removeEventListener('beforeprint', cleanup)
  }

  window.addEventListener('afterprint', cleanup)
  window.addEventListener('beforeprint', cleanup)

  // The print-root is only shown within @media print, so this is a no-op on
  // screen; kept here to make intent explicit.
  const timer = window.setTimeout(() => {
    window.print()
    window.setTimeout(cleanup, 500)
  }, PRINT_READY_DELAY)

  return {
    cleanup: () => {
      window.clearTimeout(timer)
      cleanup()
    },
  }
}
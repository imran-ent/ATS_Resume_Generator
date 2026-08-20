import { useEffect } from 'react'
import { useUiStore } from '@/store/uiStore'
import { startPrintSession } from '@/services/pdf'

/**
 * Kicks off a real A4 PDF export via the browser print engine.
 * The `PrintPortal` (mounted while `printActive` is true) is the only
 * content laid out inside `@media print`.
 */
export function usePrintExport() {
  const printActive = useUiStore((s) => s.printActive)
  const setPrintActive = useUiStore((s) => s.setPrintActive)

  useEffect(() => {
    if (!printActive) return
    const session = startPrintSession()
    return () => {
      session.cleanup()
      setPrintActive(false)
    }
  }, [printActive, setPrintActive])
}

/** Convenience wrapper for print buttons. */
export function exportResume(data: Parameters<ReturnType<typeof useUiStore.getState>['requestPrint']>[0]) {
  useUiStore.getState().requestPrint(data)
}
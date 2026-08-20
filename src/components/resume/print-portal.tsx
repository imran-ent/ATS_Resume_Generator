import { createPortal } from 'react-dom'
import type { ResumeData } from '@/types/resume'
import { ResumeDocument } from './resume-document'

/**
 * Renders the resume off-screen and, when printing, is the only thing the
 * browser lays out — producing a real A4 PDF with selectable text.
 */
export function PrintPortal({ data }: { data: ResumeData }) {
  return createPortal(
    <div className="print-root" aria-hidden="true">
      <ResumeDocument data={data} />
    </div>,
    document.body,
  )
}
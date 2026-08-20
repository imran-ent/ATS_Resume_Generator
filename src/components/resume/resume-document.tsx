import type { ResumeData } from '@/types/resume'
import { ExecutiveTemplate } from './templates/executive'
import { ModernTemplate } from './templates/modern'
import { TechnicalTemplate } from './templates/technical'

const FONT_SIZES = {
  small: '10pt',
  medium: '10.5pt',
  large: '11pt',
} as const

export const TEMPLATE_COMPONENTS = {
  executive: ExecutiveTemplate,
  modern: ModernTemplate,
  technical: TechnicalTemplate,
} as const

export function ResumeDocument({
  data,
  className = '',
}: {
  data: ResumeData
  className?: string
}) {
  const Template = TEMPLATE_COMPONENTS[data.template] ?? ModernTemplate
  return (
    <div
      className={`resume-paper ${className}`}
      style={{ fontSize: FONT_SIZES[data.settings.fontSize] }}
    >
      <Template data={data} />
    </div>
  )
}
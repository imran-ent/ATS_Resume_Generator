import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export function StepFooter({
  onBack,
  onNext,
  nextLabel = 'Continue',
  disabled,
  backVisible = true,
}: {
  onBack: () => void
  onNext: () => void
  nextLabel?: string
  disabled?: boolean
  backVisible?: boolean
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-4">
      {backVisible ? (
        <Button type="button" variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
      ) : (
        <span />
      )}
      <Button type="button" variant="accent" onClick={onNext} disabled={disabled}>
        {nextLabel}
        <ArrowRight className="size-4" />
      </Button>
    </div>
  )
}
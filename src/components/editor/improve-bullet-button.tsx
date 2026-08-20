import { useState } from 'react'
import { Wand2 } from 'lucide-react'
import { aiProvider } from '@/services/ai/client'
import { useUiStore } from '@/store/uiStore'
import type { AiImproveBulletRequest } from '@/types/resume'

interface ImproveBulletButtonProps {
  bullet: string
  context: AiImproveBulletRequest['context']
  jobDescription?: string
  onImproved: (improved: string) => void
  size?: 'sm' | 'xs'
  label?: string
}

export function ImproveBulletButton({
  bullet,
  context,
  jobDescription,
  onImproved,
  size = 'sm',
  label,
}: ImproveBulletButtonProps) {
  const [loading, setLoading] = useState(false)
  const toast = useUiStore((s) => s.toast)

  const run = async () => {
    if (loading) return
    setLoading(true)
    try {
      const res = await aiProvider.improveBullet({ bullet, context, jobDescription })
      onImproved(res.improved)
      toast({ title: 'Bullet improved', variant: 'success' })
    } catch (err) {
      toast({
        title: 'Could not improve this bullet',
        description: err instanceof Error ? err.message : 'The AI service is temporarily unavailable. Try again.',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void run()}
      disabled={loading || !bullet.trim()}
      className={
        size === 'xs'
          ? 'focus-ring inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-accent hover:bg-accent-soft disabled:opacity-40'
          : 'focus-ring inline-flex items-center gap-1.5 rounded-md border border-accent/30 bg-accent-soft px-2.5 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20 disabled:opacity-40'
      }
    >
      <Wand2 className={size === 'xs' ? 'size-3' : 'size-3.5'} />
      {loading ? 'Improving…' : label ?? 'Improve with AI'}
    </button>
  )
}
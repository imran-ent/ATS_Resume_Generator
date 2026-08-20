import { useLayoutEffect, useRef, useState } from 'react'
import type { ResumeData } from '@/types/resume'
import { ResumeDocument } from './resume-document'

const BASE_WIDTH = 794

/**
 * Renders the resume at A4 scale (794px wide) and scales it down via CSS
 * transform to fit the container — like a true "paper" preview.
 */
export function ResumePreview({ data }: { data: ResumeData }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const paperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)
  const [paperHeight, setPaperHeight] = useState(1123)

  useLayoutEffect(() => {
    const measure = () => {
      const el = containerRef.current
      if (!el) return
      const width = el.clientWidth
      setScale(Math.min(1, width / BASE_WIDTH))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  useLayoutEffect(() => {
    const measure = () => {
      const el = paperRef.current
      if (!el) return
      setPaperHeight(el.offsetHeight)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (paperRef.current) ro.observe(paperRef.current)
    return () => ro.disconnect()
  }, [data])

  return (
    <div
      ref={containerRef}
      className="flex w-full justify-center"
      style={{ height: paperHeight * scale }}
    >
      <div
        style={{
          width: BASE_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
        }}
      >
        <div ref={paperRef}>
          <ResumeDocument data={data} className="shadow-2xl" />
        </div>
      </div>
    </div>
  )
}
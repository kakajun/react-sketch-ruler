import { memo, useRef, useEffect, useState, MouseEvent, useMemo } from 'react'
import { drawCanvasRuler } from './utils'
import type { CanvasProps } from '../index-types'
const CanvasRuler = ({
  scale,
  palette,
  vertical,
  start,
  width,
  height,
  selectStart,
  selectLength,
  canvasWidth,
  canvasHeight,
  rate,
  showShadowText,
  gridRatio,
  onDragStart
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D | null>(null)
  const rafIdRef = useRef<number | null>(null)
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      setCanvasContext(ctx)
    }
  }, [canvasRef])

  useEffect(() => {
    if (canvasRef.current && canvasContext) {
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
      canvasRef.current.width = width * dpr
      canvasRef.current.height = height * dpr
      canvasContext.font = `11px -apple-system, "Helvetica Neue", ".SFNSText-Regular", "SF UI Text", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Zen Hei", sans-serif`
      canvasContext.lineWidth = 1
      canvasContext.textBaseline = 'middle'
    }
  }, [canvasContext, width, height])

  useEffect(() => {
    const options = {
      scale: scale / rate,
      width,
      height,
      palette,
      canvasWidth: canvasWidth * rate,
      canvasHeight: canvasHeight * rate,
      ratio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
      rate,
      gridRatio,
      showShadowText
    }

    if (canvasContext) {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = requestAnimationFrame(() => {
        drawCanvasRuler(canvasContext, start * rate, selectStart, selectLength, options, !vertical)
      })
    }
  }, [
      scale,
      rate,
      width,
      height,
      palette,
      canvasWidth,
      canvasHeight,
      gridRatio,
      canvasContext,
      start,
      selectStart,
      selectLength,
      vertical
  ])

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current)
    }
  }, [])

  const rulerStyle = useMemo(() => {
    return {
      width: width + 'px',
      height: height + 'px',
      cursor: vertical ? 'ew-resize' : 'ns-resize',
      [vertical ? 'borderRight' : 'borderBottom']: `1px solid ${palette.borderColor || '#eeeeef'}`
    }
  }, [vertical, palette.borderColor])

  const handleDragStart = (e: MouseEvent<HTMLCanvasElement>) => onDragStart(e)
  return (
    <canvas ref={canvasRef} className="ruler" style={rulerStyle} onMouseDown={handleDragStart} />
  )
}

export default memo(CanvasRuler)

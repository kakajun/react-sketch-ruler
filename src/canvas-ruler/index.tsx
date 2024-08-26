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
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      setCanvasContext(ctx)
    }
  }, [canvasRef])

  useEffect(() => {
    if (canvasRef.current && canvasContext) {
      canvasRef.current.width = width
      canvasRef.current.height = height
      canvasContext.font = `${12 * window.devicePixelRatio}px -apple-system, "Helvetica Neue", ".SFNSText-Regular", "SF UI Text", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Zen Hei", sans-serif`
      canvasContext.lineWidth = 1
      canvasContext.textBaseline = 'middle'
    }
  }, [canvasContext, width, height, window.devicePixelRatio])

  useEffect(() => {
    const options = {
      scale: scale / rate,
      width,
      height,
      palette,
      canvasWidth: canvasWidth * rate,
      canvasHeight: canvasHeight * rate,
      ratio: window.devicePixelRatio,
      rate,
      gridRatio,
      showShadowText
    }

    if (canvasContext) {
      drawCanvasRuler(canvasContext, start * rate, selectStart, selectLength, options, !vertical)
    }
  }, [
    scale,
    rate,
    width,
    height,
    palette,
    canvasWidth,
    canvasHeight,
    window.devicePixelRatio,
    gridRatio,
    canvasContext,
    start,
    selectStart,
    selectLength,
    vertical
  ])

  const rulerStyle = useMemo(() => {
    return {
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

import { memo, useRef, useEffect, useState, useMemo } from 'react'
import { Canvas2DRenderer } from '@sketch-ruler/canvas'
import { useRulerScale } from '../hooks/useRulerScale'
import type { CanvasProps } from '../index-types'
import type { RulerPalette } from '@sketch-ruler/core'

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
  showMinorTicks,
  onDragStart
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D | null>(null)
  const rendererRef = useRef<Canvas2DRenderer | null>(null)

  // 映射 React PaletteType 到 RulerPalette
  const rulerPalette = useMemo<RulerPalette>(() => ({
    bgColor: palette.bgColor,
    tickColor: palette.longfgColor,
    labelColor: palette.fontColor,
    guideLineColor: palette.lineColor,
    guideLineLockedColor: palette.lockLineColor,
    hoverBg: palette.hoverBg,
    hoverColor: palette.hoverColor,
    borderColor: palette.borderColor,
    shadowColor: palette.shadowColor
  }), [palette])

  const { marks } = useRulerScale(
    scale / rate,
    start * rate,
    vertical ? height : width,
    vertical ? width : height,
    (vertical ? canvasHeight : canvasWidth) * rate,
    showMinorTicks
  )

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      setCanvasContext(ctx)
      if (!rendererRef.current) {
        rendererRef.current = new Canvas2DRenderer()
      }
    }
    return () => {
      rendererRef.current?.destroy()
      rendererRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!canvasContext || !canvasRef.current || !rendererRef.current) return

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    canvasRef.current.width = Math.round(width * dpr)
    canvasRef.current.height = Math.round(height * dpr)

    rendererRef.current.render(
      canvasContext,
      [
        {
          type: 'ruler',
          marks,
          vertical,
          thick: vertical ? width : height,
          width,
          height,
          ratio: dpr,
          palette: rulerPalette,
          shadowStart: selectStart,
          shadowLength: selectLength,
          showShadowText,
          canvasSize: vertical ? canvasHeight : canvasWidth
        }
      ],
      { x: 0, y: 0, width, height }
    )
  }, [
    canvasContext,
    marks,
    vertical,
    width,
    height,
    rulerPalette,
    selectStart,
    selectLength,
    showShadowText,
    canvasWidth,
    canvasHeight
  ])

  const rulerStyle = useMemo(() => {
    return {
      width: width + 'px',
      height: height + 'px',
      cursor: vertical ? 'ew-resize' : 'ns-resize',
      [vertical ? 'borderRight' : 'borderBottom']: `1px solid ${palette.borderColor || '#eeeeef'}`
    }
  }, [vertical, palette.borderColor, width, height])

  return (
    <canvas ref={canvasRef} className="ruler" style={rulerStyle} onMouseDown={onDragStart} />
  )
}

export default memo(CanvasRuler)

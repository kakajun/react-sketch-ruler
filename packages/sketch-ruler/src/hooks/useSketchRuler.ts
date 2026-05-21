import { useState, useCallback, useMemo } from 'react'
import type { GuideLine } from '@sketch-ruler/core'
import { useCanvasTransform } from './useCanvasTransform'
import { useGuideLines, lineTypeToGuideLines } from './useGuideLines'
import type { LineType, ZoomMode, PaletteType } from '../index-types'

export { lineTypeToGuideLines }

export interface UseSketchRulerOptions {
  width?: number
  height?: number
  canvasWidth?: number
  canvasHeight?: number
  thick?: number
  scale?: number
  palette?: Partial<PaletteType>
  lines?: LineType
  snapThreshold?: number
  lockLine?: boolean
  minZoom?: number
  maxZoom?: number
  zoomStep?: number
  autoCenter?: boolean
  showRuler?: boolean
  initialOffset?: { x: number; y: number }
  enableAnimation?: boolean
}

export function useSketchRuler(options: UseSketchRulerOptions = {}) {
  const {
    width = 1400,
    height = 800,
    canvasWidth = 1000,
    canvasHeight = 700,
    thick = 16,
    scale: initialScale = 1,
    palette,
    lines: initialLines = { h: [], v: [] },
    snapThreshold = 5,
    lockLine = false,
    minZoom = 0.1,
    maxZoom = 10,
    zoomStep = 0.25,
    autoCenter = true,
    showRuler = true,
    initialOffset,
    enableAnimation = false
  } = options

  const rectWidth = width
  const rectHeight = height

  const {
    engine,
    scale,
    offset,
    setTransform,
    panBy,
    zoomBy,
    zoomTo,
    reset
  } = useCanvasTransform({
    initialScale: initialScale,
    initialOffset: initialOffset ? { x: initialOffset.x, y: initialOffset.y } : { x: 0, y: 0 },
    minZoom,
    maxZoom,
    enableAnimation,
    autoCenter,
    canvasSize: { width: canvasWidth, height: canvasHeight },
    viewportSize: { width: rectWidth, height: rectHeight },
    paddingRatio: 0.2
  })

  const [zoomMode, setZoomModeState] = useState<ZoomMode>('pointer')

  const { guideLines, addLine, removeLine, updateLine } = useGuideLines(
    undefined,
    initialLines
  )

  const horizontalLines = useMemo(() =>
    guideLines.filter((l) => l.orientation === 'h' && l.visible !== false),
    [guideLines]
  )
  const verticalLines = useMemo(() =>
    guideLines.filter((l) => l.orientation === 'v' && l.visible !== false),
    [guideLines]
  )

  const paletteCpu = useMemo(() => {
    return {
      bgColor: '#f6f7f9',
      tickColor: '#BABBBC',
      labelColor: '#7D8694',
      guideLineColor: '#51d6a9',
      guideLineLockedColor: '#d4d7dc',
      hoverBg: '#000',
      hoverColor: '#fff',
      borderColor: '#eeeeef',
      shadowColor: '#e9f7fe',
      ...palette
    }
  }, [palette])

  const zoomIn = useCallback(() => {
    const cx = rectWidth / 2
    const cy = rectHeight / 2
    zoomBy(zoomStep, cx, cy)
  }, [zoomBy, zoomStep, rectWidth, rectHeight])

  const zoomOut = useCallback(() => {
    const cx = rectWidth / 2
    const cy = rectHeight / 2
    zoomBy(-zoomStep, cx, cy)
  }, [zoomBy, zoomStep, rectWidth, rectHeight])

  const setZoomMode = useCallback((mode: ZoomMode) => {
    setZoomModeState(mode)
  }, [])

  return {
    engine,
    scale,
    offset,
    rectWidth,
    rectHeight,
    zoomMode,
    guideLines,
    horizontalLines,
    verticalLines,
    paletteCpu,
    setTransform,
    panBy,
    zoomBy,
    zoomTo,
    zoomIn,
    zoomOut,
    reset,
    setZoomMode,
    addLine,
    removeLine,
    updateLine
  }
}

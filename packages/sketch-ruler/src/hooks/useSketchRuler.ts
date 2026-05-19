import { useState, useCallback, useMemo } from 'react'
import { fitRect } from '@sketch-ruler/core'
import type { TransformState, GuideLine } from '@sketch-ruler/core'
import { useTransformEngine } from './useTransformEngine'
import { useGuideLines, lineTypeToGuideLines } from './useGuideLines'
import type { LineType, ZoomMode } from '../index-types'

export interface UseSketchRulerOptions {
  width?: number
  height?: number
  canvasWidth?: number
  canvasHeight?: number
  thick?: number
  scale?: number
  autoCenter?: boolean
  paddingRatio?: number
  minZoom?: number
  maxZoom?: number
  zoomStep?: number
  enableAnimation?: boolean
  lines?: LineType
  initialOffset?: { x: number; y: number }
}

export function useSketchRuler(options: UseSketchRulerOptions = {}) {
  const {
    width = 1400,
    height = 800,
    canvasWidth = 1000,
    canvasHeight = 700,
    thick = 16,
    scale: initialScale = 1,
    autoCenter = true,
    paddingRatio = 0.2,
    minZoom = 0.1,
    maxZoom = 10,
    zoomStep = 0.25,
    enableAnimation = false,
    lines: initialLines = { h: [], v: [] },
    initialOffset
  } = options

  const rectWidth = width - thick
  const rectHeight = height - thick

  const getInitialState = useCallback((): TransformState => {
    if (autoCenter) {
      const result = fitRect(
        { x: 0, y: 0, width: canvasWidth, height: canvasHeight },
        { x: 0, y: 0, width: rectWidth, height: rectHeight },
        'contain',
        paddingRatio
      )
      return { scale: result.scale, x: result.x, y: result.y }
    }
    return { x: initialOffset?.x ?? 0, y: initialOffset?.y ?? 0, scale: initialScale }
  }, [autoCenter, canvasWidth, canvasHeight, rectWidth, rectHeight, paddingRatio, initialScale, initialOffset])

  const {
    engine,
    state,
    setTransform,
    panBy,
    zoomBy,
    zoomTo,
    reset
  } = useTransformEngine(getInitialState(), {
    minZoom,
    maxZoom,
    enableAnimation
  })

  const [zoomMode, setZoomModeState] = useState<ZoomMode>('pointer')

  const { guideLines, addLine, removeLine, updateLine } = useGuideLines(
    undefined,
    initialLines
  )

  const startX = useMemo(() => -state.x / state.scale, [state.x, state.scale])
  const startY = useMemo(() => -state.y / state.scale, [state.y, state.scale])

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
    scale: state.scale,
    offset: { x: state.x, y: state.y },
    rectWidth,
    rectHeight,
    startX,
    startY,
    zoomMode,
    guideLines,
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

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  TransformEngine,
  fitRect,
  type TransformState,
  type TransformEngineOptions
} from '@sketch-ruler/core'

export interface CanvasTransformOptions {
  initialScale?: number
  initialOffset?: { x: number; y: number }
  minZoom?: number
  maxZoom?: number
  enableAnimation?: boolean
  animationMode?: TransformEngineOptions['animationMode']
  dampingRatio?: number
  naturalFrequency?: number
  timeConstant?: number
  autoCenter?: boolean
  canvasSize?: { width: number; height: number }
  viewportSize?: { width: number; height: number }
  paddingRatio?: number
}

export interface UseCanvasTransformReturn {
  scale: number
  offset: { x: number; y: number }
  engine: TransformEngine
  setTransform: (t: Partial<TransformState>) => void
  panBy: (dx: number, dy: number) => void
  zoomBy: (dScale: number, originX: number, originY: number) => void
  zoomTo: (scale: number, originX: number, originY: number) => void
  toWorldPoint: (screenX: number, screenY: number) => { x: number; y: number }
  toScreenPoint: (worldX: number, worldY: number) => { x: number; y: number }
  reset: () => void
}

export function useCanvasTransform(options: CanvasTransformOptions = {}): UseCanvasTransformReturn {
  const {
    initialScale = 1,
    initialOffset = { x: 0, y: 0 },
    minZoom = 0.1,
    maxZoom = 10,
    enableAnimation = false,
    animationMode,
    dampingRatio,
    naturalFrequency,
    timeConstant,
    autoCenter = false,
    canvasSize,
    viewportSize,
    paddingRatio = 0.2
  } = options

  let startScale = initialScale
  let startOffset = { x: initialOffset.x, y: initialOffset.y }

  if (autoCenter && canvasSize && viewportSize) {
    const cw = Number(canvasSize.width)
    const ch = Number(canvasSize.height)
    const vw = Number(viewportSize.width)
    const vh = Number(viewportSize.height)

    if (cw > 0 && ch > 0 && vw > 0 && vh > 0) {
      const fit = fitRect(
        { x: 0, y: 0, width: cw, height: ch },
        { x: 0, y: 0, width: vw, height: vh },
        'contain',
        paddingRatio
      )
      startScale = Number.isFinite(fit.scale) ? fit.scale : initialScale
      startOffset = {
        x: Number.isFinite(fit.x) ? fit.x : initialOffset.x,
        y: Number.isFinite(fit.y) ? fit.y : initialOffset.y
      }
    }
  }

  const [scale, setScale] = useState(startScale)
  const [offset, setOffset] = useState({ x: startOffset.x, y: startOffset.y })
  const [engine, setEngine] = useState<TransformEngine | null>(null)
  const rafRef = useRef<number | null>(null)
  const pendingStateRef = useRef<TransformState | null>(null)

  useEffect(() => {
    const eng = new TransformEngine(
      { x: startOffset.x, y: startOffset.y, scale: startScale },
      {
        minZoom,
        maxZoom,
        enableAnimation,
        animationMode,
        dampingRatio,
        naturalFrequency,
        timeConstant
      }
    )
    setEngine(eng)
    const unsubscribe = eng.onUpdate((state) => {
      pendingStateRef.current = state
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null
          const s = pendingStateRef.current
          if (s) {
            setScale(s.scale)
            setOffset({ x: s.x, y: s.y })
          }
        })
      }
    })
    return () => {
      unsubscribe()
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      eng.destroy()
      setEngine(null)
    }
  }, [minZoom, maxZoom, enableAnimation, animationMode, dampingRatio, naturalFrequency, timeConstant])

  // 当 viewportSize / canvasSize 变化时重新 autoCenter
  useEffect(() => {
    if (!engine || !autoCenter || !canvasSize || !viewportSize) return
    const cw = Number(canvasSize.width)
    const ch = Number(canvasSize.height)
    const vw = Number(viewportSize.width)
    const vh = Number(viewportSize.height)
    if (cw > 0 && ch > 0 && vw > 0 && vh > 0) {
      const fit = fitRect(
        { x: 0, y: 0, width: cw, height: ch },
        { x: 0, y: 0, width: vw, height: vh },
        'contain',
        paddingRatio
      )
      engine.setTransform({ scale: fit.scale, x: fit.x, y: fit.y })
    }
  }, [
    engine,
    autoCenter,
    canvasSize?.width,
    canvasSize?.height,
    viewportSize?.width,
    viewportSize?.height,
    paddingRatio
  ])

  const setTransform = useCallback(
    (t: Partial<TransformState>) => {
      engine?.setTransform(t)
    },
    [engine]
  )

  const panBy = useCallback(
    (dx: number, dy: number) => {
      engine?.panBy(dx, dy)
    },
    [engine]
  )

  const zoomBy = useCallback(
    (dScale: number, originX: number, originY: number) => {
      engine?.zoomBy(dScale, originX, originY)
    },
    [engine]
  )

  const zoomTo = useCallback(
    (targetScale: number, originX: number, originY: number) => {
      engine?.zoomTo(targetScale, originX, originY)
    },
    [engine]
  )

  const toWorldPoint = useCallback(
    (screenX: number, screenY: number) => {
      return engine?.toWorldPoint(screenX, screenY) ?? { x: screenX, y: screenY }
    },
    [engine]
  )

  const toScreenPoint = useCallback(
    (worldX: number, worldY: number) => {
      return engine?.toScreenPoint(worldX, worldY) ?? { x: worldX, y: worldY }
    },
    [engine]
  )

  const reset = useCallback(() => {
    engine?.setTransform({ scale: startScale, x: startOffset.x, y: startOffset.y })
  }, [engine, startScale, startOffset])

  if (!engine) {
    return {
      scale,
      offset,
      engine: null as any,
      setTransform: () => {},
      panBy: () => {},
      zoomBy: () => {},
      zoomTo: () => {},
      toWorldPoint: (x: number, y: number) => ({ x, y }),
      toScreenPoint: (x: number, y: number) => ({ x, y }),
      reset: () => {}
    }
  }

  return {
    scale,
    offset,
    engine,
    setTransform,
    panBy,
    zoomBy,
    zoomTo,
    toWorldPoint,
    toScreenPoint,
    reset
  }
}

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
  const engineRef = useRef<TransformEngine | null>(null)
  const rafRef = useRef<number | null>(null)
  const pendingStateRef = useRef<TransformState | null>(null)

  // 渲染阶段同步创建 engine，确保 ref 和回调在首次渲染就可使用
  if (!engineRef.current) {
    engineRef.current = new TransformEngine(
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
  }

  // 用局部常量捕获 engine 实例，避免 StrictMode cleanup 把 ref 清为 null 后闭包读到 null
  const engineInstance = engineRef.current

  useEffect(() => {
    const unsubscribe = engineInstance.onUpdate((state) => {
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
      }
      engineInstance.destroy()
      engineRef.current = null
    }
  }, [engineInstance, minZoom, maxZoom, enableAnimation, animationMode, dampingRatio, naturalFrequency, timeConstant])

  // 当 viewportSize / canvasSize 变化时重新 autoCenter
  useEffect(() => {
    if (!autoCenter || !canvasSize || !viewportSize) return
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
      engineInstance.setTransform({ scale: fit.scale, x: fit.x, y: fit.y })
    }
  }, [
    autoCenter,
    engineInstance,
    canvasSize?.width,
    canvasSize?.height,
    viewportSize?.width,
    viewportSize?.height,
    paddingRatio
  ])

  const setTransform = useCallback(
    (t: Partial<TransformState>) => {
      engineInstance.setTransform(t)
    },
    [engineInstance]
  )

  const panBy = useCallback(
    (dx: number, dy: number) => {
      engineInstance.panBy(dx, dy)
    },
    [engineInstance]
  )

  const zoomBy = useCallback(
    (dScale: number, originX: number, originY: number) => {
      engineInstance.zoomBy(dScale, originX, originY)
    },
    [engineInstance]
  )

  const zoomTo = useCallback(
    (targetScale: number, originX: number, originY: number) => {
      engineInstance.zoomTo(targetScale, originX, originY)
    },
    [engineInstance]
  )

  const toWorldPoint = useCallback(
    (screenX: number, screenY: number) => {
      return engineInstance.toWorldPoint(screenX, screenY) ?? { x: screenX, y: screenY }
    },
    [engineInstance]
  )

  const toScreenPoint = useCallback(
    (worldX: number, worldY: number) => {
      return engineInstance.toScreenPoint(worldX, worldY) ?? { x: worldX, y: worldY }
    },
    [engineInstance]
  )

  const reset = useCallback(() => {
    engineInstance.setTransform({ scale: startScale, x: startOffset.x, y: startOffset.y })
  }, [engineInstance, startScale, startOffset])

  return {
    scale,
    offset,
    engine: engineInstance,
    setTransform,
    panBy,
    zoomBy,
    zoomTo,
    toWorldPoint,
    toScreenPoint,
    reset
  }
}

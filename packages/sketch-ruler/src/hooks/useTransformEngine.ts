import { useState, useEffect, useRef, useCallback } from 'react'
import { TransformEngine, type TransformState, type TransformEngineOptions } from '@sketch-ruler/core'

export function useTransformEngine(initial: TransformState = { x: 0, y: 0, scale: 1 }, options?: TransformEngineOptions) {
  const engineRef = useRef<TransformEngine | null>(null)
  const [state, setState] = useState<TransformState>(initial)

  useEffect(() => {
    const engine = new TransformEngine(initial, options)
    engineRef.current = engine
    const unsubscribe = engine.onUpdate((s) => setState(s))
    return () => {
      unsubscribe()
      engine.destroy()
      engineRef.current = null
    }
  }, [options?.minZoom, options?.maxZoom, options?.enableAnimation, options?.animationMode])

  const setTransform = useCallback((t: Partial<TransformState>) => {
    engineRef.current?.setTransform(t)
  }, [])

  const panBy = useCallback((dx: number, dy: number) => {
    engineRef.current?.panBy(dx, dy)
  }, [])

  const zoomBy = useCallback((dScale: number, originX: number, originY: number) => {
    engineRef.current?.zoomBy(dScale, originX, originY)
  }, [])

  const zoomTo = useCallback((targetScale: number, originX: number, originY: number) => {
    engineRef.current?.zoomTo(targetScale, originX, originY)
  }, [])

  const reset = useCallback(() => {
    engineRef.current?.setTransform(initial)
  }, [initial])

  return {
    engine: engineRef.current,
    state,
    setTransform,
    panBy,
    zoomBy,
    zoomTo,
    reset
  }
}

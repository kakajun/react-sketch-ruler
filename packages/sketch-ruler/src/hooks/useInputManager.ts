import { useEffect, useRef, useCallback } from 'react'
import { InputManager } from '@sketch-ruler/canvas'
import type { TransformEngine } from '@sketch-ruler/core'
import type { InputManagerOptions } from '@sketch-ruler/canvas'

export function useInputManager(
  engine: TransformEngine | null,
  containerRef: React.RefObject<HTMLElement | null>,
  options?: InputManagerOptions
) {
  const inputManagerRef = useRef<InputManager | null>(null)

  useEffect(() => {
    if (!engine || !containerRef.current) return

    const im = new InputManager(engine, options)
    inputManagerRef.current = im
    im.bind(containerRef.current)

    return () => {
      im.destroy()
      inputManagerRef.current = null
    }
  }, [engine, containerRef.current])

  useEffect(() => {
    if (options?.zoomMode) {
      inputManagerRef.current?.setZoomMode(options.zoomMode)
    }
  }, [options?.zoomMode])

  const getCursorClass = useCallback(() => {
    return inputManagerRef.current?.getCursorClass() ?? 'default'
  }, [])

  return {
    inputManager: inputManagerRef.current,
    getCursorClass
  }
}

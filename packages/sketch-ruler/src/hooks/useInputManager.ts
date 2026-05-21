import { useEffect, useState, useCallback } from 'react'
import { InputManager } from '@sketch-ruler/canvas'
import type { TransformEngine } from '@sketch-ruler/core'
import type { InputManagerOptions } from '@sketch-ruler/canvas'

export function useInputManager(
  engine: TransformEngine | null,
  containerRef: React.RefObject<HTMLElement | null>,
  options?: InputManagerOptions
) {
  const [inputManager, setInputManager] = useState<InputManager | null>(null)

  useEffect(() => {
    if (!engine || !containerRef.current) return

    const im = new InputManager(engine, options)
    setInputManager(im)
    im.bind(containerRef.current)

    return () => {
      im.destroy()
      setInputManager(null)
    }
  }, [engine, containerRef.current])

  useEffect(() => {
    if (options?.zoomMode) {
      inputManager?.setZoomMode(options.zoomMode)
    }
  }, [options?.zoomMode, inputManager])

  const getCursorClass = useCallback(() => {
    return inputManager?.getCursorClass() ?? 'default'
  }, [inputManager])

  return {
    inputManager,
    getCursorClass
  }
}

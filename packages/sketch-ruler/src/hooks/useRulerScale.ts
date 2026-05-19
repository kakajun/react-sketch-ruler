import { useMemo } from 'react'
import { computeScaleMarks } from '@sketch-ruler/core'

export function useRulerScale(
  scale: number,
  offset: number,
  viewportSize: number,
  thick: number,
  canvasSize?: number
) {
  return useMemo(() => {
    return computeScaleMarks({
      scale,
      offset,
      viewportSize,
      thick,
      canvasSize
    })
  }, [scale, offset, viewportSize, thick, canvasSize])
}

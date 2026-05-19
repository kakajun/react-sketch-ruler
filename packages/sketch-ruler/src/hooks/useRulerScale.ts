import { useMemo } from 'react'
import { computeScaleMarks, getTickConfig, applyHysteresis } from '@sketch-ruler/core'

export function useRulerScale(
  scale: number,
  offset: number,
  viewportSize: number,
  thick: number,
  canvasSize?: number,
  showMinorTicks?: boolean
) {
  return useMemo(() => {
    const marks = computeScaleMarks({
      scale,
      offset,
      viewportSize,
      thick,
      canvasSize,
      showMinorTicks
    })
    return {
      marks,
      currentConfig: getTickConfig(scale)
    }
  }, [scale, offset, viewportSize, thick, canvasSize, showMinorTicks])
}

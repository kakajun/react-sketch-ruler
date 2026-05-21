import { useMemo } from 'react'
import { SnapEngine } from '@sketch-ruler/core'
import type { SnapResult, SnapRule } from '@sketch-ruler/core'
import type { GuideLine } from '@sketch-ruler/core'

export type { SnapResult, SnapRule, SnapTarget } from '@sketch-ruler/core'

export interface SnapOptions {
  threshold?: number
  strength?: number
}

export function useSnapDetection(
  scale: number,
  offset: { x: number; y: number },
  guideLines: GuideLine[],
  options: SnapOptions = {}
) {
  const { threshold = 5, strength = 0.5 } = options

  const engine = useMemo(() => {
    return new SnapEngine({
      threshold,
      strength,
      guides: guideLines
    })
  }, [threshold, strength, guideLines])

  const detect = (screenX: number, screenY: number): SnapResult | null => {
    const worldX = (screenX - offset.x) / scale
    const worldY = (screenY - offset.y) / scale
    return engine.snap(worldX, worldY)
  }

  return { detect, engine }
}

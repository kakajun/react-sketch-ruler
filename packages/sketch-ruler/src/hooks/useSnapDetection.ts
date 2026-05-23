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

  const guideLineTargets = useMemo(() => {
    return guideLines.filter((l) => l.visible !== false).map((l) => l.position)
  }, [guideLines])

  const engine = useMemo(() => {
    return new SnapEngine({
      threshold,
      scale,
      strength,
      guideLineTargets,
      lines: guideLines
    })
  }, [threshold, scale, strength, guideLineTargets, guideLines])

  const detect = (screenPos: number, direction: 'h' | 'v'): SnapResult | null => {
    const offsetVal = direction === 'h' ? offset.y : offset.x
    const worldPos = (screenPos - offsetVal) / scale
    return engine.snap(worldPos, direction)
  }

  return { detect, engine }
}

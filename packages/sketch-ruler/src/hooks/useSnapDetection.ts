import { useCallback, useMemo } from 'react'

export interface SnapTarget {
  type: 'tick' | 'guide-line' | 'custom'
  position: number
  priority: number
}

export interface SnapResult {
  position: number
  target: SnapTarget
  original: number
}

export interface SnapOptions {
  threshold: number
  scale: number
  tickTargets?: number[]
  guideLineTargets?: number[]
  customTargets?: number[]
  strength?: number
}

export function useSnapDetection(options: SnapOptions) {
  const { threshold, scale, tickTargets, guideLineTargets, customTargets, strength = 0.5 } = options

  const snapStrength = useMemo(() => strength, [strength])

  const snap = useCallback(
    (position: number, _direction: 'h' | 'v'): SnapResult | null => {
      const s = scale
      if (s <= 0) return null

      const candidates: SnapTarget[] = []

      if (tickTargets) {
        for (const pos of tickTargets) {
          candidates.push({ type: 'tick', position: pos, priority: 1 })
        }
      }

      if (guideLineTargets) {
        for (const pos of guideLineTargets) {
          candidates.push({ type: 'guide-line', position: pos, priority: 2 })
        }
      }

      if (customTargets) {
        for (const pos of customTargets) {
          candidates.push({ type: 'custom', position: pos, priority: 3 })
        }
      }

      if (candidates.length === 0) return null

      const screenPos = position * s
      const pixelThreshold = threshold

      let bestTarget: SnapTarget | null = null
      let bestDistance = Infinity

      for (const target of candidates) {
        const targetScreen = target.position * s
        const dist = Math.abs(screenPos - targetScreen)
        if (dist < pixelThreshold && dist < bestDistance) {
          bestDistance = dist
          bestTarget = target
        }
      }

      if (!bestTarget) return null

      // 软吸附：根据强度插值
      const snappedPos =
        position + (bestTarget.position - position) * snapStrength

      return {
        position: snappedPos,
        target: bestTarget,
        original: position
      }
    },
    [scale, threshold, tickTargets, guideLineTargets, customTargets, snapStrength]
  )

  return { snap }
}

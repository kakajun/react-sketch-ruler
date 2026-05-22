import { renderHook } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { useSnapDetection } from '../src/hooks/useSnapDetection'

describe('useSnapDetection', () => {
  test('returns null when no guideLines', () => {
    const { result } = renderHook(() =>
      useSnapDetection(1, { x: 0, y: 0 }, [], { threshold: 10, strength: 0.5 })
    )
    // 没有参考线时，detect 应该返回 null（即使传入屏幕坐标）
    expect(result.current.detect(50, 'h')).toBeNull()
  })

  test('snaps to nearest guide line target', () => {
    const { result } = renderHook(() =>
      useSnapDetection(
        1,
        { x: 0, y: 0 },
        [
          { id: 'h-1', orientation: 'h', position: 50, visible: true, locked: false }
        ],
        { threshold: 10, strength: 0.5 }
      )
    )
    // 屏幕坐标 52，对应世界坐标 52，离 50 差 2，在 threshold 10 内
    const snapResult = result.current.detect(52, 'h')
    expect(snapResult).not.toBeNull()
    expect(snapResult!.target.type).toBe('guide-line')
  })

  test('does not snap when beyond threshold', () => {
    const { result } = renderHook(() =>
      useSnapDetection(
        1,
        { x: 0, y: 0 },
        [
          { id: 'h-1', orientation: 'h', position: 0, visible: true, locked: false },
          { id: 'h-2', orientation: 'h', position: 100, visible: true, locked: false }
        ],
        { threshold: 5, strength: 0.5 }
      )
    )
    expect(result.current.detect(50, 'h')).toBeNull()
  })

  test('applies soft snap strength', () => {
    const { result } = renderHook(() =>
      useSnapDetection(
        1,
        { x: 0, y: 0 },
        [
          { id: 'h-1', orientation: 'h', position: 100, visible: true, locked: false }
        ],
        { threshold: 10, strength: 0.5 }
      )
    )
    // 屏幕坐标 90，对应世界坐标 90，离 100 差 10，刚好在 threshold 内
    const snapResult = result.current.detect(90, 'h')
    expect(snapResult).not.toBeNull()
    // 软吸附：结果位置应该是 90 和 100 的中间值 = 95
    expect(snapResult!.position).toBeCloseTo(95, 1)
  })

  test('scales threshold with zoom level', () => {
    const { result } = renderHook(() =>
      useSnapDetection(
        2,
        { x: 0, y: 0 },
        [
          { id: 'h-1', orientation: 'h', position: 50, visible: true, locked: false }
        ],
        { threshold: 10, strength: 0.5 }
      )
    )
    // scale=2 时，threshold 在引擎内部已按 scale 处理，这里只需验证能吸附
    const snapResult = result.current.detect(95, 'h')
    expect(snapResult).not.toBeNull()
  })

  test('returns null for zero or negative scale', () => {
    const { result } = renderHook(() =>
      useSnapDetection(
        0,
        { x: 0, y: 0 },
        [
          { id: 'h-1', orientation: 'h', position: 0, visible: true, locked: false },
          { id: 'h-2', orientation: 'h', position: 50, visible: true, locked: false }
        ],
        { threshold: 10, strength: 0.5 }
      )
    )
    expect(result.current.detect(50, 'h')).toBeNull()
  })
})

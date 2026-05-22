import { renderHook } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { useRulerScale } from '../src/hooks/useRulerScale'
import { getTickConfig } from '@sketch-ruler/core'

describe('getTickConfig', () => {
  test('returns correct config for scale < 0.2', () => {
    const config = getTickConfig(0.1)
    expect(config.interval).toBe(500)
    expect(config.subdivisions).toBe(5)
  })

  test('returns correct config for scale 0.3', () => {
    const config = getTickConfig(0.3)
    expect(config.interval).toBe(200)
    expect(config.subdivisions).toBe(4)
  })

  test('returns correct config for scale 1.0', () => {
    const config = getTickConfig(1.0)
    expect(config.interval).toBe(50)
    expect(config.subdivisions).toBe(5)
  })

  test('returns correct config for scale 3.0', () => {
    const config = getTickConfig(3.0)
    expect(config.interval).toBe(20)
    expect(config.subdivisions).toBe(4)
  })

  test('returns correct config for scale >= 10', () => {
    const config = getTickConfig(15)
    expect(config.interval).toBe(5)
    expect(config.subdivisions).toBe(5)
  })
})

describe('useRulerScale', () => {
  test('generates marks for horizontal ruler', () => {
    const { result } = renderHook(() => useRulerScale(1, 0, 400, 20, 400, false))
    const { marks } = result.current
    expect(marks.length).toBeGreaterThan(0)
    const majors = marks.filter((t) => t.isMajor)
    expect(majors.length).toBeGreaterThan(0)
    majors.forEach((t) => {
      expect(t.label).toBeDefined()
    })
  })

  test('generates minor marks when showMinorTicks is true', () => {
    const { result } = renderHook(() => useRulerScale(1, 0, 400, 20, 400, true))
    const { marks } = result.current
    const majors = marks.filter((t) => t.isMajor)
    const minors = marks.filter((t) => !t.isMajor)
    expect(majors.length).toBeGreaterThan(0)
    expect(minors.length).toBeGreaterThan(0)
  })

  test('generates marks for vertical ruler', () => {
    const { result } = renderHook(() => useRulerScale(1, 0, 300, 20, 300, false))
    expect(result.current.marks.length).toBeGreaterThan(0)
  })

  test('mark positions respect scale and offset', () => {
    const { result } = renderHook(() => useRulerScale(2, 100, 400, 20, 400, false))
    const { marks } = result.current
    const zeroMark = marks.find((t) => t.value === 0)
    if (zeroMark) {
      expect(zeroMark.position).toBe(100)
    }
  })

  test('returns empty array for zero viewport', () => {
    const { result } = renderHook(() => useRulerScale(1, 0, 0, 20, 0, false))
    expect(result.current.marks).toEqual([])
  })

  test('includes buffer region marks', () => {
    const { result } = renderHook(() => useRulerScale(1, 0, 200, 20, 200, true))
    const { marks } = result.current
    const positions = marks.map((t) => t.position)
    const minPos = Math.min(...positions)
    const maxPos = Math.max(...positions)
    expect(minPos).toBeLessThan(0)
    expect(maxPos).toBeGreaterThan(200)
  })
})

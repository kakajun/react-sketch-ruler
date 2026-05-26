import { renderHook } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { useRulerScale } from '../src/hooks/useRulerScale'
import { getTickConfig } from '@sketch-ruler/core'

describe('getTickConfig', () => {
  // 测试底层 getTickConfig 在不同缩放级别下返回正确的刻度配置
  // 缩放小于 0.2 时应返回大间隔刻度配置
  test('returns correct config for scale < 0.2', () => {
    const config = getTickConfig(0.1)
    expect(config.interval).toBe(500)
    expect(config.subdivisions).toBe(5)
  })

  // 缩放 0.3 时应返回对应的刻度间隔与细分数量
  test('returns correct config for scale 0.3', () => {
    const config = getTickConfig(0.3)
    expect(config.interval).toBe(200)
    expect(config.subdivisions).toBe(4)
  })

  // 缩放 1.0（默认）时应返回标准刻度配置
  test('returns correct config for scale 1.0', () => {
    const config = getTickConfig(1.0)
    expect(config.interval).toBe(50)
    expect(config.subdivisions).toBe(5)
  })

  // 缩放 3.0 时应返回更精细的刻度配置
  test('returns correct config for scale 3.0', () => {
    const config = getTickConfig(3.0)
    expect(config.interval).toBe(20)
    expect(config.subdivisions).toBe(4)
  })

  // 缩放大于等于 10 时应返回最精细刻度配置
  test('returns correct config for scale >= 10', () => {
    const config = getTickConfig(15)
    expect(config.interval).toBe(5)
    expect(config.subdivisions).toBe(5)
  })
})

describe('useRulerScale', () => {
  // 测试 useRulerScale Hook 生成标尺刻度的行为
  // 水平标尺应生成包含主刻度的刻度数组
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

  // showMinorTicks 为 true 时应同时生成次刻度
  test('generates minor marks when showMinorTicks is true', () => {
    const { result } = renderHook(() => useRulerScale(1, 0, 400, 20, 400, true))
    const { marks } = result.current
    const majors = marks.filter((t) => t.isMajor)
    const minors = marks.filter((t) => !t.isMajor)
    expect(majors.length).toBeGreaterThan(0)
    expect(minors.length).toBeGreaterThan(0)
  })

  // 垂直标尺应生成刻度数组
  test('generates marks for vertical ruler', () => {
    const { result } = renderHook(() => useRulerScale(1, 0, 300, 20, 300, false))
    expect(result.current.marks.length).toBeGreaterThan(0)
  })

  // 刻度位置应随缩放与偏移正确变化
  test('mark positions respect scale and offset', () => {
    const { result } = renderHook(() => useRulerScale(2, 100, 400, 20, 400, false))
    const { marks } = result.current
    const zeroMark = marks.find((t) => t.value === 0)
    if (zeroMark) {
      expect(zeroMark.position).toBe(100)
    }
  })

  // 视口宽度为 0 时应返回空刻度数组
  test('returns empty array for zero viewport', () => {
    const { result } = renderHook(() => useRulerScale(1, 0, 0, 20, 0, false))
    expect(result.current.marks).toEqual([])
  })

  // 刻度应包含缓冲区范围内的额外刻度
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

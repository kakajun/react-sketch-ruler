import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { useCanvasTransform } from '../src/hooks/useCanvasTransform'

describe('useCanvasTransform', () => {
  // 每个测试前启用假定时器
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  // 验证初始缩放与偏移值
  test('initial values', () => {
    const { result } = renderHook(() =>
      useCanvasTransform({
        initialScale: 2,
        initialOffset: { x: 100, y: 50 }
      })
    )
    expect(result.current.scale).toBe(2)
    expect(result.current.offset).toEqual({ x: 100, y: 50 })
  })

  // 验证 setTransform 能正确更新缩放与偏移状态
  test('setTransform updates state', async () => {
    const { result } = renderHook(() => useCanvasTransform())
    await waitFor(() => expect(result.current.engine).toBeTruthy())
    act(() => {
      result.current.setTransform({ scale: 2, x: 50, y: 30 })
    })
    expect(result.current.scale).toBe(2)
    expect(result.current.offset).toEqual({ x: 50, y: 30 })
  })

  // 验证 panBy 可以累加平移偏移量
  test('panBy accumulates offset', async () => {
    const { result } = renderHook(() => useCanvasTransform())
    await waitFor(() => expect(result.current.engine).toBeTruthy())
    act(() => {
      result.current.panBy(10, 20)
    })
    expect(result.current.offset).toEqual({ x: 10, y: 20 })
    act(() => {
      result.current.panBy(5, -5)
    })
    expect(result.current.offset).toEqual({ x: 15, y: 15 })
  })

  // 验证 zoomBy 能按步进更新缩放比例
  test('zoomBy updates scale', async () => {
    const { result } = renderHook(() => useCanvasTransform())
    await waitFor(() => expect(result.current.engine).toBeTruthy())
    act(() => {
      result.current.zoomBy(1, 0, 0)
    })
    expect(result.current.scale).toBe(2)
  })

  // 验证 zoomTo 能设置精确的缩放比例
  test('zoomTo sets exact scale', async () => {
    const { result } = renderHook(() => useCanvasTransform())
    await waitFor(() => expect(result.current.engine).toBeTruthy())
    act(() => {
      result.current.zoomTo(3, 0, 0)
    })
    expect(result.current.scale).toBe(3)
  })

  // 验证缩放比例受 minZoom/maxZoom 限制
  test('zoom clamps to min/max', async () => {
    const { result } = renderHook(() => useCanvasTransform({ minZoom: 0.5, maxZoom: 5 }))
    await waitFor(() => expect(result.current.engine).toBeTruthy())
    act(() => {
      result.current.zoomTo(0.1, 0, 0)
    })
    expect(result.current.scale).toBe(0.5)
    act(() => {
      result.current.zoomTo(10, 0, 0)
    })
    expect(result.current.scale).toBe(5)
  })

  // 验证 reset 能恢复到初始缩放与偏移值
  test('reset restores initial values', async () => {
    const { result } = renderHook(() =>
      useCanvasTransform({
        initialScale: 1.5,
        initialOffset: { x: 10, y: 20 }
      })
    )
    await waitFor(() => expect(result.current.engine).toBeTruthy())
    act(() => {
      result.current.setTransform({ scale: 3, x: 100, y: 200 })
    })
    expect(result.current.scale).toBe(3)
    expect(result.current.offset).toEqual({ x: 100, y: 200 })
    act(() => {
      result.current.reset()
    })
    expect(result.current.scale).toBe(1.5)
    expect(result.current.offset).toEqual({ x: 10, y: 20 })
  })

  // 验证世界坐标与屏幕坐标互转互为逆运算
  test('toWorldPoint and toScreenPoint are inverse', async () => {
    const { result } = renderHook(() =>
      useCanvasTransform({
        initialScale: 2,
        initialOffset: { x: 100, y: 50 }
      })
    )
    await waitFor(() => expect(result.current.engine).toBeTruthy())
    act(() => {
      result.current.setTransform({ scale: 2, x: 100, y: 50 })
    })
    const world = { x: 50, y: 50 }
    const screen = result.current.toScreenPoint(world.x, world.y)
    const back = result.current.toWorldPoint(screen.x, screen.y)
    expect(back.x).toBeCloseTo(world.x, 6)
    expect(back.y).toBeCloseTo(world.y, 6)
  })

  // 验证引擎实例存在且具备 setTransform 方法
  test('engine is defined and has setTransform', async () => {
    const { result } = renderHook(() => useCanvasTransform())
    await waitFor(() => expect(result.current.engine).toBeTruthy())
    expect(typeof result.current.engine.setTransform).toBe('function')
  })
})

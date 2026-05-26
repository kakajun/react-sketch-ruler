import { renderHook, act } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { useSketchRuler } from '../src/hooks/useSketchRuler'

describe('useSketchRuler', () => {
  // 测试 useSketchRuler Hook 的状态管理与方法行为
  // 验证 Hook 返回引擎实例及初始状态
  test('returns engine and state', () => {
    const { result } = renderHook(() =>
      useSketchRuler({
        width: 800,
        height: 600,
        canvasWidth: 400,
        canvasHeight: 300,
        thick: 20,
        autoCenter: false
      })
    )
    expect(result.current.engine).toBeDefined()
    expect(result.current.scale).toBe(1)
    expect(result.current.rectWidth).toBe(800)
    expect(result.current.rectHeight).toBe(600)
  })

  // 验证 addLine 添加参考线与 updateLine 更新位置能正确修改状态
  test('addLine and updateLine update state', () => {
    const { result } = renderHook(() =>
      useSketchRuler({
        width: 800,
        height: 600,
        canvasWidth: 400,
        canvasHeight: 300,
        thick: 20,
        autoCenter: false
      })
    )
    expect(result.current.horizontalLines).toHaveLength(0)

    act(() => {
      result.current.addLine({ orientation: 'h', position: 100, visible: true, locked: false })
    })
    expect(result.current.horizontalLines).toHaveLength(1)
    expect(result.current.horizontalLines[0].position).toBe(100)

    const id = result.current.horizontalLines[0].id
    act(() => {
      result.current.updateLine(id, 200)
    })
    expect(result.current.horizontalLines[0].position).toBe(200)
  })

  // 验证 removeLine 能删除指定参考线
  test('removeLine deletes line', () => {
    const { result } = renderHook(() =>
      useSketchRuler({
        width: 800,
        height: 600,
        canvasWidth: 400,
        canvasHeight: 300,
        thick: 20,
        lines: { h: [50], v: [100] },
        autoCenter: false
      })
    )
    expect(result.current.horizontalLines).toHaveLength(1)
    expect(result.current.verticalLines).toHaveLength(1)

    const id = result.current.horizontalLines[0].id
    act(() => {
      result.current.removeLine(id)
    })
    expect(result.current.horizontalLines).toHaveLength(0)
  })

  // 验证 zoomIn 放大与 reset 重置功能正常
  test('zoomIn/zoomOut/reset work', () => {
    const { result } = renderHook(() =>
      useSketchRuler({
        width: 800,
        height: 600,
        canvasWidth: 400,
        canvasHeight: 300,
        thick: 20,
        zoomStep: 0.25,
        autoCenter: false
      })
    )
    const initialScale = result.current.scale

    act(() => {
      result.current.zoomIn()
    })
    expect(result.current.scale).toBeGreaterThan(initialScale)

    act(() => {
      result.current.reset()
    })
    expect(result.current.scale).toBe(initialScale)
  })

  // 验证自定义调色板与默认调色板正确合并
  test('paletteCpu merges custom palette', () => {
    const { result } = renderHook(() =>
      useSketchRuler({
        width: 800,
        height: 600,
        canvasWidth: 400,
        canvasHeight: 300,
        palette: { bgColor: '#ff0000' },
        autoCenter: false
      })
    )
    expect(result.current.paletteCpu.bgColor).toBe('#ff0000')
    expect(result.current.paletteCpu.tickColor).toBeDefined()
  })

  // 验证初始化参考线与后续状态更新均正确
  test('lines initialization and state updates work correctly', () => {
    const { result } = renderHook(() =>
      useSketchRuler({
        width: 800,
        height: 600,
        canvasWidth: 400,
        canvasHeight: 300,
        lines: { h: [10, 20], v: [30] },
        autoCenter: false
      })
    )
    expect(result.current.horizontalLines).toHaveLength(2)
    expect(result.current.verticalLines).toHaveLength(1)
    expect(result.current.horizontalLines.map((l) => l.position)).toContain(10)
    expect(result.current.horizontalLines.map((l) => l.position)).toContain(20)
    expect(result.current.verticalLines.map((l) => l.position)).toContain(30)

    act(() => {
      result.current.addLine({ orientation: 'h', position: 100, visible: true, locked: false })
    })
    expect(result.current.horizontalLines).toHaveLength(3)
    expect(result.current.horizontalLines.map((l) => l.position)).toContain(100)
  })
})

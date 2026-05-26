import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import RulerWrapper from '../src/sketch-ruler/RulerWrapper'

function mockRect(opts: Partial<DOMRect> = {}): DOMRect {
  const width = opts.width ?? 300
  const height = opts.height ?? 200
  return {
    top: opts.top ?? 0,
    left: opts.left ?? 0,
    right: opts.right ?? width,
    bottom: opts.bottom ?? height,
    width,
    height,
    x: opts.x ?? 0,
    y: opts.y ?? 0,
    toJSON: () => {}
  } as DOMRect
}

function renderRulerWrapper(props: Record<string, any> = {}) {
  const vertical = props.vertical ?? false
  const onAddLine = vi.fn()
  const onUpdateLine = vi.fn()
  const onDeleteLine = vi.fn()

  const { container, rerender } = render(
    <RulerWrapper
      vertical={vertical}
      width={vertical ? 20 : 300}
      height={vertical ? 300 : 20}
      thick={20}
      scale={1}
      offset={{ x: 20, y: 20 }}
      lines={[]}
      palette={{
        bgColor: '#f6f7f9',
        tickColor: '#BABBBC',
        labelColor: '#7D8694',
        guideLineColor: '#51d6a9',
        guideLineLockedColor: '#d4d7dc',
        hoverBg: '#000',
        hoverColor: '#fff',
        borderColor: '#eeeeef',
        shadowColor: '#e9f7fe'
      }}
      showReferLine={true}
      canvasWidth={300}
      canvasHeight={200}
      {...props}
      onAddLine={props.onAddLine ?? onAddLine}
      onUpdateLine={props.onUpdateLine ?? onUpdateLine}
      onDeleteLine={props.onDeleteLine ?? onDeleteLine}
    />
  )

  const canvas = container.querySelector('canvas') as HTMLCanvasElement
  if (canvas) {
    canvas.getBoundingClientRect = vi.fn(() =>
      mockRect({
        width: vertical ? 20 : 300,
        height: vertical ? 300 : 20
      })
    )
  }

  return { container, canvas, onAddLine, onUpdateLine, onDeleteLine, rerender }
}

describe('RulerWrapper line boundary deletion', () => {
  // 该 describe 块测试参考线拖出边界时的删除逻辑及新建参考线的边界限制
  afterEach(() => {
    fireEvent.mouseUp(document)
  })

  // 水平参考线拖出上边界时应触发 onDeleteLine
  test('should call onDeleteLine when dragging an existing horizontal line out of top boundary', () => {
    const onDeleteLine = vi.fn()
    const onUpdateLine = vi.fn()
    const { container } = renderRulerWrapper({
      lines: [{ id: 'h-1', orientation: 'h', position: 100, visible: true, locked: false }],
      onDeleteLine,
      onUpdateLine
    })

    const lineEl = container.querySelector('.line') as HTMLElement
    expect(lineEl).toBeTruthy()

    fireEvent.mouseDown(lineEl, { clientY: 120 })
    fireEvent.mouseMove(document, { clientY: -50 })
    fireEvent.mouseUp(document, { clientY: -50 })

    expect(onDeleteLine).toHaveBeenCalledWith('h-1')
    expect(onUpdateLine).toHaveBeenCalled()
  })

  // 即使 offset 使屏幕坐标为正，也应根据世界坐标判断是否超出边界并删除
  test('should delete line based on world position even when offset makes screen position positive', () => {
    const onDeleteLine = vi.fn()
    const onUpdateLine = vi.fn()
    const { container } = renderRulerWrapper({
      lines: [{ id: 'h-1', orientation: 'h', position: 100, visible: true, locked: false }],
      offset: { x: 100, y: 100 },
      onDeleteLine,
      onUpdateLine
    })

    const lineEl = container.querySelector('.line') as HTMLElement
    expect(lineEl).toBeTruthy()

    // Drag to world pos 0 (just at boundary, should NOT delete)
    fireEvent.mouseDown(lineEl, { clientY: 120 })
    fireEvent.mouseMove(document, { clientY: 20 })
    fireEvent.mouseUp(document, { clientY: 20 })
    expect(onDeleteLine).not.toHaveBeenCalled()

    // Drag further to world pos -20 (out of boundary, SHOULD delete)
    // screenPos = -20 * 1 + 100 = 80 (looks inside container)
    // but worldPos = -20 < -10, so it should be deleted
    fireEvent.mouseDown(lineEl, { clientY: 120 })
    fireEvent.mouseMove(document, { clientY: 0 })
    fireEvent.mouseUp(document, { clientY: 0 })

    expect(onDeleteLine).toHaveBeenCalledWith('h-1')
    expect(onUpdateLine).toHaveBeenCalled()
  })

  // 水平参考线拖出下边界时应触发 onDeleteLine
  test('should call onDeleteLine when dragging an existing horizontal line out of bottom boundary', () => {
    const onDeleteLine = vi.fn()
    const { container } = renderRulerWrapper({
      lines: [{ id: 'h-2', orientation: 'h', position: 100, visible: true, locked: false }],
      onDeleteLine
    })

    const lineEl = container.querySelector('.line') as HTMLElement
    fireEvent.mouseDown(lineEl, { clientY: 120 })
    fireEvent.mouseMove(document, { clientY: 350 })
    fireEvent.mouseUp(document, { clientY: 350 })

    expect(onDeleteLine).toHaveBeenCalledWith('h-2')
  })

  // 垂直参考线拖出右边界时应触发 onDeleteLine
  test('should call onDeleteLine when dragging an existing vertical line out of right boundary', () => {
    const onDeleteLine = vi.fn()
    const { container } = renderRulerWrapper({
      vertical: true,
      lines: [{ id: 'v-1', orientation: 'v', position: 100, visible: true, locked: false }],
      onDeleteLine
    })

    const lineEl = container.querySelector('.line') as HTMLElement
    fireEvent.mouseDown(lineEl, { clientX: 120 })
    fireEvent.mouseMove(document, { clientX: 450 })
    fireEvent.mouseUp(document, { clientX: 450 })

    expect(onDeleteLine).toHaveBeenCalledWith('v-1')
  })

  // 参考线在边界内拖动时应触发 onUpdateLine 而不是 onDeleteLine
  test('should call onUpdateLine when dragging line within boundary', () => {
    const onUpdateLine = vi.fn()
    const onDeleteLine = vi.fn()
    const { container } = renderRulerWrapper({
      lines: [{ id: 'h-1', orientation: 'h', position: 100, visible: true, locked: false }],
      onUpdateLine,
      onDeleteLine
    })

    const lineEl = container.querySelector('.line') as HTMLElement
    fireEvent.mouseDown(lineEl, { clientY: 120 })
    fireEvent.mouseMove(document, { clientY: 150 })
    fireEvent.mouseUp(document, { clientY: 150 })

    expect(onUpdateLine).toHaveBeenCalled()
    expect(onDeleteLine).not.toHaveBeenCalled()
  })

  // 拖出边界时默认显示中文删除提示标签
  test('should show default delete label when dragging line out of boundary', async () => {
    const { container } = renderRulerWrapper({
      lines: [{ id: 'h-1', orientation: 'h', position: 100, visible: true, locked: false }]
    })

    const lineEl = container.querySelector('.line') as HTMLElement
    fireEvent.mouseDown(lineEl, { clientY: 120 })
    fireEvent.mouseMove(document, { clientY: -50 })

    await waitFor(() => {
      const label = container.querySelector('.line-label')
      expect(label).toBeTruthy()
      expect(label!.textContent).toBe('放开删除')
    })

    fireEvent.mouseUp(document, { clientY: -50 })
  })

  // 拖出边界时支持自定义删除提示标签文本
  test('should show custom delete label when dragging line out of boundary', async () => {
    const { container } = renderRulerWrapper({
      deleteLabel: 'Release to delete',
      lines: [{ id: 'h-1', orientation: 'h', position: 100, visible: true, locked: false }]
    })

    const lineEl = container.querySelector('.line') as HTMLElement
    fireEvent.mouseDown(lineEl, { clientY: 120 })
    fireEvent.mouseMove(document, { clientY: -50 })

    await waitFor(() => {
      const label = container.querySelector('.line-label')
      expect(label).toBeTruthy()
      expect(label!.textContent).toBe('Release to delete')
    })

    fireEvent.mouseUp(document, { clientY: -50 })
  })

  // 在标尺区域内新建水平参考线时应触发 onAddLine
  test('should call onAddLine when creating a new horizontal line within boundary', () => {
    const onAddLine = vi.fn()
    const { canvas } = renderRulerWrapper({ onAddLine })
    expect(canvas).toBeTruthy()

    fireEvent.mouseDown(canvas!, { clientY: 30 })
    fireEvent.mouseMove(document, { clientY: 30 })
    fireEvent.mouseUp(document, { clientY: 30 })

    expect(onAddLine).toHaveBeenCalledTimes(1)
    const payload = onAddLine.mock.calls[0][0]
    expect(payload.orientation).toBe('h')
    expect(payload.position).toBe(10)
  })

  // 在上边界外新建参考线时不应触发 onAddLine
  test('should not call onAddLine when creating a new line beyond top boundary', () => {
    const onAddLine = vi.fn()
    const { canvas } = renderRulerWrapper({ onAddLine })

    fireEvent.mouseDown(canvas!, { clientY: 10 })
    fireEvent.mouseMove(document, { clientY: 10 })
    fireEvent.mouseUp(document, { clientY: 10 })

    expect(onAddLine).not.toHaveBeenCalled()
  })

  // 在下边界外新建参考线时不应触发 onAddLine
  test('should not call onAddLine when creating a new line beyond bottom boundary', () => {
    const onAddLine = vi.fn()
    const { canvas } = renderRulerWrapper({ onAddLine })

    fireEvent.mouseDown(canvas!, { clientY: 30 })
    fireEvent.mouseMove(document, { clientY: 250 })
    fireEvent.mouseUp(document, { clientY: 250 })

    expect(onAddLine).not.toHaveBeenCalled()
  })

  // 在右边界外新建垂直参考线时不应触发 onAddLine
  test('should not call onAddLine when creating a new vertical line beyond right boundary', () => {
    const onAddLine = vi.fn()
    const { canvas } = renderRulerWrapper({ vertical: true, onAddLine })

    fireEvent.mouseDown(canvas!, { clientX: 30 })
    fireEvent.mouseMove(document, { clientX: 350 })
    fireEvent.mouseUp(document, { clientX: 350 })

    expect(onAddLine).not.toHaveBeenCalled()
  })

  // 锁定状态的参考线拖出边界时不应触发删除或更新
  test('should not call onDeleteLine for locked lines', () => {
    const onDeleteLine = vi.fn()
    const onUpdateLine = vi.fn()
    const { container } = renderRulerWrapper({
      lines: [{ id: 'h-1', orientation: 'h', position: 100, visible: true, locked: true }],
      onDeleteLine,
      onUpdateLine
    })

    const lineEl = container.querySelector('.line') as HTMLElement
    fireEvent.mouseDown(lineEl, { clientY: 120 })
    fireEvent.mouseMove(document, { clientY: -50 })
    fireEvent.mouseUp(document, { clientY: -50 })

    expect(onDeleteLine).not.toHaveBeenCalled()
    expect(onUpdateLine).not.toHaveBeenCalled()
  })
})

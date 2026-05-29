import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import RulerLine from '../src/sketch-ruler/RulerLine'

const defaultPalette = {
  bgColor: '#fff',
  tickColor: '#000',
  labelColor: '#000',
  guideLineColor: '#000',
  guideLineLockedColor: '#ccc',
  hoverBg: 'transparent',
  hoverColor: '#000',
  borderColor: '#000',
  shadowColor: 'rgba(0,0,0,0.1)',
  fontShadowColor: '#000'
}

describe('RulerLine', () => {
  // 未锁定参考线默认显示标签
  test('unlocked line shows label by default', async () => {
    const onUpdate = vi.fn()
    const onDelete = vi.fn()

    const { container } = render(
      <RulerLine
        line={{ id: '1', position: 100, orientation: 'h', visible: true, locked: false } as any}
        scale={1}
        offset={0}
        palette={defaultPalette}
        vertical={false}
        canvasWidth={800}
        canvasHeight={600}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    )

    const line = container.querySelector('.line')
    expect(line).toBeTruthy()

    // 未锁定线默认显示标签
    expect(container.querySelector('.line-label')).toBeTruthy()
  })

  // 测试锁定状态下的参考线不显示标签
  test('locked line does not show label', async () => {
    const { container } = render(
      <RulerLine
        line={{ id: '1', position: 100, orientation: 'h', visible: true, locked: true } as any}
        scale={1}
        offset={0}
        palette={defaultPalette}
        vertical={false}
        canvasWidth={800}
        canvasHeight={600}
      />
    )

    expect(container.querySelector('.line-label')).not.toBeTruthy()
  })

  // 测试 lockLine 属性阻止拖拽但不隐藏标签
  test('lockLine prop prevents dragging but still shows label', async () => {
    const onUpdate = vi.fn()
    const { container } = render(
      <RulerLine
        line={{ id: '1', position: 100, orientation: 'h', visible: true, locked: false } as any}
        scale={1}
        offset={0}
        palette={defaultPalette}
        vertical={false}
        canvasWidth={800}
        canvasHeight={600}
        lockLine={true}
        onUpdate={onUpdate}
      />
    )

    const line = container.querySelector('.line')
    expect(line).toBeTruthy()

    // lockLine 时标签仍然显示
    expect(container.querySelector('.line-label')).toBeTruthy()

    // 但无法拖拽（mousedown 不触发更新）
    fireEvent.mouseDown(line!)
    expect(onUpdate).not.toHaveBeenCalled()
  })

  // 水平参考线被拖回标尺区域（screenPos <= thick）应删除
  test('should delete horizontal line when dragged back onto the ruler', async () => {
    const onUpdate = vi.fn()
    const onDelete = vi.fn()

    const { container } = render(
      <RulerLine
        line={{ id: 'h-1', position: 100, orientation: 'h', visible: true, locked: false } as any}
        scale={1}
        offset={20}
        thick={20}
        palette={defaultPalette}
        vertical={false}
        canvasWidth={800}
        canvasHeight={600}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    )

    const line = container.querySelector('.line')
    expect(line).toBeTruthy()

    // mousedown: 线在屏幕位置 120 (100*1 + 20)
    fireEvent.mouseDown(line!, { clientY: 120 })

    // mousemove: 拖到标尺底部边缘，clientY = 20
    // newPos = (20 - 120) / 1 + 100 = 0
    // screenPos = 0 * 1 + 20 = 20 <= thick(20)，应删除
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientY: 20 }))
    })

    expect(onUpdate).toHaveBeenCalledWith('h-1', 0)

    const label = container.querySelector('.line-label')
    expect(label).toBeTruthy()
    expect(label!.textContent).toBe('放开删除')

    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup', { clientY: 20 }))
    })

    expect(onDelete).toHaveBeenCalledWith('h-1')
  })

  // 垂直参考线被拖回标尺区域（screenPos <= thick）应删除
  test('should delete vertical line when dragged back onto the ruler', async () => {
    const onUpdate = vi.fn()
    const onDelete = vi.fn()

    const { container } = render(
      <RulerLine
        line={{ id: 'v-1', position: 100, orientation: 'v', visible: true, locked: false } as any}
        scale={1}
        offset={20}
        thick={20}
        palette={defaultPalette}
        vertical={true}
        canvasWidth={800}
        canvasHeight={600}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    )

    const line = container.querySelector('.line')
    expect(line).toBeTruthy()

    // mousedown: 线在屏幕位置 120 (100*1 + 20)
    fireEvent.mouseDown(line!, { clientX: 120 })

    // mousemove: 拖到标尺右侧边缘，clientX = 20
    // newPos = (20 - 120) / 1 + 100 = 0
    // screenPos = 0 * 1 + 20 = 20 <= thick(20)，应删除
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 20 }))
    })

    expect(onUpdate).toHaveBeenCalledWith('v-1', 0)

    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 20 }))
    })

    expect(onDelete).toHaveBeenCalledWith('v-1')
  })
})

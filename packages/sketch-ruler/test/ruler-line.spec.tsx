import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import RulerLine from '../src/sketch-ruler/RulerLine'

const defaultPalette = {
  bgColor: '#fff',
  tickColor: '#000',
  labelColor: '#000',
  guideLineColor: '#000',
  guideLineLockedColor: '#ccc',
  hoverBg: '#000',
  hoverColor: '#fff',
  borderColor: '#000',
  shadowColor: 'rgba(0,0,0,0.1)',
  fontShadowColor: '#000'
}

describe('RulerLine', () => {
  test('hover shows label after 50ms and leave hides it after 200ms', async () => {
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

    // 初始状态无标签
    expect(container.querySelector('.line-label')).not.toBeTruthy()

    // hover
    fireEvent.mouseEnter(line!)

    // 50ms 延迟后标签显示
    await waitFor(() => {
      expect(container.querySelector('.line-label')).toBeTruthy()
    }, { timeout: 100 })

    // leave
    fireEvent.mouseLeave(line!)

    // 200ms 延迟后标签隐藏
    await waitFor(() => {
      expect(container.querySelector('.line-label')).not.toBeTruthy()
    }, { timeout: 300 })
  })

  test('locked line does not show label on hover', async () => {
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

    const line = container.querySelector('.line')
    fireEvent.mouseEnter(line!)

    await new Promise((r) => setTimeout(r, 100))
    expect(container.querySelector('.line-label')).not.toBeTruthy()
  })

  test('lockLine prop prevents label on hover', async () => {
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
      />
    )

    const line = container.querySelector('.line')
    fireEvent.mouseEnter(line!)

    await new Promise((r) => setTimeout(r, 100))
    expect(container.querySelector('.line-label')).not.toBeTruthy()
  })
})

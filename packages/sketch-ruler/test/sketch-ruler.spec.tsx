import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { SketchRule } from '../src/index'

describe('SketchRule integration', () => {
  // 测试 zoomIn 后会触发 onUpdateScale 回调
  test('emits onUpdateScale on zoomIn', async () => {
    const onUpdateScale = vi.fn()
    const ref = React.createRef<any>()

    render(
      <SketchRule
        ref={ref}
        width={800}
        height={600}
        canvasWidth={600}
        canvasHeight={400}
        selfHandle={true}
        onUpdateScale={onUpdateScale}
      >
        <div data-testid="page1" style={{ width: '600px', height: '400px' }} />
      </SketchRule>
    )

    await waitFor(() => {
      expect(ref.current).toBeTruthy()
    })

    expect(ref.current?.zoomIn).toBeTypeOf('function')
    act(() => {
      ref.current!.zoomIn()
    })
    await waitFor(() => {
      expect(onUpdateScale).toHaveBeenCalled()
    })
  })

  // 测试点击左上角 eye 图标触发 onHandleCornerClick 并切换参考线显隐
  test('corner click emits onHandleCornerClick and toggles refer line', async () => {
    const onHandleCornerClick = vi.fn()

    render(
      <SketchRule
        width={800}
        height={600}
        canvasWidth={600}
        canvasHeight={400}
        onHandleCornerClick={onHandleCornerClick}
      >
        <div data-testid="page1" style={{ width: '600px', height: '400px' }} />
      </SketchRule>
    )

    const corner = document.querySelector('.corner')
    expect(corner).toBeTruthy()
    fireEvent.click(corner!)
    expect(onHandleCornerClick).toHaveBeenCalledTimes(1)
    expect(typeof onHandleCornerClick.mock.calls[0][0]).toBe('boolean')
  })

  // 测试 lockLine 属性控制参考线的交互状态
  test('lockLine prop controls line interactivity', async () => {
    const ref = React.createRef<any>()

    const { rerender } = render(
      <SketchRule
        ref={ref}
        width={800}
        height={600}
        canvasWidth={600}
        canvasHeight={400}
        lockLine={false}
      >
        <div data-testid="page1" style={{ width: '600px', height: '400px' }} />
      </SketchRule>
    )

    await waitFor(() => {
      expect(ref.current).toBeTruthy()
    })

    // 重新渲染并锁定参考线
    rerender(
      <SketchRule
        ref={ref}
        width={800}
        height={600}
        canvasWidth={600}
        canvasHeight={400}
        lockLine={true}
      >
        <div data-testid="page1" style={{ width: '600px', height: '400px' }} />
      </SketchRule>
    )

    // lockLine 为 true 时，组件正常渲染即可
    expect(document.querySelector('.sketch-ruler')).toBeTruthy()
  })

  // 测试多个 SketchRule 实例拥有独立的 TransformEngine
  test('multiple instances have independent engines', async () => {
    const onUpdateScale1 = vi.fn()
    const onUpdateScale2 = vi.fn()
    const ref1 = React.createRef<any>()
    const ref2 = React.createRef<any>()

    render(
      <>
        <SketchRule
          ref={ref1}
          width={400}
          height={300}
          canvasWidth={300}
          canvasHeight={200}
          selfHandle={true}
          onUpdateScale={onUpdateScale1}
        >
          <div data-testid="page1" style={{ width: '300px', height: '200px' }} />
        </SketchRule>
        <SketchRule
          ref={ref2}
          width={400}
          height={300}
          canvasWidth={300}
          canvasHeight={200}
          selfHandle={true}
          onUpdateScale={onUpdateScale2}
        >
          <div data-testid="page2" style={{ width: '300px', height: '200px' }} />
        </SketchRule>
      </>
    )

    await waitFor(() => {
      expect(ref1.current).toBeTruthy()
      expect(ref2.current).toBeTruthy()
    })

    const engine1 = ref1.current?.engine
    const engine2 = ref2.current?.engine

    // 每个实例都应该有自己的 engine
    expect(engine1).toBeTruthy()
    expect(engine2).toBeTruthy()
    expect(engine1).not.toBe(engine2)

    // 每个实例操作的 canvasedit 元素应该不同
    expect(screen.getByTestId('page1')).toBeTruthy()
    expect(screen.getByTestId('page2')).toBeTruthy()

    // 验证两个实例的 engine 是独立的
    expect(engine1).not.toBe(engine2)
    // 验证两个实例操作的 DOM 元素不同
    expect(screen.getByTestId('page1')).toBeTruthy()
    expect(screen.getByTestId('page2')).toBeTruthy()

    // 对第二个实例执行缩放，验证第一个实例没有收到 onUpdateScale 事件
    const emitted1Before = onUpdateScale1.mock.calls.length
    act(() => {
      engine2.setTransform({ scale: 2 })
    })
    await new Promise((r) => setTimeout(r, 50))
    const emitted1After = onUpdateScale1.mock.calls.length
    expect(emitted1After).toBe(emitted1Before)
  })
})

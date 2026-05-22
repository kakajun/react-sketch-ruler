import React, { useEffect, useRef, useState, useMemo } from 'react'
import { TransformEngine } from '@sketch-ruler/core'
import { InputManager } from '@sketch-ruler/canvas'
import leftImg from './left.png'
import middleImg from './middle.png'
import rightImg from './right.png'
import './Bigscreen.less'

const BigScreen = () => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const elemRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<TransformEngine | null>(null)
  const inputManagerRef = useRef<InputManager | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const [rectWidth, setRectWidth] = useState(window.innerWidth - 280)
  const [rectHeight, setRectHeight] = useState(window.innerHeight - 120)
  const [canvasWidth] = useState(3600)
  const [canvasHeight] = useState(1080)
  const [cursorClass, setCursorClass] = useState('')

  // Refs for values accessed in event listeners/callbacks to avoid stale closures
  const rectWidthRef = useRef(rectWidth)
  const rectHeightRef = useRef(rectHeight)
  const canvasWidthRef = useRef(canvasWidth)
  const canvasHeightRef = useRef(canvasHeight)

  // Sync refs with state
  useEffect(() => {
    rectWidthRef.current = rectWidth
    rectHeightRef.current = rectHeight
  }, [rectWidth, rectHeight])

  const paddingRatio = 0.1

  const rectStyle = useMemo(
    () => ({
      background: '#f6f7f9',
      width: `${rectWidth}px`,
      height: `${rectHeight}px`,
      overflow: 'hidden' as const
    }),
    [rectWidth, rectHeight]
  )

  const canvasStyle = useMemo(
    () => ({
      width: `${canvasWidth}px`,
      height: `${canvasHeight}px`
    }),
    [canvasWidth, canvasHeight]
  )

  /**
   * @desc: 居中算法
   * TransformEngine 以左上角为变换原点，平移量直接为像素偏移
   */
  const calculateTransform = () => {
    const rw = rectWidthRef.current
    const rh = rectHeightRef.current
    const cw = canvasWidthRef.current
    const ch = canvasHeightRef.current

    const scaleX = (rw * (1 - paddingRatio)) / cw
    const scaleY = (rh * (1 - paddingRatio)) / ch
    const scale = Math.min(scaleX, scaleY)

    const x = (rw - cw * scale) / 2
    const y = (rh - ch * scale) / 2

    return { scale, x, y }
  }

  const updateDimensions = () => {
    if (wrapperRef.current) {
      const newWidth = wrapperRef.current.clientWidth
      const newHeight = wrapperRef.current.clientHeight
      setRectWidth(newWidth)
      setRectHeight(newHeight)
      rectWidthRef.current = newWidth
      rectHeightRef.current = newHeight
      return { width: newWidth, height: newHeight }
    } else {
      const newWidth = window.innerWidth
      const newHeight = window.innerHeight
      setRectWidth(newWidth)
      setRectHeight(newHeight)
      rectWidthRef.current = newWidth
      rectHeightRef.current = newHeight
      return { width: newWidth, height: newHeight }
    }
  }

  const init = () => {
    updateDimensions()

    const engine = new TransformEngine(
      { x: 0, y: 0, scale: 1 },
      { minZoom: 0.01, maxZoom: 3, enableAnimation: false }
    )
    engineRef.current = engine

    const { scale, x, y } = calculateTransform()
    engine.setTransform({ scale, x, y })

    if (elemRef.current) {
      const inputManager = new InputManager(engine, {
        zoomStep: 0.25,
        zoomMode: 'pointer',
        viewportSize: { width: rectWidthRef.current, height: rectHeightRef.current },
        contentSize: { width: canvasWidthRef.current, height: canvasHeightRef.current },
        onCursorChange: (cls) => {
          setCursorClass(cls)
        }
      })
      inputManager.bind(elemRef.current)
      inputManagerRef.current = inputManager
    }

    unsubscribeRef.current = engine.onUpdate((state) => {
      if (elemRef.current) {
        elemRef.current.style.transform = `matrix(${state.scale}, 0, 0, ${state.scale}, ${state.x}, ${state.y})`
      }
    })
  }

  const onResize = () => {
    updateDimensions()
    const { scale, x, y } = calculateTransform()
    engineRef.current?.setTransform({ scale, x, y })
  }

  useEffect(() => {
    init()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      unsubscribeRef.current?.()
      inputManagerRef.current?.destroy()
      engineRef.current?.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="bigscreen_example" ref={wrapperRef}>
      <div className="description">
        说明: 该案例展示了如何在大屏(3600*1080)上使用 @sketch-ruler/core 的 TransformEngine,
        实现大屏的缩放(Ctrl + 鼠标滚轮)功能, 拖动(空白键+鼠标拖动)功能.方便前端分组件开发
      </div>
      <div className={`canvasedit-parent ${cursorClass}`} style={rectStyle}>
        <div className="canvasedit big-screen-demo" style={canvasStyle} ref={elemRef}>
          <div className="screen-item left">
            <img src={leftImg} alt="Left Screen" />
          </div>
          <div className="screen-item center">
            <img src={middleImg} alt="Center Screen" />
          </div>
          <div className="screen-item right">
            <img src={rightImg} alt="Right Screen" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BigScreen

import React, { useEffect, useRef, useState, useMemo } from 'react'
import Panzoom, { PanzoomObject, PanzoomEventDetail } from 'simple-panzoom'
import leftImg from './left.png'
import middleImg from './middle.png'
import rightImg from './right.png'
import './Bigscreen.less'

const BigScreen = () => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const elemRef = useRef<HTMLDivElement>(null)
  const panzoomInstance = useRef<PanzoomObject | null>(null)

  const [ownScale, setOwnScale] = useState(1)
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
  const zoomStartX = useRef(0)
  const zoomStartY = useRef(0)

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

  const handlePanzoomChange = (e: any) => {
    const { scale, dimsOut } = e.detail as PanzoomEventDetail
    if (dimsOut) {
      setOwnScale(scale)
    }
  }

  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey && panzoomInstance.current) {
      e.preventDefault()
      panzoomInstance.current.zoomWithWheel(e)
    }
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.code === 'Space' && !e.repeat && panzoomInstance.current) {
      e.preventDefault()
      setCursorClass('grab')
      panzoomInstance.current.setOptions({ disablePan: false, cursor: 'grab' })
    }
  }

  const handleKeyup = (e: KeyboardEvent) => {
    if (e.code === 'Space' && panzoomInstance.current) {
      setCursorClass('')
      panzoomInstance.current.setOptions({ disablePan: true, cursor: 'default' })
    }
  }

  const calculateTransform = () => {
    const rw = rectWidthRef.current
    const rh = rectHeightRef.current
    const cw = canvasWidthRef.current
    const ch = canvasHeightRef.current

    const scaleX = (rw * (1 - paddingRatio)) / cw
    const scaleY = (rh * (1 - paddingRatio)) / ch
    const scale = Math.min(scaleX, scaleY)

    zoomStartX.current = (rw - cw) / 2 / scale
    zoomStartY.current = (rh - ch) / 2 / scale

    return scale
  }

  const updateDimensions = () => {
    if (wrapperRef.current) {
      const newWidth = wrapperRef.current.clientWidth
      const newHeight = wrapperRef.current.clientHeight
      setRectWidth(newWidth)
      setRectHeight(newHeight)
      return { width: newWidth, height: newHeight }
    } else {
      const newWidth = window.innerWidth
      const newHeight = window.innerHeight
      setRectWidth(newWidth)
      setRectHeight(newHeight)
      return { width: newWidth, height: newHeight }
    }
  }

  const initPanzoom = () => {
    panzoomInstance.current?.destroy()

    const elem = elemRef.current
    if (elem) {
      const dims = updateDimensions()

      // Update refs immediately for calculation
      rectWidthRef.current = dims.width
      rectHeightRef.current = dims.height

      const scale = calculateTransform()
      console.log(scale, 'scale')

      panzoomInstance.current = Panzoom(elem, {
        startScale: scale,
        smoothScroll: true,
        canvas: true,
        disablePan: true,
        cursor: 'default',
        startX: zoomStartX.current,
        startY: zoomStartY.current
      })

      elem.addEventListener('panzoomchange', handlePanzoomChange as EventListener)
      if (elem.parentElement) {
        elem.parentElement.addEventListener('wheel', handleWheel, { passive: false })
      }
    }
  }

  const onResize = () => {
    const dims = updateDimensions()
    rectWidthRef.current = dims.width
    rectHeightRef.current = dims.height

    if (panzoomInstance.current) {
      const scale = calculateTransform()
      panzoomInstance.current.reset({
        startScale: scale,
        startX: zoomStartX.current,
        startY: zoomStartY.current,
        animate: false
      })
    }
  }

  useEffect(() => {
    initPanzoom()
    window.addEventListener('resize', onResize)
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('keyup', handleKeyup)

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keydown', handleKeydown)
      window.removeEventListener('keyup', handleKeyup)

      const elem = elemRef.current
      if (elem) {
        elem.removeEventListener('panzoomchange', handlePanzoomChange as EventListener)
        if (elem.parentElement) {
          elem.parentElement.removeEventListener('wheel', handleWheel as any)
        }
      }
      panzoomInstance.current?.destroy()
    }
  }, [])

  return (
    <div className="bigscreen_example" ref={wrapperRef}>
      <div className="description">
        说明: 该案例展示了如何在大屏(3600*1080)上使用simple-panzoom插件, 实现大屏的缩放(Ctrl +
        鼠标滚轮)功能, 拖动(空白键+鼠标拖动)功能.方便前端分组件开发
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

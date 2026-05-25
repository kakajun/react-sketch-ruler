import React, { useEffect, useRef, useState } from 'react'
import { TransformEngine } from '@sketch-ruler/core'
import { InputManager } from '@sketch-ruler/canvas'
import bgImg from '@/assets/8k.jpg'
import './EightK.less'

const EightK: React.FC = () => {
  const elemRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [rectWidth, setRectWidth] = useState(0)
  const [rectHeight, setRectHeight] = useState(0)
  const [cursorClass, setCursorClass] = useState('')
  const [isRemember, setIsRemember] = useState(false)

  const canvasWidth = 8800
  const canvasHeight = 5097
  const paddingRatio = 0.2

  const engineRef = useRef<TransformEngine | null>(null)
  const inputManagerRef = useRef<InputManager | null>(null)

  const updateDimensions = () => {
    if (wrapperRef.current) {
      setRectWidth(wrapperRef.current.clientWidth)
      setRectHeight(wrapperRef.current.clientHeight)
    } else {
      setRectWidth(window.innerWidth)
      setRectHeight(window.innerHeight)
    }
  }

  const calculateTransform = () => {
    const rw = wrapperRef.current?.clientWidth || window.innerWidth
    const rh = wrapperRef.current?.clientHeight || window.innerHeight
    const scaleX = (rw * (1 - paddingRatio)) / canvasWidth
    const scaleY = (rh * (1 - paddingRatio)) / canvasHeight
    const scale = Math.min(scaleX, scaleY)
    const x = (rw - canvasWidth * scale) / 2
    const y = (rh - canvasHeight * scale) / 2
    return { scale, x, y }
  }

  const init = () => {
    updateDimensions()
    let { scale, x, y } = calculateTransform()

    const savedRemember = localStorage.getItem('sketch-ruler-8k-remember')
    if (savedRemember === 'true') {
      setIsRemember(true)
      const savedState = localStorage.getItem('sketch-ruler-8k-state')
      if (savedState) {
        try {
          const state = JSON.parse(savedState)
          scale = Number(state.scale)
          x = Number(state.x)
          y = Number(state.y)
        } catch (e) {
          console.error('Failed to parse saved state', e)
        }
      }
    }

    engineRef.current?.setTransform({ scale, x, y })

    if (elemRef.current && engineRef.current) {
      inputManagerRef.current = new InputManager(engineRef.current, {
        zoomStep: 0.25,
        zoomMode: 'pointer',
        viewportSize: {
          width: rectWidth || window.innerWidth,
          height: rectHeight || window.innerHeight
        },
        contentSize: { width: canvasWidth, height: canvasHeight },
        onCursorChange: (cls) => setCursorClass(cls)
      })
      inputManagerRef.current.bind(elemRef.current)
    }
  }

  useEffect(() => {
    const engine = new TransformEngine(
      { x: 0, y: 0, scale: 1 },
      { minZoom: 0.01, maxZoom: 3, enableAnimation: false }
    )
    engineRef.current = engine

    const unsubscribe = engine.onUpdate((state) => {
      if (elemRef.current) {
        elemRef.current.style.transform = `matrix(${state.scale}, 0, 0, ${state.scale}, ${state.x}, ${state.y})`
      }
      if (isRemember) {
        localStorage.setItem('sketch-ruler-8k-state', JSON.stringify(state))
      }
    })

    init()
    window.addEventListener('resize', updateDimensions)

    return () => {
      window.removeEventListener('resize', updateDimensions)
      unsubscribe()
      inputManagerRef.current?.destroy()
      engine.destroy()
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('sketch-ruler-8k-remember', String(isRemember))
    if (!isRemember) {
      localStorage.removeItem('sketch-ruler-8k-state')
    }
  }, [isRemember])

  const rectStyle = {
    background: '#f6f7f9',
    width: `${rectWidth}px`,
    height: `${rectHeight}px`,
    overflow: 'hidden' as const
  }

  const canvasStyle = {
    width: `${canvasWidth}px`,
    height: `${canvasHeight}px`
  }

  return (
    <div className="eight-k-page wrapper" ref={wrapperRef}>
      <div className="description">
        说明: 该案例展示了大分辨率8K大屏(8800*5097)上使用 @sketch-ruler/core 的 TransformEngine,
        依然能做到上下左右居中正确
      </div>
      <div className="control-panel">
        <label style={{ cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isRemember}
            onChange={(e) => setIsRemember(e.target.checked)}
          />
          记住位置 (刷新页面后保持位置)
        </label>
      </div>
      <div className={`canvasedit-parent ${cursorClass}`} style={rectStyle}>
        <div className="canvasedit big-screen-demo" style={canvasStyle} ref={elemRef}>
          <img style={{ width: '100%', height: '100%' }} src={bgImg} alt="8K Screen" />
        </div>
      </div>
    </div>
  )
}

export default EightK

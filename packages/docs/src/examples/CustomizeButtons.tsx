import React, { useState, useRef, useEffect } from 'react'
import SketchRule from 'react-sketch-ruler'
import 'react-sketch-ruler/index.css'
import bgImg from '@/assets/bg.png'
import './Comprehensive.less'
import type { SketchRulerMethods } from 'react-sketch-ruler'

const CustomizeButtons: React.FC = () => {
  const sketchRef = useRef<SketchRulerMethods>(null)
  const [lockLine, setLockLine] = useState(false)
  const [isBlack, setIsBlack] = useState(false)
  const [scale, setScale] = useState(1)

  const [post, setPost] = useState({
    thick: 20,
    width: 1470,
    height: 800,
    canvasWidth: 1000,
    canvasHeight: 500,
    showRuler: true,
    isShowReferLine: true,
    shadow: {
      x: 0,
      y: 0,
      width: 300,
      height: 300
    },
    lines: {
      h: [0, 250],
      v: [0, 500]
    }
  })

  const cpuPalette = isBlack
    ? {
        bgColor: 'transparent',
        hoverBg: '#fff',
        hoverColor: '#000',
        tickColor: '#BABBBC',
        labelColor: '#DEDEDE',
        shadowColor: '#525252',
        guideLineColor: '#51d6a9',
        borderColor: '#B5B5B5'
      }
    : {
        bgColor: 'transparent',
        guideLineColor: '#51d6a9',
        guideLineStyle: 'dashed'
      }

  const rectStyle = {
    width: `${post.width}px`,
    height: `${post.height}px`
  }

  const canvasStyle = {
    width: `${post.canvasWidth}px`,
    height: `${post.canvasHeight}px`
  }

  const cpuScale = scale.toFixed(1)

  const resetMethod = () => sketchRef.current?.reset()
  const zoomOutMethod = () => sketchRef.current?.zoomOut()
  const changeTheme = () => setIsBlack((b) => !b)
  const changeShadow = () => {
    setPost((p) => ({
      ...p,
      shadow: {
        ...p.shadow,
        x: Math.random() * p.canvasWidth,
        y: Math.random() * p.canvasHeight
      }
    }))
  }

  const scaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setScale(val)
    sketchRef.current?.setTransform({ scale: val })
  }

  /* ========== 自定义输入事件（selfHandle=true 时需自行绑定） ========== */
  const isMiddleDragging = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      e.preventDefault()
      const engine = sketchRef.current?.engine
      if (!engine) return
      const parent = (e.currentTarget as HTMLElement)?.getBoundingClientRect()
      const originX = parent ? e.clientX - parent.left : e.clientX
      const originY = parent ? e.clientY - parent.top : e.clientY
      const delta = e.deltaY < 0 ? 1 : -1
      const currentScale = engine.getState().scale
      const toScale = currentScale * Math.exp((delta * 0.25) / 3)
      engine.zoomTo(toScale, originX, originY)
    }

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 1) return
      isMiddleDragging.current = true
      lastMouse.current = { x: e.clientX, y: e.clientY }
      e.preventDefault()
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (!isMiddleDragging.current) return
      const engine = sketchRef.current?.engine
      if (!engine) return
      const dx = e.clientX - lastMouse.current.x
      const dy = e.clientY - lastMouse.current.y
      engine.panBy(dx, dy)
      lastMouse.current = { x: e.clientX, y: e.clientY }
    }

    const handlePointerUp = (e: PointerEvent) => {
      if (e.button !== 1 || !isMiddleDragging.current) return
      isMiddleDragging.current = false
    }

    const parent = document.querySelector('.canvasedit-parent')
    if (parent) {
      parent.addEventListener('wheel', handleWheel as EventListener, { passive: false })
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)

    return () => {
      if (parent) {
        parent.removeEventListener('wheel', handleWheel as EventListener)
      }
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
    }
  }, [])

  return (
    <div className="demo">
      <div className="top font16">
        <div className="mr10">鼠标中键移动画布</div>
        <div className="scale mr10">{cpuScale}</div>
        <button
          className="mr10 font16"
          onClick={() => setPost((p) => ({ ...p, showRuler: !p.showRuler }))}
        >
          {(post.showRuler ? '隐藏' : '显示') + '标尺'}
        </button>
        <button
          className="mr10 font16"
          onClick={() => setPost((p) => ({ ...p, isShowReferLine: !p.isShowReferLine }))}
        >
          {(post.isShowReferLine ? '隐藏' : '显示') + '参考线'}
        </button>
        <button className="mr10 font16" onClick={() => setLockLine(true)}>
          锁定参考线
        </button>
        <button className="mr10 font16" onClick={changeShadow}>
          模拟阴影切换
        </button>
        <button className="mr10 font16" onClick={changeTheme}>
          主题切换
        </button>
        <button className="mr10 font16" onClick={resetMethod}>
          还原
        </button>
        <button className="mr10 font16" onClick={zoomOutMethod}>
          缩小
        </button>
        <input
          className="mr10 font16"
          type="range"
          min={0.3}
          max={3}
          step={0.1}
          value={scale}
          onChange={scaleChange}
        />
      </div>

      <div className={`wrapper ${isBlack ? 'blackwrapper' : 'whitewrapper'}`} style={rectStyle}>
        <SketchRule
          ref={sketchRef}
          scale={scale}
          lockLine={lockLine}
          width={post.width}
          height={post.height}
          canvasWidth={post.canvasWidth}
          canvasHeight={post.canvasHeight}
          thick={post.thick}
          palette={cpuPalette}
          showRuler={post.showRuler}
          isShowReferLine={post.isShowReferLine}
          lines={post.lines}
          shadow={post.shadow}
          selfHandle={true}
          onUpdateLines={(lines) => setPost((p) => ({ ...p, lines }))}
        >
          <div data-type="page" style={canvasStyle}>
            <img className="img-style" src={bgImg} alt="" />
          </div>
          <div slot="toolbar" className="btns">
            <button
              onClick={(e) => {
                e.stopPropagation()
                resetMethod()
              }}
            >
              还原
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                sketchRef.current?.zoomIn()
              }}
            >
              放大
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                zoomOutMethod()
              }}
            >
              缩小
            </button>
          </div>
        </SketchRule>
      </div>
    </div>
  )
}

export default CustomizeButtons

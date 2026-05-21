import React, { useState, useEffect, useRef, useMemo } from 'react'
import { SketchRule } from 'react-sketch-ruler'
import { Minimap, definePlugin } from 'react-sketch-ruler'
import type { SketchRulerMethods } from 'react-sketch-ruler'
import 'react-sketch-ruler/index.css'
import bgImg from '@/assets/bg.png'
import { Button, Input, Slider, Switch } from 'antd'
import './Comprehensive.less'
import { useTheme } from 'antd-style'

const logPlugin = definePlugin(() => ({
  name: 'log-plugin',
  priority: 5,
  beforeZoom(ctx: any) {
    console.log('[beforeZoom] 即将缩放', ctx.from, '->', ctx.to)
  },
  afterZoom(ctx: any) {
    console.log('[afterZoom] 缩放完成', ctx.from, '->', ctx.to)
  },
  beforePan(ctx: any) {
    console.log('[beforePan] 即将平移', 'delta:', ctx.delta)
  },
  afterPan(ctx: any) {
    console.log('[afterPan] 平移完成', 'offset:', ctx.offset)
  }
}))

const lineEventPlugin = definePlugin(() => ({
  name: 'line-event-plugin',
  priority: 3,
  onLineCreate(ctx: any) {
    console.log('[onLineCreate] 创建参考线', ctx.line.orientation, ctx.line.position)
  },
  onLineMove(ctx: any) {
    console.log('[onLineMove] 移动参考线', ctx.line.id, ctx.from, '->', ctx.to)
  },
  onLineDelete(ctx: any) {
    console.log('[onLineDelete] 删除参考线', ctx.line.id)
  }
}))

const zoomLimitPlugin = definePlugin(() => ({
  name: 'zoom-limit-plugin',
  priority: 10,
  beforeZoom(ctx: any) {
    if (ctx.to > 2.5) {
      console.warn('[zoomLimit] 超过 2.5 上限，取消缩放')
      ctx.cancel()
    }
  }
}))

const stateWatcherPlugin = definePlugin(() => ({
  name: 'state-watcher-plugin',
  priority: 1,
  afterZoom(ctx: any) {
    const { scale, offset, lines } = ctx.api.getState()
    console.log('[stateWatcher] afterZoom 状态快照:', { scale, offset, linesCount: lines.length })
  },
  afterPan(ctx: any) {
    const { scale, offset } = ctx.api.getState()
    console.log('[stateWatcher] afterPan 状态快照:', { scale, offset })
  }
}))

const plugins = [logPlugin(), lineEventPlugin(), zoomLimitPlugin(), stateWatcherPlugin()]

const Comprehensive: React.FC = () => {
  const { appearance } = useTheme()
  const sketchRef = useRef<SketchRulerMethods>(null)
  const [lockLine, setLockLine] = useState(false)
  const [zoomMode, setZoomMode] = useState<'pointer' | 'viewport-center' | 'content-center'>(
    'pointer'
  )
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 })

  const [post, setPost] = useState({
    thick: 20,
    width: 1470,
    height: 750,
    canvasWidth: 1920,
    canvasHeight: 1080,
    showRuler: true,
    showMinorTicks: false,
    isShowReferLine: true,
    zoomStep: 0.25,
    minZoom: 0.1,
    maxZoom: 3,
    snapThreshold: 5,
    lines: {
      h: [0, 250],
      v: [0, 500]
    },
    shadow: {
      x: 0,
      y: 0,
      width: 300,
      height: 300
    }
  })

  const [state, setState] = useState({ scale: 1 })
  const [isBlack, setIsBlack] = useState(false)

  useEffect(() => {
    setIsBlack(appearance !== 'light')
  }, [appearance])

  const cpuPalette = useMemo(() => {
    return isBlack
      ? {
          bgColor: 'transparent',
          tickColor: '#BABBBC',
          labelColor: '#DEDEDE',
          guideLineColor: '#51d6a9',
          guideLineLockedColor: '#d4d7dc',
          hoverBg: '#fff',
          hoverColor: '#000',
          borderColor: '#B5B5B5',
          shadowColor: '#525252'
        }
      : {
          bgColor: 'transparent',
          guideLineColor: '#51d6a9'
        }
  }, [isBlack])

  const rectStyle = useMemo(
    () => ({
      width: `${post.width}px`,
      height: `${post.height}px`
    }),
    [post.width, post.height]
  )

  const canvasStyle = useMemo(
    () => ({
      width: `${post.canvasWidth}px`,
      height: `${post.canvasHeight}px`
    }),
    [post.canvasWidth, post.canvasHeight]
  )

  const cpuScale = state.scale.toFixed(1)

  const resetMethod = () => sketchRef.current?.reset()
  const zoomOutMethod = () => sketchRef.current?.zoomOut()
  const zoomInMethod = () => sketchRef.current?.zoomIn()

  const handleZoomChange = (detail: { scale: number; x: number; y: number }) => {
    setViewportOffset({ x: detail.x, y: detail.y })
  }

  const handleLinesChange = (lines: { h: number[]; v: number[] }) => {
    setPost((prev) => ({ ...prev, lines }))
  }

  const handleCornerClick = (e: boolean) => {
    console.log('handleCornerClick', e)
  }

  const changeShadow = () => {
    setPost((prev) => ({
      ...prev,
      shadow: {
        ...prev.shadow,
        x: Math.random() * prev.canvasWidth,
        y: Math.random() * prev.canvasHeight
      }
    }))
  }

  const toggleZoomMode = () => {
    const modes: Array<'pointer' | 'viewport-center' | 'content-center'> = [
      'pointer',
      'viewport-center',
      'content-center'
    ]
    const idx = modes.indexOf(zoomMode)
    const next = modes[(idx + 1) % modes.length]
    setZoomMode(next)
    sketchRef.current?.setZoomMode(next)
  }

  const scaleChange = (value: number) => {
    setState({ scale: value })
    sketchRef.current?.setTransform({ scale: value })
  }

  const handleNavigate = (x: number, y: number) => {
    sketchRef.current?.setTransform({ x, y })
  }

  const handleDragStart = () => {
    const engine = sketchRef.current?.engine
    if (engine) {
      ;(engine as any).enableAnimation = false
    }
  }

  const handleDragEnd = () => {
    const engine = sketchRef.current?.engine
    if (engine) {
      ;(engine as any).enableAnimation = true
    }
  }

  return (
    <div className="demo">
      <div className="top font16">
        <div className="mr10">Ctrl+鼠标滚轮缩放画布</div>
        <div className="mr10">空白键+鼠标左键键移动画布</div>
        <div className="scale mr10">缩放比:{cpuScale}</div>
        <div className="scale mr10">参考线:{JSON.stringify(post.lines)}</div>
      </div>
      <div className="top font16">
        <button
          className="mr10 font16"
          onClick={() => setPost((p) => ({ ...p, showRuler: !p.showRuler }))}
        >
          {(post.showRuler ? '隐藏' : '显示') + '规尺'}
        </button>
        <button
          className="mr10 font16"
          onClick={() => setPost((p) => ({ ...p, isShowReferLine: !p.isShowReferLine }))}
        >
          {(post.isShowReferLine ? '隐藏' : '显示') + '参考线'}
        </button>
        <button
          className="mr10 font16"
          onClick={() => setPost((p) => ({ ...p, showMinorTicks: !p.showMinorTicks }))}
        >
          {(post.showMinorTicks ? '隐藏' : '显示') + '次刻度'}
        </button>
        <button className="mr10 font16" onClick={() => setLockLine((l) => !l)}>
          {lockLine ? '解锁' : '锁定'}参考线
        </button>
        <button className="mr10 font16" onClick={toggleZoomMode}>
          {zoomMode === 'pointer' ? '鼠标' : zoomMode === 'viewport-center' ? '视口' : '内容'}
        </button>
        <button className="mr10 font16" onClick={changeShadow}>
          模拟阴影切换
        </button>
        <button className="mr10 font16" onClick={resetMethod}>
          还原
        </button>
        <button className="mr10 font16" onClick={zoomOutMethod}>
          缩小
        </button>
        <span className="mr10 font16">步长:{post.zoomStep}</span>
        <input
          className="mr10 font16"
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={post.zoomStep}
          onChange={(e) => setPost((p) => ({ ...p, zoomStep: Number(e.target.value) }))}
          style={{ width: 80 }}
        />
        <span className="mr10 font16">
          范围:{post.minZoom}~{post.maxZoom}
        </span>
        <span className="mr10 font16">吸附:{post.snapThreshold}px</span>
        <input
          className="mr10 font16"
          type="range"
          min={0}
          max={20}
          step={1}
          value={post.snapThreshold}
          onChange={(e) => setPost((p) => ({ ...p, snapThreshold: Number(e.target.value) }))}
          style={{ width: 80 }}
        />
        <input
          className="mr10 font16"
          type="range"
          min={0.3}
          max={3}
          step={0.1}
          value={state.scale}
          onChange={(e) => scaleChange(Number(e.target.value))}
        />
      </div>

      <div className={`wrapper ${isBlack ? 'blackwrapper' : 'whitewrapper'}`} style={rectStyle}>
        <SketchRule
          ref={sketchRef}
          scale={state.scale}
          lockLine={lockLine}
          width={post.width}
          height={post.height}
          canvasWidth={post.canvasWidth}
          canvasHeight={post.canvasHeight}
          thick={post.thick}
          palette={cpuPalette}
          showRuler={post.showRuler}
          showMinorTicks={post.showMinorTicks}
          isShowReferLine={post.isShowReferLine}
          lines={post.lines}
          shadow={post.shadow}
          enableAnimation={true}
          animationMode="ease-out"
          zoomMode={zoomMode}
          zoomStep={post.zoomStep}
          minZoom={post.minZoom}
          maxZoom={post.maxZoom}
          snapThreshold={post.snapThreshold}
          plugins={plugins}
          onZoomChange={handleZoomChange}
          onUpdateLines={handleLinesChange}
          onHandleCornerClick={handleCornerClick}
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
                zoomInMethod()
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

        <div className="demo-minimap">
          <Minimap
            contentWidth={post.canvasWidth}
            contentHeight={post.canvasHeight}
            viewportX={viewportOffset.x}
            viewportY={viewportOffset.y}
            viewportWidth={post.width}
            viewportHeight={post.height}
            scale={state.scale}
            width={200}
            height={150}
            onNavigate={handleNavigate}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        </div>
      </div>
    </div>
  )
}

export default Comprehensive

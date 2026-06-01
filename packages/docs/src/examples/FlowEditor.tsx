import React, { useRef, useState, useEffect } from 'react'
import { TransformEngine } from '@sketch-ruler/core'
import { InputManager } from '@sketch-ruler/canvas'
import './FlowEditor.less'

interface FlowNode {
  id: string
  x: number
  y: number
  w: number
  h: number
  label: string
  color: string
  type: 'start' | 'process' | 'decision' | 'end'
}

interface FlowEdge {
  from: string
  to: string
  label?: string
}

const FlowEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasWrapperRef = useRef<HTMLDivElement>(null)

  const [scale, setScale] = useState(1)
  const [cursorClass, setCursorClass] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedIdRef = useRef(selectedId)
  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])

  const nodesRef = useRef<FlowNode[]>([
    { id: 'start', x: 100, y: 240, w: 100, h: 50, label: '开始', color: '#67c23a', type: 'start' },
    { id: 'process1', x: 300, y: 240, w: 130, h: 50, label: '数据校验', color: '#409eff', type: 'process' },
    { id: 'decision', x: 550, y: 230, w: 130, h: 70, label: '是否通过?', color: '#e6a23c', type: 'decision' },
    { id: 'process2', x: 550, y: 420, w: 130, h: 50, label: '人工审核', color: '#409eff', type: 'process' },
    { id: 'end', x: 820, y: 240, w: 100, h: 50, label: '结束', color: '#f56c6c', type: 'end' }
  ])

  const edgesRef = useRef<FlowEdge[]>([
    { from: 'start', to: 'process1' },
    { from: 'process1', to: 'decision' },
    { from: 'decision', to: 'end', label: '是' },
    { from: 'decision', to: 'process2', label: '否' },
    { from: 'process2', to: 'end' }
  ])

  const engineRef = useRef<TransformEngine | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrapper = canvasWrapperRef.current
    if (!canvas || !wrapper) return

    let rectWidth = 0
    let rectHeight = 0

    const engine = new TransformEngine(
      { x: 0, y: 0, scale: 1 },
      { minZoom: 0.1, maxZoom: 5, enableAnimation: false }
    )
    engineRef.current = engine

    let inputManager: InputManager | null = null
    let unsubscribe: (() => void) | null = null

    const nodes = nodesRef.current
    const edges = edgesRef.current

    let dragNode: FlowNode | null = null
    let dragOffset = { x: 0, y: 0 }
    let isSpacePressed = false

    const updateDimensions = () => {
      rectWidth = wrapper.clientWidth
      rectHeight = wrapper.clientHeight
      canvas.width = rectWidth
      canvas.height = rectHeight
    }

    const calculateInitialTransform = () => {
      const contentW = 960
      const contentH = 520
      const s = Math.min((rectWidth * 0.85) / contentW, (rectHeight * 0.85) / contentH)
      return {
        scale: s,
        x: (rectWidth - contentW * s) / 2,
        y: (rectHeight - contentH * s) / 2
      }
    }

    const getMousePos = (e: MouseEvent) => {
      return {
        screenX: e.offsetX,
        screenY: e.offsetY
      }
    }

    const hitTest = (worldX: number, worldY: number): FlowNode | null => {
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i]
        if (worldX >= n.x && worldX <= n.x + n.w && worldY >= n.y && worldY <= n.y + n.h) {
          return n
        }
      }
      return null
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      if (isSpacePressed) return
      e.stopPropagation()

      const { screenX, screenY } = getMousePos(e)
      const world = engine.toWorldPoint(screenX, screenY)
      const node = hitTest(world.x, world.y)

      if (node) {
        dragNode = node
        dragOffset = { x: world.x - node.x, y: world.y - node.y }
        setSelectedId(node.id)
        draw()
      } else {
        setSelectedId(null)
        draw()
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragNode) return
      const { screenX, screenY } = getMousePos(e)
      const world = engine.toWorldPoint(screenX, screenY)
      dragNode.x = world.x - dragOffset.x
      dragNode.y = world.y - dragOffset.y
      draw()
    }

    const handleMouseUp = () => {
      dragNode = null
    }

    const boundHandleMouseUp = handleMouseUp.bind(null)

    const drawGrid = (ctx: CanvasRenderingContext2D) => {
      const step = 50
      const minorStep = 10

      const topLeft = engine.toWorldPoint(0, 0)
      const bottomRight = engine.toWorldPoint(rectWidth, rectHeight)

      const startX = Math.floor(topLeft.x / minorStep) * minorStep
      const startY = Math.floor(topLeft.y / minorStep) * minorStep
      const endX = Math.ceil(bottomRight.x / minorStep) * minorStep
      const endY = Math.ceil(bottomRight.y / minorStep) * minorStep

      const maxLines = 300
      const hCount = Math.ceil((endX - startX) / minorStep)
      const vCount = Math.ceil((endY - startY) / minorStep)

      if (hCount > maxLines || vCount > maxLines) {
        const mainStartX = Math.floor(topLeft.x / step) * step
        const mainStartY = Math.floor(topLeft.y / step) * step
        const mainEndX = Math.ceil(bottomRight.x / step) * step
        const mainEndY = Math.ceil(bottomRight.y / step) * step

        ctx.strokeStyle = '#d0d0d0'
        ctx.lineWidth = 1

        for (let x = mainStartX; x <= mainEndX; x += step) {
          ctx.beginPath()
          ctx.moveTo(x, mainStartY)
          ctx.lineTo(x, mainEndY)
          ctx.stroke()
        }

        for (let y = mainStartY; y <= mainEndY; y += step) {
          ctx.beginPath()
          ctx.moveTo(mainStartX, y)
          ctx.lineTo(mainEndX, y)
          ctx.stroke()
        }
        return
      }

      ctx.strokeStyle = '#eaeaea'
      ctx.lineWidth = 1
      for (let x = startX; x <= endX; x += minorStep) {
        ctx.beginPath()
        ctx.moveTo(x, startY)
        ctx.lineTo(x, endY)
        ctx.stroke()
      }
      for (let y = startY; y <= endY; y += minorStep) {
        ctx.beginPath()
        ctx.moveTo(startX, y)
        ctx.lineTo(endX, y)
        ctx.stroke()
      }

      ctx.strokeStyle = '#d0d0d0'
      ctx.lineWidth = 1.5
      for (let x = startX; x <= endX; x += step) {
        ctx.beginPath()
        ctx.moveTo(x, startY)
        ctx.lineTo(x, endY)
        ctx.stroke()
      }
      for (let y = startY; y <= endY; y += step) {
        ctx.beginPath()
        ctx.moveTo(startX, y)
        ctx.lineTo(endX, y)
        ctx.stroke()
      }
    }

    const drawNode = (ctx: CanvasRenderingContext2D, node: FlowNode) => {
      const r = 6
      const isSelected = selectedIdRef.current === node.id

      ctx.save()

      if (isSelected) {
        ctx.shadowColor = 'rgba(64, 158, 255, 0.5)'
        ctx.shadowBlur = 12
      }

      ctx.fillStyle = node.color
      ctx.beginPath()
      ;(ctx as any).roundRect(node.x, node.y, node.w, node.h, r)
      ctx.fill()

      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0

      ctx.strokeStyle = isSelected ? '#409eff' : '#fff'
      ctx.lineWidth = isSelected ? 2.5 : 1.5
      ctx.stroke()

      ctx.fillStyle = '#fff'
      ctx.font = `bold ${14}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node.label, node.x + node.w / 2, node.y + node.h / 2)

      ctx.restore()
    }

    const drawEdge = (ctx: CanvasRenderingContext2D, edge: FlowEdge) => {
      const from = nodes.find((n) => n.id === edge.from)
      const to = nodes.find((n) => n.id === edge.to)
      if (!from || !to) return

      const x1 = from.x + from.w
      const y1 = from.y + from.h / 2
      const x2 = to.x
      const y2 = to.y + to.h / 2

      const cp1x = x1 + (x2 - x1) * 0.5
      const cp1y = y1
      const cp2x = x2 - (x2 - x1) * 0.5
      const cp2y = y2

      ctx.save()
      ctx.strokeStyle = '#909399'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2)
      ctx.stroke()

      const arrowSize = 8
      const angle = Math.atan2(y2 - cp2y, x2 - cp2x)
      ctx.fillStyle = '#909399'
      ctx.beginPath()
      ctx.moveTo(x2, y2)
      ctx.lineTo(x2 - arrowSize * Math.cos(angle - Math.PI / 6), y2 - arrowSize * Math.sin(angle - Math.PI / 6))
      ctx.lineTo(x2 - arrowSize * Math.cos(angle + Math.PI / 6), y2 - arrowSize * Math.sin(angle + Math.PI / 6))
      ctx.closePath()
      ctx.fill()

      if (edge.label) {
        const mx = (x1 + x2) / 2
        const my = (y1 + y2) / 2 - 8
        ctx.fillStyle = '#606266'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillText(edge.label, mx, my)
      }

      ctx.restore()
    }

    const draw = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const state = engine.getState()
      setScale(state.scale)

      ctx.clearRect(0, 0, rectWidth, rectHeight)

      ctx.save()
      ctx.setTransform(state.scale, 0, 0, state.scale, state.x, state.y)

      drawGrid(ctx)

      edges.forEach((edge) => drawEdge(ctx, edge))
      nodes.forEach((node) => drawNode(ctx, node))

      ctx.restore()
    }

    const init = () => {
      updateDimensions()
      const { scale, x, y } = calculateInitialTransform()
      engine.setTransform({ scale, x, y })

      inputManager = new InputManager(engine, {
        zoomStep: 0.25,
        zoomMode: 'pointer',
        viewportSize: { width: rectWidth, height: rectHeight },
        contentSize: { width: 960, height: 520 },
        onCursorChange: (cls) => {
          setCursorClass(cls)
        }
      })
      inputManager.bind(canvas)

      canvas.addEventListener('mousedown', handleMouseDown)
      canvas.addEventListener('mousemove', handleMouseMove)
      canvas.addEventListener('mouseup', handleMouseUp)
      canvas.addEventListener('mouseleave', handleMouseUp)
      document.addEventListener('mouseup', boundHandleMouseUp)
      document.addEventListener('keydown', (e) => { if (e.key === ' ') isSpacePressed = true })
      document.addEventListener('keyup', (e) => { if (e.key === ' ') isSpacePressed = false })
    }

    const onResize = () => {
      updateDimensions()
      draw()
    }

    unsubscribe = engine.onUpdate(() => {
      draw()
    })

    init()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      unsubscribe?.()
      inputManager?.destroy()
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseUp)
      document.removeEventListener('mouseup', boundHandleMouseUp)
      engine.destroy()
    }
  }, [])

  const selectedNode = nodesRef.current.find((n) => n.id === selectedId) ?? null

  return (
    <div className="flow-wrapper">
      <div className="flow-description">
        说明：该案例展示了如何在流程编辑器中直接使用 @sketch-ruler/core 的 TransformEngine
        与 @sketch-ruler/canvas 的 InputManager，实现画布的缩放（Ctrl + 滚轮）与平移（空格 +
        鼠标拖动），并在 Canvas 2D 上绘制可拖拽的流程节点与连线。
      </div>
      <div className={`flow-canvas-wrapper ${cursorClass}`} ref={canvasWrapperRef}>
        <canvas ref={canvasRef} />
        <div className="flow-hud">
          <span>缩放: {(scale * 100).toFixed(0)}%</span>
          {selectedId && <span>选中: {selectedNode?.label}</span>}
        </div>
      </div>
    </div>
  )
}

export default FlowEditor

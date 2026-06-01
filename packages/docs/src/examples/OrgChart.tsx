import React, { useRef, useState, useEffect } from 'react'
import { TransformEngine } from '@sketch-ruler/core'
import { InputManager } from '@sketch-ruler/canvas'
import './OrgChart.less'

type OrgType = 'person' | 'department'

interface OrgNode {
  id: string
  x: number
  y: number
  w: number
  h: number
  label: string
  role?: string
  type: OrgType
  color: string
}

interface OrgEdge {
  from: string
  to: string
}

const OrgChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasWrapperRef = useRef<HTMLDivElement>(null)

  const [scale, setScale] = useState(1)
  const [cursorClass, setCursorClass] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedIdRef = useRef(selectedId)
  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])

  const nodesRef = useRef<OrgNode[]>([
    { id: 'ceo', x: 400, y: 40, w: 140, h: 60, label: '王总', role: 'CEO', type: 'person', color: '#1e3a5f' },
    { id: 'cto', x: 160, y: 190, w: 140, h: 55, label: '李工', role: '技术 VP', type: 'person', color: '#2e5e8e' },
    { id: 'cpo', x: 400, y: 190, w: 140, h: 55, label: '张产品', role: '产品 VP', type: 'person', color: '#2e5e8e' },
    { id: 'cdo', x: 640, y: 190, w: 140, h: 55, label: '刘设计', role: '设计 VP', type: 'person', color: '#2e5e8e' },
    { id: 'fe', x: 60, y: 340, w: 120, h: 50, label: '前端组', type: 'department', color: '#4a90c6' },
    { id: 'be', x: 200, y: 340, w: 120, h: 50, label: '后端组', type: 'department', color: '#4a90c6' },
    { id: 'qa', x: 130, y: 440, w: 120, h: 50, label: '测试组', type: 'department', color: '#4a90c6' },
    { id: 'pd1', x: 340, y: 340, w: 120, h: 50, label: '产品一部', type: 'department', color: '#4a90c6' },
    { id: 'pd2', x: 480, y: 340, w: 120, h: 50, label: '产品二部', type: 'department', color: '#4a90c6' },
    { id: 'ui', x: 600, y: 340, w: 120, h: 50, label: 'UI 组', type: 'department', color: '#4a90c6' },
    { id: 'ux', x: 740, y: 340, w: 120, h: 50, label: 'UX 组', type: 'department', color: '#4a90c6' }
  ])

  const edgesRef = useRef<OrgEdge[]>([
    { from: 'ceo', to: 'cto' },
    { from: 'ceo', to: 'cpo' },
    { from: 'ceo', to: 'cdo' },
    { from: 'cto', to: 'fe' },
    { from: 'cto', to: 'be' },
    { from: 'cto', to: 'qa' },
    { from: 'cpo', to: 'pd1' },
    { from: 'cpo', to: 'pd2' },
    { from: 'cdo', to: 'ui' },
    { from: 'cdo', to: 'ux' }
  ])

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

    let inputManager: InputManager | null = null
    let unsubscribe: (() => void) | null = null

    const nodes = nodesRef.current
    const edges = edgesRef.current

    let dragNode: OrgNode | null = null
    let dragOffset = { x: 0, y: 0 }
    let isSpacePressed = false

    const updateDimensions = () => {
      rectWidth = wrapper.clientWidth
      rectHeight = wrapper.clientHeight
      canvas.width = rectWidth
      canvas.height = rectHeight
    }

    const calculateInitialTransform = () => {
      const contentW = 920
      const contentH = 560
      const s = Math.min((rectWidth * 0.88) / contentW, (rectHeight * 0.88) / contentH)
      return {
        scale: s,
        x: (rectWidth - contentW * s) / 2,
        y: (rectHeight - contentH * s) / 2 + 10
      }
    }

    const getMousePos = (e: MouseEvent) => ({
      screenX: e.offsetX,
      screenY: e.offsetY
    })

    const hitTest = (worldX: number, worldY: number): OrgNode | null => {
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
        ctx.strokeStyle = '#e0e0e0'
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

      ctx.strokeStyle = '#f0f0f0'
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

      ctx.strokeStyle = '#e0e0e0'
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

    const drawNode = (ctx: CanvasRenderingContext2D, node: OrgNode) => {
      const { x, y, w, h, label, role, type, color } = node
      const isSelected = selectedIdRef.current === node.id
      const r = type === 'person' ? 8 : 4

      ctx.save()

      if (isSelected) {
        ctx.shadowColor = 'rgba(64, 158, 255, 0.45)'
        ctx.shadowBlur = 14
      }

      ctx.fillStyle = color
      ctx.strokeStyle = isSelected ? '#409eff' : '#fff'
      ctx.lineWidth = isSelected ? 2.5 : 1.5
      ctx.beginPath()
      ;(ctx as any).roundRect(x, y, w, h, r)
      ctx.fill()
      ctx.stroke()

      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0

      if (type === 'person') {
        const avatarR = 14
        const avatarX = x + 28
        const avatarY = y + h / 2
        ctx.fillStyle = 'rgba(255,255,255,0.25)'
        ctx.beginPath()
        ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'
        ctx.lineWidth = 1.5
        ctx.stroke()

        ctx.fillStyle = '#fff'
        ctx.font = `bold ${13}px sans-serif`
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, x + 52, y + h / 2 - 7)

        ctx.fillStyle = 'rgba(255,255,255,0.85)'
        ctx.font = `11px sans-serif`
        ctx.fillText(role || '', x + 52, y + h / 2 + 9)
      } else {
        ctx.fillStyle = '#fff'
        ctx.font = `bold ${13}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, x + w / 2, y + h / 2)
      }

      ctx.restore()
    }

    const drawArrow = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
      const arrowSize = 6
      ctx.fillStyle = '#b0b0b0'
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - arrowSize * Math.cos(angle - Math.PI / 6), y - arrowSize * Math.sin(angle - Math.PI / 6))
      ctx.lineTo(x - arrowSize * Math.cos(angle + Math.PI / 6), y - arrowSize * Math.sin(angle + Math.PI / 6))
      ctx.closePath()
      ctx.fill()
    }

    const drawEdges = (ctx: CanvasRenderingContext2D) => {
      const parentMap = new Map<string, string[]>()
      edges.forEach((e) => {
        if (!parentMap.has(e.from)) parentMap.set(e.from, [])
        parentMap.get(e.from)!.push(e.to)
      })

      ctx.save()
      ctx.strokeStyle = '#b0b0b0'
      ctx.lineWidth = 1.8
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      parentMap.forEach((childrenIds, parentId) => {
        const parent = nodes.find((n) => n.id === parentId)
        if (!parent) return
        const children = childrenIds
          .map((id) => nodes.find((n) => n.id === id))
          .filter(Boolean) as OrgNode[]
        if (children.length === 0) return

        const px = parent.x + parent.w / 2
        const py = parent.y + parent.h

        if (children.length === 1) {
          const child = children[0]
          const cx = child.x + child.w / 2
          const cy = child.y
          const midY = (py + cy) / 2
          ctx.beginPath()
          ctx.moveTo(px, py)
          ctx.lineTo(px, midY)
          ctx.lineTo(cx, midY)
          ctx.lineTo(cx, cy)
          ctx.stroke()
          drawArrow(ctx, cx, cy, Math.PI / 2)
          return
        }

        const cxs = children.map((c) => c.x + c.w / 2)
        const minCx = Math.min(...cxs)
        const maxCx = Math.max(...cxs)
        const minCy = Math.min(...children.map((c) => c.y))
        const midY = (py + minCy) / 2

        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(px, midY)
        ctx.lineTo(minCx, midY)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(minCx, midY)
        ctx.lineTo(maxCx, midY)
        ctx.stroke()

        children.forEach((child) => {
          const cx = child.x + child.w / 2
          const cy = child.y
          ctx.beginPath()
          ctx.moveTo(cx, midY)
          ctx.lineTo(cx, cy)
          ctx.stroke()
          drawArrow(ctx, cx, cy, Math.PI / 2)
        })
      })

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
      drawEdges(ctx)
      nodes.forEach((node) => drawNode(ctx, node))

      ctx.restore()
    }

    const init = () => {
      updateDimensions()
      const { scale, x, y } = calculateInitialTransform()
      engine.setTransform({ scale, x, y })

      inputManager = new InputManager(engine, {
        zoomStep: 0.2,
        zoomMode: 'pointer',
        viewportSize: { width: rectWidth, height: rectHeight },
        contentSize: { width: 920, height: 560 },
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
    <div className="org-wrapper">
      <div className="org-description">
        说明：该案例展示了如何在组织架构图中直接使用 @sketch-ruler/core 的 TransformEngine
        与 @sketch-ruler/canvas 的 InputManager，实现画布的缩放（Ctrl + 滚轮）与平移（空格 +
        鼠标拖动），并在 Canvas 2D 上绘制层级组织架构，节点可拖拽、连线采用正交折线。
      </div>
      <div className="org-toolbar">
        {selectedNode && (
          <div className="org-info">
            <span className="org-info-label">选中:</span>
            <span className="org-info-value">
              {selectedNode.label} ({selectedNode.role || selectedNode.type})
            </span>
          </div>
        )}
        <div className="org-spacer" />
        <div className="org-hud-inline">
          <span>缩放: {(scale * 100).toFixed(0)}%</span>
        </div>
      </div>
      <div className={`org-canvas-wrapper ${cursorClass}`} ref={canvasWrapperRef}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}

export default OrgChart

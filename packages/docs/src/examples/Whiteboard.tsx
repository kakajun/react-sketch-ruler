import React, { useRef, useState, useEffect } from 'react'
import { TransformEngine } from '@sketch-ruler/core'
import { InputManager } from '@sketch-ruler/canvas'
import './Whiteboard.less'

interface Point {
  x: number
  y: number
}

type ElementType = 'rect' | 'ellipse' | 'line' | 'freedraw' | 'text'

interface BaseElement {
  id: string
  type: ElementType
  x: number
  y: number
  w: number
  h: number
  color: string
  strokeWidth: number
  selected: boolean
}

interface FreedrawElement extends BaseElement {
  type: 'freedraw'
  points: Point[]
}

interface TextElement extends BaseElement {
  type: 'text'
  text: string
}

interface LineElement extends BaseElement {
  type: 'line'
}

interface RectElement extends BaseElement {
  type: 'rect'
}

interface EllipseElement extends BaseElement {
  type: 'ellipse'
}

type Element = RectElement | EllipseElement | LineElement | FreedrawElement | TextElement

type Tool = 'select' | 'freedraw' | 'rect' | 'ellipse' | 'line' | 'text'

const tools = [
  { id: 'select' as Tool, label: '选择' },
  { id: 'freedraw' as Tool, label: '手绘' },
  { id: 'rect' as Tool, label: '矩形' },
  { id: 'ellipse' as Tool, label: '圆形' },
  { id: 'line' as Tool, label: '直线' },
  { id: 'text' as Tool, label: '文本' }
]

const toolIcons: Record<Tool, string> = {
  select:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>',
  freedraw:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>',
  rect:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>',
  ellipse:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/></svg>',
  line:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="19" x2="19" y2="5"/></svg>',
  text:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V5h16v2M9 20h6M12 5v15"/></svg>'
}

const colors = ['#333333', '#e03131', '#2f9e44', '#1971c2', '#f08c00', '#9c36b5']

const defaultElements = (): Element[] => [
  {
    id: 'el-1',
    type: 'text',
    x: -280,
    y: -200,
    w: 0,
    h: 0,
    text: 'react-sketch-ruler 无限白板',
    color: '#333333',
    strokeWidth: 0,
    selected: false
  },
  {
    id: 'el-2',
    type: 'rect',
    x: -260,
    y: -120,
    w: 180,
    h: 120,
    color: '#1971c2',
    strokeWidth: 2,
    selected: false
  },
  {
    id: 'el-3',
    type: 'ellipse',
    x: 40,
    y: -120,
    w: 160,
    h: 120,
    color: '#2f9e44',
    strokeWidth: 2,
    selected: false
  },
  {
    id: 'el-4',
    type: 'line',
    x: -260,
    y: 80,
    w: 240,
    h: 140,
    color: '#f08c00',
    strokeWidth: 2,
    selected: false
  },
  {
    id: 'el-5',
    type: 'freedraw',
    x: 20,
    y: 60,
    w: 180,
    h: 60,
    points: [
      { x: 20, y: 120 },
      { x: 50, y: 70 },
      { x: 80, y: 120 },
      { x: 110, y: 70 },
      { x: 140, y: 120 },
      { x: 170, y: 70 },
      { x: 200, y: 120 }
    ],
    color: '#9c36b5',
    strokeWidth: 2,
    selected: false
  },
  {
    id: 'el-6',
    type: 'ellipse',
    x: -80,
    y: 200,
    w: 200,
    h: 100,
    color: '#e03131',
    strokeWidth: 2,
    selected: false
  },
  {
    id: 'el-7',
    type: 'text',
    x: -60,
    y: 235,
    w: 0,
    h: 0,
    text: 'Ctrl+滚轮缩放  空格拖拽',
    color: '#333333',
    strokeWidth: 0,
    selected: false
  }
]

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasWrapperRef = useRef<HTMLDivElement>(null)

  const [scale, setScale] = useState(1)
  const [cursorClass, setCursorClass] = useState('')
  const [tool, setTool] = useState<Tool>('select')
  const [currentColor, setCurrentColor] = useState('#333333')

  const toolRef = useRef(tool)
  useEffect(() => {
    toolRef.current = tool
  }, [tool])

  const currentColorRef = useRef(currentColor)
  useEffect(() => {
    currentColorRef.current = currentColor
  }, [currentColor])

  const elementsRef = useRef<Element[]>(defaultElements())
  const [elementCount, setElementCount] = useState(elementsRef.current.length)

  const clearAllRef = useRef<() => void>()

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

    let idCounter = 7
    const generateId = () => `el-${++idCounter}`

    interface DragState {
      type: 'move' | 'create'
      el?: Element
      offsetX?: number
      offsetY?: number
      startX?: number
      startY?: number
    }

    let dragState: DragState | null = null
    let isSpacePressed = false

    const getMousePos = (e: MouseEvent) => ({
      screenX: e.offsetX,
      screenY: e.offsetY
    })

    function distToSegment(p: Point, v: Point, w: Point): number {
      const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2
      if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y)
      let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2
      t = Math.max(0, Math.min(1, t))
      return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)))
    }

    function hitTest(el: Element, wx: number, wy: number): boolean {
      const padding = 6
      switch (el.type) {
        case 'rect':
          return (
            wx >= el.x - padding &&
            wx <= el.x + el.w + padding &&
            wy >= el.y - padding &&
            wy <= el.y + el.h + padding
          )
        case 'ellipse': {
          const cx = el.x + el.w / 2
          const cy = el.y + el.h / 2
          const rx = Math.abs(el.w) / 2 + padding
          const ry = Math.abs(el.h) / 2 + padding
          const dx = wx - cx
          const dy = wy - cy
          return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1.2
        }
        case 'line':
          return (
            distToSegment(
              { x: wx, y: wy },
              { x: el.x, y: el.y },
              { x: el.x + el.w, y: el.y + el.h }
            ) < 8
          )
        case 'freedraw':
          return (el as FreedrawElement).points.some((p) => Math.hypot(p.x - wx, p.y - wy) < 12)
        case 'text':
          return wx >= el.x && wx <= el.x + el.w && wy >= el.y && wy <= el.y + el.h
      }
      return false
    }

    function seededRandom(seed: number) {
      let s = seed
      return () => {
        s = (s * 16807) % 2147483647
        return s / 2147483647 - 0.5
      }
    }

    function roughLine(
      ctx: CanvasRenderingContext2D,
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      seed = 1
    ) {
      const len = Math.hypot(x2 - x1, y2 - y1)
      const seg = Math.max(2, Math.floor(len / 12))
      const dx = (x2 - x1) / seg
      const dy = (y2 - y1) / seg
      const rnd = seededRandom(seed)
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      for (let i = 1; i < seg; i++) {
        ctx.lineTo(x1 + dx * i + rnd() * 2.5, y1 + dy * i + rnd() * 2.5)
      }
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }

    function roughRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, seed = 1) {
      roughLine(ctx, x, y, x + w, y, seed)
      roughLine(ctx, x + w, y, x + w, y + h, seed + 7)
      roughLine(ctx, x + w, y + h, x, y + h, seed + 13)
      roughLine(ctx, x, y + h, x, y, seed + 19)
    }

    function roughEllipse(
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      rx: number,
      ry: number,
      seed = 1
    ) {
      const seg = 20
      const rnd = seededRandom(seed)
      ctx.beginPath()
      for (let i = 0; i <= seg; i++) {
        const a = (i / seg) * Math.PI * 2
        const px = cx + Math.cos(a) * rx + rnd() * 2
        const py = cy + Math.sin(a) * ry + rnd() * 2
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.stroke()
    }

    function drawElement(ctx: CanvasRenderingContext2D, el: Element) {
      ctx.strokeStyle = el.color
      ctx.fillStyle = el.color
      ctx.lineWidth = el.strokeWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      switch (el.type) {
        case 'rect': {
          if (el.w !== 0 && el.h !== 0) {
            roughRect(ctx, el.x, el.y, el.w, el.h, el.id.charCodeAt(3))
          }
          break
        }
        case 'ellipse': {
          if (el.w !== 0 && el.h !== 0) {
            roughEllipse(ctx, el.x + el.w / 2, el.y + el.h / 2, Math.abs(el.w) / 2, Math.abs(el.h) / 2, el.id.charCodeAt(3))
          }
          break
        }
        case 'line': {
          if (el.w !== 0 || el.h !== 0) {
            roughLine(ctx, el.x, el.y, el.x + el.w, el.y + el.h, el.id.charCodeAt(3))
          }
          break
        }
        case 'freedraw': {
          const pts = (el as FreedrawElement).points
          if (pts.length < 2) break
          ctx.beginPath()
          ctx.moveTo(pts[0].x, pts[0].y)
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y)
          }
          ctx.stroke()
          break
        }
        case 'text': {
          ctx.font = '20px sans-serif'
          ctx.textAlign = 'left'
          ctx.textBaseline = 'top'
          const lines = (el as TextElement).text.split('\n')
          const lh = 26
          lines.forEach((line, i) => {
            ctx.fillText(line, el.x, el.y + i * lh)
          })
          if (el.w === 0 && lines.length > 0) {
            const maxW = Math.max(...lines.map((l) => ctx.measureText(l).width))
            el.w = maxW
            el.h = lines.length * lh
          }
          break
        }
      }
    }

    function drawSelectionBox(ctx: CanvasRenderingContext2D, el: Element) {
      ctx.save()
      ctx.strokeStyle = '#409eff'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])

      let bx: number, by: number, bw: number, bh: number
      if (el.type === 'line') {
        bx = Math.min(el.x, el.x + el.w) - 6
        by = Math.min(el.y, el.y + el.h) - 6
        bw = Math.abs(el.w) + 12
        bh = Math.abs(el.h) + 12
      } else {
        bx = el.x - 4
        by = el.y - 4
        bw = (el.w || 0) + 8
        bh = (el.h || 0) + 8
      }

      ctx.strokeRect(bx, by, bw, bh)
      ctx.setLineDash([])

      ctx.fillStyle = '#409eff'
      const handles = [
        [bx, by],
        [bx + bw, by],
        [bx, by + bh],
        [bx + bw, by + bh]
      ]
      handles.forEach(([hx, hy]) => {
        ctx.fillRect(hx - 3, hy - 3, 6, 6)
      })
      ctx.restore()
    }

    function drawDotGrid(ctx: CanvasRenderingContext2D, state: { scale: number }) {
      const gridSize = 20
      const topLeft = engine.toWorldPoint(0, 0)
      const bottomRight = engine.toWorldPoint(rectWidth, rectHeight)

      const startX = Math.floor(topLeft.x / gridSize) * gridSize
      const startY = Math.floor(topLeft.y / gridSize) * gridSize

      ctx.fillStyle = '#dcdcdc'
      const radius = Math.max(0.8, 1.2 / state.scale)

      for (let x = startX; x <= bottomRight.x; x += gridSize) {
        for (let y = startY; y <= bottomRight.y; y += gridSize) {
          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    const draw = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const state = engine.getState()
      setScale(state.scale)

      ctx.clearRect(0, 0, rectWidth, rectHeight)
      ctx.save()
      ctx.setTransform(state.scale, 0, 0, state.scale, state.x, state.y)

      drawDotGrid(ctx, state)

      elementsRef.current.forEach((el) => {
        drawElement(ctx, el)
        if (el.selected) drawSelectionBox(ctx, el)
      })

      ctx.restore()
    }

    const deselectAll = () => {
      elementsRef.current.forEach((el) => (el.selected = false))
    }

    const clearAll = () => {
      elementsRef.current = []
      dragState = null
      setElementCount(0)
      draw()
    }

    clearAllRef.current = clearAll

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      if (isSpacePressed) return

      const { screenX, screenY } = getMousePos(e)
      const world = engine.toWorldPoint(screenX, screenY)
      const currentTool = toolRef.current

      if (currentTool === 'select') {
        e.stopPropagation()
        for (let i = elementsRef.current.length - 1; i >= 0; i--) {
          const el = elementsRef.current[i]
          if (hitTest(el, world.x, world.y)) {
            deselectAll()
            el.selected = true
            dragState = {
              type: 'move',
              el,
              offsetX: world.x - el.x,
              offsetY: world.y - el.y
            }
            draw()
            return
          }
        }
        deselectAll()
        draw()
        return
      }

      e.stopPropagation()
      deselectAll()

      if (currentTool === 'freedraw') {
        const newEl: FreedrawElement = {
          id: generateId(),
          type: 'freedraw',
          x: world.x,
          y: world.y,
          w: 0,
          h: 0,
          points: [{ x: world.x, y: world.y }],
          color: currentColorRef.current,
          strokeWidth: 2,
          selected: false
        }
        elementsRef.current.push(newEl)
        dragState = { type: 'create', el: newEl }
      } else if (currentTool === 'rect' || currentTool === 'ellipse' || currentTool === 'line') {
        const newEl: Element = {
          id: generateId(),
          type: currentTool as ElementType,
          x: world.x,
          y: world.y,
          w: 0,
          h: 0,
          color: currentColorRef.current,
          strokeWidth: 2,
          selected: false
        }
        elementsRef.current.push(newEl)
        dragState = { type: 'create', el: newEl, startX: world.x, startY: world.y }
      } else if (currentTool === 'text') {
        const text = window.prompt('请输入文本', '文本')
        if (text) {
          const newEl: TextElement = {
            id: generateId(),
            type: 'text',
            x: world.x,
            y: world.y,
            w: 0,
            h: 0,
            text,
            color: currentColorRef.current,
            strokeWidth: 0,
            selected: true
          }
          elementsRef.current.push(newEl)
          setElementCount(elementsRef.current.length)
          draw()
        }
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState) return
      const { screenX, screenY } = getMousePos(e)
      const world = engine.toWorldPoint(screenX, screenY)

      if (dragState.type === 'move' && dragState.el) {
        dragState.el.x = world.x - (dragState.offsetX || 0)
        dragState.el.y = world.y - (dragState.offsetY || 0)
        draw()
      } else if (dragState.type === 'create' && dragState.el) {
        const el = dragState.el
        if (el.type === 'freedraw') {
          ;(el as FreedrawElement).points.push({ x: world.x, y: world.y })
          const xs = (el as FreedrawElement).points.map((p) => p.x)
          const ys = (el as FreedrawElement).points.map((p) => p.y)
          el.x = Math.min(...xs)
          el.y = Math.min(...ys)
          el.w = Math.max(...xs) - el.x
          el.h = Math.max(...ys) - el.y
        } else if (el.type === 'rect' || el.type === 'ellipse') {
          el.x = Math.min(dragState.startX || 0, world.x)
          el.y = Math.min(dragState.startY || 0, world.y)
          el.w = Math.abs(world.x - (dragState.startX || 0))
          el.h = Math.abs(world.y - (dragState.startY || 0))
        } else if (el.type === 'line') {
          el.w = world.x - el.x
          el.h = world.y - el.y
        }
        draw()
      }
    }

    const handleMouseUp = () => {
      if (dragState?.type === 'create' && dragState.el) {
        const el = dragState.el
        if (
          (el.type === 'rect' || el.type === 'ellipse') &&
          (Math.abs(el.w) < 5 || Math.abs(el.h) < 5)
        ) {
          elementsRef.current = elementsRef.current.filter((e) => e.id !== el.id)
        } else if (el.type === 'line' && Math.abs(el.w) < 3 && Math.abs(el.h) < 3) {
          elementsRef.current = elementsRef.current.filter((e) => e.id !== el.id)
        }
        setElementCount(elementsRef.current.length)
      }
      dragState = null
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        isSpacePressed = true
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const before = elementsRef.current.length
        elementsRef.current = elementsRef.current.filter((el) => !el.selected)
        if (elementsRef.current.length !== before) {
          setElementCount(elementsRef.current.length)
          draw()
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        isSpacePressed = false
      }
    }

    const updateDimensions = () => {
      rectWidth = wrapper.clientWidth
      rectHeight = wrapper.clientHeight
      canvas.width = rectWidth
      canvas.height = rectHeight
    }

    const init = () => {
      updateDimensions()
      engine.setTransform({ scale: 1, x: rectWidth / 2, y: rectHeight / 2 })

      inputManager = new InputManager(engine, {
        zoomStep: 0.25,
        zoomMode: 'pointer',
        viewportSize: { width: rectWidth, height: rectHeight },
        onCursorChange: (cls) => {
          setCursorClass(cls)
        }
      })
      inputManager.bind(canvas)

      canvas.addEventListener('mousedown', handleMouseDown)
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('keyup', handleKeyUp)
    }

    const onResize = () => {
      updateDimensions()
      draw()
    }

    unsubscribe = engine.onUpdate(() => draw())
    init()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      unsubscribe?.()
      inputManager?.destroy()
      canvas.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
      engine.destroy()
    }
  }, [])

  return (
    <div className="wb-whiteboard">
      <div className="wb-toolbar">
        <div className="wb-tool-group">
          {tools.map((t) => (
            <button
              key={t.id}
              className={`wb-tool-btn ${tool === t.id ? 'active' : ''}`}
              title={t.label}
              onClick={() => setTool(t.id)}
              dangerouslySetInnerHTML={{ __html: `<span class="wb-tool-icon">${toolIcons[t.id]}</span>` }}
            />
          ))}
        </div>
        <div className="wb-divider" />
        <div className="wb-color-group">
          {colors.map((c) => (
            <button
              key={c}
              className={`wb-color-btn ${currentColor === c ? 'active' : ''}`}
              style={{ background: c }}
              onClick={() => setCurrentColor(c)}
            />
          ))}
        </div>
        <div className="wb-divider" />
        <button className="wb-tool-btn" title="清空画布" onClick={() => clearAllRef.current?.()}>
          🗑️
        </button>
      </div>

      <div className={`wb-canvas-wrapper ${cursorClass}`} ref={canvasWrapperRef}>
        <canvas ref={canvasRef} />
        <div className="wb-hud">
          <span>缩放: {(scale * 100).toFixed(0)}%</span>
          <span>元素: {elementCount}</span>
          <span className="wb-hint">Ctrl+滚轮缩放 | 空格拖拽 | Delete 删除</span>
        </div>
      </div>
    </div>
  )
}

export default Whiteboard

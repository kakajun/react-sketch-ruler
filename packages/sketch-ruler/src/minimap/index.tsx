import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import { MinimapEngine } from '@sketch-ruler/core'

export interface MinimapProps {
  contentWidth: number
  contentHeight: number
  viewportX: number
  viewportY: number
  viewportWidth: number
  viewportHeight: number
  scale: number
  width?: number
  height?: number
  onNavigate?: (x: number, y: number) => void
  onDragStart?: () => void
  onDragEnd?: () => void
}

const Minimap: React.FC<MinimapProps> = ({
  contentWidth,
  contentHeight,
  viewportX,
  viewportY,
  viewportWidth,
  viewportHeight,
  scale,
  width = 200,
  height = 150,
  onNavigate,
  onDragStart,
  onDragEnd
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [dragging, setDragging] = useState(false)
  const dragRectRef = useRef({ left: 0, top: 0, width: 0, height: 0 })

  const engine = useMemo(
    () =>
      new MinimapEngine({
        contentWidth,
        contentHeight,
        viewportX,
        viewportY,
        viewportWidth,
        viewportHeight,
        scale,
        width,
        height
      }),
    [contentWidth, contentHeight, viewportX, viewportY, viewportWidth, viewportHeight, scale, width, height]
  )

  const state = useMemo(() => engine.getState(), [engine])

  const drawMinimap = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, width, height)

    const s = state.miniScale
    const cw = contentWidth * s
    const ch = contentHeight * s
    const ox = (width - cw) / 2
    const oy = (height - ch) / 2

    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1
    ctx.strokeRect(ox, oy, cw, ch)
  }, [state.miniScale, width, height, contentWidth, contentHeight])

  useEffect(() => {
    drawMinimap()
  }, [drawMinimap])

  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!engine.canPan()) {
        startDrag(e, 'canvas', false)
        return
      }
      startDrag(e, 'canvas', true)
    },
    [engine]
  )

  const handleViewportPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation()
      if (!engine.canPan()) return
      startDrag(e, 'viewport', true)
    },
    [engine]
  )

  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>, source: 'canvas' | 'viewport', canMove: boolean) => {
      const target = e.currentTarget as HTMLElement
      target.setPointerCapture(e.pointerId)

      const rect = canvasRef.current!.getBoundingClientRect()
      const startState = engine.getState()

      let accDx = 0
      let accDy = 0
      let hasMoved = false
      let skipClick = false

      let pendingTargetX = viewportX
      let pendingTargetY = viewportY
      let emitRafId: number | null = null

      const session = engine.startDrag(viewportX, viewportY, startState.viewportRect.left, startState.viewportRect.top)

      function scheduleEmit() {
        if (emitRafId !== null) return
        emitRafId = requestAnimationFrame(() => {
          emitRafId = null
          onNavigate?.(pendingTargetX, pendingTargetY)
        })
      }

      if (canMove) {
        dragRectRef.current = { ...startState.viewportRect }
        setDragging(true)
        onDragStart?.()
      }

      const onMove = (ev: PointerEvent) => {
        accDx += ev.movementX
        accDy += ev.movementY

        if (Math.abs(accDx) > 3 || Math.abs(accDy) > 3) {
          skipClick = true
          if (!hasMoved && canMove) {
            hasMoved = true
          }
        }

        if (canMove) {
          const result = session.move(accDx, accDy)
          dragRectRef.current = result.dragRect
          pendingTargetX = result.targetX
          pendingTargetY = result.targetY
          scheduleEmit()
        }
      }

      const onUp = (ev: PointerEvent) => {
        target.releasePointerCapture(ev.pointerId)
        target.removeEventListener('pointermove', onMove)
        target.removeEventListener('pointerup', onUp)
        target.removeEventListener('pointercancel', onUp)

        if (emitRafId !== null) {
          cancelAnimationFrame(emitRafId)
          emitRafId = null
        }

        if (canMove) {
          const endResult = session.end(accDx, accDy)
          onNavigate?.(endResult.x, endResult.y)
          setTimeout(() => {
            setDragging(false)
            onDragEnd?.()
          }, 50)
        } else if (!skipClick && source === 'canvas') {
          const nav = engine.clickAt(ev.clientX, ev.clientY, rect.left, rect.top)
          onNavigate?.(nav.x, nav.y)
        }
      }

      target.addEventListener('pointermove', onMove)
      target.addEventListener('pointerup', onUp)
      target.addEventListener('pointercancel', onUp)
    },
    [engine, viewportX, viewportY, onNavigate, onDragStart, onDragEnd]
  )

  const containerStyle = useMemo(
    () => ({
      width: width + 'px',
      height: height + 'px',
      position: 'relative' as const,
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      overflow: 'hidden',
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
    }),
    [width, height]
  )

  const currentRect = dragging ? dragRectRef.current : state.viewportRect
  const viewportStyle = useMemo(
    () => ({
      position: 'absolute' as const,
      left: currentRect.left + 'px',
      top: currentRect.top + 'px',
      width: currentRect.width + 'px',
      height: currentRect.height + 'px',
      border: '1px solid #1890ff',
      background: 'rgba(24, 144, 255, 0.15)',
      cursor: 'move',
      pointerEvents: 'auto' as const,
      boxSizing: 'border-box' as const,
      willChange: 'left, top, width, height'
    }),
    [currentRect]
  )

  return (
    <div style={containerStyle}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
        width={width}
        height={height}
        onPointerDown={handleCanvasPointerDown}
      />
      <div
        style={viewportStyle}
        onPointerDown={handleViewportPointerDown}
      />
    </div>
  )
}

export default Minimap

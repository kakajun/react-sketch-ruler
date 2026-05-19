import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react'

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

  const miniScale = useMemo(() => {
    const scaleX = width / contentWidth
    const scaleY = height / contentHeight
    return Math.min(scaleX, scaleY)
  }, [width, contentWidth, contentHeight])

  const contentOffset = useMemo(() => {
    const s = miniScale
    const cw = contentWidth * s
    const ch = contentHeight * s
    return {
      x: (width - cw) / 2,
      y: (height - ch) / 2
    }
  }, [miniScale, width, height, contentWidth, contentHeight])

  const viewportRect = useMemo(() => {
    const s = miniScale
    const ox = contentOffset.x
    const oy = contentOffset.y
    const left = ox + (-viewportX / scale) * s
    const top = oy + (-viewportY / scale) * s
    const vw = (viewportWidth / scale) * s
    const vh = (viewportHeight / scale) * s
    return { left, top, width: vw, height: vh }
  }, [miniScale, contentOffset, viewportX, viewportY, viewportWidth, viewportHeight, scale])

  const clampTransform = useCallback(
    (x: number, y: number): { x: number; y: number } => {
      const contentW = contentWidth * scale
      const contentH = contentHeight * scale

      let cx = x
      let cy = y

      if (contentW <= viewportWidth) {
        cx = (viewportWidth - contentW) / 2
      } else {
        cx = Math.min(0, Math.max(viewportWidth - contentW, x))
      }

      if (contentH <= viewportHeight) {
        cy = (viewportHeight - contentH) / 2
      } else {
        cy = Math.min(0, Math.max(viewportHeight - contentH, y))
      }

      return { x: cx, y: cy }
    },
    [contentWidth, contentHeight, scale, viewportWidth, viewportHeight]
  )

  const canPan = useCallback(() => {
    return contentWidth * scale > viewportWidth || contentHeight * scale > viewportHeight
  }, [contentWidth, contentHeight, scale, viewportWidth, viewportHeight])

  const drawMinimap = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, width, height)

    const s = miniScale
    const cw = contentWidth * s
    const ch = contentHeight * s
    const ox = (width - cw) / 2
    const oy = (height - ch) / 2

    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1
    ctx.strokeRect(ox, oy, cw, ch)
  }, [miniScale, width, height, contentWidth, contentHeight])

  useEffect(() => {
    drawMinimap()
  }, [drawMinimap])

  const handleClickAt = useCallback(
    (clientX: number, clientY: number) => {
      const rect = canvasRef.current!.getBoundingClientRect()
      const ox = contentOffset.x
      const oy = contentOffset.y
      const worldX = (clientX - rect.left - ox) / miniScale
      const worldY = (clientY - rect.top - oy) / miniScale
      const transformX = viewportWidth / 2 - worldX * scale
      const transformY = viewportHeight / 2 - worldY * scale
      const clamped = clampTransform(transformX, transformY)
      onNavigate?.(clamped.x, clamped.y)
    },
    [contentOffset, miniScale, viewportWidth, viewportHeight, scale, clampTransform, onNavigate]
  )

  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>, source: 'canvas' | 'viewport', canMove: boolean) => {
      const target = e.currentTarget as HTMLElement
      target.setPointerCapture(e.pointerId)

      const startViewportX = viewportX
      const startViewportY = viewportY
      const startMinimapLeft = viewportRect.left
      const startMinimapTop = viewportRect.top
      const ratio = scale / miniScale

      let accDx = 0
      let accDy = 0
      let hasMoved = false
      let skipClick = false

      let pendingTargetX = startViewportX
      let pendingTargetY = startViewportY
      let emitRafId: number | null = null

      function scheduleEmit() {
        if (emitRafId !== null) return
        emitRafId = requestAnimationFrame(() => {
          emitRafId = null
          onNavigate?.(pendingTargetX, pendingTargetY)
        })
      }

      if (canMove) {
        dragRectRef.current = { ...viewportRect }
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
          const rawX = startViewportX - accDx * ratio
          const rawY = startViewportY - accDy * ratio
          const clamped = clampTransform(rawX, rawY)

          const actualDx = (startViewportX - clamped.x) / ratio
          const actualDy = (startViewportY - clamped.y) / ratio
          dragRectRef.current.left = startMinimapLeft + actualDx
          dragRectRef.current.top = startMinimapTop + actualDy

          pendingTargetX = clamped.x
          pendingTargetY = clamped.y
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
          onNavigate?.(pendingTargetX, pendingTargetY)
          setTimeout(() => {
            setDragging(false)
            onDragEnd?.()
          }, 50)
        } else if (!skipClick && source === 'canvas') {
          handleClickAt(ev.clientX, ev.clientY)
        }
      }

      target.addEventListener('pointermove', onMove)
      target.addEventListener('pointerup', onUp)
      target.addEventListener('pointercancel', onUp)
    },
    [viewportX, viewportY, viewportRect, scale, miniScale, clampTransform, onNavigate, onDragStart, onDragEnd, handleClickAt]
  )

  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!canPan()) {
        startDrag(e, 'canvas', false)
        return
      }
      startDrag(e, 'canvas', true)
    },
    [canPan, startDrag]
  )

  const handleViewportPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation()
      if (!canPan()) return
      startDrag(e, 'viewport', true)
    },
    [canPan, startDrag]
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

  const currentRect = dragging ? dragRectRef.current : viewportRect
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

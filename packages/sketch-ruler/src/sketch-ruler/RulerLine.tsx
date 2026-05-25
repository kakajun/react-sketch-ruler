import React, { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react'
import type { LineProps } from '../index-types'

const RulerLineComponent = ({
  line,
  scale,
  offset,
  palette,
  vertical,
  canvasWidth,
  canvasHeight,
  width = 0,
  height = 0,
  lockLine = false,
  deleteLabel = '放开删除',
  onUpdate,
  onDelete
}: LineProps) => {
  const [draggingPos, setDraggingPos] = useState<number | null>(null)
  const [showLabel, setShowLabel] = useState(false)
  const labelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lineElRef = useRef<HTMLDivElement | null>(null)
  const mountedRef = useRef(true)
  mountedRef.current = true
  const lineRef = useRef(line)
  lineRef.current = line

  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (labelTimerRef.current) clearTimeout(labelTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const el = lineElRef.current
    if (!el || lockLine) return

    const handleEnter = () => {
      if (lineRef.current.locked) return
      if (labelTimerRef.current) clearTimeout(labelTimerRef.current)
      labelTimerRef.current = setTimeout(() => {
        if (mountedRef.current) setShowLabel(true)
      }, 50)
    }

    const handleLeave = () => {
      if (lineRef.current.locked) return
      if (labelTimerRef.current) clearTimeout(labelTimerRef.current)
      labelTimerRef.current = setTimeout(() => {
        if (mountedRef.current) setShowLabel(false)
      }, 200)
    }

    el.addEventListener('mouseenter', handleEnter)
    el.addEventListener('mouseleave', handleLeave)

    return () => {
      el.removeEventListener('mouseenter', handleEnter)
      el.removeEventListener('mouseleave', handleLeave)
    }
  }, [lockLine])

  const pos = line.position * scale + offset

  const style = useMemo(() => {
    const cursor = line.locked || lockLine ? 'default' : vertical ? 'ew-resize' : 'ns-resize'
    const pointerEvents: 'auto' | 'none' = line.locked || lockLine ? 'none' : 'auto'
    if (vertical) {
      return {
        left: `${pos}px`,
        top: 0,
        height: `${height}px`,
        width: '1px',
        borderLeft: `1px dashed ${palette.guideLineColor}`,
        cursor,
        pointerEvents
      }
    }
    return {
      top: `${pos}px`,
      left: 0,
      width: `${width}px`,
      height: '1px',
      borderBottom: `1px dashed ${palette.guideLineColor}`,
      cursor,
      pointerEvents
    }
  }, [pos, vertical, palette.guideLineColor, line.locked, lockLine, width, height])

  const labelText = useMemo(() => {
    const displayPos = draggingPos !== null ? draggingPos : line.position
    const limit = vertical ? canvasWidth : canvasHeight
    if (displayPos < 0 || displayPos > limit) {
      return deleteLabel
    }
    return `${vertical ? 'X' : 'Y'}: ${Math.round(displayPos)}`
  }, [draggingPos, line.position, canvasWidth, canvasHeight, deleteLabel, vertical])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (lineRef.current.locked || lockLine) return
      e.preventDefault()
      e.stopPropagation()
      if (labelTimerRef.current) clearTimeout(labelTimerRef.current)
      if (mountedRef.current) setShowLabel(true)

      const startMouse = vertical ? e.clientX : e.clientY
      const startPos = lineRef.current.position
      let shouldDelete = false

      const onMove = (moveEvent: MouseEvent) => {
        const currentMouse = vertical ? moveEvent.clientX : moveEvent.clientY
        const delta = (currentMouse - startMouse) / scale
        let newPos = startPos + delta

        const snapThreshold = 10 / scale
        const nearest = Math.round(newPos / snapThreshold) * snapThreshold
        if (Math.abs(nearest - newPos) < snapThreshold * 0.5) {
          newPos = nearest
        }

        if (mountedRef.current) setDraggingPos(newPos)

        const limit = vertical ? canvasWidth : canvasHeight
        shouldDelete = newPos < -10 / scale || newPos > limit + 10 / scale

        onUpdate?.(lineRef.current.id, Math.round(newPos))
      }

      const onUp = () => {
        if (shouldDelete) {
          onDelete?.(lineRef.current.id)
        }
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        if (labelTimerRef.current) clearTimeout(labelTimerRef.current)
        if (mountedRef.current) {
          setShowLabel(false)
          setDraggingPos(null)
        }
      }

      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [lockLine, vertical, scale, offset, width, height, onUpdate, onDelete]
  )

  return (
    <div
      ref={lineElRef}
      className="line"
      style={style}
      onMouseDown={handleMouseDown}
    >
      {showLabel && (
        <span
          className="line-label"
          style={{
            position: 'absolute',
            background: palette.hoverBg,
            color: palette.hoverColor,
            fontSize: '10px',
            padding: '2px 4px',
            borderRadius: '2px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            transform: 'scale(0.83)',
            [vertical ? 'top' : 'left']: '4px'
          }}
        >
          {labelText}
        </span>
      )}
    </div>
  )
}

export default memo(RulerLineComponent)

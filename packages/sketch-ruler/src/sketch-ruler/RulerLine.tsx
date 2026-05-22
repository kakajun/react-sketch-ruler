import React, { useState, useCallback, useMemo, memo } from 'react'
import type { GuideLine } from '@sketch-ruler/core'
import type { LineProps } from '../index-types'

const RulerLineComponent = ({
  line,
  scale,
  offset,
  palette,
  vertical,
  canvasWidth,
  canvasHeight,
  lockLine = false,
  deleteLabel = '放开删除',
  onUpdate,
  onDelete
}: LineProps) => {
  const [active, setActive] = useState(false)
  const [showLabel, setShowLabel] = useState(false)
  const [draggingPos, setDraggingPos] = useState<number | null>(null)

  const pos = line.position * scale + offset
  const limit = vertical ? canvasWidth : canvasHeight

  const style = useMemo(() => {
    const cursor = line.locked || lockLine ? 'default' : vertical ? 'ew-resize' : 'ns-resize'
    const pointerEvents: 'auto' | 'none' = line.locked || lockLine ? 'none' : 'auto'
    if (vertical) {
      return {
        left: `${pos}px`,
        top: 0,
        height: '100vh',
        width: '1px',
        borderLeft: `1px dashed ${palette.guideLineColor}`,
        cursor,
        pointerEvents
      }
    }
    return {
      top: `${pos}px`,
      left: 0,
      width: '100vw',
      height: '1px',
      borderBottom: `1px dashed ${palette.guideLineColor}`,
      cursor,
      pointerEvents
    }
  }, [pos, vertical, palette.guideLineColor, line.locked, lockLine])

  const labelText = useMemo(() => {
    const displayPos = draggingPos !== null ? draggingPos : line.position
    if (displayPos < 0 || displayPos > limit) {
      return deleteLabel
    }
    return `${vertical ? 'X' : 'Y'}: ${Math.round(displayPos)}`
  }, [draggingPos, line.position, limit, deleteLabel, vertical])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (line.locked || lockLine) return
      e.preventDefault()
      e.stopPropagation()
      setActive(true)
      setShowLabel(true)

      const startMouse = vertical ? e.clientX : e.clientY
      const startPos = line.position
      let shouldDelete = false

      const onMove = (moveEvent: MouseEvent) => {
        const currentMouse = vertical ? moveEvent.clientX : moveEvent.clientY
        const delta = (currentMouse - startMouse) / scale
        let newPos = startPos + delta

        // 吸附到最近刻度（简化：吸附到整数像素）
        const snapThreshold = 10 / scale
        const nearest = Math.round(newPos / snapThreshold) * snapThreshold
        if (Math.abs(nearest - newPos) < snapThreshold * 0.5) {
          newPos = nearest
        }

        setDraggingPos(newPos)
        shouldDelete = newPos < 0 || newPos > limit
        if (!shouldDelete) {
          onUpdate?.(line.id, Math.round(newPos))
        }
      }

      const onUp = () => {
        if (shouldDelete) {
          onDelete?.(line.id)
        }
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        setShowLabel(false)
        setActive(false)
        setDraggingPos(null)
      }

      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [line, lockLine, vertical, scale, limit, onUpdate, onDelete]
  )

  const handleMouseEnter = useCallback(() => {
    if (line.locked || lockLine) return
    setActive(true)
    setShowLabel(true)
  }, [line.locked, lockLine])

  const handleMouseLeave = useCallback(() => {
    if (!active) {
      setShowLabel(false)
    }
    setActive(false)
  }, [active])

  return (
    <div
      className="line"
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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

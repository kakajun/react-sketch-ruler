import React, { useState, useCallback, useMemo, memo, useRef } from 'react'
import { getTickConfig } from '@sketch-ruler/core'
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
  thick = 16,
  lockLine = false,
  deleteLabel = '放开删除',
  isInScale = false,
  onUpdate,
  onDelete
}: LineProps) => {
  const [draggingPos, setDraggingPos] = useState<number | null>(null)
  const lineRef = useRef(line)
  lineRef.current = line

  const pos = line.position * scale + offset

  const style = useMemo(() => {
    const cursor = line.locked || lockLine ? 'default' : vertical ? 'ew-resize' : 'ns-resize'
    const pointerEvents: 'auto' | 'none' = line.locked || lockLine || isInScale ? 'none' : 'auto'
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
  }, [pos, vertical, palette.guideLineColor, line.locked, lockLine, width, height, isInScale])

  const labelText = useMemo(() => {
    if (draggingPos !== null) {
      const limit = vertical ? canvasWidth : canvasHeight
      const isOutOfCanvas = draggingPos < 0 || draggingPos > limit
      const screenPos = draggingPos * scale + offset
      const isOverRuler = screenPos <= thick
      if (isOutOfCanvas || isOverRuler) {
        return deleteLabel
      }
    }
    return String(Math.round(line.position))
  }, [draggingPos, line.position, canvasWidth, canvasHeight, deleteLabel, vertical, scale, offset, thick])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (lineRef.current.locked || lockLine) return
      e.preventDefault()
      e.stopPropagation()
      setDraggingPos(lineRef.current.position)

      const startMouse = vertical ? e.clientX : e.clientY
      const startPos = lineRef.current.position
      let shouldDelete = false

      const onMove = (moveEvent: MouseEvent) => {
        const currentMouse = vertical ? moveEvent.clientX : moveEvent.clientY
        const delta = (currentMouse - startMouse) / scale
        let newPos = startPos + delta

        // 吸附到最近主刻度（基于当前缩放级别的刻度间隔，不依赖可见刻度数组）
        const snapThreshold = 10 / scale
        const interval = getTickConfig(scale).interval
        const gridPos = Math.round(newPos / interval) * interval
        const dist = Math.abs(newPos - gridPos)
        if (dist < snapThreshold) {
          newPos = gridPos
        }

        setDraggingPos(newPos)

        // 越界检测：记录是否拖出画布外，等鼠标放开时再删除
        const limit = vertical ? canvasWidth : canvasHeight
        const isOutOfCanvas = newPos < 0 || newPos > limit
        // 标尺区域检测：参考线被拖回到标尺区域（screenPos ≤ thick）也应删除
        const screenPos = newPos * scale + offset
        const isOverRuler = screenPos <= thick

        shouldDelete = isOutOfCanvas || isOverRuler

        // 始终更新位置，让线可以跟随鼠标移出画布
        onUpdate?.(lineRef.current.id, Math.round(newPos))
      }

      const onUp = () => {
        if (shouldDelete) {
          onDelete?.(lineRef.current.id)
        }
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        setDraggingPos(null)
      }

      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [lockLine, vertical, scale, offset, width, height, thick, onUpdate, onDelete]
  )

  return (
    <div className="line" style={style} onMouseDown={handleMouseDown}>
      {!line.locked && (
        <span className="line-label" style={{ color: palette.hoverColor }}>
          {labelText}
        </span>
      )}
    </div>
  )
}

export default memo(RulerLineComponent)

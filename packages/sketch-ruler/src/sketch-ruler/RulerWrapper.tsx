import React, { useState, useEffect, useMemo, useRef, memo, useCallback } from 'react'
import type { GuideLine } from '@sketch-ruler/core'
import { Canvas2DRenderer } from '@sketch-ruler/canvas'
import { computeScaleMarks, getTickConfig } from '@sketch-ruler/core'
import RulerLine from './RulerLine'
import type { RulerWrapperProps, FinalPaletteType } from '../index-types'

const RulerComponent = ({
  vertical,
  width,
  height,
  thick,
  scale,
  offset,
  lines,
  palette,
  showReferLine,
  shadowStart,
  shadowLength,
  canvasSize,
  showMinorTicks,
  canvasWidth = 1000,
  canvasHeight = 1000,
  deleteLabel = '放开删除',
  lockLine = false,
  onAddLine,
  onUpdateLine,
  onDeleteLine
}: RulerWrapperProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rendererRef = useRef<Canvas2DRenderer | null>(null)
  const ratio = typeof window !== 'undefined' ? window.devicePixelRatio : 1

  const containerClass = vertical ? 'v-container' : 'h-container'

  const rulerStyle = useMemo(() => ({
    width: width + 'px',
    height: height + 'px',
    cursor: vertical ? 'ew-resize' : 'ns-resize',
    [vertical ? 'borderRight' : 'borderBottom']: `1px solid ${palette.borderColor}`
  }), [width, height, vertical, palette.borderColor])

  // === 刻度计算 ===
  const canvasOffset = vertical ? offset.x : offset.y
  const marks = useMemo(() => {
    return computeScaleMarks({
      scale,
      offset: canvasOffset,
      viewportSize: vertical ? height : width,
      thick,
      canvasSize: canvasSize ?? Infinity,
      showMinorTicks: showMinorTicks ?? false
    })
  }, [scale, canvasOffset, vertical, height, width, thick, canvasSize, showMinorTicks])

  // === Canvas 绘制 ===
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let ctx = canvas.getContext('2d')
    if (!ctx) return

    if (!rendererRef.current) {
      rendererRef.current = new Canvas2DRenderer()
    }

    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)

    rendererRef.current.render(
      ctx,
      [{
        type: 'ruler',
        marks,
        vertical,
        thick,
        width,
        height,
        ratio,
        palette,
        shadowStart,
        shadowLength,
        showShadowText: true,
        canvasSize
      }],
      { x: 0, y: 0, width, height }
    )
  }, [marks, vertical, thick, width, height, palette, shadowStart, shadowLength, canvasSize, ratio])

  // === 吸附预览线 ===
  const [isCreatingLine, setIsCreatingLine] = useState(false)
  const [isSnapping, setIsSnapping] = useState(false)
  const [previewScreenPos, setPreviewScreenPos] = useState(0)
  const [previewWorldPos, setPreviewWorldPos] = useState(0)

  const previewStyle = useMemo(() => {
    const pos = previewScreenPos
    if (vertical) {
      return { left: `${pos}px`, top: 0, height: '100%', width: '1px' }
    }
    return { top: `${pos}px`, left: 0, width: '100%', height: '1px' }
  }, [previewScreenPos, vertical])

  const updatePreview = useCallback((e: MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const screenPos = vertical ? e.clientX - rect.left : e.clientY - rect.top
    const offsetVal = vertical ? offset.x : offset.y
    let worldPos = (screenPos - offsetVal) / scale

    // 吸附检测
    const snapThreshold = 10 / scale
    let bestTick: number | null = null
    let bestDist = Infinity

    for (const mark of marks) {
      if (!mark.isMajor) continue
      const dist = Math.abs(worldPos - mark.value)
      if (dist < snapThreshold && dist < bestDist) {
        bestDist = dist
        bestTick = mark.value
      }
    }

    if (bestTick !== null) {
      worldPos = bestTick
      setIsSnapping(true)
    } else {
      setIsSnapping(false)
    }

    setPreviewScreenPos(worldPos * scale + offsetVal)
    setPreviewWorldPos(worldPos)
  }, [vertical, offset, scale, marks])

  const handlePointerDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (lockLine) return
    e.stopPropagation()
    setIsCreatingLine(true)
    setIsSnapping(false)
    updatePreviewWithRef(e.nativeEvent)

    const onMove = (moveEvent: MouseEvent) => {
      updatePreviewWithRef(moveEvent)
    }

    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)

      const worldPos = previewWorldPosRef.current
      const limit = vertical ? canvasWidth : canvasHeight
      if (worldPos >= 0 && worldPos <= limit) {
        onAddLine?.({
          orientation: vertical ? 'v' : 'h',
          position: Math.round(worldPos),
          visible: true,
          locked: false
        })
      }

      setIsCreatingLine(false)
      setIsSnapping(false)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [lockLine, vertical, canvasWidth, canvasHeight, onAddLine, updatePreviewWithRef])

  const previewWorldPosRef = useRef(previewWorldPos)
  useEffect(() => {
    previewWorldPosRef.current = previewWorldPos
  }, [previewWorldPos])

  const updatePreviewWithRef = useCallback((e: MouseEvent) => {
    updatePreview(e)
    // 立即同步 ref，避免 useEffect 延迟
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const screenPos = vertical ? e.clientX - rect.left : e.clientY - rect.top
    const offsetVal = vertical ? offset.x : offset.y
    let worldPos = (screenPos - offsetVal) / scale
    const snapThreshold = 10 / scale
    let bestTick: number | null = null
    let bestDist = Infinity
    for (const mark of marks) {
      if (!mark.isMajor) continue
      const dist = Math.abs(worldPos - mark.value)
      if (dist < snapThreshold && dist < bestDist) {
        bestDist = dist
        bestTick = mark.value
      }
    }
    if (bestTick !== null) worldPos = bestTick
    previewWorldPosRef.current = worldPos
  }, [updatePreview, vertical, offset, scale, marks])

  // === 参考线渲染 ===
  const lineStyle = (line: GuideLine) => {
    const offsetVal = vertical ? offset.x : offset.y
    const pos = line.position * scale + offsetVal
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
  }

  return (
    <div className={containerClass}>
      <canvas
        ref={canvasRef}
        className="ruler"
        style={rulerStyle}
        onMouseDown={handlePointerDown}
      />
      {isCreatingLine && (
        <div
          className="preview-line"
          style={{
            ...previewStyle,
            background: isSnapping ? palette.hoverBg : palette.guideLineColor,
            opacity: isSnapping ? 0.9 : 0.5
          }}
        >
          <span className="preview-label">{Math.round(previewWorldPos)}</span>
        </div>
      )}
      {showReferLine && (
        <div className="lines">
          {lines.map((line) => (
            <RulerLine
              key={line.id}
              line={line}
              scale={scale}
              offset={vertical ? offset.x : offset.y}
              palette={palette}
              vertical={vertical}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              lockLine={lockLine}
              deleteLabel={deleteLabel}
              onUpdate={onUpdateLine}
              onDelete={onDeleteLine}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default memo(RulerComponent)

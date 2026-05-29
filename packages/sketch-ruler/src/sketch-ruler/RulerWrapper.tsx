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

  // 缩放期间临时禁用参考线交互，防止滚轮事件被参考线拦截导致页面缩放
  const [isInScale, setIsInScale] = useState(false)
  const scaleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setIsInScale(true)
    if (scaleTimerRef.current) {
      clearTimeout(scaleTimerRef.current)
    }
    scaleTimerRef.current = setTimeout(() => {
      setIsInScale(false)
    }, 1000)
    return () => {
      if (scaleTimerRef.current) {
        clearTimeout(scaleTimerRef.current)
      }
    }
  }, [scale])

  const containerClass = vertical ? 'v-container' : 'h-container'

  const rulerStyle = useMemo(
    () => ({
      width: width + 'px',
      height: height + 'px',
      cursor: lockLine ? 'default' : vertical ? 'ew-resize' : 'ns-resize',
      [vertical ? 'borderRight' : 'borderBottom']: `1px solid ${palette.borderColor}`
    }),
    [width, height, vertical, palette.borderColor, lockLine]
  )

  // === 刻度计算 ===
  const canvasOffset = vertical ? offset.y : offset.x
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
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (!rendererRef.current) {
      rendererRef.current = new Canvas2DRenderer()
    }

    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)

    rendererRef.current.render(
      ctx,
      [
        {
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
        }
      ],
      { x: 0, y: 0, width, height }
    )
  }, [marks, vertical, thick, width, height, palette, shadowStart, shadowLength, canvasSize, ratio])

  // === 吸附预览线 ===
  const [isCreatingLine, setIsCreatingLine] = useState(false)
  const [previewScreenPos, setPreviewScreenPos] = useState(0)
  const [previewWorldPos, setPreviewWorldPos] = useState(0)

  const previewStyle = useMemo(() => {
    const pos = previewScreenPos
    const border = `1px dashed ${palette.guideLineColor}`
    if (vertical) {
      return { left: `${pos}px`, top: 0, height: '100%', width: '1px', borderLeft: border }
    }
    return { top: `${pos}px`, left: 0, width: '100%', height: '1px', borderBottom: border }
  }, [previewScreenPos, vertical, palette.guideLineColor])

  const updatePreview = useCallback(
    (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const screenPos = vertical ? e.clientX - rect.left : e.clientY - rect.top
      const offsetVal = vertical ? offset.x : offset.y
      let worldPos = (screenPos - offsetVal) / scale

      // 吸附检测：吸附到最近主刻度（基于当前缩放级别的刻度间隔，不依赖可见刻度数组）
      const snapThreshold = 10 / scale
      const interval = getTickConfig(scale).interval
      const gridPos = Math.round(worldPos / interval) * interval
      const dist = Math.abs(worldPos - gridPos)

      if (dist < snapThreshold) {
        worldPos = gridPos
      }

      setPreviewScreenPos(worldPos * scale + offsetVal)
      setPreviewWorldPos(worldPos)
    },
    [vertical, offset, scale]
  )

  const previewWorldPosRef = useRef(previewWorldPos)
  useEffect(() => {
    previewWorldPosRef.current = previewWorldPos
  }, [previewWorldPos])

  const updatePreviewWithRef = useCallback(
    (e: MouseEvent) => {
      updatePreview(e)
      // 立即同步 ref，避免 useEffect 延迟
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const screenPos = vertical ? e.clientX - rect.left : e.clientY - rect.top
      const offsetVal = vertical ? offset.x : offset.y
      let worldPos = (screenPos - offsetVal) / scale
      const snapThreshold = 10 / scale
      const interval = getTickConfig(scale).interval
      const gridPos = Math.round(worldPos / interval) * interval
      const dist = Math.abs(worldPos - gridPos)
      if (dist < snapThreshold) {
        worldPos = gridPos
      }
      previewWorldPosRef.current = worldPos
    },
    [updatePreview, vertical, offset, scale]
  )

  const handlePointerDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (lockLine) return
      e.stopPropagation()
      setIsCreatingLine(true)
      updatePreviewWithRef(e.nativeEvent)

      const onMove = (moveEvent: MouseEvent) => {
        updatePreviewWithRef(moveEvent)
      }

      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)

        const worldPos = previewWorldPosRef.current
        const limit = vertical ? canvasWidth : canvasHeight
        const offsetVal = vertical ? offset.x : offset.y
        const screenPos = worldPos * scale + offsetVal
        const isOverRuler = screenPos <= thick
        if (worldPos >= 0 && worldPos <= limit && !isOverRuler) {
          onAddLine?.({
            orientation: vertical ? 'v' : 'h',
            position: Math.round(worldPos),
            visible: true,
            locked: false
          })
        }

        setIsCreatingLine(false)
      }

      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [lockLine, vertical, canvasWidth, canvasHeight, onAddLine, updatePreviewWithRef, scale, offset, thick]
  )

  return (
    <div className={containerClass}>
      <canvas
        ref={canvasRef}
        className="ruler"
        style={rulerStyle}
        onMouseDown={handlePointerDown}
      />
      {isCreatingLine && (
        <div className="preview-line" style={previewStyle}>
          <span className="preview-label" style={{ color: palette.hoverColor }}>
            {Math.round(previewWorldPos)}
          </span>
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
              width={width}
              height={height}
              thick={thick}
              lockLine={lockLine}
              deleteLabel={deleteLabel}
              isInScale={isInScale}
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

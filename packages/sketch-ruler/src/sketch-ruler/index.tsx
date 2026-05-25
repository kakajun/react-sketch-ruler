import { eye64, closeEye64 } from './cornerImg64'
import React, {
  useState,
  useEffect,
  useMemo,
  useImperativeHandle,
  useRef,
  useCallback
} from 'react'
import {
  fitRect,
  PluginManager,
  importLines,
  exportLines,
  generateLineId
} from '@sketch-ruler/core'
import type {
  TransformEngine,
  TransformState,
  SketchRulerPlugin,
  GuideLine
} from '@sketch-ruler/core'
import './index.less'
import RulerWrapper from './RulerWrapper'
import { useCanvasTransform } from '../hooks/useCanvasTransform'
import { useInputManager } from '../hooks/useInputManager'
import type { SketchRulerProps, PaletteType, SketchRulerMethods, ZoomMode } from '../index-types'

const ZOOM_PRESETS = [0.1, 0.25, 0.33, 0.5, 0.66, 1, 1.5, 2, 3, 4, 6, 8, 16]

const DEFAULT_LINES: { h: number[]; v: number[] } = { h: [], v: [] }
const DEFAULT_SHADOW = { x: 0, y: 0, width: 0, height: 0 }
const DEFAULT_INITIAL_OFFSET = { x: 0, y: 0 }

const usePaletteConfig = (palette: PaletteType | undefined) => {
  return useMemo(() => {
    const mapped: PaletteType = {
      ...palette,
      tickColor: palette?.tickColor ?? '#BABBBC',
      labelColor: palette?.labelColor ?? '#7D8694',
      guideLineColor: palette?.guideLineColor ?? '#51d6a9',
      guideLineLockedColor: palette?.guideLineLockedColor ?? '#d4d7dc',
      hoverBg: palette?.hoverBg ?? '#000',
      hoverColor: palette?.hoverColor ?? '#fff',
      borderColor: palette?.borderColor ?? '#eeeeef',
      shadowColor: palette?.shadowColor ?? '#e9f7fe',
      fontShadowColor: palette?.fontShadowColor ?? '#106ebe'
    }
    return {
      bgColor: palette?.bgColor ?? '#f6f7f9',
      tickColor: mapped.tickColor!,
      labelColor: mapped.labelColor!,
      guideLineColor: mapped.guideLineColor!,
      guideLineLockedColor: mapped.guideLineLockedColor!,
      hoverBg: mapped.hoverBg!,
      hoverColor: mapped.hoverColor!,
      borderColor: mapped.borderColor!,
      shadowColor: mapped.shadowColor!,
      fontShadowColor: mapped.fontShadowColor!
    }
  }, [palette])
}

const SketchRule = React.forwardRef<SketchRulerMethods, SketchRulerProps>(
  (
    {
      showRuler = true,
      scale: propScale = 1,
      thick = 16,
      width = 1400,
      height = 800,
      canvasWidth = 700,
      canvasHeight = 700,
      palette,
      lines = DEFAULT_LINES,
      isShowReferLine = true,
      snapThreshold = 5,
      lockLine = false,
      selfHandle = false,
      zoomStep = 0.25,
      minZoom = 0.1,
      maxZoom = 10,
      animationMode = 'ease-out',
      zoomMode = 'pointer',
      enableAnimation = false,
      plugins = [],
      autoCenter = true,
      shadow = DEFAULT_SHADOW,
      initialOffset = DEFAULT_INITIAL_OFFSET,
      showMinorTicks = false,
      eyeIcon,
      closeEyeIcon,
      deleteLabel = '放开删除',
      children,
      onUpdateScale,
      onZoomChange,
      onUpdateLines,
      onHandleCornerClick
    }: SketchRulerProps,
    ref
  ) => {
    const paletteConfig = usePaletteConfig(palette)
    const [showReferLine, setShowReferLine] = useState(isShowReferLine)
    const canvasEditRef = useRef<HTMLDivElement | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const cursorClassRef = useRef('default')
    const [cursorClass, setCursorClass] = useState('default')

    const rectWidth = width
    const rectHeight = height

    const canvasSize = useMemo(
      () => ({ width: canvasWidth, height: canvasHeight }),
      [canvasWidth, canvasHeight]
    )
    const viewportSize = useMemo(
      () => ({ width: rectWidth, height: rectHeight }),
      [rectWidth, rectHeight]
    )

    const { engine, scale, offset, setTransform, zoomBy, zoomTo, reset } = useCanvasTransform({
      initialScale: propScale,
      initialOffset,
      minZoom,
      maxZoom,
      enableAnimation,
      animationMode,
      autoCenter,
      canvasSize,
      viewportSize,
      paddingRatio: 0.2
    })

    // 外部 prop 变化 → 同步到引擎（跳过首次渲染，避免覆盖 autoCenter 初始化）
    const prevPropScaleRef = useRef(propScale)
    useEffect(() => {
      if (Math.abs(propScale - prevPropScaleRef.current) > 1e-10) {
        prevPropScaleRef.current = propScale
        const currentScale = engine?.getState().scale
        if (currentScale !== undefined && Math.abs(propScale - currentScale) > 1e-10) {
          setTransform({ scale: propScale })
        }
      }
    }, [propScale, engine, setTransform])

    // 使用 InputManager 处理输入事件
    const { inputManager } = useInputManager(engine, canvasEditRef, {
      zoomStep,
      zoomMode,
      selfHandle,
      viewportSize: { width: rectWidth, height: rectHeight },
      contentSize: { width: canvasWidth, height: canvasHeight }
    })

    useEffect(() => {
      inputManager?.setZoomMode(zoomMode)
    }, [zoomMode, inputManager])

    useEffect(() => {
      if (animationMode) {
        engine?.setAnimationMode(animationMode)
      }
    }, [animationMode, engine])

    useEffect(() => {
      const interval = setInterval(() => {
        const cls = inputManager?.getCursorClass() ?? 'default'
        if (cls !== cursorClassRef.current) {
          cursorClassRef.current = cls
          setCursorClass(cls)
        }
      }, 100)
      return () => clearInterval(interval)
    }, [inputManager])

    // === 插件系统 ===
    const pluginManagerRef = useRef(new PluginManager())
    useEffect(() => {
      const pm = pluginManagerRef.current
      pm.clear()
      for (const plugin of plugins) {
        pm.register(plugin)
      }
    }, [plugins])

    useEffect(() => {
      pluginManagerRef.current.setApi({
        getState: () => ({
          scale,
          offset: { ...offset },
          lines: guideLines
        }),
        zoomBy,
        zoomTo,
        panBy: (dx: number, dy: number) => engine?.panBy(dx, dy),
        setTransform
      })
    }, [scale, offset, engine, zoomBy, zoomTo, setTransform])

    // === 参考线状态管理 ===
    const [guideLines, setGuideLines] = useState<GuideLine[]>(() => importLines(lines))

    const horizontalLines = useMemo(
      () => guideLines.filter((l) => l.orientation === 'h' && l.visible !== false),
      [guideLines]
    )
    const verticalLines = useMemo(
      () => guideLines.filter((l) => l.orientation === 'v' && l.visible !== false),
      [guideLines]
    )

    function syncGuideLines(newLines: { h: number[]; v: number[] }): void {
      const existing = guideLines
      const updated: GuideLine[] = []

      const existingH = existing.filter((l) => l.orientation === 'h')
      newLines.h.forEach((pos, idx) => {
        if (idx < existingH.length) {
          updated.push({ ...existingH[idx], position: pos })
        } else {
          updated.push({
            id: generateLineId(),
            orientation: 'h',
            position: pos,
            visible: true,
            locked: false
          })
        }
      })

      const existingV = existing.filter((l) => l.orientation === 'v')
      newLines.v.forEach((pos, idx) => {
        if (idx < existingV.length) {
          updated.push({ ...existingV[idx], position: pos })
        } else {
          updated.push({
            id: generateLineId(),
            orientation: 'v',
            position: pos,
            visible: true,
            locked: false
          })
        }
      })

      setGuideLines(updated)
    }

    const linesKey = JSON.stringify(lines)
    useEffect(() => {
      syncGuideLines(lines)
    }, [linesKey])

    // autoCenter 已在 useCanvasTransform 内部处理，此处不再重复

    useEffect(() => {
      setShowReferLine(isShowReferLine)
    }, [isShowReferLine])

    function getExportedLines(): { h: number[]; v: number[] } {
      return exportLines(guideLines)
    }

    const handleAddLine = (line: Omit<GuideLine, 'id'>): void => {
      const newLine: GuideLine = { ...line, id: generateLineId() }
      const next = [...guideLines, newLine]
      setGuideLines(next)
      pluginManagerRef.current.onLineCreate({ line: newLine })
      onUpdateLines?.(exportLines(next))
    }

    const handleUpdateLine = (id: string, position: number): void => {
      const line = guideLines.find((l) => l.id === id)
      if (!line) return
      const from = line.position
      const next = guideLines.map((l) => (l.id === id ? { ...l, position } : l))
      setGuideLines(next)
      pluginManagerRef.current.onLineMove({ line: { ...line, position }, from, to: position })
      onUpdateLines?.(exportLines(next))
    }

    const handleDeleteLine = (id: string): void => {
      const line = guideLines.find((l) => l.id === id)
      const next = guideLines.filter((l) => l.id !== id)
      setGuideLines(next)
      if (line) {
        pluginManagerRef.current.onLineDelete({ line })
      }
      onUpdateLines?.(exportLines(next))
    }

    // === 通知外部缩放变化 ===
    useEffect(() => {
      onUpdateScale?.(scale)
      onZoomChange?.({ scale, x: offset.x, y: offset.y })
    }, [scale, offset.x, offset.y])

    const getZoomOrigin = useCallback((): { x: number; y: number } => {
      const parent = canvasEditRef.current?.parentElement
      const rect = parent ? parent.getBoundingClientRect() : new DOMRect(0, 0, 0, 0)
      return { x: rect.width / 2, y: rect.height / 2 }
    }, [])

    const zoomIn = useCallback(async () => {
      const { x: cx, y: cy } = getZoomOrigin()
      const from = scale
      const to = from + zoomStep
      const allowed = await pluginManagerRef.current.beforeZoom({
        from,
        to,
        center: { x: cx, y: cy },
        cancel: () => {}
      })
      if (allowed) {
        zoomBy(zoomStep, cx, cy)
        pluginManagerRef.current.afterZoom({ from, to, center: { x: cx, y: cy } })
      }
    }, [zoomBy, zoomStep, getZoomOrigin, scale])

    const zoomOut = useCallback(async () => {
      const { x: cx, y: cy } = getZoomOrigin()
      const from = scale
      const to = from - zoomStep
      const allowed = await pluginManagerRef.current.beforeZoom({
        from,
        to,
        center: { x: cx, y: cy },
        cancel: () => {}
      })
      if (allowed) {
        zoomBy(-zoomStep, cx, cy)
        pluginManagerRef.current.afterZoom({ from, to, center: { x: cx, y: cy } })
      }
    }, [zoomBy, zoomStep, getZoomOrigin, scale])

    const handleCornerClick = () => {
      const next = !showReferLine
      setShowReferLine(next)
      onHandleCornerClick?.(next)
    }

    const setZoomMode = useCallback(
      (mode: ZoomMode) => {
        inputManager?.setZoomMode(mode)
      },
      [inputManager]
    )

    const zoomToPreset = useCallback(
      async (preset: number) => {
        const target =
          ZOOM_PRESETS.find((p) => p >= preset) ?? ZOOM_PRESETS[ZOOM_PRESETS.length - 1]
        const { x: cx, y: cy } = getZoomOrigin()
        const from = scale
        const allowed = await pluginManagerRef.current.beforeZoom({
          from,
          to: target,
          center: { x: cx, y: cy },
          cancel: () => {}
        })
        if (allowed) {
          zoomTo(target, cx, cy)
          pluginManagerRef.current.afterZoom({ from, to: target, center: { x: cx, y: cy } })
        }
      },
      [zoomTo, getZoomOrigin, scale]
    )

    useImperativeHandle(ref, () => ({
      engine,
      reset,
      zoomIn,
      zoomOut,
      setTransform,
      setZoomMode,
      zoomToPreset
    }))

    const cornerStyle = useMemo(() => {
      return {
        backgroundImage: showReferLine
          ? `url(${eyeIcon || eye64})`
          : `url(${closeEyeIcon || closeEye64})`,
        width: `${thick}px`,
        height: `${thick}px`,
        borderRight: `1px solid ${paletteConfig.borderColor}`,
        borderBottom: `1px solid ${paletteConfig.borderColor}`
      }
    }, [showReferLine, eyeIcon, closeEyeIcon, paletteConfig, thick])

    const rectStyle = useMemo(() => {
      return {
        background: paletteConfig.bgColor,
        width: rectWidth + 'px',
        height: rectHeight + 'px',
        left: 0,
        top: 0
      }
    }, [rectHeight, rectWidth, paletteConfig])

    // 处理children：分离 default 和 toolbar
    const [defaultSlot, toolbarSlot] = React.Children.toArray(children).reduce(
      (acc: [React.ReactNode | null, React.ReactNode | null], child: React.ReactNode) => {
        if (typeof child === 'function') {
          acc[1] = child
        } else if (React.isValidElement(child)) {
          const el = child as React.ReactElement<any>
          if (el.props.slot === 'toolbar') {
            acc[1] = el
          } else {
            acc[0] = child
          }
        } else {
          acc[0] = child
        }
        return acc
      },
      [null, null]
    )

    const toolbarState = useMemo(
      () => ({
        scale,
        offset,
        zoomMode,
        showReferLine
      }),
      [scale, offset, zoomMode, showReferLine]
    )

    const toolbarTools = useMemo(
      () => ({
        zoomIn,
        zoomOut,
        reset,
        setZoomMode,
        zoomToPreset,
        toggleReferLine: handleCornerClick
      }),
      [zoomIn, zoomOut, reset, setZoomMode, zoomToPreset, handleCornerClick]
    )

    return (
      <div className="sketch-ruler" ref={containerRef}>
        {toolbarSlot && (
          <div className="sketch-ruler-toolbar">
            {typeof toolbarSlot === 'function'
              ? (toolbarSlot as any)({ tools: toolbarTools, state: toolbarState })
              : toolbarSlot}
          </div>
        )}
        <div className={'canvasedit-parent ' + cursorClass} style={rectStyle}>
          <div
            ref={canvasEditRef}
            className={'canvasedit ' + cursorClass}
            style={{
              width: canvasWidth + 'px',
              height: canvasHeight + 'px',
              transform: `matrix(${scale}, 0, 0, ${scale}, ${offset.x}, ${offset.y})`,
              transformOrigin: '0 0'
            }}
          >
            {defaultSlot}
          </div>
        </div>
        {showRuler && (
          <RulerWrapper
            vertical={false}
            width={rectWidth}
            height={thick}
            thick={thick}
            scale={scale}
            offset={offset}
            lines={horizontalLines}
            palette={paletteConfig}
            showReferLine={showReferLine}
            shadowStart={shadow.x}
            shadowLength={shadow.width}
            canvasSize={canvasWidth}
            showMinorTicks={showMinorTicks}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            deleteLabel={deleteLabel}
            lockLine={lockLine}
            onAddLine={handleAddLine}
            onUpdateLine={handleUpdateLine}
            onDeleteLine={handleDeleteLine}
          />
        )}
        {showRuler && (
          <RulerWrapper
            vertical={true}
            width={thick}
            height={rectHeight}
            thick={thick}
            scale={scale}
            offset={offset}
            lines={verticalLines}
            palette={paletteConfig}
            showReferLine={showReferLine}
            shadowStart={shadow.y}
            shadowLength={shadow.height}
            canvasSize={canvasHeight}
            showMinorTicks={showMinorTicks}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            deleteLabel={deleteLabel}
            lockLine={lockLine}
            onAddLine={handleAddLine}
            onUpdateLine={handleUpdateLine}
            onDeleteLine={handleDeleteLine}
          />
        )}
        {showRuler && <a className="corner" style={cornerStyle} onClick={handleCornerClick} />}
      </div>
    )
  }
)

export default SketchRule

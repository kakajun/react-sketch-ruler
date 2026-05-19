import { eye64, closeEye64 } from './cornerImg64'
import React, { useState, useEffect, useMemo, useImperativeHandle, useRef, useCallback } from 'react'
import { fitRect, PluginManager } from '@sketch-ruler/core'
import type { TransformEngine, TransformState, SketchRulerPlugin } from '@sketch-ruler/core'
import './index.less'
import RulerWrapper from './RulerWrapper'
import { useTransformEngine } from '../hooks/useTransformEngine'
import { useInputManager } from '../hooks/useInputManager'
import { useGuideLines } from '../hooks/useGuideLines'
import type { SketchRulerProps, PaletteType, SketchRulerMethods, ZoomMode } from '../index-types'

const ZOOM_PRESETS = [0.1, 0.25, 0.33, 0.5, 0.66, 1, 1.5, 2, 3, 4, 6, 8, 16]

const usePaletteConfig = (palette: PaletteType) => {
  return useMemo(() => {
    // Vue 字段映射到 React 内部字段
    const mapped: PaletteType = {
      ...palette,
      longfgColor: palette.longfgColor ?? palette.tickColor,
      fontColor: palette.fontColor ?? palette.labelColor,
      lineColor: palette.lineColor ?? palette.guideLineColor,
      lockLineColor: palette.lockLineColor ?? palette.guideLineLockedColor,
      lineType: palette.lineType ?? palette.guideLineStyle
    }
    return {
      bgColor: '#f6f7f9',
      longfgColor: '#BABBBC',
      fontColor: '#7D8694',
      fontShadowColor: '#106ebe',
      shadowColor: '#e9f7fe',
      lineColor: '#51d6a9',
      lineType: 'solid',
      lockLineColor: '#d4d7dc',
      hoverBg: '#000',
      hoverColor: '#fff',
      borderColor: '#eeeeef',
      ...mapped
    }
  }, [palette])
}

const SketchRule = React.forwardRef<SketchRulerMethods, SketchRulerProps>(
  (
    {
      showRuler = true,
      scale = 1,
      rate = 1,
      thick = 16,
      width = 1400,
      height = 800,
      eyeIcon,
      closeEyeIcon,
      paddingRatio = 0.2,
      autoCenter = true,
      showShadowText = true,
      showMinorTicks = false,
      shadow = { x: 0, y: 0, width: 0, height: 0 },
      lines = { h: [], v: [] },
      isShowReferLine = true,
      canvasWidth = 1000,
      canvasHeight = 700,
      snapsObj = { h: [], v: [] },
      palette,
      snapThreshold = 5,
      gridRatio = 1,
      lockLine = false,
      selfHandle = false,
      zoomMode = 'pointer' as ZoomMode,
      zoomStep = 0.25,
      minZoom = 0.1,
      maxZoom = 10,
      enableAnimation = false,
      animationMode = 'ease-out' as const,
      initialOffset,
      children,
      onHandleCornerClick,
      updateScale,
      onZoomChange,
      guideLines: guideLinesProp,
      onGuideLineChange,
      handleLine,
      plugins = [],
      deleteLabel
    }: SketchRulerProps,
    ref
  ) => {
    const paletteConfig = usePaletteConfig(palette || {})
    const [showReferLine, setShowReferLine] = useState(isShowReferLine)
    const canvasEditRef = useRef<HTMLDivElement | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const isHoveringRef = useRef(false)
    const rectWidth = useMemo(() => width - thick, [width, thick])
    const rectHeight = useMemo(() => height - thick, [height, thick])

    // 使用 TransformEngine 替代 simple-panzoom
    const getInitialState = useCallback((): TransformState => {
      if (autoCenter) {
        const result = fitRect(
          { x: 0, y: 0, width: canvasWidth, height: canvasHeight },
          { x: 0, y: 0, width: rectWidth, height: rectHeight },
          'contain',
          paddingRatio
        )
        return { scale: result.scale, x: result.x, y: result.y }
      }
      return { x: initialOffset?.x ?? 0, y: initialOffset?.y ?? 0, scale }
    }, [autoCenter, canvasWidth, canvasHeight, rectWidth, rectHeight, paddingRatio, scale, initialOffset])

    const initialStateRef = useRef(getInitialState())

    const {
      engine,
      state,
      setTransform,
      zoomBy,
      zoomTo,
      reset
    } = useTransformEngine(initialStateRef.current, {
      minZoom,
      maxZoom,
      enableAnimation,
      animationMode
    })

    // 将引擎的屏幕坐标偏移转换为 ruler 需要的 world 坐标 start
    const startX = useMemo(() => -state.x / state.scale, [state.x, state.scale])
    const startY = useMemo(() => -state.y / state.scale, [state.y, state.scale])
    const ownScale = state.scale

    // 使用 InputManager 处理输入事件
    const { inputManager, getCursorClass } = useInputManager(
      engine,
      canvasEditRef,
      {
        zoomStep,
        zoomMode,
        viewportSize: { width: rectWidth, height: rectHeight },
        contentSize: { width: canvasWidth, height: canvasHeight },
        selfHandle
      }
    )
    const cursorClass = getCursorClass()

    // === 插件系统 ===
    const pluginManagerRef = useRef(new PluginManager())
    useEffect(() => {
      const pm = pluginManagerRef.current
      pm.clear()
      for (const plugin of plugins) {
        pm.register(plugin)
      }
    }, [plugins])

    const { guideLines, addLine, removeLine, updateLine } = useGuideLines(
      guideLinesProp,
      lines,
      onGuideLineChange,
      handleLine,
      {
        onLineCreate: (line) => pluginManagerRef.current.onLineCreate({ line }),
        onLineDelete: (line) => pluginManagerRef.current.onLineDelete({ line }),
        onLineMove: (line, from, to) => pluginManagerRef.current.onLineMove({ line, from, to })
      }
    )

    const commonProps = {
      thick,
      lines,
      snapThreshold,
      snapsObj,
      isShowReferLine: showReferLine,
      canvasWidth,
      canvasHeight,
      rate,
      palette: paletteConfig,
      gridRatio,
      showShadowText,
      showMinorTicks,
      lockLine,
      scale: ownScale,
      handleLine,
      deleteLabel,
      guideLines,
      addLine,
      removeLine,
      updateLine
    }

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
    }, [showReferLine, eyeIcon, closeEyeIcon, paletteConfig])

    const rectStyle = useMemo(() => {
      return {
        background: paletteConfig.bgColor,
        left: thick + 'px',
        top: thick + 'px',
        width: rectWidth + 'px',
        height: rectHeight + 'px'
      }
    }, [rectHeight, rectWidth, paletteConfig])

    const handleCornerClick = () => {
      setShowReferLine(!showReferLine)
      onHandleCornerClick?.(!showReferLine)
    }

    // 通知外部缩放变化
    useEffect(() => {
      updateScale?.(ownScale)
      onZoomChange?.({
        scale: ownScale,
        x: state.x,
        y: state.y
      } as any)
    }, [ownScale, state.x, state.y])

    const getZoomOrigin = useCallback((): { x: number; y: number } => {
      const parent = canvasEditRef.current?.parentElement
      const rect = parent ? parent.getBoundingClientRect() : new DOMRect(0, 0, 0, 0)
      return { x: rect.width / 2, y: rect.height / 2 }
    }, [])

    const zoomIn = useCallback(async () => {
      const { x: cx, y: cy } = getZoomOrigin()
      const allowed = await pluginManagerRef.current.beforeZoom({
        from: ownScale,
        to: ownScale + zoomStep,
        center: { x: cx, y: cy },
        cancel: () => {}
      })
      if (allowed) zoomBy(zoomStep, cx, cy)
    }, [zoomBy, zoomStep, getZoomOrigin, ownScale])

    const zoomOut = useCallback(async () => {
      const { x: cx, y: cy } = getZoomOrigin()
      const allowed = await pluginManagerRef.current.beforeZoom({
        from: ownScale,
        to: ownScale - zoomStep,
        center: { x: cx, y: cy },
        cancel: () => {}
      })
      if (allowed) zoomBy(-zoomStep, cx, cy)
    }, [zoomBy, zoomStep, getZoomOrigin, ownScale])

    const zoomToPreset = useCallback(async (preset: number) => {
      const target = ZOOM_PRESETS.find((p) => p >= preset) ?? ZOOM_PRESETS[ZOOM_PRESETS.length - 1]
      const { x: cx, y: cy } = getZoomOrigin()
      const allowed = await pluginManagerRef.current.beforeZoom({
        from: ownScale,
        to: target,
        center: { x: cx, y: cy },
        cancel: () => {}
      })
      if (allowed) zoomTo(target, cx, cy)
    }, [zoomTo, getZoomOrigin, ownScale])

    const setZoomMode = useCallback((mode: ZoomMode) => {
      inputManager?.setZoomMode(mode)
    }, [inputManager])

    const initPanzoom = () => {
      // 重新计算居中
      if (autoCenter) {
        const s = getInitialState()
        setTransform(s)
      }
    }

    // 兼容旧 API：panzoomInstance 指向 engine
    const panzoomInstance = useRef<TransformEngine | null>(null)
    useEffect(() => {
      panzoomInstance.current = engine
    }, [engine])

    useImperativeHandle(ref, () => ({
      reset,
      zoomIn,
      zoomOut,
      initPanzoom,
      panzoomInstance,
      setTransform,
      setZoomMode,
      zoomToPreset
    }))

    useEffect(() => {
      setShowReferLine(isShowReferLine)
    }, [isShowReferLine])

    // 处理children
    const [defaultSlot, btnSlot] = React.Children.toArray(children).reduce(
      (acc: [React.ReactNode | null, React.ReactNode | null], child: React.ReactNode) => {
        if (React.isValidElement(child)) {
          const el = child as React.ReactElement<any>
          if (el.props.slot === 'default' || !el.props.slot) {
            acc[0] = el
          } else if (el.props.slot === 'btn') {
            acc[1] = el
          }
        }
        return acc
      },
      [null, null]
    )

    return (
      <div
        className="sketch-ruler"
        ref={containerRef}
        onMouseEnter={() => { isHoveringRef.current = true }}
        onMouseLeave={() => { isHoveringRef.current = false }}
      >
        {btnSlot}
        <div className={'canvasedit-parent ' + cursorClass} style={rectStyle}>
          <div
            ref={canvasEditRef}
            className={'canvasedit ' + cursorClass}
            style={{
              width: canvasWidth + 'px',
              height: canvasHeight + 'px',
              transform: `translate(${state.x}px, ${state.y}px) scale(${ownScale})`,
              transformOrigin: '0 0'
            }}
          >
            {defaultSlot}
          </div>
        </div>
        {showRuler && (
          <RulerWrapper
            {...commonProps}
            width={width!}
            propStyle={{ marginLeft: thick + 'px', width: rectWidth + 'px' }}
            height={thick!}
            start={startX!}
            startOther={startY!}
            selectStart={shadow.x!}
            selectLength={shadow.width}
            vertical={false}
          />
        )}
        {showRuler && (
          <RulerWrapper
            {...commonProps}
            propStyle={{ marginTop: thick + 'px', top: 0, height: rectHeight + 'px' }}
            width={thick!}
            height={height!}
            start={startY!}
            startOther={startX!}
            selectStart={shadow.y!}
            selectLength={shadow.height}
            vertical={true}
          />
        )}
        {showRuler && <a className="corner" style={cornerStyle} onClick={handleCornerClick} />}
      </div>
    )
  }
)

export default SketchRule

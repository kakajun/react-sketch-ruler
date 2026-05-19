import { eye64, closeEye64 } from './cornerImg64'
import React, { useState, useEffect, useMemo, useImperativeHandle, useRef, useCallback } from 'react'
import { fitRect } from '@sketch-ruler/core'
import type { TransformEngine, TransformState } from '@sketch-ruler/core'
import './index.less'
import RulerWrapper from './RulerWrapper'
import { useTransformEngine } from '../hooks/useTransformEngine'
import { useInputManager } from '../hooks/useInputManager'
import type { SketchRulerProps, PaletteType, SketchRulerMethods } from '../index-types'

const usePaletteConfig = (palette: PaletteType) => {
  return useMemo(
    () => ({
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
      ...palette
    }),
    [palette]
  )
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
      children,
      onHandleCornerClick,
      updateScale,
      onZoomChange,
      handleLine,
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
      return { x: 0, y: 0, scale }
    }, [autoCenter, canvasWidth, canvasHeight, rectWidth, rectHeight, paddingRatio, scale])

    const initialStateRef = useRef(getInitialState())

    const {
      engine,
      state,
      setTransform,
      zoomBy,
      zoomTo,
      reset
    } = useTransformEngine(initialStateRef.current, {
      minZoom: 0.1,
      maxZoom: 10,
      enableAnimation: false
    })

    // 将引擎的屏幕坐标偏移转换为 ruler 需要的 world 坐标 start
    const startX = useMemo(() => -state.x / state.scale, [state.x, state.scale])
    const startY = useMemo(() => -state.y / state.scale, [state.y, state.scale])
    const ownScale = state.scale

    // 使用 InputManager 处理输入事件
    const { getCursorClass } = useInputManager(
      engine,
      canvasEditRef,
      {
        zoomStep: 0.25,
        viewportSize: { width: rectWidth, height: rectHeight },
        selfHandle
      }
    )
    const cursorClass = getCursorClass()

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
      lockLine,
      scale: ownScale,
      handleLine,
      deleteLabel
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

    const zoomIn = () => zoomBy(0.25, rectWidth / 2, rectHeight / 2)
    const zoomOut = () => zoomBy(-0.25, rectWidth / 2, rectHeight / 2)
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
      panzoomInstance
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

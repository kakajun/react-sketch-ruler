import { eye64, closeEye64 } from './cornerImg64'
import Panzoom from 'simple-panzoom'
import type { PanzoomObject, PanzoomEventDetail } from 'simple-panzoom'
import React, { useState, useEffect, useMemo, useImperativeHandle, useRef } from 'react'
import './index.less'
import RulerWrapper from './RulerWrapper'
import type { SketchRulerProps, PaletteType, SketchRulerMethods } from '../index-types'

const usePaletteConfig = (palette: PaletteType) => {
  return useMemo(
    () => ({
      bgColor: '#f6f7f9',
      longfgColor: '#BABBBC',
      fontColor: '#7D8694', // ruler font color
      fontShadowColor: '#106ebe',
      shadowColor: '#e9f7fe', // ruler shadow color
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
      shadow = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      lines = {
        h: [],
        v: []
      },
      isShowReferLine = true,
      canvasWidth = 1000,
      canvasHeight = 700,
      snapsObj = {
        h: [],
        v: []
      },
      palette,
      snapThreshold = 5,
      gridRatio = 1,
      lockLine = false,
      selfHandle = false,
      panzoomOption,
      children,
      onHandleCornerClick,
      updateScale,
      onZoomChange,
      handleLine
    }: SketchRulerProps,
    ref
  ) => {
    const paletteConfig = usePaletteConfig(palette || {})
    const [startX, setStartX] = useState(0)
    const [startY, setStartY] = useState(0)
    const [cursorClass, setCursorClass] = useState('defaultCursor')
    let zoomStartX = 0
    let zoomStartY = 0
    const [ownScale, setOwnScale] = useState(1)
    const [showReferLine, setShowReferLine] = useState(isShowReferLine)
    const panzoomInstance = useRef<PanzoomObject | null>(null)
    const rectWidth = useMemo(() => width - thick, [width, thick])
    const rectHeight = useMemo(() => height - thick, [height, thick])

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
      handleLine
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

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (panzoomInstance.current) {
          panzoomInstance.current.zoomWithWheel(e)
        }
      }
    }

    const handleSpaceKeyDown = (e: KeyboardEvent) => {
      // 检查当前焦点元素
      const activeElement = document.activeElement
      const isEditableElement =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.classList.contains('monaco-editor') ||
        activeElement?.getAttribute('contenteditable') === 'true'
      // 如果焦点在可编辑元素中,则不处理空格事件
      if (isEditableElement) {
        return
      }

      if (e.key === ' ') {
        if (panzoomInstance.current) {
          setCursorClass('grabCursor')
          panzoomInstance.current.bind()
        }
        e.preventDefault()
      }
    }

    const handleSpaceKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        if (panzoomInstance.current) {
          setCursorClass('defaultCursor')
          panzoomInstance.current.destroy()
        }
      }
    }

    const getPanOptions = (scale: number) => ({
      noBind: true,
      startScale: scale,
      // cursor: 'default',
      startX: zoomStartX,
      startY: zoomStartY,
      smoothScroll: true,
      canvas: true,
      ...panzoomOption
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePanzoomChange = (e: any) => {
      const detail = e.detail as PanzoomEventDetail
      const { scale: newScale, dimsOut } = detail
      if (dimsOut) {
        setOwnScale(newScale)
        if (updateScale) {
          updateScale(newScale)
        }
        const left = (dimsOut.parent.left - dimsOut.elem.left) / newScale
        const top = (dimsOut.parent.top - dimsOut.elem.top) / newScale
        setStartX(left)
        if (onZoomChange) {
          onZoomChange(detail)
        }
        setStartY(top)
      }
    }

    const initPanzoom = () => {
      const elem = document.querySelector('.canvasedit')
      let tempScale = scale
      if (autoCenter) {
        tempScale = calculateTransform()
        setOwnScale(tempScale)
        if (updateScale) {
          updateScale(tempScale)
        }
      }
      const panzoom = Panzoom(elem as HTMLElement, getPanOptions(tempScale))
      panzoomInstance.current = panzoom
      if (elem) {
        elem.addEventListener('panzoomchange', handlePanzoomChange)
      }
    }

    /**
     * @desc: 居中算法
     */
    const calculateTransform = () => {
      const scaleX = (rectWidth * (1 - paddingRatio)) / canvasWidth
      const scaleY = (rectHeight * (1 - paddingRatio)) / canvasHeight
      const scale = Math.min(scaleX, scaleY)
      zoomStartX = rectWidth / 2 - canvasWidth / 2
      if (scale < 1) {
        zoomStartY =
          ((canvasHeight * scale) / 2 - canvasHeight / 2) / scale -
          (canvasHeight * scale - rectHeight) / scale / 2
      } else if (scale > 1) {
        zoomStartY =
          (canvasHeight * scale - canvasHeight) / 2 / scale +
          (rectHeight - canvasHeight * scale) / scale / 2
      } else {
        zoomStartY = 0
      }
      return scale
    }

    const reset = () => panzoomInstance.current?.reset()
    const zoomIn = () => panzoomInstance.current?.zoomIn()
    const zoomOut = () => panzoomInstance.current?.zoomOut()
    const setOtions = () => {
      let centerScale = calculateTransform()
      panzoomInstance.current?.setOptions(getPanOptions(centerScale))
    }

    const handleCornerClick = () => {
      setShowReferLine(!showReferLine)
      if (onHandleCornerClick) {
        onHandleCornerClick(!showReferLine)
      }
    }
    // 使用 useImperativeHandle 来暴露这些方法
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

    useEffect(() => {
      initPanzoom()
      if (!selfHandle) {
        document.addEventListener('wheel', handleWheel, { passive: false })
        document.addEventListener('keydown', handleSpaceKeyDown)
        document.addEventListener('keyup', handleSpaceKeyUp)
      }
      // 清理函数，用于移除监听器
      return () => {
        document.removeEventListener('wheel', handleWheel)
        document.removeEventListener('keydown', handleSpaceKeyDown)
        document.removeEventListener('keyup', handleSpaceKeyUp)
      }
    }, [canvasWidth, canvasHeight, width, height])

    useEffect(() => {
      setOtions()
    }, [panzoomOption])

    // 处理children
    const [defaultSlot, btnSlot] = React.Children.toArray(children).reduce(
      (acc: [React.ReactNode | null, React.ReactNode | null], child: React.ReactNode) => {
        if (React.isValidElement(child)) {
          if (child.props.slot === 'default' || !child.props.slot) {
            acc[0] = child
          } else if (child.props.slot === 'btn') {
            acc[1] = child
          }
        }
        return acc
      },
      [null, null] // 初始化 acc 为数组
    )
    return (
      <div className="StyledRuler" id="sketch-ruler">
        {btnSlot}
        <div className={'canvasedit-parent ' + cursorClass} style={rectStyle}>
          <div className={'canvasedit ' + cursorClass}>{defaultSlot}</div>
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
        {/* 竖直方向 */}
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

import { eye64, closeEye64 } from './cornerImg64'
import Panzoom from 'simple-panzoom'
import type { PanzoomObject, PanzoomEventDetail } from 'simple-panzoom'
import React, { useState, useEffect, useMemo, useImperativeHandle } from 'react'
import { StyledRuler } from './styles'
import RulerWrapper from './RulerWrapper'
import type { SketchRulerProps, PaletteType, SketchRulerMethods } from '../index-types'

const usePaletteConfig = (palette: PaletteType) => {
  return useMemo(
    () => ({
      bgColor: '#f6f7f9',
      longfgColor: '#BABBBC',
      fontColor: '#7D8694', // ruler font color
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
      onCornerClick,
      onUpdateScale,
      onZoomChange
    }: SketchRulerProps,
    ref
  ) => {
    const paletteConfig = usePaletteConfig(palette || {})
    const [startX, setStartX] = useState(0)
    const [startY, setStartY] = useState(0)
    let zoomStartX = 0
    let zoomStartY = 0
    const [ownScale, setOwnScale] = useState(1)
    const [showReferLine, setShowReferLine] = useState(isShowReferLine)
    const [panzoomInstance, setPanzoomInstance] = useState<PanzoomObject | null>(null)
    const rectWidth = width - thick
    const rectHeight = height - thick
    const changeLineState = () => {
      // onUpdateLockLine(val);
    }

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
      lockLine,
      scale: ownScale,
      changeLineState: changeLineState
    }

    const cornerStyle = {
      backgroundImage: isShowReferLine
        ? `url(${eyeIcon || eye64})`
        : `url(${closeEyeIcon || closeEye64})`,
      width: `${thick}px`,
      height: `${thick}px`,
      borderRight: `1px solid ${paletteConfig.borderColor}`,
      borderBottom: `1px solid ${paletteConfig.borderColor}`
    }

    const rectStyle = {
      background: paletteConfig.bgColor,
      width: rectWidth + 'px',
      height: rectHeight + 'px'
    }
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (panzoomInstance) {
          // 阻止浏览器的默认行为
          e.preventDefault()
          panzoomInstance.zoomWithWheel(e)
        }
      }
    }

    const handleSpaceKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        if (panzoomInstance) {
          panzoomInstance.bind()
        }
        e.preventDefault()
      }
    }

    const handleSpaceKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        if (panzoomInstance) {
          panzoomInstance.destroy()
        }
      }
    }

    if (!selfHandle) {
      console.log('wheel')
      document.addEventListener('wheel', handleWheel, { passive: false })
      document.addEventListener('keydown', handleSpaceKeyDown)
      document.addEventListener('keyup', handleSpaceKeyUp)
    }

    const getPanOptions = (scale: number) => ({
      noBind: true,
      startScale: scale,
      cursor: 'default',
      startX: zoomStartX,
      startY: zoomStartY,
      smoothScroll: true,
      ...panzoomOption
    })

    const initPanzoom = () => {
      const elem = document.querySelector('.canvasedit')
      let tempScale = scale
      if (autoCenter) {
        tempScale = calculateTransform()
      }
      const panzoom = Panzoom(elem as HTMLElement, getPanOptions(tempScale))
      setPanzoomInstance(panzoom)
      if (elem) {
        elem.addEventListener('panzoomchange', handlePanzoomChange)
      }
      setOwnScale(tempScale)
    }

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePanzoomChange = (e: any) => {
      const detail = e.detail as PanzoomEventDetail
      const { scale: newScale, dimsOut } = detail
      if (dimsOut) {
        if (onUpdateScale) {
          onUpdateScale(newScale)
        }

        setOwnScale(newScale)
        const left = (dimsOut.parent.left - dimsOut.elem.left) / newScale
        const top = (dimsOut.parent.top - dimsOut.elem.top) / newScale
        setStartX(left)
        console.log(left, 'startX.value')
        if (onZoomChange) {
          onZoomChange(detail)
        }
        setStartY(top)
      }
    }

    const reset = () => {
      if (panzoomInstance) {
        panzoomInstance.reset()
      }
    }

    const zoomIn = () => {
      if (panzoomInstance) {
        panzoomInstance.zoomIn()
      }
    }

    const zoomOut = () => {
      if (panzoomInstance) {
        panzoomInstance.zoomOut()
      }
    }

    const handleCornerClick = () => {
      setShowReferLine(!showReferLine)
      if (onCornerClick) {
        onCornerClick(!showReferLine)
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
    }, [canvasWidth, canvasHeight, width, height])

    useEffect(() => {
      if (panzoomInstance) {
        panzoomInstance.setOptions(getPanOptions(scale))
      }
    }, [panzoomOption])

    // 处理children
    const [defaultSlot, btnSlot] = React.Children.toArray(children).reduce(
      (acc: [React.ReactNode | null, React.ReactNode | null], child: React.ReactNode) => {
        if (React.isValidElement(child)) {
          if (child.props.slot === 'default') {
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
      <StyledRuler id="sketch-ruler" thickness={thick}>
        {btnSlot}
        <div className="canvasedit-parent" style={rectStyle}>
          <div className="canvasedit">{defaultSlot}</div>
        </div>
        {showRuler && (
          <RulerWrapper
            {...commonProps}
            width={width!}
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
      </StyledRuler>
    )
  }
)

export default SketchRule

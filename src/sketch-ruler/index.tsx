
import { eye64, closeEye64 } from './cornerImg64';
import Panzoom from 'simple-panzoom'
import type { PanzoomObject,Dimensions } from 'simple-panzoom'
import React, {useRef , useState, useEffect, useMemo,useImperativeHandle } from 'react'
import type { CanvasConfigs, RulerWrapperProps } from '../types/index'
import { StyledRuler } from './styles'
// import RulerWrapper from './RulerWrapper'
import type { SketchRulerProps, PaletteType } from '../index-types';

// 自定义事件接口
interface PanZoomChangeEvent extends CustomEvent<{ detail: { scale: number; dimsOut: Dimensions; } }> {}

interface SketchRulerMethods {
  reset: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

const usePaletteConfig = (palette: PaletteType) => {
  return useMemo(() => ({
    bgColor: '#f6f7f9', // ruler bg color
    longfgColor: '#BABBBC', // ruler longer mark color
    fontColor: '#7D8694', // ruler font color
    shadowColor: '#e9f7fe', // ruler shadow color
    lineColor: '#51d6a9',
    lineType: 'solid',
    lockLineColor: '#d4d7dc',
    hoverBg: '#000',
    hoverColor: '#fff',
    borderColor: '#eeeeef',
    ...palette
  }), [palette]);
};

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
      // shadow = {
      //   x: 0,
      //   y: 0,
      //   width: 0,
      //   height: 0
      // },
      // lines = {
      //   h: [],
      //   v: []
      // },
      isShowReferLine = true,
      canvasWidth = 1000,
      canvasHeight = 700,
      // snapsObj = {
      //   h: [],
      //   v: []
      // },
      palette,
      // snapThreshold = 5,
      // gridRatio = 1,
      // lockLine = false,
      selfHandle = false,
      panzoomOption,
      children,
      onUpdateScale,
      onZoomChange
    }: SketchRulerProps,
    ref) => {
      const localRef = useRef<HTMLDivElement>(null);
    const paletteConfig = usePaletteConfig(palette || {});
    const [canvasConfigs] = useState<CanvasConfigs>(() => {
      const { bgColor,  fontColor, shadowColor, lineColor, borderColor, cornerActiveColor } = palette!
      return {
        bgColor,
        shadowColor,
        fontColor,
        lineColor,
        borderColor,
        cornerActiveColor,
      } as CanvasConfigs
    })

    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [zoomStartX, setZoomStartX] = useState(0);
    const [zoomStartY, setZoomStartY] = useState(0);
    const [ownScale, setOwnScale] = useState(1);
    const [showReferLine, setShowReferLine] = useState(isShowReferLine);
    const [panzoomInstance, setPanzoomInstance] = useState<PanzoomObject | null>(null);
    const rectWidth = width - thick;
    const rectHeight = height - thick;


    const changeLineState = () => {
      // onUpdateLockLine(val);
    };

    const commonProps = {
      scale,
      canvasConfigs,
      onLineChange: changeLineState,
      isShowReferLine,

    } as RulerWrapperProps

    const cornerStyle = {
      backgroundImage: isShowReferLine
        ? `url(${eyeIcon || eye64})`
        : `url(${closeEyeIcon || closeEye64})`,
      width: `${thick}px`,
      height: `${thick}px`,
      borderRight: `1px solid ${paletteConfig.borderColor}`,
      borderBottom: `1px solid ${paletteConfig.borderColor}`
    };

    const rectStyle = {
      background: paletteConfig.bgColor,
      width: rectWidth + 'px',
      height: rectHeight + 'px'
    };
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (panzoomInstance) {
          panzoomInstance.zoomWithWheel(e);
        }
        e.preventDefault();
      }
    };

    const handleSpaceKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        if (panzoomInstance) {
          panzoomInstance.bind();
        }
        e.preventDefault();
      }
    };

    const handleSpaceKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        if (panzoomInstance) {
          panzoomInstance.destroy();
        }
      }
    };

    if (!selfHandle) {
      document.addEventListener('wheel', handleWheel);
      document.addEventListener('keydown', handleSpaceKeyDown);
      document.addEventListener('keyup', handleSpaceKeyUp);
    }


    const getPanOptions = (scale: number) => ({
      noBind: true,
      startScale: scale,
      cursor: 'default',
      startX: zoomStartX,
      startY: zoomStartY,
      smoothScroll: true,
      ...panzoomOption
    });

    const initPanzoom = () => {
      const elem = document.querySelector('.canvasedit');
      if (autoCenter) {
        scale = calculateTransform();
      }

      const panzoom = Panzoom(elem as HTMLElement, getPanOptions(scale));
      setPanzoomInstance(panzoom);
      if (elem) {
        elem.addEventListener('panzoomchange', handlePanzoomChange);
      }

    };

    const calculateTransform = () => {
      const scaleX = (rectWidth * (1 - paddingRatio)) / canvasWidth;
      const scaleY = (rectHeight * (1 - paddingRatio)) / canvasHeight;
      const scale = Math.min(scaleX, scaleY);
      setZoomStartX(rectWidth / 2 - canvasWidth / 2);
      setZoomStartY(rectHeight / 2 - canvasHeight / 2);
      return scale;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePanzoomChange = (e:any) => {
      const { scale: newScale, dimsOut } = e.detail;
      if (dimsOut) {
        if (onUpdateScale) {
          onUpdateScale(newScale);
        }
        console.log('newScale', newScale);

        setOwnScale(newScale);
        const left = (dimsOut.parent.left - dimsOut.elem.left) / newScale;
        const top = (dimsOut.parent.top - dimsOut.elem.top) / newScale;
        setStartX(left);
        if (onZoomChange) {
          onZoomChange(e.detail);
        }
        setStartY(top);
      }
    };



    const reset = () => {
      if (panzoomInstance) {
        panzoomInstance.reset();
      }
    };

    const zoomIn = () => {
      if (panzoomInstance) {
        panzoomInstance.zoomIn();
      }
    };

    const zoomOut = () => {
      if (panzoomInstance) {
        panzoomInstance.zoomOut();
      }
    };


  // 使用 useImperativeHandle 来暴露这些方法
  useImperativeHandle(ref, () => ({
    reset,
    zoomIn,
    zoomOut,
  }));


    useEffect(() => {
      setShowReferLine(isShowReferLine);
    }, [isShowReferLine]);

    useEffect(() => {
      initPanzoom();
    }, [canvasWidth, canvasHeight, width, height]);

    useEffect(() => {
      if (panzoomInstance) {
        panzoomInstance.setOptions(getPanOptions(scale));
      }
    }, [panzoomOption]);

    return <StyledRuler id="sketch-ruler"  ref={localRef} >
      <div className="canvasedit-parent" style={rectStyle} onWheel={(e) => e.preventDefault()}>
        <div className="canvasedit">
          {children}
        </div>
      </div>
      {/* <RulerWrapper {...commonProps} width={width!} height={thick!} start={startX!} lines={horLineArr!} selectStart={x!} selectLength={w!} />

      <RulerWrapper {...commonProps} width={thick!} height={height!} start={startY!} lines={verLineArr!} selectStart={y!} selectLength={h!} vertical />
      <a className={`corner${cornerActive ? ' active' : ''}`} style={{ backgroundColor: bgColor }} onClick={onCornerClick} />
      {isOpenMenuFeature && isShowMenu
        && <RulerContextMenu
          key={String(menuPosition.left) + String(menuPosition.top)}
          lang={lang!}
          vertical={vertical}
          handleLine={handleLine!}
          horLineArr={horLineArr!}
          verLineArr={verLineArr!}
          menuPosition={menuPosition}
          handleShowRuler={handleShowRuler!}
          isShowReferLine={isShowReferLine!}
          handleShowReferLine={handleShowReferLine!}
          onCloseMenu={onHandleCloseMenu}
          menuConfigs={menuConfigs}
        />
      } */}
    </StyledRuler>
  })

export default SketchRule

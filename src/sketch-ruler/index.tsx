import type { MouseEventHandler } from 'react'
import { eye64, closeEye64 } from './cornerImg64';
import Panzoom, { PanzoomObject } from 'simple-panzoom'
import { useState,useEffect } from 'react'
import type { CanvasConfigs, MenuColorProfile, RulerWrapperProps } from './types/index'
import { StyledRuler } from './styles'
// import RulerWrapper from './RulerWrapper'
import type { SketchRulerProps } from '../index-types';

interface RulerMethods {
  reset: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}




const SKETCH_RULE_DEFAULT_PROPS: Partial<SketchRulerProps> = {
  showRuler: true,
  scale: 1,
  rate: 1,
  thick: 16,
  width: 1400,
  height: 800,
  paddingRatio: 0.2,
  autoCenter: true,
  shadow: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  lines: {
    h: [],
    v: []
  },
  isShowReferLine: true,
  canvasWidth: 1000,
  canvasHeight: 700,
  snapsObj: {
    h: [],
    v: []
  },
  snapThreshold: 5,
  gridRatio: 1,
  lockLine: false,
  selfHandle: false,
}

const SketchRule = (props: Partial<SketchRulerProps>) => {
  props = { ...SKETCH_RULE_DEFAULT_PROPS, ...props }
  const [canvasConfigs] = useState<CanvasConfigs>(() => {
    const {  palette } = props
    const { bgColor, longFGColor, shortFGColor, fontColor, shadowColor, lineColor, borderColor, cornerActiveColor } = palette!
    return {
      bgColor,
      longFGColor,
      shortFGColor,
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
  const [showReferLine, setShowReferLine] = useState(props.isShowReferLine);
  const [panzoomInstance, setPanzoomInstance] = useState<PanzoomObject | null>(null);
  const rectWidth = props.width - props.thick;
  const rectHeight = props.height - props.thick;
  const handleLineChange = (arr: number[], vertical: boolean) => {
    const { horLineArr, verLineArr, handleLine } = props
    const newLines = vertical
      ? { h: horLineArr, v: [...arr] }
      : { h: [...arr], v: verLineArr }
    handleLine && handleLine(newLines)
  }

  const paletteCpu = ()=>{
    return {
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
      ...props.palette
    }
  }


  const changeLineState = (val) => {
    // onUpdateLockLine(val);
  };
  const render = () => {
    const { scale,eyeIcon,closeEyeIcon, isShowReferLine,panzoomOption, canvasWidth,canvasHeight,thick, width, height, startX, startY, horLineArr, shadow, lang, verLineArr, cornerActive, isOpenMenuFeature, palette: { bgColor } = {}, onCornerClick, handleShowRuler, handleLine, handleShowReferLine } = props
    const commonProps = {
      scale,
      canvasConfigs,
      onLineChange: changeLineState,
      isShowReferLine,
      handleShowReferLine,
    } as RulerWrapperProps

    const cornerStyle = {
      backgroundImage: isShowReferLine
        ? `url(${eyeIcon || eye64})`
        : `url(${closeEyeIcon || closeEye64})`,
      width: `${thick}px`,
      height: `${thick}px`,
      borderRight: `1px solid ${paletteCpu.borderColor}`,
      borderBottom: `1px solid ${paletteCpu.borderColor}`
    };

    const rectStyle = {
      background: paletteCpu.bgColor,
      width: rectWidth + 'px',
      height: rectHeight + 'px'
    };

    // useEffect(() => {
    //   initPanzoom();

    //   if (!selfHandle) {
    //     document.addEventListener('wheel', handleWheel);
    //     document.addEventListener('keydown', handleSpaceKeyDown);
    //     document.addEventListener('keyup', handleSpaceKeyUp);

    //     return () => {
    //       document.removeEventListener('wheel', handleWheel);
    //       document.removeEventListener('keydown', handleSpaceKeyDown);
    //       document.removeEventListener('keyup', handleSpaceKeyUp);
    //     };
    //   }
    // }, []);

    const getPanOptions = (scale:number) => ({
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
      let scale = scale;
      if (autoCenter) {
        scale = calculateTransform();
      }

      const panzoom =  Panzoom(elem as HTMLElement, getPanOptions(scale));
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

    const handlePanzoomChange = (e: { detail: { scale: number; dimsOut: object; }; }) => {
      const { scale, dimsOut } = e.detail;
      if (dimsOut) {
        onUpdateScale(scale);
        setOwnScale(scale);
        const left = (dimsOut.parent.left - dimsOut.elem.left) / scale;
        const top = (dimsOut.parent.top - dimsOut.elem.top) / scale;
        setStartX(left);
        onZoomChange(e.detail);
        setStartY(top);
      }
    };

    const handleWheel = (e:WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (panzoomInstance) {
          panzoomInstance.zoomWithWheel(e);
        }
        e.preventDefault();
      }
    };

    const handleSpaceKeyDown = (e:KeyboardEvent) => {
      if (e.key === ' ') {
        if (panzoomInstance) {
          panzoomInstance.bind();
        }
        e.preventDefault();
      }
    };

    const handleSpaceKeyUp = (e:KeyboardEvent) => {
      if (e.key === ' ') {
        if (panzoomInstance) {
          panzoomInstance.destroy();
        }
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





    // useEffect(() => {
    //   setShowReferLine(isShowReferLine);
    // }, [isShowReferLine]);

    // useEffect(() => {
    //   initPanzoom();
    // }, [canvasWidth, canvasHeight, width, height]);

    // useEffect(() => {
    //   if (panzoomInstance) {
    //     panzoomInstance.setOptions(getPanOptions(scale));
    //   }
    // }, [panzoomOption]);

    return <StyledRuler id="sketch-ruler"  >
      <div className="canvasedit-parent" style={rectStyle} onWheel={(e) => e.preventDefault()}>
        <div className="canvasedit">
          {props.children}
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
  }
  return render()
}

export default SketchRule

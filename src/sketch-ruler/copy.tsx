import React, { useState, useEffect, useRef,forwardRef } from 'react';
// import RulerWrapper from './RulerWrapper';
import { eye64, closeEye64 } from './cornerImg64';
import Panzoom, { PanzoomObject } from 'simple-panzoom'
import { merge } from '../canvas-ruler/utils';
import type { SketchRulerProps } from '../index-types';
interface RulerMethods {
  reset: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}




const SketchRuler = forwardRef<HTMLDivElement, SketchRulerProps>(function SketchRuler(
  props,
  ref
) {
  const {
    showRuler= true,
    eyeIcon,
    closeEyeIcon,
    scale= 1,
    rate= 1,
    thick= 16,
    width= 1400,
    height= 800,
    paddingRatio= 0.2,
    autoCenter= true,
    shadow= {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    },
    lines= {
      h: [],
      v: [],
    },
    isShowReferLine= true,
    canvasWidth= 1000,
    canvasHeight= 700,
    snapsObj= {
      h: [],
      v: [],
    },
    snapThreshold= 5,
    gridRatio= 1,
    lockLine= false,
    selfHandle= false,
    palette,
    panzoomOption
  } = props;
  // static defaultProps=defaultProps;
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [zoomStartX, setZoomStartX] = useState(0);
  const [zoomStartY, setZoomStartY] = useState(0);
  const [ownScale, setOwnScale] = useState(1);
  const [showReferLine, setShowReferLine] = useState(isShowReferLine);
  const [panzoomInstance, setPanzoomInstance] = useState<PanzoomObject | null>(null);
  const rectWidth = width - thick;
  const rectHeight = height - thick;

  const paletteCpu = merge(
    {
      bgColor: '#f6f7f9', // ruler bg color
      longfgColor: '#BABBBC', // ruler longer mark color
      fontColor: '#7D8694', // ruler font color
      shadowColor: '#e9f7fe', // ruler shadow color
      lineColor: '#EB5648',
      lineType: 'solid',
      lockLineColor: '#d4d7dc',
      hoverBg: '#000',
      hoverColor: '#fff',
      borderColor: '#eeeeef',
      cornerActiveColor: 'rgb(235, 86, 72, 0.6)'
    },
    palette || {}
  );

  const cornerStyle = {
    backgroundImage: showReferLine
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



  useEffect(() => {
    initPanzoom();

    if (!selfHandle) {
      document.addEventListener('wheel', handleWheel);
      document.addEventListener('keydown', handleSpaceKeyDown);
      document.addEventListener('keyup', handleSpaceKeyUp);

      return () => {
        document.removeEventListener('wheel', handleWheel);
        document.removeEventListener('keydown', handleSpaceKeyDown);
        document.removeEventListener('keyup', handleSpaceKeyUp);
      };
    }
  }, []);

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

  React.useImperativeHandle(ref, () => ({
    reset,
    zoomIn,
    zoomOut
  }));
  const onCornerClick = () => {
    setShowReferLine(!showReferLine);
    onCornerClick(showReferLine);
  };

  const changeLineState = (val) => {
    onUpdateLockLine(val);
  };

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

  return (
    <div className="sketch-ruler">
      <div className="canvasedit-parent" style={rectStyle} onWheel={(e) => e.preventDefault()}>
        <div className="canvasedit">
          {props.children}
        </div>
      </div>
      {/* <RulerWrapper
        style={{ marginLeft: `${thick}px`, width: `${rectWidth}px` }}
        vShow={showRuler}
        vertical={false}
        width={width}
        height={thick}
        isShowReferLine={showReferLine}
        thick={thick}
        start={startX}
        startOther={startY}
        lines={lines}
        selectStart={shadow.x}
        snapThreshold={snapThreshold}
        snapsObj={snapsObj}
        selectLength={shadow.width}
        scale={ownScale}
        parentRect={parentRect}
        palette={paletteCpu}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        rate={rate}
        gridRatio={gridRatio}
        lockLine={lockLine}
        onChangeLineState={changeLineState}
      /> */}
      {/* <RulerWrapper
        style={{ marginTop: `${thick}px`, top: 0, height: `${rectHeight}px` }}
        vShow={showRuler}
        vertical={true}
        width={thick}
        height={height}
        isShowReferLine={showReferLine}
        thick={thick}
        start={startY}
        startOther={startX}
        lines={lines}
        selectStart={shadow.y}
        selectLength={shadow.height}
        snapThreshold={snapThreshold}
        snapsObj={snapsObj}
        scale={ownScale}
        parentRect={parentRect}
        palette={paletteCpu}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        rate={rate}
        gridRatio={gridRatio}
        lockLine={lockLine}
        onChangeLineState={changeLineState}
      /> */}
      <a
        vShow={showRuler}
        className="corner"
        style={cornerStyle}
        onClick={onCornerClick}
      />
    </div>
  );
});
export default SketchRuler;

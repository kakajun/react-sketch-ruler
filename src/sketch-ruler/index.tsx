import React, { useState, useEffect, useRef } from 'react';
import RulerWrapper from './ruler-wrapper';
import { eye64, closeEye64 } from './cornerImg64';
import Panzoom, { PanzoomObject } from 'simple-panzoom';
import { merge } from '../canvas-ruler/utils';

const SketchRuler = (props) => {
  const [parentRect, setParentRect] = useState(null);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [zoomStartX, setZoomStartX] = useState(0);
  const [zoomStartY, setZoomStartY] = useState(0);
  const [ownScale, setOwnScale] = useState(1);
  const [showReferLine, setShowReferLine] = useState(props.isShowReferLine);
  const [panzoomInstance, setPanzoomInstance] = useState(null);

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
    props.palette || {}
  );

  const cornerStyle = {
    backgroundImage: showReferLine
      ? `url(${props.eyeIcon || eye64})`
      : `url(${props.closeEyeIcon || closeEye64})`,
    width: `${props.thick}px`,
    height: `${props.thick}px`,
    borderRight: `1px solid ${paletteCpu.borderColor}`,
    borderBottom: `1px solid ${paletteCpu.borderColor}`
  };

  const rectStyle = {
    background: paletteCpu.bgColor,
    width: rectWidth + 'px',
    height: rectHeight + 'px'
  };

  const rectWidth = props.width - props.thick;
  const rectHeight = props.height - props.thick;

  useEffect(() => {
    initPanzoom();

    if (!props.selfHandle) {
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

  const getPanOptions = (scale) => ({
    noBind: true,
    startScale: scale,
    cursor: 'default',
    startX: zoomStartX,
    startY: zoomStartY,
    smoothScroll: true,
    ...props.panzoomOption
  });

  const initPanzoom = () => {
    const elem = document.querySelector('.canvasedit');
    let scale = props.scale;
    if (props.autoCenter) {
      scale = calculateTransform();
    }

    const panzoom = new Panzoom(elem, getPanOptions(scale));
    setPanzoomInstance(panzoom);

    elem.addEventListener('panzoomchange', handlePanzoomChange);
  };

  const calculateTransform = () => {
    const scaleX = (rectWidth * (1 - props.paddingRatio)) / props.canvasWidth;
    const scaleY = (rectHeight * (1 - props.paddingRatio)) / props.canvasHeight;
    const scale = Math.min(scaleX, scaleY);
    setZoomStartX(rectWidth / 2 - props.canvasWidth / 2);
    setZoomStartY(rectHeight / 2 - props.canvasHeight / 2);
    return scale;
  };

  const handlePanzoomChange = (e) => {
    const { scale, dimsOut } = e.detail;
    if (dimsOut) {
      props.onUpdateScale(scale);
      setOwnScale(scale);
      const left = (dimsOut.parent.left - dimsOut.elem.left) / scale;
      const top = (dimsOut.parent.top - dimsOut.elem.top) / scale;
      setStartX(left);
      props.onZoomChange(e.detail);
      setStartY(top);
    }
  };

  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (panzoomInstance) {
        panzoomInstance.zoomWithWheel(e);
      }
      e.preventDefault();
    }
  };

  const handleSpaceKeyDown = (e) => {
    if (e.key === ' ') {
      if (panzoomInstance) {
        panzoomInstance.bind();
      }
      e.preventDefault();
    }
  };

  const handleSpaceKeyUp = (e) => {
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

  const onCornerClick = () => {
    setShowReferLine(!showReferLine);
    props.onCornerClick(showReferLine);
  };

  const changeLineState = (val) => {
    props.onUpdateLockLine(val);
  };

  useEffect(() => {
    setShowReferLine(props.isShowReferLine);
  }, [props.isShowReferLine]);

  useEffect(() => {
    initPanzoom();
  }, [props.canvasWidth, props.canvasHeight, props.width, props.height]);

  useEffect(() => {
    if (panzoomInstance) {
      panzoomInstance.setOptions(getPanOptions(props.scale));
    }
  }, [props.panzoomOption]);

  return (
    <div className="sketch-ruler">
      <div className="canvasedit-parent" style={rectStyle} onWheel={(e) => e.preventDefault()}>
        <div className="canvasedit">
          {props.children}
        </div>
      </div>
      <RulerWrapper
        style={{ marginLeft: `${props.thick}px`, width: `${rectWidth}px` }}
        vShow={props.showRuler}
        vertical={false}
        width={props.width}
        height={props.thick}
        isShowReferLine={showReferLine}
        thick={props.thick}
        start={startX}
        startOther={startY}
        lines={props.lines}
        selectStart={props.shadow.x}
        snapThreshold={props.snapThreshold}
        snapsObj={props.snapsObj}
        selectLength={props.shadow.width}
        scale={ownScale}
        parentRect={parentRect}
        palette={paletteCpu}
        canvasWidth={props.canvasWidth}
        canvasHeight={props.canvasHeight}
        rate={props.rate}
        gridRatio={props.gridRatio}
        lockLine={props.lockLine}
        onChangeLineState={changeLineState}
      />
      <RulerWrapper
        style={{ marginTop: `${props.thick}px`, top: 0, height: `${rectHeight}px` }}
        vShow={props.showRuler}
        vertical={true}
        width={props.thick}
        height={props.height}
        isShowReferLine={showReferLine}
        thick={props.thick}
        start={startY}
        startOther={startX}
        lines={props.lines}
        selectStart={props.shadow.y}
        selectLength={props.shadow.height}
        snapThreshold={props.snapThreshold}
        snapsObj={props.snapsObj}
        scale={ownScale}
        parentRect={parentRect}
        palette={paletteCpu}
        canvasWidth={props.canvasWidth}
        canvasHeight={props.canvasHeight}
        rate={props.rate}
        gridRatio={props.gridRatio}
        lockLine={props.lockLine}
        onChangeLineState={changeLineState}
      />
      <a
        vShow={props.showRuler}
        className="corner"
        style={cornerStyle}
        onClick={onCornerClick}
      />
    </div>
  );
};

export default SketchRuler;

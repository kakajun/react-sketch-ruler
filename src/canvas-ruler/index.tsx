import React, {memo, useRef, useEffect, useState, useCallback } from 'react';
// import { drawCanvasRuler } from './utils';

const CanvasRuler = ({
  scale,
  palette,
  vertical,
  start,
  width,
  height,
  selectStart,
  selectLength,
  canvasWidth,
  canvasHeight,
  rate,
  gridRatio,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D | null>(null);
  const [ratioValue, setRatioValue] = useState(window.devicePixelRatio || 1);

  // useEffect(() => {
  //   const handleResize = () => {
  //     setRatioValue(window.devicePixelRatio || 1);
  //     updateCanvas();
  //   };

  //   window.addEventListener('resize', handleResize);

  //   return () => {
  //     window.removeEventListener('resize', handleResize);
  //   };
  // }, []);

  // useEffect(() => {
  //   if (canvasRef.current) {
  //     const ctx = canvasRef.current.getContext('2d');
  //     setCanvasContext(ctx);
  //     updateCanvas();
  //   }
  // }, [canvasRef]);

  // const updateCanvas = useCallback(() => {
  //   if (canvasRef.current && canvasContext) {
  //     canvasRef.current.width = width;
  //     canvasRef.current.height = height;

  //     canvasContext.font = `${12 * ratioValue}px -apple-system, "Helvetica Neue", ".SFNSText-Regular", "SF UI Text", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Zen Hei", sans-serif`;
  //     canvasContext.lineWidth = 1;
  //     canvasContext.textBaseline = 'middle';

  //     drawRuler();
  //   }
  // }, [width, height, ratioValue]);

  // const drawRuler = useCallback(() => {
  //   const options = {
  //     scale: scale / rate,
  //     width,
  //     height,
  //     palette,
  //     canvasWidth: canvasWidth * rate,
  //     canvasHeight: canvasHeight * rate,
  //     ratio: ratioValue,
  //     rate,
  //     gridRatio,
  //   };

  //   if (canvasContext) {
  //     drawCanvasRuler(
  //       canvasContext,
  //       start * rate,
  //       selectStart,
  //       selectLength,
  //       options,
  //       !vertical
  //     );
  //   }
  // }, [scale, rate, width, height, palette, canvasWidth, canvasHeight, ratioValue, start, selectStart, selectLength, vertical]);

  // useEffect(() => {
  //   drawRuler();
  // }, [drawRuler]);

  // const handleDragStart = useCallback(() => {
  //   setIsDragging(true);
  // }, []);

  return (
    <div></div>
    // <canvas
    //   ref={canvasRef}
    //   className="ruler"
    //   style={{
    //     [vertical ? 'borderRight' : 'borderBottom']: `1px solid ${palette.borderColor || '#eeeeef'}`,
    //   }}
    //   onMouseDown={handleDragStart}
    // />
  );
};

export default memo(CanvasRuler)

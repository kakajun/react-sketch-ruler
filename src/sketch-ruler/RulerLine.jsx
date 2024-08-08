import React, { useState, useEffect, useRef, useCallback } from 'react';
import useLine from './useLine';
import { debounce } from '../canvas-ruler/utils';
import type {LineProps} from '../index-types';


const LineComponent = ({
  scale,
  thick,
  palette,
  index,
  start,
  vertical,
  value,
  canvasWidth,
  canvasHeight,
  lines,
  isShowReferLine,
  rate,
  snapThreshold,
  snapsObj,
  lockLine,
}: LineProps) => {
  const [showLabel, setShowLabel] = useState(false);
  const [startValue, setStartValue] = useState(value ?? 0);
  const [isInscale, setIsInscale] = useState(false);

  const { actionStyle, handleMouseMove, handleMouseDown, labelContent } = useLine(
    {
      palette,
      scale,
      snapsObj,
      lines,
      canvasWidth,
      canvasHeight,
      snapThreshold,
      rate,
      lockLine,
    },
    vertical
  );

  const showLine = startValue >= start;

  const offsetStyle = {
    [vertical ? 'top' : 'left']: `${(startValue - start) * scale}px`,
  };

  const borderCursor = {
    pointerEvents: lockLine || isInscale ? 'none' : 'auto',
    cursor:
      isShowReferLine && !lockLine
        ? vertical
          ? 'ns-resize'
          : 'ew-resize'
        : 'default',
    ...(vertical
      ? { borderTop: `1px ${palette.lineType} ${lockLine ? palette.lockLineColor : palette.lineColor}` }
      : { borderLeft: `1px ${palette.lineType} ${lockLine ? palette.lockLineColor : palette.lineColor}` }),
  };

  useEffect(() => {
    setStartValue(value ?? 0);
  }, [value]);

  const deactivateAfterDelay = useCallback(
    debounce(() => {
      setIsInscale(false);
    }, 1000),
    []
  );

  useEffect(() => {
    setIsInscale(true);
    deactivateAfterDelay();
  }, [scale, deactivateAfterDelay]);

  const handleMouseenter = () => {
    if (!lockLine) {
      setShowLabel(true);
    }
  };

  return (
    <div
      style={{ ...offsetStyle, ...borderCursor }}
      className="line"
      onMouseEnter={handleMouseenter}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowLabel(false)}
      onMouseDown={handleMouseDown}
      hidden={!showLine}
    >
      <div className="action" style={actionStyle}>
        {showLabel && <span className="value">{labelContent}</span>}
      </div>
    </div>
  );
};

export default LineComponent;

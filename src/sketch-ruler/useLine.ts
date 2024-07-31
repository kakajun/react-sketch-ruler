import { useState } from 'react';

type PaletteType = {
  hoverBg: string;
  hoverColor: string;
};

type SnapsObjType = {
  h: number[];
  v: number[];
};

type LinesType = {
  h: number[];
  v: number[];
};

type PropsType = {
  palette: PaletteType;
  scale: number;
  snapsObj: SnapsObjType;
  lines: LinesType;
  canvasWidth: number;
  canvasHeight: number;
  snapThreshold: number;
  rate: number;
  lockLine: boolean;
};

export function useLine(props: PropsType, vertical: boolean) {
  const [offsetLine, setOffsetLine] = useState(0);
  const [startValue, setStartValue] = useState(0);

  const actionStyle = {
    backgroundColor: props.palette.hoverBg,
    color: props.palette.hoverColor,
    [vertical ? 'top' : 'left']: '-8px',
    [vertical ? 'left' : 'top']: `${offsetLine + 10}px`,
  };

  const handleMouseMove = ({ offsetX, offsetY }: { offsetX: number; offsetY: number }) => {
    setOffsetLine(vertical ? offsetX : offsetY);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (props.lockLine) return;

    const startPosition = vertical ? e.clientY : e.clientX;
    const initialValue = startValue;

    const moveHandler = (e: MouseEvent) => {
      const currentPosition = vertical ? e.clientY : e.clientX;
      const delta = (currentPosition - startPosition) / props.scale;
      let nextPos = delta + initialValue;
      let guidePos = nextPos;
      const snaps = vertical ? props.snapsObj.h : props.snapsObj.v;
      const guideSnaps = [...snaps].sort((a, b) => Math.abs(guidePos - a) - Math.abs(guidePos - b));
      if (guideSnaps.length && Math.abs(guideSnaps[0] - nextPos) < props.snapThreshold) {
        guidePos = guideSnaps[0];
        nextPos = guidePos;
      }
      setStartValue(Math.round(nextPos));
    };

    const mouseUpHandler = () => {
      document.removeEventListener('mousemove', moveHandler);
      handleLineRelease(startValue);
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', mouseUpHandler, { once: true });
  };

  const handleLineRelease = (value: number, index?: number) => {
    const linesArrs = vertical ? props.lines.h : props.lines.v;
    const isOutOfRange = checkBoundary(value);
    if (isOutOfRange) {
      if (typeof index === 'number') {
        linesArrs.splice(index, 1);
      }
      return; // New addition out of range, do nothing
    }
    if (typeof index !== 'number') {
      linesArrs.push(value);
    }
  };

  const checkBoundary = (value: number) => {
    const maxOffset = vertical ? props.canvasHeight : props.canvasWidth;
    return value < 0 || value > maxOffset;
  };

  const labelContent = checkBoundary(startValue)
    ? 'Release to delete'
    : `${vertical ? 'Y' : 'X'}: ${startValue * props.rate}`;

  return {
    startValue,
    actionStyle,
    labelContent,
    handleMouseMove,
    handleMouseDown,
  };
}

import { useState ,MouseEventHandler,useMemo ,useEffect} from 'react';
import type { PaletteType, LineType } from '../index-types'
interface Props {
  palette: PaletteType
  lockLine: boolean
  scale: number
  snapThreshold: number
  snapsObj: LineType
  lines: LineType
  canvasHeight: number
  canvasWidth: number
  rate: number
  value?: number
  index?: number
}

export default function useLine(props: Props, vertical: boolean) {
  const [offsetLine, setOffsetLine] = useState(0);
  const [startValue, setStartValue] = useState(0);

  useEffect(() => {
    setStartValue(props.value || 0);
  }, []); // 空数组依赖确保此 effect 只运行一次

  const actionStyle = {
    backgroundColor: props.palette.hoverBg,
    color: props.palette.hoverColor,
    [vertical ? 'top' : 'left']: '-8px',
    [vertical ? 'left' : 'top']: `${offsetLine + 10}px`,
  };

  const handleMouseMove : MouseEventHandler<HTMLDivElement> = (event) => {
    const offsetX = event.nativeEvent.offsetX;
    const offsetY = event.nativeEvent.offsetY;
    console.log('offsetX', offsetX);
    console.log('offsetY', offsetY);

    setOffsetLine(vertical ? offsetX : offsetY);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (props.lockLine) return;

    const startPosition = vertical ? e.clientY : e.clientX;
    const initialValue = startValue;
      debugger
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

  // const labelContent = useMemo(() => {
  //   return  checkBoundary(startValue)
  //   ? 'Release to delete'
  //   : `${vertical ? 'Y' : 'X'}: ${startValue * props.rate}`;},
  //   [startValue,  vertical]
  // )
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

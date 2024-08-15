import { useState, useEffect, useCallback, useMemo } from 'react'
import useLine from './useLine'
import { debounce } from '../canvas-ruler/utils'
import type { LineProps } from '../index-types'
const LineComponent = ({
  scale,
  rate,
  palette,
  index,
  start,
  vertical,
  value,
  canvasWidth,
  canvasHeight,
  lines,
  isShowReferLine,
  snapThreshold,
  snapsObj,
  lockLine,
  handleLine
}: LineProps) => {
  const [showLabel, setShowLabel] = useState(false)
  const [isInscale, setIsInscale] = useState(false)
  const { startValue, setStartValue, actionStyle, handleMouseMove, handleMouseDown, labelContent } =
    useLine(
      {
        palette,
        scale,
        snapsObj,
        lines,
        canvasWidth,
        canvasHeight,
        snapThreshold,
        lockLine,
        index,
        value,
        rate,
        handleLine
      },
      vertical
    )

  const showLine = useMemo(() => startValue >= start, [start, startValue, vertical])
  type PointerEvents = 'auto' | 'none'
  const combinedStyle = useMemo(() => {
    const { lineType, lockLineColor, lineColor } = palette
    const borderColor = lockLine ? lockLineColor : (lineColor ?? 'black')
    const pointerEvents: PointerEvents = lockLine || isInscale ? 'none' : 'auto'
    const cursor = isShowReferLine && !lockLine ? (vertical ? 'ns-resize' : 'ew-resize') : 'default'
    const borderProperty = vertical ? 'borderTop' : 'borderLeft'
    const offsetPx = (startValue - start) * scale

    return {
      [borderProperty]: `1px ${lineType} ${borderColor}`,
      pointerEvents: pointerEvents,
      cursor,
      [vertical ? 'top' : 'left']: `${offsetPx}px`
    }
  }, [palette, lockLine, isInscale, isShowReferLine, vertical, startValue, start, scale])

  const deactivateAfterDelay = useCallback(
    debounce(() => {
      setIsInscale(false)
    }, 1000),
    []
  )

  useEffect(() => {
    setIsInscale(true)
    deactivateAfterDelay()
  }, [scale])

  useEffect(() => {
    setStartValue(value)
  }, [value])
  const handleMouseenter = () => {
    if (!lockLine) {
      setShowLabel(true)
    }
  }

  return (
    <div
      style={combinedStyle}
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
  )
}

export default LineComponent

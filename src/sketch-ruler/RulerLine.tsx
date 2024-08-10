import { useState, useEffect, useCallback } from 'react'
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
  lockLine
}: LineProps) => {
  const [showLabel, setShowLabel] = useState(false)
  const [isInscale, setIsInscale] = useState(false)
  const { startValue, actionStyle, handleMouseMove, handleMouseDown, labelContent } = useLine(
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
      rate
    },
    vertical
  )

  const showLine = startValue >= start

  const offsetStyle = {
    [vertical ? 'top' : 'left']: `${(startValue - start) * scale}px`
  }

  type PointerEvents = 'auto' | 'none'
  const bordStyle = `1px ${palette.lineType} ${lockLine ? palette.lockLineColor : palette.lineColor}`
  const borderCursor: {
    borderTop?: string
    borderLeft?: string
    pointerEvents?: PointerEvents
    cursor?: string
  } = {
    pointerEvents: lockLine || isInscale ? 'none' : 'auto',
    cursor: isShowReferLine && !lockLine ? (vertical ? 'ns-resize' : 'ew-resize') : 'default',
    [vertical ? 'borderTop' : 'borderLeft']: bordStyle
  }

  const deactivateAfterDelay = useCallback(
    debounce(() => {
      setIsInscale(false)
    }, 1000),
    []
  )

  useEffect(() => {
    setIsInscale(true)
    deactivateAfterDelay()
  }, [scale, deactivateAfterDelay])

  const handleMouseenter = () => {
    if (!lockLine) {
      setShowLabel(true)
    }
  }

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
  )
}

export default LineComponent

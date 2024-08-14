import { useState, useRef, MouseEventHandler, useEffect } from 'react'
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

export default function useLine(
  props: Props,
  vertical: boolean,
  setLocalLines?: (lines: LineType) => void
) {
  const [offsetLine, setOffsetLine] = useState(0)
  const startValue = useRef<number>(props.value || 0)

  const actionStyle = {
    backgroundColor: props.palette.hoverBg,
    color: props.palette.hoverColor,
    [vertical ? 'top' : 'left']: '-8px',
    [vertical ? 'left' : 'top']: `${offsetLine + 10}px`
  }

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = (event) => {
    const offsetX = event.nativeEvent.offsetX
    const offsetY = event.nativeEvent.offsetY
    setOffsetLine(vertical ? offsetX : offsetY)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    return new Promise<void>((resolve) => {
      if (props.lockLine) return
      const startPosition = vertical ? e.clientY : e.clientX
      const initialValue = startValue.current
      const moveHandler = (e: MouseEvent) => {
        const currentPosition = vertical ? e.clientY : e.clientX
        const delta = (currentPosition - startPosition) / props.scale
        let nextPos = delta + initialValue
        let guidePos = nextPos
        const snaps = vertical ? props.snapsObj.h : props.snapsObj.v
        const guideSnaps = [...snaps].sort(
          (a, b) => Math.abs(guidePos - a) - Math.abs(guidePos - b)
        )
        if (guideSnaps.length && Math.abs(guideSnaps[0] - nextPos) < props.snapThreshold) {
          guidePos = guideSnaps[0]
          nextPos = guidePos
        }
        startValue.current = Math.round(nextPos)
      }
      const mouseUpHandler = () => {
        document.removeEventListener('mousemove', moveHandler)
        handleLineRelease(startValue.current, props.index)
        resolve()
      }

      document.addEventListener('mousemove', moveHandler)
      document.addEventListener('mouseup', mouseUpHandler, { once: true })
    })
  }

  const handleLineRelease = (value: number, index?: number) => {

    const linesArrs = vertical ? props.lines.h : props.lines.v
    const isOutOfRange = checkBoundary(value)
    if (isOutOfRange) {
      if (typeof index === 'number') {
        linesArrs.splice(index, 1)
        if (setLocalLines) {
          console.log('删除了')

          setLocalLines(props.lines)
        }
      } else {
        return // 新增越界,什么也不做
      }
    }
    if (typeof index !== 'number') {
      linesArrs.push(value)
    }
  }

  const checkBoundary = (value: number) => {
    const maxOffset = vertical ? props.canvasHeight : props.canvasWidth
    return value < 0 || value > maxOffset
  }

  const labelContent = checkBoundary(startValue.current)
    ? '放开删除'
    : `${vertical ? 'Y' : 'X'}: ${startValue.current * props.rate}`

  return {
    startValue,
    actionStyle,
    labelContent,
    handleMouseMove,
    handleMouseDown
  }
}

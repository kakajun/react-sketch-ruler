import { useState, MouseEventHandler } from 'react'
import type { GuideLine } from '@sketch-ruler/core'
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
  handleLine?: (props: LineType) => void
  deleteLabel?: string
  guideLines?: GuideLine[]
  guideLine?: GuideLine
  addLine?: (line: Omit<GuideLine, 'id'>) => void
  removeLine?: (id: string) => void
  updateLine?: (id: string, position: number) => void
}

export default function useLine(props: Props, vertical: boolean) {
  const [offsetLine, setOffsetLine] = useState(0)
  const [startValue, setStartValue] = useState(0)
  /* 记录hover标签 */
  const actionStyle = {
    backgroundColor: props.palette.hoverBg,
    color: props.palette.hoverColor,
    [vertical ? 'top' : 'left']: '-8px',
    [vertical ? 'left' : 'top']: `${offsetLine + 10}px`
  }

  const hasGuideApi =
    props.guideLines !== undefined &&
    props.addLine &&
    props.removeLine &&
    props.updateLine

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = (event) => {
    const offsetX = event.nativeEvent.offsetX
    const offsetY = event.nativeEvent.offsetY
    setOffsetLine(vertical ? offsetX : offsetY)
  }

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement | HTMLCanvasElement>,
    propValue?: number
  ) => {
    e.stopPropagation() // 阻止冒泡
    return new Promise<void>((resolve) => {
      if (props.lockLine) return
      const startPosition = vertical ? e.clientY : e.clientX
      const initialValue = propValue || startValue
      let tempStartValue = initialValue
      const moveHandler = (e: MouseEvent) => {
        const currentPosition = vertical ? e.clientY : e.clientX
        const delta = (currentPosition - startPosition) / props.scale
        let nextPos = delta + initialValue
        let guidePos = nextPos
        const snaps = vertical ? props.snapsObj.h : props.snapsObj.v
        const guideSnaps = [...snaps].sort(
          (a, b) => Math.abs(guidePos - a) - Math.abs(guidePos - b)
        )
        if (
          guideSnaps.length &&
          Math.abs(guideSnaps[0] - nextPos) < props.snapThreshold / props.scale
        ) {
          guidePos = guideSnaps[0]
          nextPos = guidePos
        }
        tempStartValue = Math.round(nextPos)
        setStartValue(Math.round(nextPos))
      }
      const mouseUpHandler = () => {
        document.removeEventListener('mousemove', moveHandler)
        handleLineRelease(tempStartValue, props.index)
        resolve()
      }

      document.addEventListener('mousemove', moveHandler)
      document.addEventListener('mouseup', mouseUpHandler, { once: true })
    })
  }

  const handleLineRelease = (value: number, index?: number) => {
    const isOutOfRange = checkBoundary(value)

    if (hasGuideApi) {
      const guideLine =
        typeof index === 'number'
          ? props.guideLines!.filter((l) => l.orientation === (vertical ? 'v' : 'h'))[index]
          : undefined

      if (isOutOfRange) {
        if (guideLine) {
          props.removeLine!(guideLine.id)
        } else if (typeof index !== 'number') {
          return
        }
      } else {
        if (!guideLine) {
          props.addLine!({
            orientation: vertical ? 'v' : 'h',
            position: value
          })
        } else {
          props.updateLine!(guideLine.id, value)
        }
      }
      return
    }

    // 旧模式：直接操作 lines 数组
    const linesArrs = vertical ? props.lines.h : props.lines.v
    if (!linesArrs) {
      return
    }
    if (isOutOfRange) {
      if (typeof index === 'number') {
        linesArrs.splice(index, 1)
        if (props.handleLine) {
          props.handleLine(props.lines)
        }
      } else {
        return // 新增越界,什么也不做
      }
    } else {
      if (typeof index !== 'number') {
        linesArrs.push(value)
        if (props.handleLine) {
          props.handleLine(props.lines)
        }
      } else {
        // 移动修改
        linesArrs[index] = value
        if (props.handleLine) {
          props.handleLine({ ...props.lines, [vertical ? 'h' : 'v']: linesArrs })
        }
      }
    }
  }

  const checkBoundary = (value: number) => {
    const maxOffset = vertical ? props.canvasHeight : props.canvasWidth
    return value < 0 || value > maxOffset
  }

  const labelContent = checkBoundary(startValue)
    ? props.deleteLabel || '放开删除'
    : `${vertical ? 'Y' : 'X'}: ${startValue * props.rate}`

  return {
    startValue,
    setStartValue,
    actionStyle,
    labelContent,
    handleMouseMove,
    handleMouseDown
  }
}

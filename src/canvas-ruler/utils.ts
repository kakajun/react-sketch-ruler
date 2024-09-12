import type { FinalPaletteType } from '../index-types'
// 标尺中每小格代表的宽度(根据scale的不同实时变化)
const getGridSize = (scale: number) => {
  if (scale <= 0.25) return 40
  if (scale <= 0.5) return 20
  if (scale <= 1) return 10
  if (scale <= 2) return 5
  if (scale <= 4) return 2
  return 1
}

export const drawCanvasRuler = (
  ctx: CanvasRenderingContext2D,
  start: number,
  selectStart: number,
  selectLength: number,
  options: {
    scale: number
    width: number
    height: number
    ratio: number
    gridRatio: number
    palette: FinalPaletteType
    canvasWidth: number
    canvasHeight: number
    showShadowText: boolean
  },
  isHorizontal?: boolean //横向为true,纵向缺省
) => {
  const { scale, width, height, ratio, palette, gridRatio, showShadowText } = options
  const { bgColor, fontColor, fontShadowColor, shadowColor, longfgColor } = palette
  const endNum = isHorizontal ? options.canvasWidth : options.canvasHeight
  // 缩放ctx, 以简化计算
  ctx.scale(ratio, ratio)
  ctx.clearRect(0, 0, width, height)

  // 1. 画标尺底色
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, width, height)

  const gridSize = getGridSize(scale) * gridRatio // 每小格表示的宽度
  const gridSize10 = gridSize * 10 // 每大格表示的宽度
  const gridPixel10 = gridSize10 * scale
  const startValue10 = Math.floor(start / gridSize10) * gridSize10
  const offsetX10 = ((startValue10 - start) / gridSize10) * gridPixel10 // 长间隔起点刻度距离ctx原点(start)的px距离
  const endValue = start + Math.ceil((isHorizontal ? width : height) / scale) // 终点刻度
  // 2. 画阴影
  if (selectLength) {
    const shadowX = (selectStart - start) * scale // 阴影起点坐标
    const shadowWidth = selectLength * scale // 阴影宽度
    ctx.fillStyle = shadowColor

    isHorizontal
      ? ctx.fillRect(shadowX, 0, shadowWidth, height)
      : ctx.fillRect(0, shadowX, width, shadowWidth)

    // 画阴影文字起始
    if (showShadowText) {
      if (isHorizontal) {
        drawShadowText(shadowX, height * 0.3, Math.round(selectStart))
        const shadowEnd = (selectStart + selectLength - start) * scale
        drawShadowText(shadowEnd, height * 0.3, Math.round(selectStart + selectLength))
      } else {
        drawShadowText(width * 0.3, shadowX, Math.round(selectStart))
        const shadowEnd = (selectStart + selectLength - start) * scale
        drawShadowText(width * 0.3, shadowEnd, Math.round(selectStart + selectLength))
      }
    }
  }
  // 3. 画刻度和文字(因为刻度遮住了阴影)
  ctx.beginPath()
  ctx.fillStyle = fontColor
  ctx.strokeStyle = longfgColor

  // 绘制长间隔和文字
  for (let value = startValue10, count = 0; value < endValue; value += gridSize10, count++) {
    const x = offsetX10 + count * gridPixel10 + 0.5 // prevent canvas 1px line blurry
    if ((value - gridSize10 < endNum && value > endNum) || value == endNum) {
      // 如果尾数画最后一个刻度
      const xl = offsetX10 + count * gridPixel10 + 0.5 + (endNum - value) * scale
      setLast(xl, endNum)
      return
    }

    if (value >= 0 && value <= endNum) {
      if (value == 0) {
        if (isHorizontal) {
          ctx.moveTo(x, 0)
          ctx.lineTo(x, height)
        } else {
          ctx.moveTo(0, x)
          ctx.lineTo(width, x)
        }
      } else {
        if (isHorizontal) {
          ctx.moveTo(x, 20)
          ctx.lineTo(x, height / 1.3)
        } else {
          ctx.moveTo(20, x)
          ctx.lineTo(width / 1.3, x)
        }
      }

      ctx.save()
      // 影响文字位置
      if (value == 0) {
        isHorizontal ? ctx.translate(x - 15, height * 0.2) : ctx.translate(width * 0.3, x - 5)
      } else {
        isHorizontal ? ctx.translate(x - 12, height * 0.05) : ctx.translate(width * 0.05, x + 12)
      }

      if (!isHorizontal) {
        ctx.rotate(-Math.PI / 2) // 旋转 -90 度
      }

      // 如果最后一个大刻度挨着最后一个刻度, 不画文字
      if (endNum - value > gridSize10 / 2) {
        if (
          !showShadowText ||
          selectLength == 0 ||
          (Math.abs(value - selectStart) > gridSize10 / 2 &&
            Math.abs(value - (selectStart + selectLength)) > gridSize10 / 2)
        ) {
          ctx.fillText(value.toString(), 4, 9)
        }
      }

      ctx.restore()
    }
  }
  ctx.stroke()
  ctx.closePath()
  function setLast(x: number, value: number) {
    isHorizontal ? ctx.moveTo(x, 0) : ctx.moveTo(0, x)
    ctx.save()

    isHorizontal ? ctx.translate(x + 5, height * 0.2) : ctx.translate(width * 0.1, x + 32)
    if (!isHorizontal) ctx.rotate(-Math.PI / 2)
    ctx.fillText(Math.round(value).toString(), 4, 7)
    ctx.restore()
    isHorizontal ? ctx.lineTo(x, height) : ctx.lineTo(width, x)
    ctx.stroke()
    ctx.closePath()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }

  function drawShadowText(x: number, y: number, num: number) {
    ctx.fillStyle = fontShadowColor
    ctx.strokeStyle = longfgColor
    ctx.save()
    ctx.translate(x, y)
    if (!isHorizontal) ctx.rotate(-Math.PI / 2)

    ctx.strokeText(String(num), 0, 0)
    ctx.fillText(String(num), 0, 0)
    ctx.restore()
  }
}

export function debounce(func: () => void, wait: number) {
  let timeout: ReturnType<typeof setTimeout>
  return function () {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func()
    }, wait)
  }
}

import type { ReactEventHandler } from 'react'
import { useEffect, useRef, useState } from 'react'
import SketchRule from '../src/sketch-ruler/index.tsx'

import './App.css'
const thick = 16

const App = () => {
  const [scale, setScale] = useState(2)
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [lines, setLines] = useState<Record<'h' | 'v', number[]>>({ h: [100, 200], v: [100, 200] })
  const [lang, setLang] = useState<'en' | 'zh-CN'>('zh-CN')
  const [isShowRuler, setIsShowRuler] = useState(true)
  const [isShowReferLine, setIsShowReferLine] = useState(true)

  const appRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    const screensRect = document.querySelector('#screens')?.getBoundingClientRect()
    const canvasRect = document.querySelector('#canvas')?.getBoundingClientRect()

    // 标尺开始的刻度
    const startX = ((screensRect?.left || 0) + thick - (canvasRect?.left || 0)) / scale
    const startY = ((screensRect?.top || 0) + thick - (canvasRect?.top || 0)) / scale
    setStartX(startX)
    setStartY(startY)
  }

  const handleLine = (lines: Record<'h' | 'v', number[]>) => {
    setLines(lines)
  }



  const handleChangeCh = () => {
    setLang('zh-CN')
  }

  // 显示/隐藏标尺
  const handleShowRuler = () => {
    setIsShowRuler(!isShowRuler)
  }


  const handleCornerClick = () => {

  }

  useEffect(() => {
    appRef.current!.scrollLeft = containerRef.current!.getBoundingClientRect().width / 2 - 300
  }, [])

  const render = () => {
    const { h, v } = lines

    const rectWidth = 160
    const rectHeight = 200

    const canvasStyle = {
      width: rectWidth,
      height: rectHeight,
      transform: `scale(${scale})`,
      backgroundColor: 'blue',
    }

    const shadow = {
      x: 0,
      y: 0,
      width: rectWidth,
      height: rectHeight,
    }

    return <div className="wrapper">
      <button className="button" onClick={handleShowRuler}>{!isShowRuler ? '显示' : '隐藏'}标尺</button>
      <button className="button-ch" onClick={handleChangeCh}>中</button>
      {/* <button className="button-en" onClick={handleChangeEn}>英</button> */}
      <div className="scale-value">{`scale: ${scale}`}</div>
      {
        isShowRuler
        && <SketchRule
          lang={lang}
          thick={thick}
          scale={scale}
          width={582}
          height={482}
          startX={startX}
          startY={startY}
          shadow={shadow}
          horLineArr={h}
          verLineArr={v}
          handleLine={handleLine}
          cornerActive={true}
          onCornerClick={handleCornerClick}

          // 右键菜单props
          isOpenMenuFeature={true}
          handleShowRuler={handleShowRuler}
          isShowReferLine={isShowReferLine}
        />
      }
      <div ref={appRef} id="screens" onScroll={handleScroll}>
        <div ref={containerRef} className="screen-container">
          <div id="canvas" style={canvasStyle} />
        </div>
      </div>
    </div>
  }

  return render()
}

export default App

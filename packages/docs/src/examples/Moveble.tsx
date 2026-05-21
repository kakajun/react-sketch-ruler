import React, { useState, useEffect, useRef } from 'react'
import { SketchRule } from 'react-sketch-ruler'
import 'react-sketch-ruler/index.css'
import MovebleCom from './MovebleCom'
import './Comprehensive.less'
import type { SketchRulerMethods } from 'react-sketch-ruler'
import { useTheme } from 'antd-style'
import { Button } from 'antd'

const MoveblePage: React.FC = () => {
  const { appearance } = useTheme()
  const [rectWidth] = useState(1470)
  const [rectHeight] = useState(800)
  const [canvasWidth] = useState(1920)
  const [canvasHeight] = useState(1080)
  const sketchruleRef = useRef<SketchRulerMethods>(null)

  const [state, setState] = useState({
    scale: 1,
    isBlack: false,
    lines: { h: [0, 250], v: [0, 500] },
    thick: 20,
    shadow: { x: 0, y: 0, width: 300, height: 300 },
    isShowReferLine: true
  })

  useEffect(() => {
    setState((prev) => ({ ...prev, isBlack: appearance !== 'light' }))
  }, [appearance])

  const resetMethod = () => sketchruleRef.current?.reset()
  const zoomOutMethod = () => sketchruleRef.current?.zoomOut()
  const zoomInMethod = () => sketchruleRef.current?.zoomIn()

  const handleLine = (lines: { h: number[]; v: number[] }) => {
    setState((prev) => ({ ...prev, lines }))
  }

  const handleCornerClick = (e: boolean) => {
    console.log('handleCornerClick', e)
  }

  const cpuScale = state.scale.toFixed(2)

  const cpuPalette = state.isBlack
    ? {
        bgColor: 'transparent',
        hoverBg: '#fff',
        hoverColor: '#000',
        tickColor: '#BABBBC',
        labelColor: '#DEDEDE',
        shadowColor: '#525252',
        guideLineColor: '#51d6a9',
        borderColor: '#B5B5B5'
      }
    : {
        bgColor: 'transparent',
        guideLineColor: '#51d6a9'
      }

  const canvasStyle = {
    width: `${canvasWidth}px`,
    height: `${canvasHeight}px`
  }

  const updateShadow = (shadow: { x: number; y: number; width: number; height: number }) => {
    setState((prev) => ({ ...prev, shadow }))
  }

  return (
    <div className="demo">
      <div className="top">
        <div style={{ marginRight: '10px' }}> 缩放比例:{cpuScale} </div>
        <a
          href="https://github.com/kakajun/react-sketch-ruler"
          target="_blank"
          rel="noopener noreferrer"
        >
          git源码
        </a>
      </div>
      <div className={`wrapper ${state.isBlack ? 'blackwrapper' : 'whitewrapper'}`}>
        <SketchRule
          scale={state.scale}
          thick={state.thick}
          width={rectWidth}
          height={rectHeight}
          palette={cpuPalette}
          shadow={state.shadow}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          ref={sketchruleRef}
          isShowReferLine={state.isShowReferLine}
          onHandleCornerClick={handleCornerClick}
          onUpdateLines={handleLine}
          lines={state.lines}
        >
          <div data-type="page" style={canvasStyle}>
            <MovebleCom updateShadow={updateShadow} zoom={state.scale} />
          </div>
          <div slot="toolbar" className="btns">
            <Button size="small" onClick={resetMethod}>
              还原
            </Button>
            <Button size="small" onClick={zoomInMethod}>
              放大
            </Button>
            <Button size="small" onClick={zoomOutMethod}>
              缩小
            </Button>
          </div>
        </SketchRule>
      </div>
    </div>
  )
}

export default MoveblePage

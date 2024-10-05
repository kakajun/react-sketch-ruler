import React, { useState, useEffect, useRef } from 'react'
import SketchRule from 'react-sketch-ruler'
import 'react-sketch-ruler/lib/style.css'
import { Button } from 'antd'
import type { SketchRulerMethods } from 'react-sketch-ruler'
import bgImg from '@/assets/bg.png'
import './Basic.less'
import { useTheme } from 'antd-style'
const DemoComponent = () => {
  const { appearance } = useTheme()
  const [rectWidth] = useState(1470)
  const [rectHeight] = useState(800)
  const [canvasWidth] = useState(1920)
  const [canvasHeight] = useState(1080)
  const sketchruleRef = useRef(null)
  const [state, setState] = useState({
    scale: 1,
    isBlack: false,
    lines: {
      h: [0, 250],
      v: [0, 500]
    },
    thick: 20
  })
  useEffect(() => {
    setState((prevState) => ({ ...prevState, isBlack: appearance !== 'light' }))
  }, [appearance])
  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleResize = () => {
    if (sketchruleRef.current) {
      ;(sketchruleRef.current as SketchRulerMethods).initPanzoom()
    }
  }

  const resetMethod = () => {
    if (sketchruleRef.current) {
      ;(sketchruleRef.current as SketchRulerMethods).reset()
    }
  }

  const zoomOutMethod = () => {
    if (sketchruleRef.current) {
      ;(sketchruleRef.current as SketchRulerMethods).zoomOut()
    }
  }

  const zoomInMethod = () => {
    if (sketchruleRef.current) {
      ;(sketchruleRef.current as SketchRulerMethods).zoomIn()
    }
  }

  const rectStyle = {
    width: `${rectWidth}px`,
    height: `${rectHeight}px`
  }

  const canvasStyle = {
    width: `${canvasWidth}px`,
    height: `${canvasHeight}px`
  }

  return (
    <>
      <div className="demo">
        <div
          style={rectStyle}
          className={`wrapper ${state.isBlack ? 'blackwrapper' : 'whitewrapper'}`}
        >
          <SketchRule
            scale={state.scale}
            thick={state.thick}
            width={rectWidth}
            height={rectHeight}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            ref={sketchruleRef}
            lines={state.lines}
          >
            <div slot="default" data-type="page" style={canvasStyle}>
              <img className="imgStyle" src={bgImg} alt="" />
            </div>

            <div className="btns" slot="btn">
              <Button size="small" className="btn" onClick={resetMethod}>
                还原
              </Button>
              <Button size="small" className="btn" onClick={zoomInMethod}>
                放大
              </Button>
              <Button size="small" className="btn" onClick={zoomOutMethod}>
                缩小
              </Button>
            </div>
          </SketchRule>
        </div>
      </div>
    </>
  )
}

export default DemoComponent

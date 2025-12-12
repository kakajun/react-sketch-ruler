import React, { useEffect, useRef, useState } from 'react'
import SketchRule, { SketchRulerMethods } from 'react-sketch-ruler'
import bgImg from'../assets/8k.jpg'
import './EightKSketchRuler.less'
import { useTheme } from 'antd-style'

const EightKSketchRuler = () => {
  const { appearance } = useTheme()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const sketchRuleRef = useRef<SketchRulerMethods>(null)

  const [rectWidth, setRectWidth] = useState(0)
  const [rectHeight, setRectHeight] = useState(0)
  const [scale, setScale] = useState(1)
  const [isBlack, setIsBlack] = useState(false)

  const canvasWidth = 8800
  const canvasHeight = 5097
  const lines = {
    h: [0, 2400],
    v: [0, 800]
  }
  const panzoomOption = {
    maxScale: 3,
    minScale: 0.01,
    disablePan: false,
    disableZoom: false
  }

  const updateDimensions = () => {
    if (wrapperRef.current) {
      setRectWidth(wrapperRef.current.clientWidth)
      setRectHeight(wrapperRef.current.clientHeight)
    } else {
      setRectWidth(window.innerWidth)
      setRectHeight(window.innerHeight)
    }
  }

  useEffect(() => {
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => {
      window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  useEffect(() => {
    setIsBlack(appearance !== 'light')
  }, [appearance])

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation()
    sketchRuleRef.current?.reset()
  }

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation()
    sketchRuleRef.current?.zoomIn()
  }

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation()
    sketchRuleRef.current?.zoomOut()
  }

  const cpuPalette = isBlack
    ? {
        bgColor: 'transparent',
        hoverBg: '#fff',
        hoverColor: '#000',
        longfgColor: '#BABBBC', // ruler longer mark color
        fontColor: '#DEDEDE', // ruler font color
        shadowColor: '#525252', // ruler shadow color
        lineColor: '#51d6a9',
        borderColor: '#B5B5B5',
        lineType: 'dashed'
      }
    : {
        bgColor: 'transparent',
        lineColor: '#51d6a9',
        lineType: 'dashed'
      }

  return (
    <div className="eight-k-sketch-ruler" ref={wrapperRef}>
      <div className={`wrapper ${isBlack ? 'blackwrapper' : 'whitewrapper'}`}>
        <div className="description" style={{ color: isBlack ? '#fff' : '#000' }}>
          说明: 该案例展示了大分辨率8K大屏(8800*5097)上使用react-sketch-ruler插件,
          依然能做到上下左右居中正确
        </div>
        {rectWidth > 0 && rectHeight > 0 && (
          <SketchRule
            ref={sketchRuleRef}
            thick={20}
            scale={scale}
            width={rectWidth}
            height={rectHeight}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            panzoomOption={panzoomOption}
            lines={lines}
            autoCenter={true}
            showRuler={true}
            updateScale={setScale}
            palette={cpuPalette}
          >
            <div slot="default" style={{ width: '100%', height: '100%' }}>
              <img style={{ width: '100%', height: '100%' }} src={bgImg} alt="8K Screen" />
            </div>
            <div slot="btn" className="btns">
              <button onClick={handleReset}>还原</button>
              <button onClick={handleZoomIn}>放大</button>
              <button onClick={handleZoomOut}>缩小</button>
            </div>
          </SketchRule>
        )}
      </div>
    </div>
  )
}

export default EightKSketchRuler

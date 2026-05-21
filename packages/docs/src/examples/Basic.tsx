import React, { useRef } from 'react'
import SketchRule from 'react-sketch-ruler'
import 'react-sketch-ruler/index.css'
import bgImg from '@/assets/bg.png'
import './Basic.less'

const Basic: React.FC = () => {
  const sketchRef = useRef<any>(null)
  const post = {
    thick: 20,
    width: 1470,
    height: 700,
    canvasWidth: 1000,
    canvasHeight: 500,
    showRuler: true,
    palette: { bgColor: 'transparent', guideLineStyle: 'dashed' },
    isShowReferLine: true,
    autoCenter: false,
    initialOffset: { x: 100, y: 50 },
    shadow: {
      x: 0,
      y: 0,
      width: 300,
      height: 300
    },
    lines: {
      h: [0, 250],
      v: [0, 500]
    }
  }

  const rectStyle = {
    width: `${post.width}px`,
    height: `${post.height}px`
  }

  const canvasStyle = {
    width: `${post.canvasWidth}px`,
    height: `${post.canvasHeight}px`
  }

  const resetMethod = () => sketchRef.current?.reset()
  const zoomInMethod = () => sketchRef.current?.zoomIn()
  const zoomOutMethod = () => sketchRef.current?.zoomOut()

  return (
    <div className="wrapper whitewrapper" style={rectStyle}>
      <SketchRule ref={sketchRef} {...post}>
        <div data-type="page" style={canvasStyle}>
          <img className="img-style" src={bgImg} alt="" />
        </div>
        <div slot="toolbar" className="btns">
          <button
            onClick={(e) => {
              e.stopPropagation()
              resetMethod()
            }}
          >
            还原
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              zoomInMethod()
            }}
          >
            放大
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              zoomOutMethod()
            }}
          >
            缩小
          </button>
        </div>
      </SketchRule>
    </div>
  )
}

export default Basic

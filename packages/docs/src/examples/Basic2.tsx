import React, { useRef, useState } from 'react'
import { SketchRule } from 'react-sketch-ruler'
import 'react-sketch-ruler/index.css'
import bgImg from '@/assets/bg.png'
import './Basic2.less'

const Basic2: React.FC = () => {
  const sketchRef = useRef<any>(null)
  const [scaleStr, setScaleStr] = useState('1.00')
  const [offsetStr, setOffsetStr] = useState('(100, 50)')
  const [lineCount, setLineCount] = useState(4)
  const [showRuler, setShowRuler] = useState(true)

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

  const handleZoomChange = (detail: { scale: number; x: number; y: number }) => {
    setScaleStr(detail.scale.toFixed(2))
    setOffsetStr(`(${detail.x.toFixed(0)}, ${detail.y.toFixed(0)})`)
  }

  const handleLinesChange = (lines: { h: number[]; v: number[] }) => {
    setLineCount(lines.h.length + lines.v.length)
  }

  const handleCornerClick = (e: boolean) => {
    setShowRuler(e)
  }

  return (
    <div className="wrapper whitewrapper" style={rectStyle}>
      <SketchRule
        ref={sketchRef}
        {...post}
        onZoomChange={handleZoomChange}
        onUpdateLines={handleLinesChange}
        onHandleCornerClick={handleCornerClick}
      >
        <div data-type="page" style={canvasStyle}>
          <img className="img-style" src={bgImg} alt="" />
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'rgba(0,0,0,0.75)',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              lineHeight: '1.6',
              zIndex: 9999,
              pointerEvents: 'none',
              fontFamily: 'monospace'
            }}
          >
            <div>scale: {scaleStr}</div>
            <div>offset: {offsetStr}</div>
            <div>lines: {lineCount}</div>
            <div>showRuler: {showRuler.toString()}</div>
          </div>
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

export default Basic2

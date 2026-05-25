import React, { useState, useEffect, useRef } from 'react'
import { SketchRule } from 'react-sketch-ruler'
import 'react-sketch-ruler/index.css'
import MovebleCom from './MovebleCom'
import './Moveble.less'
import type { SketchRulerMethods } from 'react-sketch-ruler'
import { useTheme } from 'antd-style'

const MoveblePage: React.FC = () => {
  const { appearance } = useTheme()
  const sketchruleRef = useRef<SketchRulerMethods>(null)
  const [lockLine, setLockLine] = useState(false)

  const [state, setState] = useState({
    scale: 1,
    isBlack: false
  })

  const [post, setPost] = useState({
    thick: 20,
    width: 1470,
    height: 800,
    canvasWidth: 1242,
    canvasHeight: 1660,
    showRuler: true,
    palette: {
      bgColor: 'transparent',
      guideLineColor: '#51d6a9',
      guideLineStyle: 'dashed'
    } as any,
    shadow: {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    },
    isShowReferLine: true,
    lines: {
      h: [0, 250],
      v: [0, 500]
    }
  })

  useEffect(() => {
    const isBlack = appearance !== 'light'
    setState((prev) => ({ ...prev, isBlack }))
    setPost((prev) => ({
      ...prev,
      palette: isBlack
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
            guideLineColor: '#51d6a9',
            guideLineStyle: 'dashed'
          }
    }))
  }, [appearance])

  const handleLine = (lines: { h: number[]; v: number[] }) => {
    setPost((prev) => ({ ...prev, lines }))
  }

  const handleZoomChange = (detail: { scale: number; x: number; y: number }) => {
    setState((prev) => ({ ...prev, scale: detail.scale }))
  }

  const handleCornerClick = (e: boolean) => {
    console.log('handleCornerClick', e)
  }

  const cpuScale = state.scale.toFixed(2)

  const rectStyle = {
    width: `${post.width}px`,
    height: `${post.height}px`
  }

  const canvasStyle = {
    width: `${post.canvasWidth}px`,
    height: `${post.canvasHeight}px`
  }

  const updateShadow = (shadow: { x: number; y: number; width: number; height: number }) => {
    setPost((prev) => ({ ...prev, shadow }))
  }

  const updateSnapsObj = (snapsObj: { h: number[]; v: number[] }) => {
    // snapsObj 由子组件计算并回传，父级可在此做额外处理
    console.log('snapsObj', snapsObj)
  }

  return (
    <div className="demo">
      <div className="top font16">
        <div className="mr10">鼠标中键移动画布</div>
        <div className="scale mr10">缩放比:{cpuScale}</div>
      </div>

      <div
        className={`wrapper ${state.isBlack ? 'blackwrapper' : 'whitewrapper'}`}
        style={rectStyle}
      >
        <SketchRule
          ref={sketchruleRef}
          scale={state.scale}
          lockLine={lockLine}
          selfHandle={true}
          thick={post.thick}
          width={post.width}
          height={post.height}
          canvasWidth={post.canvasWidth}
          canvasHeight={post.canvasHeight}
          showRuler={post.showRuler}
          palette={post.palette}
          shadow={post.shadow}
          isShowReferLine={post.isShowReferLine}
          lines={post.lines}
          onHandleCornerClick={handleCornerClick}
          onUpdateLines={handleLine}
          onZoomChange={handleZoomChange}
        >
          <div className="moveble-container" style={canvasStyle}>
            <MovebleCom
              scale={state.scale}
              shadow={post.shadow}
              onUpdateShadow={updateShadow}
              onUpdateSnapsObj={updateSnapsObj}
            />
          </div>
          {(props: any) => (
            <div className="btns">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  props.tools.reset()
                }}
              >
                还原
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  props.tools.zoomIn()
                }}
              >
                放大
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  props.tools.zoomOut()
                }}
              >
                缩小
              </button>
            </div>
          )}
        </SketchRule>
      </div>
    </div>
  )
}

export default MoveblePage

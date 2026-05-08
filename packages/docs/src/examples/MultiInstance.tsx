import React, { useState, useRef } from 'react'
import SketchRule from 'react-sketch-ruler'
import 'react-sketch-ruler/index.css'
import type { SketchRulerMethods } from 'react-sketch-ruler'
import { Button } from 'antd'
import './MultiInstance.less'

const MultiInstance = () => {
  const sketchruleRef1 = useRef<SketchRulerMethods>(null)
  const sketchruleRef2 = useRef<SketchRulerMethods>(null)

  const [state1, setState1] = useState({
    scale: 1,
    lines: {
      h: [100, 200],
      v: [150, 300]
    },
    thick: 20
  })

  const [state2, setState2] = useState({
    scale: 1,
    lines: {
      h: [50, 150],
      v: [100, 250]
    },
    thick: 20
  })

  const rectWidth = 600
  const rectHeight = 400
  const canvasWidth = 700
  const canvasHeight = 500

  const rectStyle = {
    width: `${rectWidth}px`,
    height: `${rectHeight}px`
  }

  const canvasStyle = {
    width: `${canvasWidth}px`,
    height: `${canvasHeight}px`,
    background: '#e6f7ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: '#1890ff'
  }

  const updateScale1 = (scale: number) => {
    setState1((prev) => ({ ...prev, scale }))
  }

  const updateScale2 = (scale: number) => {
    setState2((prev) => ({ ...prev, scale }))
  }

  const handleLine1 = (lines: Record<'h' | 'v', number[]>) => {
    setState1((prev) => ({ ...prev, lines }))
  }

  const handleLine2 = (lines: Record<'h' | 'v', number[]>) => {
    setState2((prev) => ({ ...prev, lines }))
  }

  return (
    <div className="multi-instance-demo">
      <div className="top font16">
        <div className="mr10"> 页面上同时存在两个 SketchRule 实例 </div>
        <div className="mr10"> 每个实例独立响应 Ctrl+滚轮缩放和空格拖拽 </div>
      </div>
      <div className="instance-list">
        <div className="instance-item">
          <div className="instance-title">
            <span>实例一</span>
            <div className="instance-btns">
              <Button size="small" onClick={() => sketchruleRef1.current?.reset()}>
                还原
              </Button>
              <Button size="small" onClick={() => sketchruleRef1.current?.zoomIn()}>
                放大
              </Button>
              <Button size="small" onClick={() => sketchruleRef1.current?.zoomOut()}>
                缩小
              </Button>
            </div>
          </div>
          <div className="wrapper" style={rectStyle}>
            <SketchRule
              scale={state1.scale}
              thick={state1.thick}
              width={rectWidth}
              height={rectHeight}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              ref={sketchruleRef1}
              lines={state1.lines}
              updateScale={updateScale1}
              handleLine={handleLine1}
            >
              <div style={canvasStyle}>Instance 1</div>
            </SketchRule>
          </div>
        </div>

        <div className="instance-item">
          <div className="instance-title">
            <span>实例二</span>
            <div className="instance-btns">
              <Button size="small" onClick={() => sketchruleRef2.current?.reset()}>
                还原
              </Button>
              <Button size="small" onClick={() => sketchruleRef2.current?.zoomIn()}>
                放大
              </Button>
              <Button size="small" onClick={() => sketchruleRef2.current?.zoomOut()}>
                缩小
              </Button>
            </div>
          </div>
          <div className="wrapper" style={rectStyle}>
            <SketchRule
              scale={state2.scale}
              thick={state2.thick}
              width={rectWidth}
              height={rectHeight}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              ref={sketchruleRef2}
              lines={state2.lines}
              updateScale={updateScale2}
              handleLine={handleLine2}
            >
              <div style={{ ...canvasStyle, background: '#f6ffed', color: '#52c41a' }}>
                Instance 2
              </div>
            </SketchRule>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MultiInstance

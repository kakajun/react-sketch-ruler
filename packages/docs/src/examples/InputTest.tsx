import React, { useState, useRef } from 'react'
import SketchRule from 'react-sketch-ruler'
import 'react-sketch-ruler/lib/style.css'
import { Input } from 'antd'
import './Basic.less'
const { TextArea } = Input
const DemoComponent = () => {
  const [rectWidth] = useState(1470)
  const [rectHeight] = useState(800)
  const [canvasWidth] = useState(1920)
  const [canvasHeight] = useState(1080)
  const sketchruleRef = useRef(null)
  const [state] = useState({
    scale: 1,
    isBlack: false,
    lines: {
      h: [0, 250],
      v: [0, 500]
    },
    thick: 20
  })

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
              <Input placeholder="Basic usage" style={{ marginBottom: 20 }} />
              <TextArea rows={4} />
            </div>
          </SketchRule>
        </div>
      </div>
    </>
  )
}

export default DemoComponent

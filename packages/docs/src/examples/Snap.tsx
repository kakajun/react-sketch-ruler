import React, { useState, useRef, useMemo } from 'react'
import SketchRule, { type SketchRulerMethods } from 'react-sketch-ruler'
import 'react-sketch-ruler/index.css'
import Drager, { DragData } from 'react-es-drager'
import './Snap.less'

const SnapExample: React.FC = () => {
  const sketchruleRef = useRef<SketchRulerMethods>(null)

  const [data, setData] = useState({
    componentList: [
      {
        id: 'div1',
        component: 'div',
        text: 'div1',
        width: 100,
        height: 100,
        left: 0,
        top: 0
      },
      {
        id: 'div2',
        component: 'div',
        text: 'div2',
        width: 100,
        height: 100,
        top: 100,
        left: 100
      }
    ]
  })

  const [state, setState] = useState({
    scale: 1,
    thick: 20,
    width: 1470,
    height: 700,
    showShadowText: false,
    canvasWidth: 1000,
    canvasHeight: 500,
    showRuler: true,
    palette: { bgColor: 'transparent', lineType: 'dashed' },
    isShowReferLine: true,
    shadow: {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    },
    lines: {
      h: [300],
      v: [400]
    }
  })

  const rectStyle = useMemo(
    () => ({
      width: `${state.width}px`,
      height: `${state.height}px`
    }),
    [state]
  )

  const canvasStyle = useMemo(
    () => ({
      width: `${state.canvasWidth}px`,
      height: `${state.canvasHeight}px`
    }),
    [state]
  )
  const extraLines = () => {
    // 可以返回dom元素列表
    return Array.from(document.querySelectorAll('.sketch-ruler .lines .line'))
  }
  const onChange = (index: number, dragData: DragData) => {
    setData((prevState) => ({
      componentList: prevState.componentList.map((item, i) =>
        i === index ? { ...item, ...dragData } : item
      )
    }))
    state.shadow = {
      x: dragData.left,
      y: dragData.top,
      width: dragData.width,
      height: dragData.height
    }
  }

  const updateScale = (scale: number) => {
    setState((prevState) => ({ ...prevState, scale }))
  }

  return (
    <div>
      <div className="wrapper" style={rectStyle}>
        <SketchRule ref={sketchruleRef} {...state} updateScale={updateScale}>
          <div data-type="page" className="canvas" style={canvasStyle}>
            {data.componentList.map((item, index) => (
              <Drager
                key={item.id}
                size={{
                  width: item.width,
                  height: item.height,
                  left: item.left,
                  top: item.top
                }}
                snap
                className="dragerItem"
                snapThreshold={10}
                scaleRatio={state.scale}
                extraLines={extraLines}
                markline
                onChange={(e: DragData) => onChange(index, e)}
              >
                <div>{item.text}</div>
              </Drager>
            ))}
          </div>
          <div className="btns" slot="btn">
            <button onClick={() => sketchruleRef.current?.reset()}>还原</button>
            <button onClick={() => sketchruleRef.current?.zoomIn()}>放大</button>
            <button onClick={() => sketchruleRef.current?.zoomOut()}>缩小</button>
          </div>
        </SketchRule>
      </div>
    </div>
  )
}

export default SnapExample

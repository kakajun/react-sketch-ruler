import React, { useState, useRef, useMemo } from 'react'
import SketchRule from 'react-sketch-ruler'
import 'react-sketch-ruler/index.css'
import Drager, { DragData } from 'react-es-drager'
import './Basic.less'

const EsDragle: React.FC = () => {
  const sketchruleRef = useRef<any>(null)

  const [data, setData] = useState({
    componentList: [
      { id: 'div1', text: 'div1', width: 100, height: 100, left: 0, top: 0 },
      { id: 'div2', text: 'div2', width: 100, height: 100, top: 100, left: 100 }
    ]
  })

  const [state, setState] = useState({
    scale: 1,
    thick: 20,
    width: 1470,
    height: 700,
    canvasWidth: 1000,
    canvasHeight: 500,
    showRuler: true,
    palette: { bgColor: 'transparent', guideLineStyle: 'dashed' },
    isShowReferLine: true,
    shadow: { x: 0, y: 0, width: 0, height: 0 },
    lines: { h: [300], v: [400] }
  })

  const rectStyle = useMemo(() => ({
    width: `${state.width}px`,
    height: `${state.height}px`
  }), [state])

  const canvasStyle = useMemo(() => ({
    width: `${state.canvasWidth}px`,
    height: `${state.canvasHeight}px`,
    position: 'relative' as const,
    background: '#eff2f5'
  }), [state])

  const extraLines = () => {
    const container = document.querySelector('.sketch-ruler')
    if (container) {
      return Array.from(container.querySelectorAll('.lines .line'))
    }
    return []
  }

  const onChange = (index: number, dragData: DragData) => {
    setData((prev) => ({
      componentList: prev.componentList.map((item, i) =>
        i === index ? { ...item, ...dragData } : item
      )
    }))
    setState((prev) => ({
      ...prev,
      shadow: {
        x: dragData.left,
        y: dragData.top,
        width: dragData.width,
        height: dragData.height
      }
    }))
  }

  return (
    <div>
      <div className="wrapper" style={rectStyle}>
        <SketchRule
          ref={sketchruleRef}
          scale={state.scale}
          thick={state.thick}
          width={state.width}
          height={state.height}
          canvasWidth={state.canvasWidth}
          canvasHeight={state.canvasHeight}
          showRuler={state.showRuler}
          palette={state.palette}
          isShowReferLine={state.isShowReferLine}
          shadow={state.shadow}
          lines={state.lines}
          onUpdateScale={(scale: number) => setState((p) => ({ ...p, scale }))}
        >
          <div data-type="page" style={canvasStyle}>
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
          <div slot="toolbar" className="btns">
            <button onClick={(e) => { e.stopPropagation(); sketchruleRef.current?.reset() }}>还原</button>
            <button onClick={(e) => { e.stopPropagation(); sketchruleRef.current?.zoomIn() }}>放大</button>
            <button onClick={(e) => { e.stopPropagation(); sketchruleRef.current?.zoomOut() }}>缩小</button>
          </div>
        </SketchRule>
      </div>
    </div>
  )
}

export default EsDragle

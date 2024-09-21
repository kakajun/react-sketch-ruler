import { useState, useEffect, useRef } from 'react'
import SketchRule from '../src/index'
import MovebleCom from './MovebleCom'
import './UserRulerts.less'
import type { SketchRulerMethods } from '../src/index-types'

const DemoComponent = () => {
  // const [rectWidth] = useState(770)
  // const [rectHeight] = useState(472)
  const [rectWidth] = useState(1470)
  const [rectHeight] = useState(800)
  const [canvasWidth] = useState(1920)
  const [canvasHeight] = useState(1080)
  const sketchruleRef = useRef(null)
  const [panzoomOption, setPanzoomOption] = useState({
    maxScale: 3,
    minScale: 0.1,
    disablePan: false,
    disableZoom: false,
    handleStartEvent: (event: Event) => {
      event.preventDefault()
      console.log('handleStartEvent', event)
    }
  })

  const [state, setState] = useState({
    scale: 1,
    isBlack: false,
    lines: {
      h: [0, 250],
      v: [0, 500]
    },
    showShadowText: true,
    thick: 20,
    shadow: {
      x: 0,
      y: 0,
      width: 300,
      height: 300
    },
    isShowRuler: true,
    isShowReferLine: true
  })

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

  const handleLine = (lines: Record<'h' | 'v', number[]>) => {
    setState((prevState) => ({ ...prevState, lines }))
  }

  const zoomOutMethod = () => {
    if (sketchruleRef.current) {
      ;(sketchruleRef.current as SketchRulerMethods).zoomOut()
    }
  }

  const updateScale = (scale: number) => {
    setState((prevState) => ({ ...prevState, scale }))
  }

  const updateSnapsObj = (snapsObj: Record<'h' | 'v', number[]>) => {
    setState((prevState) => ({ ...prevState, snapsObj }))
  }

  const handleCornerClick = (e: boolean) => {
    console.log('handleCornerClick', e)
  }
  const cpuScale = state.scale.toFixed(2)
  const rectStyle = {
    width: `${rectWidth}px`,
    height: `${rectHeight}px`
  }
  const cpuPalette = state.isBlack
    ? {
        bgColor: 'transparent',
        hoverBg: '#fff',
        hoverColor: '#000',
        longfgColor: '#BABBBC', // ruler longer mark color
        fontColor: '#DEDEDE', // ruler font color
        shadowColor: '#525252', // ruler shadow color
        lineColor: '#51d6a9',
        borderColor: '#B5B5B5'
      }
    : {
        bgColor: 'transparent',
        lineColor: '#51d6a9',
        lineType: 'dashed'
      }
  const canvasStyle = {
    width: `${canvasWidth}px`,
    height: `${canvasHeight}px`
  }

  interface ShadowType {
    x: number
    y: number
    width: number
    height: number
  }

  const updateShadow = (shadow: ShadowType) => {
    setState((prevState) => ({ ...prevState, shadow }))
  }

  return (
    <>
      <Demo>
        <Top>
          <div style={{ marginRight: '10px' }}> 缩放比例:{cpuScale} </div>
          <a
            href="https://github.com/kakajun/react-sketch-ruler"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fas fa-external-link-alt"></i> git源码
          </a>
        </Top>

        <Wrapper style={rectStyle} className={state.isBlack ? 'balckwrapper' : 'whitewrapper'}>
          <SketchRule
            scale={state.scale}
            thick={state.thick}
            width={rectWidth}
            height={rectHeight}
            palette={cpuPalette}
            shadow={state.shadow}
            showShadowText={state.showShadowText}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            panzoomOption={panzoomOption}
            ref={sketchruleRef}
            isShowReferLine={state.isShowReferLine}
            onHandleCornerClick={handleCornerClick}
            updateScale={updateScale}
            handleLine={handleLine}
            lines={state.lines}
          >
            <div slot="default" data-type="page" style={canvasStyle}>
              <MovebleCom updateShadow={updateShadow} updateSnapsObj={updateSnapsObj} />
            </div>

            <Btns slot="btn">
              <button onClick={resetMethod}>还原</button>
              <button onClick={zoomOutMethod}>缩小</button>
            </Btns>
          </SketchRule>
        </Wrapper>
      </Demo>
    </>
  )
}

export default DemoComponent

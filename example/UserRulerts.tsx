import React, { useState, useEffect, useRef } from 'react'
import SketchRule from '../src/index'
// import SketchRule from '../lib/index.js'
import type { SketchRulerMethods } from '../src/index-types'
import bgImg from './assets/bg.png'
import 'module'
import './UserRulerts.less'
const DemoComponent = () => {
  // const [rectWidth] = useState(770)
  // const [rectHeight] = useState(472)
  const [rectWidth] = useState(1470)
  const [rectHeight] = useState(800)
  const [canvasWidth] = useState(1920)
  const [canvasHeight] = useState(1080)
  const sketchruleRef = useRef(null)
  const [showRuler, setShowRuler] = useState(true)
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
  const [lockLine, setLockLine] = useState(false)
  const [snapsObj, setSnapsObj] = useState({ h: [0, 100, 200], v: [130] })

  const [state, setState] = useState({
    scale: 1,
    isBlack: false,
    lines: {
      h: [0, 250],
      v: [0, 500]
    },
    showShadowText: false,
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

  const changeTheme = () => {
    setState((prevState) => ({ ...prevState, isBlack: !prevState.isBlack }))
  }

  const handleLine = (lines: Record<'h' | 'v', number[]>) => {
    setState((prevState) => ({ ...prevState, lines }))
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

  const handleShowRuler = () => {
    setShowRuler(!showRuler)
  }

  const scaleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    if (value) {
      setState((prevState) => ({ ...prevState, scale: Number(value) }))
      if (sketchruleRef.current) {
        ;(sketchruleRef.current as SketchRulerMethods).panzoomInstance.current?.zoom(Number(value))
      }
    }
  }

  const handleShowReferLine = () => {
    setState((prevState) => ({ ...prevState, isShowReferLine: !prevState.isShowReferLine }))
    console.log(state.isShowReferLine, 'state.isShowReferLine')
  }

  const snapsChange = (e: { target: { value: string } }) => {
    const arr = e.target.value.split(',')
    setSnapsObj((prevState) => ({ ...prevState, h: arr.map((item) => Number(item)) }))
  }

  const snapsChangeV = (e: { target: { value: string } }) => {
    const arr = e.target.value.split(',')
    setSnapsObj((prevState) => ({ ...prevState, v: arr.map((item) => Number(item)) }))
  }

  const changeScale = (e: { target: { checked: boolean } }) => {
    setPanzoomOption((prevState) => ({ ...prevState, disableZoom: e.target.checked }))
  }
  const updateScale = (scale: number) => {
    setState((prevState) => ({ ...prevState, scale }))
  }

  const changeMove = (e: { target: { checked: boolean } }) => {
    setPanzoomOption((prevState) => ({ ...prevState, disablePan: e.target.checked }))
  }

  const changeShadow = () => {
    setState((prevState) => ({
      ...prevState,
      shadow: {
        ...prevState.shadow,
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight
      }
    }))
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
        borderColor: '#B5B5B5',
        lineType: 'dashed'
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

  return (
    <>
      <div className="demo">
        <div className="top">
          <div style={{ marginRight: '10px' }}> 缩放比例:{cpuScale} </div>
          <button className="btn" onClick={showRuler ? () => setShowRuler(false) : handleShowRuler}>
            隐藏规尺
          </button>
          <button className="btn" onClick={handleShowReferLine}>
            辅助线开关
          </button>
          <button className="btn" onClick={() => setLockLine(true)}>
            锁定参考线
          </button>
          <button className="btn" onClick={changeShadow}>
            模拟阴影切换
          </button>
          <button className="btn" onClick={changeTheme}>
            主题切换
          </button>
          <button className="btn" onClick={resetMethod}>
            还原
          </button>
          <button className="btn" onClick={zoomOutMethod}>
            缩小
          </button>
          <span>禁止缩放</span>
          <input type="checkbox" className="switch" onChange={changeScale} />
          <span>禁止移动</span>
          <input type="checkbox" className="switch" onChange={changeMove} />
          <input
            style={{ marginRight: '10px' }}
            type="range"
            value={state.scale}
            onChange={scaleChange}
            min="0.1"
            max="3"
            step="0.1"
          />
          <div style={{ marginRight: '10px' }}> 吸附横线: </div>
          <input
            style={{ marginRight: '10px', width: '80px' }}
            defaultValue={snapsObj.h.join(',')}
            onBlur={snapsChange}
          />
          <div style={{ marginRight: '10px' }}> 吸附纵线: </div>
          <input
            style={{ marginRight: '10px', width: '80px' }}
            defaultValue={snapsObj.v.join(',')}
            onBlur={snapsChangeV}
          />

          <a
            href="https://github.com/kakajun/react-sketch-ruler"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fas fa-external-link-alt"></i> git源码
          </a>
        </div>

        <div
          style={rectStyle}
          className={`wrapper ${state.isBlack ? 'blackwrapper' : 'whitewrapper'}`}
        >
          <SketchRule
            scale={state.scale}
            lockLine={lockLine}
            thick={state.thick}
            width={rectWidth}
            showRuler={showRuler}
            height={rectHeight}
            palette={cpuPalette}
            snapsObj={snapsObj}
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
              <img className="imgStyle" src={bgImg} alt="" />
            </div>

            <div className="btns" slot="btn">
              <button onClick={resetMethod}>还原</button>
              <button onClick={zoomInMethod}>放大</button>
              <button onClick={zoomOutMethod}>缩小</button>
            </div>
          </SketchRule>
        </div>
      </div>
    </>
  )
}

export default DemoComponent

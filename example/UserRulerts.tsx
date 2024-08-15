import React, { useState, useEffect, useRef } from 'react'
import SketchRule from '../src/index'
import type { SketchRulerMethods } from '../src/index-types'
import bgImg from './assets/bg.png'
import { Demo, Top, Button, Wrapper, ImgStyle, Btns, Switch } from './styles'

const DemoComponent = () => {
  const [rectWidth] = useState(770)
  const [rectHeight] = useState(472)
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

  const handleShowRuler = () => {
    setShowRuler(!showRuler)
  }

  const scaleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    if (value) {
      setState((prevState) => ({ ...prevState, scale: Number(value) }))
      if (sketchruleRef.current) {
        ;(sketchruleRef.current as SketchRulerMethods).panzoomInstance?.zoom(Number(value))
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
        longfgColor: '#BABBBC',
        fontColor: '#DEDEDE',
        shadowColor: '#525252',
        lineColor: '#51d6a9',
        borderColor: '#B5B5B5',
        cornerActiveColor: '#fff'
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
      <Demo>
        <Top>
          <div style={{ marginRight: '10px' }}> 缩放比例:{cpuScale} </div>
          <Button onClick={showRuler ? () => setShowRuler(false) : handleShowRuler}>
            隐藏规尺
          </Button>
          <Button onClick={handleShowReferLine}>辅助线开关</Button>
          <Button onClick={() => setLockLine(true)}>锁定参考线</Button>
          <Button onClick={changeShadow}>模拟阴影切换</Button>
          <Button onClick={changeTheme}>主题切换</Button>
          <Button onClick={resetMethod}>还原</Button>
          <Button onClick={zoomOutMethod}>缩小</Button>
          <span>禁止缩放</span>
          <Switch onChange={changeScale} />
          <span>禁止移动</span>
          <Switch onChange={changeMove} />
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
            style={{ marginRight: '10px' }}
            defaultValue={snapsObj.h.join(',')}
            onBlur={snapsChange}
          />
          <div style={{ marginRight: '10px' }}> 吸附纵线: </div>
          <input
            style={{ marginRight: '10px' }}
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
        </Top>

        <Wrapper style={rectStyle}>
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
              <ImgStyle src={bgImg} alt="" />
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

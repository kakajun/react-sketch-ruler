import React, { useState, useEffect, useRef } from 'react'
import SketchRule from 'react-sketch-ruler'
import 'react-sketch-ruler/lib/style.css'
import type { SketchRulerMethods } from 'react-sketch-ruler'
import bgImg from '@/assets/bg.png'
import { Button, Input, Slider, Switch } from 'antd'
import './Comprehensive.less'
import { useTheme } from 'antd-style'
const DemoComponent = () => {
  // const [rectWidth] = useState(770)
  // const [rectHeight] = useState(472)
  const { appearance } = useTheme()

  const [rectWidth] = useState(1470)
  const [rectHeight] = useState(750)
  const [canvasWidth] = useState(1920)
  const [canvasHeight] = useState(1080)
  const sketchruleRef = useRef<SketchRulerMethods>(null)
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
    setState((prevState) => ({ ...prevState, isBlack: appearance !== 'light' }))
  }, [appearance])

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

  const zoomInMethod = () => {
    if (sketchruleRef.current) {
      ;(sketchruleRef.current as SketchRulerMethods).zoomIn()
    }
  }

  const handleShowRuler = () => {
    setShowRuler(!showRuler)
  }

  const scaleChange = (value: number) => {
    if (value) {
      setState((prevState) => ({ ...prevState, scale: value }))
      if (sketchruleRef.current) {
        ;(sketchruleRef.current as SketchRulerMethods).panzoomInstance.current?.zoom(value)
      }
    }
  }

  const handleShowReferLine = () => {
    setState((prevState) => ({ ...prevState, isShowReferLine: !prevState.isShowReferLine }))
    console.log(state.isShowReferLine, 'state.isShowReferLine')
  }

  const snapsChange = (e: { target: { value: string } }) => {
    const arr = e.target.value.split(',')
    console.log(arr, 'arr')
  }

  const snapsChangeV = (e: { target: { value: string } }) => {
    const arr = e.target.value.split(',')
    setSnapsObj((prevState) => ({ ...prevState, v: arr.map((item) => Number(item)) }))
  }

  const changeScale = (checked: boolean) => {
    setPanzoomOption((prevState) => ({ ...prevState, disableZoom: checked }))
  }
  const updateScale = (scale: number) => {
    setState((prevState) => ({ ...prevState, scale }))
  }

  const changeMove = (checked: boolean) => {
    setPanzoomOption((prevState) => ({ ...prevState, disablePan: checked }))
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
        <div className="top font16">
          <div className="mr10"> Ctrl+鼠标滚轮缩放画布 </div>
          <div className="mr10"> 空白键+鼠标左键键移动画布 </div>
          <div className="mr10"> 缩放比:{cpuScale} </div>
          <div className="mr10"> 参考线:{JSON.stringify(state.lines)} </div>
        </div>
        <div className="top">
          <Button
            size="small"
            className="btn"
            onClick={showRuler ? () => setShowRuler(false) : handleShowRuler}
          >
            隐藏规尺
          </Button>
          <Button size="small" className="btn" onClick={handleShowReferLine}>
            辅助线开关
          </Button>
          <Button size="small" className="btn" onClick={() => setLockLine(true)}>
            锁定参考线
          </Button>
          <Button size="small" className="btn" onClick={changeShadow}>
            模拟阴影切换
          </Button>
          <Button size="small" className="btn" onClick={resetMethod}>
            还原
          </Button>
          <Button size="small" className="btn" onClick={zoomOutMethod}>
            缩小
          </Button>
          <span className="btn">禁止缩放</span>
          <Switch onChange={changeScale} />

          <span className="btn">禁止移动</span>
          <Switch onChange={changeMove} />

          <Slider
            style={{ marginRight: '10px', width: '90px' }}
            value={state.scale}
            disabled={panzoomOption.disableZoom}
            onChange={scaleChange}
            min={0.1}
            max={3}
            step={0.1}
          />

          <div style={{ marginRight: '10px' }}> 吸附横线: </div>
          <Input
            style={{ marginRight: '10px', width: '90px' }}
            defaultValue={snapsObj.h.join(',')}
            onBlur={snapsChange}
          />

          <div style={{ marginRight: '10px' }}> 吸附纵线: </div>
          <Input
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
              <Button size="small" className="btn" onClick={resetMethod}>
                还原
              </Button>
              <Button size="small" className="btn" onClick={zoomInMethod}>
                放大
              </Button>
              <Button size="small" className="btn" onClick={zoomOutMethod}>
                缩小
              </Button>
            </div>
          </SketchRule>
        </div>
      </div>
    </>
  )
}

export default DemoComponent

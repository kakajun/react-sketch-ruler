import React, { useState, useRef, useMemo } from 'react'
import { SketchRule } from 'react-sketch-ruler'
import type { SketchRulerMethods } from 'react-sketch-ruler'
import Moveable from 'react-moveable'
import ReactSelecto from './edit/ReactSelecto'
import type { ReactSelectoRef } from './edit/ReactSelecto'
import './SelectoDemo.less'

const cubes = Array.from({ length: 30 }, (_, i) => i)

const SelectoDemo: React.FC = () => {
  const [targets, setTargets] = useState<HTMLElement[]>([])
  const [isBlack] = useState(false)
  const moveableRef = useRef<any>(null)
  const selectoRef = useRef<ReactSelectoRef>(null)
  const sketchRef = useRef<SketchRulerMethods>(null)
  const elemRef = useRef<HTMLDivElement>(null)

  const cpuPalette = useMemo(() => {
    return isBlack
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
  }, [isBlack])

  const post = useMemo(
    () => ({
      thick: 20,
      width: 770,
      height: 600,
      canvasWidth: 600,
      canvasHeight: 600,
      showRuler: true,
      palette: cpuPalette,
      shadow: { x: 0, y: 0, width: 0, height: 0 },
      isShowReferLine: true,
      lines: { h: [0, 250], v: [0, 500] }
    }),
    [cpuPalette]
  )

  const rectStyle = useMemo(
    () => ({
      width: `${post.width}px`,
      height: `${post.height}px`
    }),
    [post.width, post.height]
  )

  const canvasStyle = useMemo(
    () => ({
      width: `${post.canvasWidth}px`,
      height: `${post.canvasHeight}px`
    }),
    [post.canvasWidth, post.canvasHeight]
  )

  const onDragStart = (e: any) => {
    const target = e.inputEvent.target
    if (
      moveableRef.current?.isMoveableElement(target) ||
      targets.some((t) => t === target || t.contains(target))
    ) {
      e.stop()
    }
  }

  const onSelectEnd = (e: any) => {
    if (e.isDragStartEnd) {
      e.inputEvent.preventDefault()
      moveableRef.current?.waitToChangeTarget().then(() => {
        moveableRef.current?.dragStart(e.inputEvent)
      })
    }
    setTargets(e.selected)
  }

  const onClickGroup = (e: any) => {
    selectoRef.current?.clickTarget(e.inputEvent, e.inputTarget)
  }

  const onRender = (e: any) => {
    e.target.style.cssText += e.cssText
  }

  const onRenderGroup = (e: any) => {
    e.events.forEach((ev: any) => {
      ev.target.style.cssText += ev.cssText
    })
  }

  return (
    <div className="moveable app">
      <h1>Change the Moveable targets by selecting it.</h1>
      <p className="description">
        这是一个失败的例子, 此例子展示 Selecto 与 react-sketch-ruler 共存会有问题,
        因为react-sketch-ruler 依赖transform 跟 Selecto 天然不能共存
      </p>
      <div className="wrapper whitewrapper" style={rectStyle}>
        <SketchRule ref={sketchRef} {...post}>
          <div slot="toolbar" className="btns">
            <button
              onClick={(e) => {
                e.stopPropagation()
                sketchRef.current?.reset()
              }}
            >
              还原
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                sketchRef.current?.zoomIn()
              }}
            >
              放大
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                sketchRef.current?.zoomOut()
              }}
            >
              缩小
            </button>
          </div>
          <div data-type="page" style={canvasStyle}>
            <div className="container">
              <Moveable
                ref={moveableRef}
                target={targets}
                draggable
                onClickGroup={onClickGroup}
                onRender={onRender}
                onRenderGroup={onRenderGroup}
              />
              <ReactSelecto
                ref={selectoRef}
                dragContainer=".elements"
                selectableTargets={['.target']}
                hitRate={0}
                selectByClick
                selectFromInside={false}
                toggleContinueSelect={['shift']}
                ratio={0}
                keyContainer={window}
                onDragStart={onDragStart}
                onSelectEnd={onSelectEnd}
              />
              <div ref={elemRef} className="elements selecto-area">
                {cubes.map((i) => (
                  <div key={i} className="cube target" />
                ))}
              </div>
            </div>
          </div>
        </SketchRule>
      </div>
    </div>
  )
}

export default SelectoDemo

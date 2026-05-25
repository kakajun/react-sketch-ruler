import React, { useState, useRef } from 'react'
import Moveable from 'react-moveable'
import ReactSelecto from './edit/ReactSelecto'
import type { ReactSelectoRef } from './edit/ReactSelecto'
import './SelectoDemo.less'

const cubes = Array.from({ length: 30 }, (_, i) => i)

const SelectoDemo: React.FC = () => {
  const [targets, setTargets] = useState<HTMLElement[]>([])
  const moveableRef = useRef<any>(null)
  const selectoRef = useRef<ReactSelectoRef>(null)
  const elemRef = useRef<HTMLDivElement>(null)

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
      <div className="container">
        <div className="logo logos">
          <a>
            <img
              src="https://daybrush.com/selecto/images/256x256.png"
              className="selecto"
              alt="selecto"
            />
          </a>
          <a>
            <img src="https://daybrush.com/moveable/images/256x256.png" alt="moveable" />
          </a>
        </div>
        <h1>Change the Moveable targets by selecting it.</h1>
        <p className="description">此例子展示 Selecto 与 Moveable 的协同使用</p>
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
  )
}

export default SelectoDemo

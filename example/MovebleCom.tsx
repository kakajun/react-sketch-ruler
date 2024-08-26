import React, { useState, useEffect, useRef } from 'react'
import Moveable from 'react-moveable' // 假设 Moveable 已经适配了 React

const App = () => {
  const [targetId, setTargetId] = useState(null)
  const [targetList, setTargetList] = useState([
    {
      id: 'target0',
      className: 'element0',
      left: 200,
      top: 150,
      background: '#ee8',
      width: 600,
      zIndex: 1,
      height: 600
    },
    {
      id: 'target1',
      className: 'element1',
      left: 600,
      top: 150,
      zIndex: 1,
      background: 'rgb(52, 55, 221)',
      width: 400,
      height: 300
    },
    {
      id: 'target2',
      className: 'element2',
      left: 100,
      top: 600,
      zIndex: 1,
      background: 'rgb(212, 67, 152)',
      width: 400,
      height: 400
    }
  ])

  const moveableRef = useRef(null)

  const snapDirections = {
    top: true,
    right: true,
    bottom: true,
    left: true,
    center: true,
    middle: true
  }

  const elementSnapDirections = {
    top: true,
    right: true,
    bottom: true,
    left: true,
    center: true,
    middle: true
  }

  const copyTargetList = useRef()

  const handleClick = (event, item) => {
    setTargetList((prevList) =>
      prevList.map((o) => ({
        ...o,
        zIndex: o.id === item.id ? 2 : 1
      }))
    )
    setTargetId(item.id)
    if (moveableRef.current) {
      moveableRef.current.dragStart(event)
    }
  }

  const onDragStart = (e) => {
    copyTargetList.current = JSON.parse(JSON.stringify(targetList))
  }

  const onDrag = (params) => {
    const { target, translate } = params
    const { id } = target.dataset
    const { left, top, width, height } = copyTargetList.current.find((o) => o.id === id)
    const [x, y] = translate
    const obj = targetList.find((o) => o.id === id)
    obj.left = left + x
    obj.top = top + y
    console.log({ x: obj.left, y: obj.top, width, height }) // 这里替换为实际的更新逻辑
  }

  const getStyle = (item) => ({
    left: `${item.left}px`,
    top: `${item.top}px`,
    lineHeight: `${item.height}px`,
    width: `${item.width}px`,
    height: `${item.height}px`,
    zIndex: item.zIndex,
    transform: 'rotate(0deg)', // 覆盖原来的,否则会有偏移
    background: item.background
  })

  const onDragEnd = (e) => {
    if (moveableRef.current) {
      moveableRef.current.updateRect()
    }
  }

  return (
    <div className="container">
      {targetList.map((item) => (
        <div
          key={item.id}
          className={`target ${item.className}`}
          data-id={item.id}
          data-left={item.left}
          data-top={item.top}
          id={item.id}
          style={getStyle(item)}
          onMouseDown={(event) => handleClick(event, item)}
        >
          {item.className}
        </div>
      ))}

      <Moveable
        ref={moveableRef}
        snappable
        snapGap
        snapDirections={snapDirections}
        elementSnapDirections={elementSnapDirections}
        snapThreshold={5 / 1} // 假设 scale 为 1
        target={`#${targetId}`}
        draggable
        throttleDrag={1}
        edgeDraggable={false}
        startDragRotate={0}
        throttleDragRotate={0}
        onDrag={onDrag}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />
    </div>
  )
}

export default App

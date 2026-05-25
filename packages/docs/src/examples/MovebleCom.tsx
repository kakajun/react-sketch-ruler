import React, { useState, useRef, useEffect } from 'react'
import { flushSync } from 'react-dom'
import Moveable from 'react-moveable'

interface TargetItem {
  id: string
  className: string
  left: number
  top: number
  background: string
  width: number
  height: number
  zIndex?: number
}

interface MovebleComProps {
  scale: number
  shadow: { x: number; y: number; width: number; height: number }
  onUpdateShadow?: (shadow: { x: number; y: number; width: number; height: number }) => void
  onUpdateSnapsObj?: (snapsObj: { h: number[]; v: number[] }) => void
}

const MovebleCom = ({ scale, shadow, onUpdateShadow, onUpdateSnapsObj }: MovebleComProps) => {
  const [targetId, setTargetId] = useState<string | null>(null)
  const [targetList, setTargetList] = useState<TargetItem[]>([
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

  const moveableRef = useRef<any>(null)
  const copyTargetList = useRef<TargetItem[]>([])

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

  const handleClick = (event: React.MouseEvent<HTMLDivElement>, item: TargetItem) => {
    flushSync(() => {
      setTargetList((prevList) =>
        prevList.map((o) => ({
          ...o,
          zIndex: o.id === item.id ? 2 : 1
        }))
      )
      setTargetId(item.id)
    })
    if (moveableRef.current) {
      moveableRef.current.dragStart(event.nativeEvent)
    }
  }

  useEffect(() => {
    if (targetId && moveableRef.current) {
      moveableRef.current.updateRect()
    }
  }, [targetId])

  useEffect(() => {
    const h = targetList.map((item) => item.top)
    const v = targetList.map((item) => item.left)
    onUpdateSnapsObj?.({ h, v })
  }, [targetList, onUpdateSnapsObj])

  const onDragStart = () => {
    copyTargetList.current = JSON.parse(JSON.stringify(targetList)) as TargetItem[]
  }

  const onDrag = (params: { target: any; translate: any }) => {
    const { target, translate } = params
    const { id } = target.dataset
    const arr = copyTargetList.current.find((o) => o.id === id)
    if (!arr) return
    const { left, top, width, height } = arr
    const [x, y] = translate
    const newLeft = left + x
    const newTop = top + y

    setTargetList((prevList) =>
      prevList.map((o) =>
        o.id === id ? { ...o, left: newLeft, top: newTop } : o
      )
    )
    onUpdateShadow?.({ x: newLeft, y: newTop, width, height })
  }

  const getStyle = (item: TargetItem) => ({
    left: `${item.left}px`,
    top: `${item.top}px`,
    lineHeight: `${item.height}px`,
    width: `${item.width}px`,
    height: `${item.height}px`,
    zIndex: item.zIndex,
    transform: 'rotate(0deg)',
    background: item.background
  })

  const onDragEnd = () => {
    if (moveableRef.current) {
      moveableRef.current.updateRect()
    }
  }

  return (
    <div className="container">
      {targetList.map((item) => (
        <div
          key={item.id}
          className={`moveble-target ${item.className}`}
          data-id={item.id}
          data-left={item.left}
          data-top={item.top}
          id={item.id}
          style={getStyle({ ...item, zIndex: item.zIndex ?? 1 })}
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
        snapThreshold={5 / scale}
        target={targetId ? `#${targetId}` : undefined}
        visible={!!targetId}
        draggable
        throttleDrag={1}
        edgeDraggable={false}
        startDragRotate={0}
        throttleDragRotate={0}
        onDrag={onDrag}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        zoom={scale}
        rootContainer={document.querySelector('.canvasedit') as HTMLElement}
        container={document.querySelector('.canvasedit') as HTMLElement}
        elementGuidelines={['.moveble-container', '.element0', '.element1', '.element2']}
      />
    </div>
  )
}

export default MovebleCom

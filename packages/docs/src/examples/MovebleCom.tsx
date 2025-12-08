import React, { useState, useRef, useEffect } from 'react'
import Moveable from 'react-moveable' // 假设 Moveable 已经适配了 React
// 临时定义 ShadowType，避免找不到模块报错
type ShadowType = {
  x: number
  y: number
  width: number
  height: number
}

interface MovebleComProps {
  updateShadow: (props: ShadowType) => void
  updateSnapsObj: (props: { h: number[]; v: number[] }) => void
  zoom?: number
}

type TargetItem = {
  id: string
  className: string
  left: number
  top: number
  background: string
  width: number
  height: number
  zIndex?: number // 可选字段
}

const MovebleCom = ({ updateShadow, updateSnapsObj, zoom = 1 }: MovebleComProps) => {
  const [targetId, setTargetId] = useState<string | null>('target0')
  const [targetEl, setTargetEl] = useState<HTMLElement | null>(null)
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

  const copyTargetList = useRef<TargetItem[]>([])

  const handleClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    item: {
      id: any
      className?: string
      left?: number
      top?: number
      background?: string
      width?: number
      height?: number
      zIndex?: number | undefined
    }
  ) => {
    setTargetList((prevList) =>
      prevList.map((o) => ({
        ...o,
        zIndex: o.id === item.id ? 2 : 1
      }))
    )
    setTargetId(item.id)
    setTimeout(() => {
      if (moveableRef.current) {
        ;(moveableRef.current as any).dragStart(event)
      }
    }, 0)
  }

  useEffect(() => {
    const el = targetId ? document.getElementById(targetId) : null
    setTargetEl(el)
    if (el && moveableRef.current) {
      ;(moveableRef.current as any).updateRect()
    }
  }, [targetId])

  const onDragStart = () => {
    copyTargetList.current = JSON.parse(JSON.stringify(targetList)) as TargetItem[]
  }

  const onDrag = (params: { target: any; translate: any }) => {
    // 使用 setTargetList
    const { target, translate } = params
    const { id } = target.dataset
    const arr = copyTargetList.current.find((o) => o.id === id)
    if (!arr) return
    const { left, top, width, height } = arr
    const [x, y] = translate
    // 获取当前对象并更新其位置
    const updatedList = targetList.map((o) =>
      o.id === id ? { ...o, left: left + x, top: top + y } : o
    )

    // 更新状态
    setTargetList(updatedList)
    updateShadow({ x: left + x, y: top + y, width, height })
  }

  const getStyle = (item: {
    id?: string
    className?: string
    left: any
    top: any
    background: any
    width: any
    height: any
    zIndex: any
  }) => ({
    left: `${item.left}px`,
    top: `${item.top}px`,
    lineHeight: `${item.height}px`,
    width: `${item.width}px`,
    height: `${item.height}px`,
    zIndex: item.zIndex,
    transform: 'rotate(0deg)', // 覆盖原来的,否则会有偏移
    background: item.background
  })

  const onDragEnd = () => {
    if (moveableRef.current) {
      ;(moveableRef.current as any).updateRect()
    }
  }

  useEffect(() => {
    const h = targetList.map((item: TargetItem) => item.top)
    const v = targetList.map((item: TargetItem) => item.left)
    updateSnapsObj({ h, v })
  }, [targetList])

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
        snapThreshold={5 / zoom}
        target={targetEl || undefined}
        visible={!!targetEl}
        draggable
        throttleDrag={1}
        edgeDraggable={false}
        startDragRotate={0}
        throttleDragRotate={0}
        onDrag={onDrag}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        zoom={zoom}
        rootContainer={document.querySelector('.canvasedit') as HTMLElement}
        container={document.querySelector('.canvasedit') as HTMLElement}
      />
    </div>
  )
}

export default MovebleCom

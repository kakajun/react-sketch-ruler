import React, { useState, useRef, useEffect } from 'react'
import Moveable from 'react-moveable'
import './Comprehensive.less'

const cubes = Array.from({ length: 30 }, (_, i) => i)

const SelectoDemo: React.FC = () => {
  const [targets, setTargets] = useState<HTMLElement[]>([])
  const moveableRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('cube')) {
      if (e.shiftKey) {
        setTargets((prev) =>
          prev.includes(target as HTMLElement)
            ? prev.filter((t) => t !== target)
            : [...prev, target as HTMLElement]
        )
      } else {
        setTargets([target as HTMLElement])
      }
    } else {
      setTargets([])
    }
  }

  return (
    <div className="moveable app" style={{ padding: 20, textAlign: 'center' }}>
      <h1>Moveable 多选示例</h1>
      <p className="description">此例子展示 react-moveable 的多选与拖拽功能</p>
      <div
        ref={containerRef}
        className="elements selecto-area"
        style={{ border: '2px solid #eee', padding: 20, marginTop: 40 }}
        onMouseDown={handleMouseDown}
      >
        {cubes.map((i) => (
          <div
            key={i}
            className="cube target"
            style={{
              display: 'inline-block',
              borderRadius: 5,
              width: 40,
              height: 40,
              margin: 4,
              background: targets.some((t) => t.dataset.id === String(i)) ? '#4af' : '#ddd',
              lineHeight: '40px',
              cursor: 'pointer'
            }}
            data-id={i}
          >
            {i}
          </div>
        ))}
      </div>
      <Moveable
        ref={moveableRef}
        target={targets}
        draggable
        onDrag={({ target, translate }) => {
          target.style.transform = `translate(${translate[0]}px, ${translate[1]}px)`
        }}
      />
    </div>
  )
}

export default SelectoDemo

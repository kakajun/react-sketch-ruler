import React, { useState, useEffect, useMemo } from 'react'
import { SketchRule } from 'react-sketch-ruler'
import 'react-sketch-ruler/index.css'
import { CanvasManager, BUILTIN_TEMPLATES, exportLines, importLines } from '@sketch-ruler/core'
import type { CanvasState, CanvasManagerState } from '@sketch-ruler/core'
import './MultiInstance.less'

const MultiInstance: React.FC = () => {
  const [canvases, setCanvases] = useState<CanvasState[]>([])
  const [activeId, setActiveId] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const rectWidth = 900
  const rectHeight = 560

  const manager = useMemo(() => {
    return new CanvasManager([
      {
        name: 'Web 1920',
        width: 1920,
        height: 1080,
        scale: 0.4,
        lines: { h: [100, 540], v: [200, 960] }
      },
      {
        name: 'A4 纵向',
        width: 794,
        height: 1123,
        scale: 0.45,
        lines: { h: [300], v: [400] }
      },
      {
        name: 'Mobile 375',
        width: 375,
        height: 812,
        scale: 0.6,
        lines: { h: [200, 400], v: [100, 200] }
      }
    ])
  }, [])

  useEffect(() => {
    manager.onUpdate((state: CanvasManagerState) => {
      setCanvases(state.canvases)
      setActiveId(state.activeId)
    })
    const init = manager.getState()
    setCanvases(init.canvases)
    setActiveId(init.activeId)
  }, [manager])

  const activeCanvas = useMemo(() => {
    return canvases.find((c) => c.id === activeId) ?? null
  }, [canvases, activeId])

  const activeLines = useMemo(() => {
    if (!activeCanvas) return { h: [], v: [] }
    return exportLines(activeCanvas.lines)
  }, [activeCanvas])

  const rectStyle = useMemo(
    () => ({
      width: `${rectWidth}px`,
      height: `${rectHeight}px`
    }),
    []
  )

  const getCanvasStyle = (canvas: CanvasState) => ({
    width: `${canvas.width}px`,
    height: `${canvas.height}px`
  })

  const getContentStyle = (canvas: CanvasState) => {
    const hue = canvas.name.charCodeAt(0) % 360
    return {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      border: '2px dashed rgba(0, 0, 0, 0.1)',
      boxSizing: 'border-box' as const,
      background: `linear-gradient(135deg, hsl(${hue}, 60%, 90%), hsl(${hue}, 60%, 80%))`
    }
  }

  const getPreviewStyle = (canvas: CanvasState) => {
    const ratio = canvas.width / canvas.height
    const w = ratio > 1 ? 64 : 64 / ratio
    const h = ratio > 1 ? 64 / ratio : 64
    const hue = canvas.name.charCodeAt(0) % 360
    return {
      width: `${w}px`,
      height: `${h}px`,
      background: `hsl(${hue}, 60%, 85%)`,
      margin: '0 auto 8px',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }

  const switchCanvas = (id: string) => {
    manager.switchCanvas(id)
  }

  const removeCanvas = (id: string) => {
    manager.removeCanvas(id)
  }

  const handleAddCanvas = () => {
    const name = selectedTemplate
    if (!name) return
    const id = manager.applyTemplate(name)
    if (id) {
      manager.switchCanvas(id)
    }
    setSelectedTemplate('')
  }

  const handleZoomChange = (detail: { scale: number; x: number; y: number }) => {
    manager.updateCanvasState(activeId, {
      scale: detail.scale
    })
  }

  const handleLinesChange = (lines: { h: number[]; v: number[] }) => {
    manager.updateCanvasLines(activeId, importLines(lines))
  }

  const templateNames = Object.keys(BUILTIN_TEMPLATES)

  return (
    <div className="demo">
      <div className="top font16">
        <div className="mr10">
          多画布管理器演示：通过 CanvasManager 管理多个画布，各自独立保存缩放、偏移与参考线
        </div>
      </div>

      <div className="main-layout">
        <div className="sidebar">
          <div className="sidebar-header">
            <span className="sidebar-title">画布列表</span>
            <select
              className="template-select"
              value={selectedTemplate}
              onChange={(e) => {
                setSelectedTemplate(e.target.value)
                if (e.target.value) {
                  setTimeout(() => handleAddCanvas(), 0)
                }
              }}
            >
              <option value="">+ 添加画布</option>
              {templateNames.map((name) => (
                <option key={name} value={name}>
                  {BUILTIN_TEMPLATES[name]?.name || name}
                </option>
              ))}
            </select>
          </div>

          <div className="canvas-list">
            {canvases.map((canvas) => (
              <div
                key={canvas.id}
                className={`canvas-card ${canvas.id === activeId ? 'active' : ''}`}
                onClick={() => switchCanvas(canvas.id)}
              >
                <div className="canvas-preview" style={getPreviewStyle(canvas)}>
                  <span className="canvas-label">{canvas.name}</span>
                </div>
                <div className="canvas-info">
                  <span className="canvas-size">
                    {canvas.width} × {canvas.height}
                  </span>
                  <span className="canvas-scale">{(canvas.scale * 100).toFixed(0)}%</span>
                </div>
                {canvases.length > 1 && (
                  <button
                    className="canvas-delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeCanvas(canvas.id)
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="editor-area">
          <div className="editor-header">
            <span className="editor-title">{activeCanvas?.name || '未选择'}</span>
            <span className="editor-meta">
              {activeCanvas?.width} × {activeCanvas?.height} | 参考线: {activeLines.h.length}h /{' '}
              {activeLines.v.length}v
            </span>
          </div>

          <div className="wrapper whitewrapper" style={rectStyle}>
            {activeCanvas && (
              <SketchRule
                key={activeId}
                width={rectWidth}
                height={rectHeight}
                canvasWidth={activeCanvas.width}
                canvasHeight={activeCanvas.height}
                thick={20}
                lines={activeLines}
                autoCenter={true}
                palette={{ bgColor: 'transparent', guideLineStyle: 'dashed' }}
                isShowReferLine={true}
                onZoomChange={handleZoomChange}
                onUpdateLines={handleLinesChange}
              >
                <div data-type="page" style={getCanvasStyle(activeCanvas)}>
                  <div style={getContentStyle(activeCanvas)}>
                    <span className="content-label">{activeCanvas.name}</span>
                    <span className="content-size">
                      {activeCanvas.width} × {activeCanvas.height}
                    </span>
                  </div>
                </div>
                <div slot="toolbar" className="btns">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    还原
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    放大
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    缩小
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    100%
                  </button>
                </div>
              </SketchRule>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MultiInstance

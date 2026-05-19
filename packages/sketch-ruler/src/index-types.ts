import type { RefObject } from 'react'
import type { TransformEngine, TransformState, GuideLine } from '@sketch-ruler/core'
export type { GuideLine } from '@sketch-ruler/core'
export interface PaletteType {
  bgColor?: string
  longfgColor?: string
  fontColor?: string
  fontShadowColor?: string
  shadowColor?: string
  lineColor?: string
  lineType?: string
  lockLineColor?: string
  borderColor?: string
  hoverBg?: string
  hoverColor?: string
  cornerActiveColor?: string
}

export interface FinalPaletteType {
  bgColor: string
  longfgColor: string
  fontColor: string
  fontShadowColor: string
  shadowColor: string
  lineColor: string
  lineType: string
  lockLineColor: string
  hoverColor: string
  hoverBg: string
  borderColor: string
}

export interface ShadowType {
  x: number
  y: number
  width: number
  height: number
}

export interface LineType {
  h: number[]
  v: number[]
}

export type ZoomMode = 'pointer' | 'viewport-center' | 'content-center'

export interface SketchRulerProps {
  showRuler?: boolean
  eyeIcon?: string
  closeEyeIcon?: string
  scale?: number
  rate?: number
  thick?: number
  palette?: PaletteType
  width?: number
  height?: number
  paddingRatio?: number
  autoCenter?: boolean
  shadow?: ShadowType
  showShadowText?: boolean
  lines?: LineType
  isShowReferLine?: boolean
  canvasWidth?: number
  canvasHeight?: number
  snapsObj?: LineType
  snapThreshold?: number
  gridRatio?: number
  lockLine?: boolean
  selfHandle?: boolean
  panzoomOption?: Record<string, any> // 保留兼容，底层已改为 TransformEngine
  children: React.ReactNode
  updateScale?: (props: number) => void
  onZoomChange?: (props: TransformState) => void
  onHandleCornerClick?: (props: boolean) => void
  handleLine?: (props: LineType) => void
  /** 参考线对象模型（新），优先级高于 `lines` */
  guideLines?: GuideLine[]
  /** 参考线变更回调（新，返回 GuideLine[]） */
  onGuideLineChange?: (lines: GuideLine[]) => void
  deleteLabel?: string
  /** 是否显示次刻度线 */
  showMinorTicks?: boolean
  /** 缩放原点模式 */
  zoomMode?: ZoomMode
  /** 缩放步长 */
  zoomStep?: number
  /** 最小缩放 */
  minZoom?: number
  /** 最大缩放 */
  maxZoom?: number
  /** 是否启用动画 */
  enableAnimation?: boolean
  /** 动画模式 */
  animationMode?: 'direct' | 'ease-out' | 'damped' | 'exponential'
  /** 初始偏移（autoCenter=false 时生效） */
  initialOffset?: { x: number; y: number }
}

export interface RulerWrapperProps {
  vertical: boolean
  showShadowText: boolean
  scale: number
  width: number
  height: number
  canvasWidth: number
  canvasHeight: number
  startOther: number
  thick: number
  palette: FinalPaletteType
  start: number
  rate: number
  lines: LineType
  snapThreshold: number
  snapsObj: LineType
  selectStart: number
  gridRatio: number
  selectLength: number
  lockLine: boolean
  isShowReferLine: boolean
  handleLine?: (props: LineType) => void
  deleteLabel?: string
  propStyle: React.CSSProperties
  showMinorTicks?: boolean
  guideLines?: GuideLine[]
  addLine?: (line: Omit<GuideLine, 'id'>) => void
  removeLine?: (id: string) => void
  updateLine?: (id: string, position: number) => void
}

export interface LineProps {
  index: number
  start: number
  vertical: boolean
  canvasWidth: number
  canvasHeight: number
  snapThreshold: number
  snapsObj: LineType
  lines: LineType
  palette: FinalPaletteType
  isShowReferLine: boolean
  rate: number
  scale: number
  value: number
  lockLine: boolean
  handleLine?: (props: LineType) => void
  deleteLabel?: string
  guideLine?: GuideLine
}

export interface CanvasProps {
  start: number
  vertical: boolean
  showShadowText: boolean
  canvasWidth: number
  canvasHeight: number
  palette: FinalPaletteType
  rate: number
  scale: number
  width: number
  height: number
  selectStart: number
  gridRatio: number
  selectLength: number
  onDragStart: (e: React.MouseEvent<HTMLCanvasElement>) => Promise<void>
  showMinorTicks?: boolean
}

export interface SketchRulerMethods {
  reset: () => void
  zoomIn: () => void
  zoomOut: () => void
  initPanzoom: () => void
  panzoomInstance: RefObject<TransformEngine | null>
  setTransform: (t: Partial<TransformState>) => void
  setZoomMode: (mode: ZoomMode) => void
  zoomToPreset: (preset: number) => void
}

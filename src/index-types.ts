import type { PanzoomObject, PanzoomEventDetail } from 'simple-panzoom'
export interface PaletteType {
  bgColor?: string
  longfgColor?: string
  fontColor?: string
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
  shadowColor: string
  lineColor: string
  lineType: string
  lockLineColor: string
  hoverColor: string
  hoverBg: string
  borderColor: string
}

interface ShadowType {
  x: number
  y: number
  width: number
  height: number
}

export interface LineType {
  h: number[]
  v: number[]
}

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
  lines?: LineType
  isShowReferLine?: boolean
  canvasWidth?: number
  canvasHeight?: number
  snapsObj?: LineType
  snapThreshold?: number
  gridRatio?: number
  lockLine?: boolean
  selfHandle?: boolean
  panzoomOption?: object // 需要具体类型，这里假设为object
  children: React.ReactNode
  onUpdateScale?: (props: number) => void
  onZoomChange?: (props: PanzoomEventDetail) => void
  onCornerClick?: (props: boolean) => void
}

export interface RulerWrapperProps {
  vertical: boolean
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
  changeLineState: Fn
  propStyle: React.CSSProperties
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
}

export interface CanvasProps {
  start: number
  vertical: boolean
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
  onDragStart: Fn
}

export interface SketchRulerMethods {
  reset: () => void
  zoomIn: () => void
  zoomOut: () => void
  initPanzoom: () => void
  panzoomInstance: PanzoomObject | null
}

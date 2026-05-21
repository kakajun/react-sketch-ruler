import type { RefObject } from 'react'
import type { TransformEngine, TransformState, GuideLine, SketchRulerPlugin } from '@sketch-ruler/core'

export type { GuideLine, SketchRulerPlugin } from '@sketch-ruler/core'

export interface PaletteType {
  bgColor?: string
  tickColor?: string
  labelColor?: string
  guideLineColor?: string
  guideLineLockedColor?: string
  hoverBg?: string
  hoverColor?: string
  borderColor?: string
  shadowColor?: string
  fontShadowColor?: string
  cornerActiveColor?: string
  guideLineStyle?: string
  guideLineWidth?: number
  labelEnabled?: boolean
  labelPosition?: string
  labelFormat?: (value: number) => string
}

export interface FinalPaletteType {
  bgColor: string
  tickColor: string
  labelColor: string
  guideLineColor: string
  guideLineLockedColor: string
  hoverBg: string
  hoverColor: string
  borderColor: string
  shadowColor: string
  fontShadowColor: string
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
  scale?: number
  thick?: number
  width?: number
  height?: number
  canvasWidth?: number
  canvasHeight?: number
  palette?: PaletteType
  lines?: LineType
  isShowReferLine?: boolean
  snapThreshold?: number
  lockLine?: boolean
  selfHandle?: boolean
  zoomStep?: number
  minZoom?: number
  maxZoom?: number
  animationMode?: 'direct' | 'ease-out' | 'damped' | 'exponential'
  zoomMode?: ZoomMode
  enableAnimation?: boolean
  plugins?: SketchRulerPlugin[]
  autoCenter?: boolean
  shadow?: ShadowType
  initialOffset?: { x: number; y: number }
  showMinorTicks?: boolean
  eyeIcon?: string
  closeEyeIcon?: string
  deleteLabel?: string
  children?: React.ReactNode
  onUpdateScale?: (scale: number) => void
  onZoomChange?: (detail: { scale: number; x: number; y: number }) => void
  onUpdateLines?: (lines: LineType) => void
  onUpdateLockLine?: (lock: boolean) => void
  onHandleCornerClick?: (show: boolean) => void
}

export interface RulerWrapperProps {
  vertical: boolean
  width: number
  height: number
  thick: number
  scale: number
  offset: { x: number; y: number }
  lines: GuideLine[]
  palette: FinalPaletteType
  showReferLine: boolean
  shadowStart?: number
  shadowLength?: number
  canvasSize?: number
  showMinorTicks?: boolean
  canvasWidth?: number
  canvasHeight?: number
  deleteLabel?: string
  lockLine?: boolean
  onAddLine?: (line: Omit<GuideLine, 'id'>) => void
  onUpdateLine?: (id: string, position: number) => void
  onDeleteLine?: (id: string) => void
}

export interface LineProps {
  line: GuideLine
  scale: number
  offset: number
  palette: FinalPaletteType
  vertical: boolean
  canvasWidth: number
  canvasHeight: number
  lockLine?: boolean
  deleteLabel?: string
  onUpdate?: (id: string, position: number) => void
  onDelete?: (id: string) => void
}

export interface CanvasProps {
  marks: any[]
  palette: FinalPaletteType
  vertical: boolean
  thick: number
  width: number
  height: number
  ratio?: number
}

export interface SketchRulerMethods {
  engine: TransformEngine
  reset: () => void
  zoomIn: () => void
  zoomOut: () => void
  setTransform: (t: Partial<TransformState>) => void
  setZoomMode: (mode: ZoomMode) => void
  zoomToPreset: (preset: number) => void
}

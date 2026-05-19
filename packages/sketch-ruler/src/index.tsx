import SketchRule from './sketch-ruler/index'
import Minimap from './minimap/index'
export type { SketchRulerProps, SketchRulerMethods, ZoomMode, PaletteType, LineType, GuideLine } from './index-types'
export type { MinimapProps } from './minimap/index'
export { Minimap }

// 核心类型重新导出
export type {
  SketchRulerPlugin,
  TransformState,
  TransformEngineOptions,
  ScaleMark,
  TickConfig,
  RulerPalette,
  SnapConfig,
  RulerState,
  RulerAction
} from '@sketch-ruler/core'

// Hooks 导出
export { useTransformEngine } from './hooks/useTransformEngine'
export { useInputManager } from './hooks/useInputManager'
export { useRulerScale } from './hooks/useRulerScale'
export { useGuideLines, lineTypeToGuideLines, guideLinesToLineType } from './hooks/useGuideLines'
export { useSketchRuler } from './hooks/useSketchRuler'
export { useSnapDetection } from './hooks/useSnapDetection'
export type { SnapOptions, SnapResult, SnapTarget } from './hooks/useSnapDetection'

export default SketchRule

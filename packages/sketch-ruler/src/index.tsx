import SketchRule from './sketch-ruler/index'
import Minimap from './minimap/index'
export type {
  SketchRulerProps,
  SketchRulerMethods,
  PaletteType,
  LineType,
  GuideLine
} from './index-types'
export type { ZoomMode } from '@sketch-ruler/core'
export type { MinimapProps } from './minimap/index'

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

// 核心 API 重新导出（保持与 Vue 版本对齐）
export { TransformEngine } from '@sketch-ruler/core'
export { produceState, createDefaultState, PluginManager } from '@sketch-ruler/core'
export { InputManager } from '@sketch-ruler/canvas'
export { CanvasManager, BUILTIN_TEMPLATES } from '@sketch-ruler/core'

// Hooks 导出
export { useCanvasTransform } from './hooks/useCanvasTransform'
export { useInputManager } from './hooks/useInputManager'
export { useRulerScale } from './hooks/useRulerScale'
export { useGuideLines, lineTypeToGuideLines, guideLinesToLineType } from './hooks/useGuideLines'
export { useSketchRuler } from './hooks/useSketchRuler'
export { useSnapDetection } from './hooks/useSnapDetection'
export type { SnapOptions, SnapResult, SnapTarget } from './hooks/useSnapDetection'

// 插件
export { definePlugin } from './plugins'

export { SketchRule, Minimap }

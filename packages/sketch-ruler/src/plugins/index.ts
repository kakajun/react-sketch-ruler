export { PluginManager } from '@sketch-ruler/core'
export type {
  SketchRulerPlugin,
  RulerRenderer,
  BeforeZoomContext,
  AfterZoomContext,
  BeforePanContext,
  AfterPanContext,
  OnSnapContext,
  OnLineContext,
  OnLineMoveContext,
  TickInfo,
  LabelInfo,
  RenderConfig,
  Point,
  SnapTarget,
  PluginApi,
  PluginContext
} from '@sketch-ruler/core'

import type { SketchRulerPlugin } from '@sketch-ruler/core'

/**
 * 辅助函数：创建带类型推断的插件
 */
export function definePlugin<TOptions = void>(
  factory: (options: TOptions) => SketchRulerPlugin
): (options: TOptions) => SketchRulerPlugin {
  return (options: TOptions) => factory(options)
}

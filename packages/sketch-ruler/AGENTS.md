# react-sketch-ruler 插件系统指南

> 本文件面向 AI Coding Agent，说明 `react-sketch-ruler` 的插件系统架构、开发约定与使用方式。

---

## 包概述

`react-sketch-ruler` 是 `@sketch-ruler/core` 的 **React 封装层**，负责：

- 将核心引擎（TransformEngine、PluginManager 等）接入 React 生命周期
- 提供 JSX 组件 `<SketchRule>` 与 `<Minimap>`
- 封装 Hooks（useCanvasTransform、useInputManager 等）
- 管理参考线渲染与交互
- **透传插件系统**：`plugins` prop 直接对接底层 `PluginManager`

### SketchRuler 关键 Props

| 属性 | 说明 | 默认值 |
| --- | --- | --- |
| `autoCenter` | 初始化时自动将画布居中 | `true` |
| `paddingRatio` | 自动居中时的边距比例（`0 ~ 0.5`），控制画布四周留白 | `0.2` |
| `initialOffset` | `autoCenter=false` 时使用的初始偏移 | `{ x:0, y:0 }` |

> `paddingRatio` 变更后会实时触发重新 fit 并更新画布位置（仅 `autoCenter=true` 时生效）。

---

## 插件系统架构

```
用户插件 (SketchRulerPlugin[])
       │
       ▼
<SketchRule plugins={plugins} />
       │
       ▼
PluginManager (@sketch-ruler/core)
       │
       ├── 生命周期钩子分发 (beforeZoom / afterZoom / beforePan / afterPan ...)
       ├── 渲染器注册 (registerRenderer)
       └── API 注入 (getState / zoomBy / zoomTo / panBy / setTransform)
```

React 层仅在 `SketchRule` 组件内做两件事：

1. **`plugins` prop 变化时重新注册**：
   ```tsx
   useEffect(() => {
     const pm = pluginManagerRef.current
     pm.clear()
     for (const plugin of plugins) {
       pm.register(plugin)
     }
   }, [plugins])
   ```

2. **在核心操作前后调用 PluginManager 钩子**：
   - `zoomIn` / `zoomOut` / `zoomToPreset` → `beforeZoom` → 执行缩放 → `afterZoom`
   - 滚轮缩放 → `beforeZoom` → `zoomTo` → `afterZoom`
   - 参考线创建/删除/移动 → `onLineCreate` / `onLineDelete` / `onLineMove`

---

## 插件类型定义

全部来自 `@sketch-ruler/core`，React 层通过 `src/plugins/index.ts` 重导出：

```ts
// 从 react-sketch-ruler 导入（推荐）
import type {
  SketchRulerPlugin,
  BeforeZoomContext,
  AfterZoomContext,
  BeforePanContext,
  AfterPanContext,
  OnSnapContext,
  OnLineContext,
  OnLineMoveContext,
  PluginApi,
  PluginContext,
  RulerRenderer,
  TickInfo,
  LabelInfo,
  RenderConfig,
  Point,
  SnapTarget
} from 'react-sketch-ruler'
```

### SketchRulerPlugin 接口

```ts
interface SketchRulerPlugin {
  name: string
  version?: string
  /** 优先级，数字越大越先执行。默认 0 */
  priority?: number

  /** 缩放前拦截。调用 ctx.cancel() 可阻止缩放 */
  beforeZoom?: (ctx: BeforeZoomContext & PluginContext) => void | Promise<void>
  /** 缩放后通知 */
  afterZoom?: (ctx: AfterZoomContext & PluginContext) => void
  /** 平移前拦截。调用 ctx.cancel() 可阻止平移 */
  beforePan?: (ctx: BeforePanContext & PluginContext) => void | Promise<void>
  /** 平移后通知 */
  afterPan?: (ctx: AfterPanContext & PluginContext) => void

  /** 吸附发生时通知 */
  onSnap?: (ctx: OnSnapContext & PluginContext) => void

  /** 参考线事件 */
  onLineCreate?: (ctx: OnLineContext & PluginContext) => void
  onLineDelete?: (ctx: OnLineContext & PluginContext) => void
  onLineMove?: (ctx: OnLineMoveContext & PluginContext) => void

  /** 注册自定义渲染器 */
  registerRenderer?: () => { name: string; renderer: RulerRenderer }
}
```

### 上下文类型速查

| 上下文 | 字段 |
| ------ | ---- |
| `BeforeZoomContext` | `from: number`（旧缩放比）, `to: number`（新缩放比）, `center: Point`, `cancel: () => void` |
| `AfterZoomContext` | `from: number`, `to: number`, `center: Point` |
| `BeforePanContext` | `offset: Point`（当前偏移）, `delta: Point`（增量）, `cancel: () => void` |
| `AfterPanContext` | `offset: Point`, `delta: Point` |
| `OnSnapContext` | `line: GuideLine`, `targets: SnapTarget[]`, `applied: SnapTarget \| null` |
| `OnLineContext` | `line: GuideLine` |
| `OnLineMoveContext` | `line: GuideLine`, `from: number`, `to: number` |

### PluginApi（插件可操作的核心 API）

```ts
interface PluginApi {
  /** 获取当前状态（scale / offset / lines） */
  getState: () => { scale: number; offset: Point; lines: GuideLine[] }
  /** 相对缩放 */
  zoomBy: (dScale: number, originX: number, originY: number) => void
  /** 绝对缩放 */
  zoomTo: (scale: number, originX: number, originY: number) => void
  /** 相对平移 */
  panBy: (dx: number, dy: number) => void
  /** 直接设置变换 */
  setTransform: (t: { scale?: number; x?: number; y?: number }) => void
}
```

> 注意：`PluginApi` 的所有方法均操作底层 `TransformEngine`，不会触发 React state 重新渲染。如果插件需要更新 UI，请自行管理状态。

---

## definePlugin 辅助函数

React 层提供了一个带类型推断的工厂函数包装器：

```ts
// src/plugins/index.ts
export function definePlugin<TOptions = void>(
  factory: (options: TOptions) => SketchRulerPlugin
): (options: TOptions) => SketchRulerPlugin
```

### 使用示例

```ts
import { definePlugin } from 'react-sketch-ruler'
import type { SketchRulerPlugin, PluginApi } from 'react-sketch-ruler'

// 带配置选项的插件
export const myPlugin = definePlugin((options: { threshold: number }) => {
  return {
    name: 'my-plugin',
    version: '1.0.0',
    priority: 10,

    beforeZoom(ctx) {
      if (ctx.to > 3) {
        console.log('禁止放大超过 3 倍')
        ctx.cancel()
      }
    },

    afterZoom(ctx) {
      console.log(`缩放完成：${ctx.from} → ${ctx.to}`)
      // 通过 api 读取状态
      const state = ctx.api.getState()
      console.log('当前偏移：', state.offset)
    },

    onLineCreate(ctx) {
      console.log('创建参考线：', ctx.line)
    }
  }
})

// 在组件中使用
function App() {
  const plugins = useMemo(() => [myPlugin({ threshold: 5 })], [])
  return <SketchRule plugins={plugins} />
}
```

---

## 自定义渲染器（RulerRenderer）

插件可注册自定义标尺渲染器，替代默认的 Canvas 刻度绘制。

```ts
import type { RulerRenderer, TickInfo, LabelInfo, RenderConfig } from 'react-sketch-ruler'

const customRenderer: RulerRenderer = {
  renderTicks(ctx, ticks, config) {
    // 自定义刻度绘制逻辑
    for (const tick of ticks) {
      ctx.beginPath()
      ctx.moveTo(tick.position, 0)
      ctx.lineTo(tick.position, tick.isMajor ? config.thick : config.thick / 2)
      ctx.strokeStyle = config.palette.tickColor
      ctx.stroke()
    }
  },

  renderLabels(ctx, labels, config) {
    // 自定义标签绘制逻辑
    ctx.fillStyle = config.palette.labelColor
    ctx.font = '10px sans-serif'
    for (const label of labels) {
      ctx.fillText(label.text, label.x, label.y)
    }
  }
}

export const rendererPlugin = definePlugin(() => ({
  name: 'custom-renderer',
  registerRenderer: () => ({ name: 'custom', renderer: customRenderer })
}))
```

> 渲染器注册后，**默认激活第一个注册的渲染器**。后续可通过底层 `PluginManager` 的 `setActiveRenderer(name)` 切换。

---

## 生命周期触发时机

| 钩子 | 触发时机 | 是否可拦截 |
| ---- | -------- | ---------- |
| `beforeZoom` | `zoomIn` / `zoomOut` / `zoomToPreset` / 滚轮缩放 / propScale 变化 | ✅ 调用 `cancel()` |
| `afterZoom` | 缩放完成后 | ❌ |
| `beforePan` | 拖拽平移前 | ✅ 调用 `cancel()` |
| `afterPan` | 拖拽平移后 | ❌ |
| `onSnap` | 参考线吸附到刻度时 | ❌ |
| `onLineCreate` | 用户从标尺拖拽创建参考线后 | ❌ |
| `onLineDelete` | 用户双击参考线删除后 | ❌ |
| `onLineMove` | 用户拖拽移动参考线后 | ❌ |

---

## 注意事项

1. **plugins 引用稳定性**：`SketchRule` 的 `useEffect` 依赖 `plugins` 数组本身。若每次渲染都创建新数组，会导致插件反复卸载/注册。请使用 `useMemo` 缓存插件数组。

2. **异步钩子**：`beforeZoom` 和 `beforePan` 支持 `async`，PluginManager 会按优先级顺序 `await` 每个插件。一旦有插件调用 `cancel()`，后续插件不再执行，操作被拦截。

3. **错误隔离**：所有钩子调用均被 `try/catch` 包裹，单个插件抛错不会影响其他插件或核心流程。

4. **优先级**：`priority` 数字越大越先执行。多个插件拦截同一操作时，高优先级插件先获得 `cancel()` 权限。

5. **PluginApi 的局限性**：`PluginApi` 提供的是底层引擎的直接操作接口，不会触发 React 层面的 `onZoomChange` 等回调。如果插件修改了变换状态，React 层的状态（如 `offset` state）不会自动同步。

6. **不要直接操作 DOM**：插件应通过 `PluginApi` 与引擎交互，不要直接修改标尺或画布的 DOM 元素。

---

## 文件位置

| 文件 | 说明 |
| ---- | ---- |
| `src/plugins/index.ts` | `definePlugin` 辅助函数 + 核心类型重导出 |
| `src/index.tsx` | 包入口：导出 `definePlugin`、`PluginManager`、各类型 |
| `src/index-types.ts` | `SketchRulerProps` 中声明 `plugins?: SketchRulerPlugin[]` |
| `src/sketch-ruler/index.tsx` | `PluginManager` 实例创建、插件注册、钩子调用 |

---

## 相关外部文档

- `@sketch-ruler/core` 的插件系统实现：`node_modules/@sketch-ruler/core/src/plugins/plugin-manager.ts`
- `@sketch-ruler/core` 的类型定义：`node_modules/@sketch-ruler/core/src/types/index.ts`

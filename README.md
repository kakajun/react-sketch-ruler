# react-sketch-ruler

> 是一个基于 React + TypeScript 的标尺组件库，由 [vue3-sketch-ruler](https://github.com/kakajun/vue3-sketch-ruler) 翻译而来，共用 `@sketch-ruler/core` 与 `@sketch-ruler/canvas` 底层插件。适用于低代码平台、大屏可视化、做图工具等场景，提供类似 Photoshop 的缩放与标尺辅助线体验。

[![](https://img.shields.io/npm/v/react-sketch-ruler.svg)](https://www.npmjs.com/package/react-sketch-ruler) [![build status](https://github.com/kakajun/react-sketch-ruler/actions/workflows/gh-pages.yml/badge.svg?branch=main)](https://github.com/kakajun/react-sketch-ruler/actions/workflows/gh-pages.yml)

<div align=center>
<img src="https://github.com/kakajun/react-sketch-ruler/blob/main/packages/docs/src/assets/logo.png" width="392" height="300">
</div>

## 🚀 Features

- ⚛️ React 18+ / 19+ 友好，完全基于 TypeScript
- 🎯 内置 TransformEngine 变换引擎，零外部 panzoom 依赖
- 🖱️ 多种缩放模式：鼠标中心、视口中心、内容中心
- 📐 可配置参考线（拖拽创建、吸附、锁定）
- 🗺️ 内置 Minimap 缩略图导航（支持拖拽视口、点击跳转）
- 🔌 插件系统（生命周期钩子 + 自定义渲染器）
- 🎨 动画支持：`ease-out` / `damped` / `exponential` / `direct`
- 📦 平台与业务代码分离，通过 `children` 与 `slot="toolbar"` 插槽专注业务即可

## 🦄 Demo

案例浏览: [https://kakajun.github.io/react-sketch-ruler](https://kakajun.github.io/react-sketch-ruler)

[CodePen 示例](https://codepen.io/kakajun/pen/WNVeYap)

## 安装

```bash
npm install --save react-sketch-ruler

# 或
yarn add react-sketch-ruler

# 或
pnpm add react-sketch-ruler
```

## 引入方式

### ESM

```tsx
import { SketchRule, Minimap } from 'react-sketch-ruler'
import type { SketchRulerProps, SketchRulerMethods } from 'react-sketch-ruler'
import 'react-sketch-ruler/index.css'
```

### CDN (IIFE)

通过 `<script>` 标签直接引入，挂载到全局变量 `SketchRuler`：

```html
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/react-sketch-ruler/lib/index.iife.js"></script>
<link rel="stylesheet" href="https://unpkg.com/react-sketch-ruler/lib/style.css" />

<script>
  const { SketchRule } = SketchRuler

  function App() {
    return React.createElement(SketchRule, { width: 1470, height: 700 })
  }

  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App))
</script>
```

### CDN (UMD)

UMD 格式兼容 CommonJS、AMD 和浏览器全局变量三种环境：

```html
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/react-sketch-ruler/lib/index.umd.cjs"></script>
<link rel="stylesheet" href="https://unpkg.com/react-sketch-ruler/lib/style.css" />

<script>
  const { SketchRule } = SketchRuler

  function App() {
    return React.createElement(SketchRule, { width: 1470, height: 700 })
  }

  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App))
</script>
```

## 使用

### 基础用法

```tsx
import React, { useRef } from 'react'
import { SketchRule } from 'react-sketch-ruler'
import 'react-sketch-ruler/index.css'

const BasicDemo: React.FC = () => {
  const sketchRef = useRef<SketchRulerMethods>(null)

  const width = 1470
  const height = 700
  const canvasWidth = 1000
  const canvasHeight = 500

  const [scale, setScale] = React.useState(1)
  const [lines, setLines] = React.useState({ h: [0, 250], v: [0, 500] })

  return (
    <div style={{ width, height }}>
      <SketchRule
        ref={sketchRef}
        scale={scale}
        width={width}
        height={height}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        thick={20}
        lines={lines}
        isShowReferLine={true}
        enableAnimation={true}
        animationMode="ease-out"
        onZoomChange={(detail) => {
          console.log('zoomchange', detail)
          setScale(detail.scale)
        }}
        onUpdateLines={setLines}
      >
        <div data-type="page" style={{ width: canvasWidth, height: canvasHeight }}>
          {/* 业务画布内容 */}
          <img src="bg.png" style={{ width: '100%', height: '100%' }} alt="" />
        </div>

        <div slot="toolbar" className="btns">
          <button onClick={() => sketchRef.current?.reset()}>还原</button>
          <button onClick={() => sketchRef.current?.zoomIn()}>放大</button>
          <button onClick={() => sketchRef.current?.zoomOut()}>缩小</button>
          <button onClick={() => sketchRef.current?.zoomToPreset(1)}>100%</button>
          <span>{(scale * 100).toFixed(0)}%</span>
        </div>
      </SketchRule>
    </div>
  )
}
```

### 配合 Minimap

```tsx
import React, { useRef, useState } from 'react'
import { SketchRule, Minimap } from 'react-sketch-ruler'
import type { SketchRulerMethods } from 'react-sketch-ruler'

const Demo: React.FC = () => {
  const sketchRef = useRef<SketchRulerMethods>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const handleZoomChange = (detail: { scale: number; x: number; y: number }) => {
    setScale(detail.scale)
    setOffset({ x: detail.x, y: detail.y })
  }

  const handleNavigate = (x: number, y: number) => {
    sketchRef.current?.setTransform({ x, y })
  }

  return (
    <>
      <SketchRule ref={sketchRef} scale={scale} onZoomChange={handleZoomChange} ...>
        <div data-type="page">...</div>
      </SketchRule>

      <Minimap
        contentWidth={1000}
        contentHeight={700}
        viewportX={offset.x}
        viewportY={offset.y}
        viewportWidth={1470}
        viewportHeight={700}
        scale={scale}
        width={200}
        height={150}
        onNavigate={handleNavigate}
      />
    </>
  )
}
```

### 插件系统

```tsx
import { definePlugin } from 'react-sketch-ruler'
import type { SketchRulerPlugin } from 'react-sketch-ruler'

const myPlugin = definePlugin(() => ({
  name: 'demo-logger',
  beforeZoom(ctx) {
    if (ctx.to > 3) ctx.cancel()
  },
  afterZoom(ctx) {
    console.log('zoom', ctx.from, '→', ctx.to)
  },
  onLineCreate: (ctx) => console.log('line created', ctx.line.id),
  onLineDelete: (ctx) => console.log('line deleted', ctx.line.id)
}))

// 使用（建议用 useMemo 缓存，避免反复注册）
function App() {
  const plugins = React.useMemo(() => [myPlugin()], [])
  return <SketchRule plugins={plugins} ... />
}
```

插件支持以下生命周期钩子：`beforeZoom` / `afterZoom` / `beforePan` / `afterPan` / `onSnap` / `onLineCreate` / `onLineDelete` / `onLineMove`，以及自定义渲染器 `registerRenderer`。详见源码 `packages/sketch-ruler/AGENTS.md`。

### Hooks

如果你需要更底层的控制能力，可以直接使用提供的 Hooks：

```tsx
import {
  useSketchRuler,
  useCanvasTransform,
  useGuideLines,
  useInputManager,
  useSnapDetection
} from 'react-sketch-ruler'
```

## API

### Props

| 属性 | 描述 | 类型 | 默认值 |
| --- | --- | --- | --- |
| width | 容器宽度 | `number` | `1400` |
| height | 容器高度 | `number` | `800` |
| canvasWidth | 画布宽度 | `number` | `700` |
| canvasHeight | 画布高度 | `number` | `700` |
| thick | 标尺厚度 | `number` | `16` |
| scale | 缩放值（受控属性） | `number` | `1` |
| showRuler | 是否显示标尺 | `boolean` | `true` |
| isShowReferLine | 是否显示参考线 | `boolean` | `true` |
| lines | 初始化参考线 | `{ h: number[]; v: number[] }` | `{ h: [], v: [] }` |
| palette | 标尺样式配置 | `PaletteType` | `{}` |
| shadow | 阴影高亮区域 | `{ x, y, width, height }` | `{ x:0, y:0, width:0, height:0 }` |
| zoomMode | 缩放原点模式 | `'pointer' \| 'viewport-center' \| 'content-center'` | `'pointer'` |
| zoomStep | 缩放步长 | `number` | `0.25` |
| minZoom | 最小缩放 | `number` | `0.1` |
| maxZoom | 最大缩放 | `number` | `10` |
| enableAnimation | 是否启用动画 | `boolean` | `false` |
| animationMode | 动画模式 | `'direct' \| 'ease-out' \| 'damped' \| 'exponential'` | `'ease-out'` |
| autoCenter | 初始化自动居中 | `boolean` | `true` |
| paddingRatio | 自动居中边距比（`0~0.5`） | `number` | `0.2` |
| initialOffset | 初始偏移（autoCenter=false 时生效） | `{ x: number; y: number }` | `{ x:0, y:0 }` |
| snapThreshold | 吸附阈值 | `number` | `5` |
| lockLine | 是否锁定参考线 | `boolean` | `false` |
| selfHandle | 自行处理输入事件 | `boolean` | `false` |
| plugins | 插件列表 | `SketchRulerPlugin[]` | `[]` |
| showMinorTicks | 是否显示次刻度 | `boolean` | `false` |
| eyeIcon | 左上角睁眼图标 Base64 | `string` | — |
| closeEyeIcon | 左上角闭眼图标 Base64 | `string` | — |
| deleteLabel | 删除参考线提示文字 | `string` | `'放开删除'` |
| children | 画布内容与工具栏插槽 | `React.ReactNode` | — |

### Callbacks

| 回调                | 描述               | 参数                                     |
| ------------------- | ------------------ | ---------------------------------------- |
| onUpdateScale       | 缩放值变化         | `(scale: number) => void`                |
| onZoomChange        | 缩放/平移变化      | `({ scale, x, y }) => void`              |
| onUpdateLines       | 参考线变化         | `({ h: number[], v: number[] }) => void` |
| onUpdateLockLine    | 参考线锁定状态变化 | `(lock: boolean) => void`                |
| onHandleCornerClick | 左上角按钮点击     | `(showReferLine: boolean) => void`       |

### Ref

通过 `ref` 可以调用以下方法：

| 方法                               | 描述                 |
| ---------------------------------- | -------------------- |
| `engine`                           | TransformEngine 实例 |
| `setTransform({ x?, y?, scale? })` | 设置变换状态         |
| `zoomIn()`                         | 放大                 |
| `zoomOut()`                        | 缩小                 |
| `reset()`                          | 重置到初始状态       |
| `zoomToPreset(scale)`              | 缩放到预设比例       |
| `setZoomMode(mode)`                | 设置缩放模式         |

### Palette

| 属性                 | 描述           | 默认值     |
| -------------------- | -------------- | ---------- |
| bgColor              | 画布背景       | `#f6f7f9`  |
| tickColor            | 刻度颜色       | `#BABBBC`  |
| labelColor           | 刻度标签颜色   | `#7D8694`  |
| guideLineColor       | 参考线颜色     | `#51d6a9`  |
| guideLineLockedColor | 锁定参考线颜色 | `#d4d7dc`  |
| hoverBg              | 标签背景色     | `transparent` |
| hoverColor           | 标签文字色     | `#000`     |
| borderColor          | 尺子边框颜色   | `#eeeeef`  |
| shadowColor          | 阴影背景色     | `#e9f7fe`  |
| fontShadowColor      | 阴影字体颜色   | `#106ebe`  |
| guideLineStyle       | 参考线样式     | `'dashed'` |
| guideLineWidth       | 参考线宽度     | `1`        |
| labelEnabled         | 是否显示标签   | `true`     |

## Minimap API

| 属性           | 描述        | 类型     | 默认值 |
| -------------- | ----------- | -------- | ------ |
| contentWidth   | 内容宽度    | `number` | —      |
| contentHeight  | 内容高度    | `number` | —      |
| viewportX      | 视口 X 偏移 | `number` | —      |
| viewportY      | 视口 Y 偏移 | `number` | —      |
| viewportWidth  | 视口宽度    | `number` | —      |
| viewportHeight | 视口高度    | `number` | —      |
| scale          | 缩放比例    | `number` | —      |
| width          | 缩略图宽度  | `number` | `200`  |
| height         | 缩略图高度  | `number` | `150`  |

| 回调        | 描述           | 参数                             |
| ----------- | -------------- | -------------------------------- |
| onNavigate  | 导航到指定位置 | `(x: number, y: number) => void` |
| onDragStart | 开始拖拽       | `() => void`                     |
| onDragEnd   | 结束拖拽       | `() => void`                     |

## 2.x → 3.x 迁移指南

v3.x 是架构重构版本，与 [vue3-sketch-ruler](https://github.com/kakajun/vue3-sketch-ruler) v3.x 对齐，内置 TransformEngine 替代了外部 `simple-panzoom` 依赖，并引入了 Minimap、插件系统、动画系统等全新能力。

### 主要 Breaking Changes

| 变更项 | 2.x 写法 | 3.x 写法 | 说明 |
| --- | --- | --- | --- |
| **组件名** | `<SketchRule>` | `<SketchRule>`（保持不变） | — |
| **导出方式** | `import SketchRule from 'react-sketch-ruler'` | `import { SketchRule } from 'react-sketch-ruler'` | 改为命名导出，仍保留默认导出兼容 |
| **工具栏插槽** | 通过 `ref` 调用 | `slot="toolbar"` 子元素 | 在 `children` 中传入 `<div slot="toolbar">...</div>` |
| **缩放事件** | `onZoomChange` / `updateScale` | `onUpdateScale` / `onZoomChange` | `onUpdateScale` 仅通知 scale；`onZoomChange` 返回 `{ scale, x, y }` |
| **参考线事件** | `handleLine` | `onUpdateLines` | 统一回调命名风格 |
| **偏移控制** | `panzoomOption` | `autoCenter`、`paddingRatio`、`initialOffset` | 移除 `panzoomOption`，改为内置引擎直接配置 |
| **缩放控制** | `panzoomOption` | `zoomMode`、`zoomStep`、`minZoom`、`maxZoom` | 内置引擎直接配置 |
| **动画系统** | 无 | `enableAnimation`、`animationMode` | 新增，支持 `ease-out`、`damped`、`exponential`、`direct` |
| **阴影文字** | `showShadowText` | 移除 | 3.x 已移除该属性 |
| **palette 属性** | `lineType`、`lineColor`、`longfgColor`、`fontColor` | `guideLineStyle`、`guideLineColor`、`tickColor`、`labelColor` | 命名规范化 |
| **Ref 暴露** | `panzoomInstance` | `engine`（TransformEngine） | 直接暴露内置引擎实例 |
| **Ref 方法** | `zoomIn()`、`zoomOut()`、`reset()` | 同上，并新增 `setTransform()`、`zoomToPreset()`、`setZoomMode()` | 方法更丰富 |
| **外部依赖** | `simple-panzoom` | 零外部 panzoom 依赖 | 需从项目中移除 `simple-panzoom` |

### 快速迁移示例

**2.x 代码：**

```tsx
import SketchRule from 'react-sketch-ruler'
;<SketchRule
  ref={sketchruleRef}
  scale={state.scale}
  panzoomOption={panzoomOption}
  palette={{ lineType: 'dashed', lineColor: '#51d6a9' }}
  handleLine={handleLinesChange}
>
  <div>...</div>
</SketchRule>
```

**3.x 代码：**

```tsx
import { SketchRule } from 'react-sketch-ruler'
;<SketchRule
  ref={sketchRef}
  scale={state.scale}
  zoomMode="pointer"
  enableAnimation={true}
  animationMode="ease-out"
  palette={{ guideLineStyle: 'dashed', guideLineColor: '#51d6a9' }}
  onUpdateLines={handleLinesChange}
  onZoomChange={handleZoomChange}
>
  <div>...</div>
  <div slot="toolbar">
    <button onClick={() => sketchRef.current?.reset()}>还原</button>
    <button onClick={() => sketchRef.current?.zoomIn()}>放大</button>
    <button onClick={() => sketchRef.current?.zoomOut()}>缩小</button>
    <button onClick={() => sketchRef.current?.zoomToPreset(1)}>100%</button>
  </div>
</SketchRule>
```

### 新增能力速览

- **Minimap 缩略图**：独立组件，支持拖拽视口与点击跳转
- **插件系统**：通过 `plugins` 属性注入生命周期钩子
- **吸附引擎**：`snapThreshold` 配置参考线吸附阈值
- **动画引擎**：`enableAnimation` + `animationMode` 实现平滑缩放/平移
- **多实例支持**：每个 `SketchRule` 实例独立管理自己的 TransformEngine
- **纯原生零依赖**：核心引擎 `@sketch-ruler/core` 纯原生实现，无需 panzoom 等第三方库

---

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式（先构建组件库，再启动文档站点）
pnpm dev

# 构建组件库
pnpm build

# 构建文档站点
pnpm build:demo

# 运行测试
pnpm test

# 格式化与检查
pnpm fmt
pnpm lint:check
```

## 🌈 应用案例

> 如果你正在使用 `react-sketch-ruler`，欢迎提交 PR 添加你的项目！

### QQ 技术交流群

<a target="_blank" href="https://qm.qq.com/cgi-bin/qm/qr?k=oqnBX-qn7gkWsdfYQdvNCzYbkeNknuOc&jump_from=webapi&authKey=4YXd2jvmWYU0cN8zUky5DoCD6kz+fjUyWv782GLUjDEIHctXYviSXD/pbqxm/ZDD"><img border="0" src="https://github.com/kakajun/react-sketch-ruler/blob/main/packages/docs/src/assets/group.png" alt="react-sketch-ruler" title="点击这里加入QQ群640166628"></a>

<div align=center>
<img src="https://github.com/kakajun/react-sketch-ruler/blob/main/packages/docs/src/assets/qq.png" width="243" height="287">
</div>

## 贡献者

<a href="https://github.com/kakajun/react-sketch-ruler/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=kakajun/react-sketch-ruler" />
</a>

## 最后

这是个开源业余做的功能，欢迎加强该插件的小伙伴加入。如果 `react-sketch-ruler` 对您有帮助，请给个 star，您的鼓励是我最大的动力。

## 引用

- Vue3 版本：[vue3-sketch-ruler](https://github.com/kakajun/vue3-sketch-ruler)
- Vue2 版本：[vue-sketch-ruler](https://github.com/chuxiaoguo/vue-sketch-ruler.git)

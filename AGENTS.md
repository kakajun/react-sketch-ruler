# AGENTS.md

> 本文件面向 AI 编程助手。如果你正在阅读此文件，说明你需要在不了解项目背景的情况下快速上手 `react-sketch-ruler`。以下内容全部基于项目实际代码与配置，请勿凭假设推断。

---

## 项目概述

`react-sketch-ruler` 是一个基于 **React + TypeScript** 的标尺组件库，由 `vue3-sketch-ruler` 迁移而来，与 Vue 版本共用底层包 `@sketch-ruler/core` 和 `@sketch-ruler/canvas`。适用于低代码平台、大屏可视化、做图工具等场景，提供类似 Photoshop 的缩放、平移与标尺辅助线体验。

- **版本**：`3.0.0-beta.0`
- **协议**：MIT
- **仓库地址**：https://github.com/kakajun/react-sketch-ruler
- **线上 Demo**：https://kakajun.github.io/react-sketch-ruler

项目采用 **pnpm workspace** 管理的单体仓库（monorepo），包含两个子包：

| 包路径                  | 说明                                                |
| ----------------------- | --------------------------------------------------- |
| `packages/sketch-ruler` | 组件库本体，发布到 npm（包名 `react-sketch-ruler`） |
| `packages/sketch-ruler/AGENTS.md` | 插件系统详细指南（面向 AI 助手）             |
| `packages/docs`         | 文档与示例站点，部署到 GitHub Pages                 |

---

## 技术栈与运行时架构

### 核心依赖

- **React**：Peer dependency，支持 `>=18 || >=19`
- **React-DOM**：同上
- **底层引擎**：`@sketch-ruler/core`（TransformEngine、PluginManager、CanvasManager 等）、`@sketch-ruler/canvas`（InputManager）
- **构建工具**：Vite（库模式 + 文档站点）
- **类型生成**：`vite-plugin-dts`（Rollup 合并类型声明）
- **样式**：Less（`*.less`）
- **测试**：Vitest + `@testing-library/react` + `jsdom`
- **格式化**：`oxfmt`
- **静态检查**：`oxlint`
- **包管理**：pnpm（`pnpm-workspace.yaml` 定义 `packages/*`）

### 构建产物（`packages/sketch-ruler`）

- `lib/index.js` — ESM 入口
- `lib/index.umd.cjs` — UMD 入口
- `lib/index.css` — 组件样式
- `lib/index.d.ts` — 类型声明

### 运行时架构要点

- **TransformEngine**：内置变换引擎，负责缩放/平移状态管理，零外部 panzoom 依赖。
- **InputManager**：来自 `@sketch-ruler/canvas`，封装鼠标/触摸/滚轮事件。
- **PluginManager**：来自 `@sketch-ruler/core`，支持生命周期钩子（`beforeZoom`、`afterZoom`、`onLineCreate` 等）。
- **缩放原点计算**：`zoomMode`（`pointer` / `viewport-center` / `content-center`）统一由 `@sketch-ruler/core` 的 `getZoomOrigin()` 计算，React 层不再手写原点逻辑。
- **插槽机制**：`SketchRule` 的 `children` 中，若元素带有 `slot="toolbar"`，会被提取到顶部工具栏区域渲染；其余内容作为画布主体。
- **多实例**：每个 `SketchRule` 实例拥有独立的 `TransformEngine`。

---

## 仓库结构与模块划分

```
react-sketch-ruler
├── packages/
│   ├── sketch-ruler/          # 组件库
│   │   ├── src/
│   │   │   ├── index.tsx      # 入口：导出组件、Hooks、类型、插件工具
│   │   │   ├── index-types.ts # React 层 Props / Methods / Palette 类型定义
│   │   │   ├── sketch-ruler/
│   │   │   │   ├── index.tsx       # SketchRule 主组件（forwardRef + useImperativeHandle）
│   │   │   │   ├── RulerWrapper.tsx# 标尺容器（横/纵）
│   │   │   │   ├── RulerLine.tsx   # 单条参考线渲染与交互
│   │   │   │   ├── index.less      # 组件样式
│   │   │   │   └── cornerImg64.ts  # 左上角眼睛图标 Base64
│   │   │   ├── minimap/
│   │   │   │   └── index.tsx       # Minimap 缩略图组件
│   │   │   ├── hooks/
│   │   │   │   ├── useCanvasTransform.ts # 封装 TransformEngine
│   │   │   │   ├── useGuideLines.ts      # 参考线状态管理
│   │   │   │   ├── useInputManager.ts    # 绑定 InputManager
│   │   │   │   ├── useSketchRuler.ts     # 组合 Hook（底层控制）
│   │   │   │   ├── useRulerScale.ts      # 刻度计算
│   │   │   │   └── useSnapDetection.ts   # 吸附逻辑
│   │   │   ├── plugins/
│   │   │   │   └── index.ts       # definePlugin 辅助函数 + 核心类型重导出
│   │   │   └── global.d.ts        # *.less 模块声明
│   │   ├── test/
│   │   │   ├── sketch-ruler.spec.tsx      # 主组件测试
│   │   │   ├── use-canvas-transform.spec.ts
│   │   │   ├── use-guide-lines.spec.ts
│   │   │   ├── use-input-manager.spec.ts
│   │   │   ├── use-ruler-scale.spec.ts
│   │   │   ├── use-sketch-ruler.spec.ts
│   │   │   └── use-snap-detection.spec.ts # Hooks 测试
│   │   ├── vite.config.ts         # 库构建配置
│   │   ├── tsconfig.json          # 继承 ../../tsconfig.common.json
│   │   └── package.json           # 包名 react-sketch-ruler
│   └── docs/                      # 文档示例站点
│       ├── src/
│       │   ├── main.tsx           # 应用入口（React 18 createRoot）
│       │   ├── App.tsx            # 根组件
│       │   ├── router/            # 路由配置
│       │   ├── i18n/              # react-i18next 国际化配置与语言包
│       │   ├── components/layout/ # 布局组件（Aside、Header）
│       │   ├── examples/          # 各种示例页面（Basic、Comprehensive、Bigscreen…）
│       │   └── assets/            # 图片、样式、图标
│       ├── vite.config.ts         # 站点构建配置（base: './'）
│       ├── tsconfig.json
│       └── package.json           # 包名 root-doc
├── scripts/
│   └── release.js               # 交互式发版脚本（semver + enquirer）
├── .github/workflows/
│   └── gh-pages.yml             # CI：测试 → 构建 Demo → 部署 GitHub Pages
├── tsconfig.common.json         # 公共 TS 配置（strict、composite、declarationMap）
├── tsconfig.json                # 根配置，仅用于 IDE 自动补全（references 指向两个子包）
├── .oxfmtrc.json                # oxfmt 格式化配置
├── .oxlintrc.json               # oxlint 静态检查配置
├── .node-version                # Node 版本：v22.17.0
├── pnpm-workspace.yaml
└── package.json                 # root（private）
```

---

## 常用命令

所有命令均在仓库根目录执行：

| 命令              | 说明                                                     |
| ----------------- | -------------------------------------------------------- |
| `pnpm install`    | 安装依赖                                                 |
| `pnpm dev`        | 先构建组件库，再启动文档站点开发服务器（`0.0.0.0:5274`） |
| `pnpm build`      | 构建组件库（输出到 `packages/sketch-ruler/lib`）         |
| `pnpm build:demo` | 构建组件库 + 构建文档站点（输出到 `packages/docs/dist`） |
| `pnpm test`       | 在 `packages/sketch-ruler` 中运行 Vitest                 |
| `pnpm fmt`        | 运行 `oxfmt` 格式化代码                                  |
| `pnpm fmt:check`  | 检查格式化是否合规                                       |
| `pnpm lint`       | 运行 `oxlint --fix` 自动修复问题                         |
| `pnpm lint:check` | 运行 `oxlint` 检查问题                                   |
| `pnpm changelog`  | 为组件库生成 `CHANGELOG.md`（Angular preset）            |
| `pnpm release`    | 交互式发版：构建 → 更新版本号 → `npm publish`            |

---

## 代码风格规范

项目使用 `oxfmt` 与 `oxlint` 做统一约束，配置不可随意更改。

### 格式化（`.oxfmtrc.json`）

- 缩进：**2 个空格**，不使用 Tab
- 分号：**不加**（`semi: false`）
- 引号：字符串使用 **单引号**；JSX 属性使用双引号
- 尾随逗号：**不保留**（`trailingComma: "none"`）
- 箭头函数参数：始终加括号（`arrowParens: "always"`）
- 对象大括号两侧保留空格（`bracketSpacing: true`）

### Lint（`.oxlintrc.json`）

- 环境：`browser`、`node`、`es2022`
- 忽略目录：`node_modules`、`lib`
- 强制规则（error 级别）：
  - `no-var`
  - `prefer-const`
  - `prefer-rest-params`
  - `prefer-spread`
- `scripts/*.js` 中关闭 `typescript/no-require-imports`（脚本使用 CommonJS）

### TypeScript

- 所有子包继承 `tsconfig.common.json`：
  - `strict: true`
  - `noImplicitReturns: true`
  - `forceConsistentCasingInFileNames: true`
  - `composite: true`（monorepo 项目引用）
- `packages/sketch-ruler/tsconfig.json` 额外开启 `jsx: "react-jsx"`、`moduleResolution: "bundler"`
- `packages/docs/tsconfig.json` 额外配置 `paths: { "@/*": ["src/*"] }`

### 编码约定

- 注释以中文为主，变量命名可混合中英文。
- 组件使用 `React.forwardRef` + `useImperativeHandle` 暴露命令式 API（`zoomIn`、`zoomOut`、`reset`、`setTransform`…）。
- Hooks 文件统一放在 `src/hooks/`，按功能拆分（变换、参考线、输入、吸附等）。
- 样式文件与组件同级，使用 `.less` 后缀。
- 插槽识别逻辑：在 `SketchRule` 内部通过 `React.Children.toArray` 遍历 `children`，若 `el.props.slot === 'toolbar'` 则归入工具栏，否则作为默认画布内容。

---

## 测试说明

- **框架**：Vitest
- **DOM 环境**：`jsdom`
- **测试文件位置**：`packages/sketch-ruler/test/`，共 7 个测试文件
- **当前覆盖范围**（共 51 条用例）：
  - 主组件：`zoomIn` / `zoomOut` / `reset` / `setTransform` / `zoomToPreset`、参考线显隐切换、锁定交互、多实例独立引擎
  - `useCanvasTransform`：engine 初始化、缩放/平移动画回调、边界约束、动画模式切换
  - `useGuideLines`：参考线 CRUD、导入导出、锁定、可见性
  - `useInputManager`：滚轮缩放、拖拽平移、滚轮方向配置
  - `useRulerScale`：刻度计算、主次刻度、偏移响应
  - `useSketchRuler`：组合 Hook 状态同步、事件分发
  - `useSnapDetection`：吸附目标检测、阈值过滤、优先级
- **运行**：`pnpm test`（即 `vitest run`）
- CI 流程中会在构建 Demo 前先执行测试。

---

## 发版与部署流程

### GitHub Pages 自动化部署

- 触发条件：`push` 或 `pull_request` 到 `main` 分支
- 工作流（`.github/workflows/gh-pages.yml`）：
  1. 安装 pnpm + Node.js（矩阵 `24.x`）
  2. `pnpm i --no-frozen-lockfile`
  3. `pnpm --filter ./packages/sketch-ruler test`
  4. `pnpm build:demo`
  5. 使用 `peaceiris/actions-gh-pages@v4` 将 `packages/docs/dist` 部署到 GitHub Pages

### npm 手动发版

- 执行 `pnpm release`
- 交互流程：
  1. 选择版本升级类型（patch / minor / major / custom）
  2. 确认版本号
  3. 脚本自动更新 `root/package.json` 与 `packages/sketch-ruler/package.json` 的 `version`
  4. 将根目录 `README.md` 拷贝到 `packages/sketch-ruler/README.md`
  5. 在 `packages/sketch-ruler` 目录执行 `npm publish`
  6. 发布成功后自动删除拷贝的 `README.md`
- 注意：脚本中注释掉了 `git add / commit / tag` 操作，目前不会自动打 tag。

---

## 安全与敏感信息

- 仓库中**不存在** `.env` 或包含密钥的配置文件。
- CI 仅使用 GitHub 自动提供的 `secrets.GITHUB_TOKEN` 进行 Pages 部署。
- npm 发布依赖本地已登录的 npm 账号凭证，**不在**仓库内保存 token。
- `pnpm-workspace.yaml` 中设置了 `allowBuilds: esbuild: true`，允许构建脚本使用 esbuild。

---

## AI 助手注意事项

1. **不要假设外部 panzoom 依赖**：v3.x 已内置 `TransformEngine`，项目中不应再引入 `simple-panzoom`。
2. **修改组件 API 时同步更新 `index-types.ts`**：所有对外 Props、Ref 方法、Palette 类型均定义在此文件中。
3. **新增 Hook 后需在 `src/index.tsx` 导出**：否则文档示例或外部用户无法引用。
4. **样式修改请同时检查 `.less` 文件**：库构建会将 `index.less` 打包到 `lib/index.css`。
5. **测试文件请放在 `packages/sketch-ruler/test/`**：CI 与 `vitest` 默认会扫描该目录。
6. **发布前务必执行 `pnpm build`**：确保 `lib/` 产物与源码一致；`pnpm release` 已包含此步骤。
7. **保持中英文注释风格**：现有代码以中文注释为主，新增代码建议延续此风格。
8. **插件开发请参考 `packages/sketch-ruler/AGENTS.md`**：该文件详细说明了插件生命周期、自定义渲染器、`definePlugin` 用法及注意事项。

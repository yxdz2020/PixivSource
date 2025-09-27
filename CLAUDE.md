# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个 Pixiv 书源生成工程，将原始的 JavaScript 手工维护模式工程化改造为 TypeScript + 现代构建工具链的项目。最终输出为阅读 3.0 软件可用的书源 JSON 文件。

## 核心构建命令

```bash
# 完整构建流程（推荐）
pnpm run build:all

# 分步构建
pnpm run build:pixiv    # 编译 TypeScript 到 JavaScript
pnpm run build-json     # 生成最终的 pixiv.json 文件

# 清理构建产物
pnpm run clean
```

## 架构设计

### 工作空间结构

- **根目录**：PNPM workspace 配置，管理子包依赖
- **packages/common**：共享类型定义，包含阅读 3.0 的完整 API 类型声明
- **projects/pixiv**：Pixiv 书源的具体实现
- **scripts/**：构建脚本和模板文件
- **dist/**：最终生成的书源文件

### 构建流程设计

1. **TypeScript 编译**：通过 Rollup 将 TypeScript 模块编译为独立的 JavaScript 文件
2. **模块去除**：自定义 Rollup 插件移除 import/export 语句，生成可直接执行的脚本
3. **JSON 组装**：通过 `scripts/build-pixiv.ts` 将编译后的脚本注入到书源模板中

### 特殊的编译要求

- 目标环境为阅读 3.0 的 Rhino JavaScript 引擎，不支持完整的 ES6 模块语法
- 所有脚本需要编译为可直接执行的文件

### 书源结构映射

每个 TypeScript 文件对应书源 JSON 的特定字段：

- `base.jsLib.ts` → `jsLib`（JavaScript 工具库）
- `base.loginUrl.ts` → `loginUrl`（登录地址）
- `base.loginCheckJs.ts` → `loginCheckJs`（登录检查脚本）
- `catalog.ts` → `ruleToc.chapterList`（目录解析）
- `content.ts` → `ruleContent.content`（内容解析）
- `detail.ts` → `ruleBookInfo.init`（详情页解析）
- `discover_address.ts` → `exploreUrl`（发现页地址）
- `discover.ts` → `ruleExplore.bookList`（发现页解析）
- `search.ts` → `ruleSearch.bookList`（搜索结果解析）
- `searchUrl.ts` → `searchUrl`（搜索地址）

## 开发指南

### 修改现有功能

1. 在 `projects/pixiv/src/` 中找到对应的 TypeScript 文件
2. 修改后运行 `pnpm run build:pixiv` 编译
3. 运行 `pnpm run build-json` 生成最终 JSON
4. 生成的 `dist/pixiv.json` 即为可用的书源文件

### 静态配置文件

- `scripts/pixiv_template.json`：书源模板，包含基础配置
- `scripts/pixiv_other_sources.json`：其他书源配置（未工程化部分）
- `projects/pixiv/src/base.bookUrlPattern.txt`：书籍 URL 匹配模式
- `projects/pixiv/src/base.loginUI.json`：登录界面配置
- `projects/pixiv/src/base.variableComment.txt`：变量说明
- `projects/pixiv/src/ReadMe.txt`：书源说明文档

### 类型安全

- 使用 `packages/common` 中的类型定义，确保与阅读 3.0 API 兼容
- 全局类型包括 `java`、`book`、`chapter` 等阅读环境对象
- 通过 TypeScript 获得完整的 IDE 支持和类型检查

### 工具方法

通用工具方法位于 `common.ts` 内，此文件内的函数会在Rollup打包时被包含在最终文件内。

由阅读App提供的全局方法位于 `base.jsLib.ts` 内。此文件会先于其他文件加载到运行环境中，整个文件位于全局环境。相比于 `common.ts`，此处不宜定义功能复杂的class，闭包等，可能会产生未预期错误或全局变量污染。

建议优先采用 `common.ts`.

## 开发环境

### 环境要求

- Node.js 20+
- PNPM 8+ (通过 corepack 管理)

### 首次设置

```bash
# 安装依赖
pnpm install

# 验证构建
pnpm run build:all
```

### Git 工作流

- 主分支：`main`
- GitHub Actions 自动构建和发布
- 支持 tag 触发的 Release 生成

## 注意事项

- 这是原项目 [PixivSource](https://github.com/windyhusky/PixivSource) 的工程化版本
- 目标运行环境为移动端阅读软件的 JavaScript Rhino 引擎，需考虑兼容性
- 修改任何 base.\* 文件后都需要重新构建才能看到效果
- `scripts/build-pixiv.ts` 是构建逻辑的核心，定义了如何将各个模块组装成最终的书源文件

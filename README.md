# AetherOS - 现代 WebOS 桌面操作系统

[![Deploy to GitHub Pages](https://github.com/xxwl12122/webos-desktop/actions/workflows/deploy.yml/badge.svg)](https://github.com/xxwl12122/webos-desktop/actions/workflows/deploy.yml)

> 基于 **Vite 6 + React 18 + TypeScript + Tailwind CSS** 构建的深色磨砂玻璃极客 Web 桌面系统。具备完整的窗口管理、层级置顶调度、防穿透遮罩、Dock 任务栏与内置应用套件。

---

## 🌟 核心特性与工程架构

### 1. 窗口管理器与焦点调度系统（彻底解决两大工程通病）
* **防断触遮罩（Anti-Drop Overlay）**：在窗口拖拽（Drag）或缩放（Resize）触发时，动态向 `body` 施加全局防断触状态，强制全屏及所有 `iframe` 应用 `pointer-events: none`。彻底杜绝鼠标快速划过 iframe 时浏览器事件被内部吞噬导致的断触丢失顽疾。
* **数组栈层级调度（Z-Index Stack Manager）**：
  * 全局维护 `windowStack: AppId[]` 状态数组，杜绝简单的 `zIndex++` 累加溢出。
  * 点击任意窗口任意区域，即时将该窗口 ID 移至数组末尾，每个窗口层级计算为 `zIndex = baseZIndex + windowStack.indexOf(id)`，活动窗口始终置顶且赋予发光轮廓与柔和深投影。
* **全生命周期窗口状态机**：
  * 标题栏拖拽位移，具备视口边界碰撞防护，绝不被拖出屏幕。
  * 右下角及边缘自由拉伸（Resize），内置 `minWidth`、`minHeight` 约束。
  * 窗口最小化到 Dock 栏、最大化/还原切换、双击标题栏最大化、关闭窗口。

### 2. 底部 Dock 任务栏与桌面系统
* **毛玻璃悬浮 Dock**：macOS 风格磨砂设计，鼠标悬浮呈现 Dock Magnification 缩放动画。
* **状态指示小圆点**：实时显示应用运行状态（运行中亮蓝光、最小化亮灰光、关闭熄灭）。点击已最小化应用平滑恢复并置顶。
* **桌面操作**：右键桌面空白处弹出自定义 ContextMenu（新建便签、换壁纸、全屏切换、系统设置）。
* **常驻状态栏**：集成动态毫秒级时钟、网络在线/离线监测与全屏切换快捷按钮。

### 3. 内置核心应用套件
* **轻舟浏览器（Browser）**：
  * 完整浏览器外壳：前进、后退、刷新、URL 输入栏与一键访问。
  * 预设必应、维基百科、MDN、Hacker News 等快捷书签。
  * **同源策略拦截容灾与引导层**：面对商业站点 `X-Frame-Options: SAMEORIGIN` 或 CSP 拦截，内置优雅的错误容灾遮罩，并提供【在新标签页打开 ↗】外链跳转。
* **Aether AI 极客副驾驶（AI Copilot）**：
  * 对话式 UI，预留标准 OpenAI 兼容接口配置抽屉（支持自定义 Base URL、Model Name、API Key，本地持久化）。
  * 配置 API Key 后支持真实 SSE 流式推送；未配置时内置智能交互与 Markdown 代码高亮打字机演示。
* **系统设置（Settings）**：
  * 高清预设壁纸库快速切换。
  * 支持 `<input type="file">` 本地上传任意图片，利用 `FileReader` 自动转 Base64 本地持久化保存。
  * 存储管理：提供一键清空本地缓存、恢复出厂设置功能。
* **随手记（Notepad）**：
  * 实时防抖同步存储，支持实时字数统计与“已自动保存”状态指示灯。

---

## 🛠️ 本地开发与构建

```bash
# 安装依赖
npm install

# 启动本地开发服务器
npm run dev

# 编译生产版本 (类型检查 + Vite 打包)
npm run build

# 本地预览生产构建产物
npm run preview
```

---

## 🚀 自动化部署至 GitHub Pages

项目已在 `.github/workflows/deploy.yml` 配置完整的 GitHub Actions CI/CD 流水线：
1. 当代码推送到 `main` 分支时，自动触发构建。
2. 自动运行 `npm ci` 和 `npm run build`。
3. 自动将 `dist` 目录发布至 `gh-pages` 分支。
4. 在 GitHub 仓库设置 `Settings -> Pages`，选择分支为 `gh-pages` 即可在线访问。

# AetherOS - 现代 WebOS 桌面操作系统

<p align="center">
  <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&h=280&q=80" alt="AetherOS Banner" width="650" style="border-radius: 10px;" />
</p>

<div align="center">

### 🚀 [👉 点击这里立即高速在线体验 AetherOS 桌面 (Vercel 极速版) 👈](https://webos-desktop-lyart.vercel.app)

**无需安装，任何浏览器双击即开，已支持手机/平板/电脑跨端访问！**

[![Live Demo](https://img.shields.io/badge/Demo-在线极速体验-3b82f6?logo=vercel&logoColor=white)](https://webos-desktop-lyart.vercel.app)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 🌟 线上体验入口

* ⚡ **全球高速直达节点（强烈推荐，国内秒开）**：  
  👉 **[https://webos-desktop-lyart.vercel.app](https://webos-desktop-lyart.vercel.app)**
* 📦 **GitHub Pages 备用节点**：  
  👉 [https://xxwl12122.github.io/webos-desktop/](https://xxwl12122.github.io/webos-desktop/)

---

## 🌟 系统核心架构与功能清单

### 1. 窗口管理器与防穿透调度
* **防断触遮罩（Anti-Drop Overlay）**：在窗口拖拽（Drag）或缩放（Resize）期间，动态激活全局防断触状态，强制 `iframe` 应用 `pointer-events: none`，彻底杜绝鼠标快速划过 iframe 时浏览器事件丢失。
* **数组栈层级调度（Z-Index Stack Manager）**：通过 `windowStack: AppId[]` 状态数组动态计算 `zIndex = baseZIndex + windowStack.indexOf(id)`，活动窗口自动置顶并渲染发光轮廓与柔和投影，拒绝简单的 `zIndex++` 溢出。
* **视口碰撞防护**：限制标题栏拖拽位移范围，防窗口拖离屏幕。
* **自由伸缩**：支持右侧、底部及右下角三方向拉伸（带 `minWidth/minHeight` 约束），支持双击标题栏最大化/还原。

### 2. 桌面与 Dock 任务栏
* **悬浮毛玻璃 Dock 栏**：macOS 风格磨砂质感，鼠标悬浮呈现 Dock Magnification 缩放动画。
* **应用运行状态指示灯**：图标下方实时展示小圆点（运行中亮蓝光、最小化亮灰光、关闭熄灭）。点击已最小化应用平滑恢复并置顶。
* **右键上下文菜单**：桌面空白处右键弹出快捷菜单（新建便签、随机换壁纸、全屏切换、系统设置）。
* **常驻状态栏**：集成动态毫秒级时钟、在线/断网检测指示灯与全屏切换快捷按钮。

### 3. 内置核心应用套件
* **轻舟浏览器（Browser）**：具备前进、后退、刷新、URL 输入栏、快速书签，以及遇到同源策略拦截（CSP/X-Frame-Options）时的友好引导层与外链跳转兜底。
* **Aether AI 极客副驾驶（AI Copilot）**：对话交互终端，支持配置标准 OpenAI 兼容接口（Base URL、Model Name、API Key 本地持久化），支持 SSE 流式打字与 Markdown 代码高亮展示（带一键复制代码功能）。
* **随手记（Notepad）**：实时防抖自动保存至本地存储，带字数统计与同步指示灯。
* **系统设置（Settings）**：预设多套高清壁纸即换即存，支持本地上传任意图片转 Base64 持久化，提供一键恢复出厂设置选项。

---

## 🛠️ 本地运行指南

如果你想在自己的电脑本地运行体验或进行二次开发：

```bash
# 1. 克隆仓库到本地
git clone https://github.com/xxwl12122/webos-desktop.git

# 2. 进入项目目录
cd webos-desktop

# 3. 安装依赖
npm install

# 4. 启动本地开发服务器
npm run dev

# 5. 编译生产版本
npm run build
```
本地终端会输出 `http://localhost:5173`，按住 Ctrl 点击即可在浏览器打开！

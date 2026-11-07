# AetherOS - 现代极客 Web 桌面操作系统

<p align="center">
  <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&h=280&q=85" alt="AetherOS Banner" width="650" style="border-radius: 10px;" />
</p>

<div align="center">

### 🚀 [👉 点击这里立即高速在线体验 AetherOS (Vercel 极速版) 👈](https://webos-desktop-lyart.vercel.app)

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

## 🌟 核心架构与重构特性清单

### 1. Linear / macOS 质感暗黑设计系统
* **纯正极客暗黑底色**：摒弃廉价的高饱和渐变，采用深度暗黑基底（`#09090b`）结合超细微质感描边（`border-white/[0.08]`）。
* **多层混合磨砂质感**：多重滤镜叠加 `backdrop-blur-2xl bg-zinc-950/80 shadow-2xl shadow-black/80`，辅以活动窗口发光轮廓。
* **精致系统级标题栏**：高度压低至 38px，原生 macOS 质感三色控制圆点（悬停显标、点击缩放反馈）。

### 2. 原生级手感交互重构
* **边缘吸附（Snap Assist）**：拖拽窗口靠近屏幕左边缘、右边缘或顶部边缘时，呼出半透明的虚线占位框；释放鼠标自动平滑 Snap 为“左半屏（50%）”、“右半屏（50%）”或“全屏铺满”，并支持拖拽解吸附还原。
* **全局右键接管**：全局捕获 `contextmenu` 事件屏蔽浏览器默认菜单，支持桌面空白处呼出专属暗黑上下文菜单。
* **全局 Spotlight 启动器（⌘K / Ctrl+K）**：按下 `Cmd+K` 或 `Ctrl+K` 调出居中聚焦搜索栏，支持键盘上下箭头与回车快速启动或关闭任意应用与快捷指令。

### 3. 四大核心实用极客 App
1. **极客系统终端（Cyber Terminal）**：
   - 真实高拟真 CLI 交互终端，Bash 提示符 `guest@webos:~$`。
   - 内置命令解析：`help`、`neofetch`（彩色 ASCII 艺术字展示系统内核与分辨率参数）、`ping <domain>`、`matrix`（黑客帝国字符雨特效，按 Q 退出）、`date`、`whoami`、`uname -a`、`clear`。
   - 支持键盘方向键上下回溯历史命令。
2. **Markdown 沉浸式知识库（Notepad Pro）**：
   - 支持编辑模式、分屏实时渲染模式与纯预览模式无缝切换。
   - 内容实时防抖自动持久化到 `localStorage`，顶部提供“导出 .md 文件”与“清空笔记”动作。
3. **极客音频频谱播放器（Lo-Fi / Synthwave Player）**：
   - 内置高质量 Synthwave 80s 律动生成器，集成 Web Audio API 实时 Canvas 柱状音频频谱动画。
   - 支持拖拽本地 `.mp3` / `.wav` 文件进窗口即拖即播，支持音量调节与播放进度控制。
4. **AI 模型工作舱（AI Studio Terminal）**：
   - 深度支持标准 OpenAI 兼容协议（可自定义 Base URL、Model Name、API Key）。
   - 支持打字机动效、Token 耗时统计、预设 System Prompt 人设切换（极客架构师 / 代码审查官 / 哲学黑客）与会话导出（JSON / Markdown）。

---

## 🛠️ 本地运行指南

```bash
# 1. 克隆仓库
git clone https://github.com/xxwl12122/webos-desktop.git

# 2. 进入项目
cd webos-desktop

# 3. 安装依赖
npm install

# 4. 启动本地开发服务
npm run dev

# 5. 编译生产版本
npm run build
```
本地终端会输出 `http://localhost:5173`，按住 Ctrl 点击即可在浏览器打开！

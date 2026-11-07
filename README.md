# AetherOS - 现代 Windows 风格极客 Web 桌面系统

<p align="center">
  <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&h=280&q=85" alt="AetherOS Banner" width="650" style="border-radius: 10px;" />
</p>

<div align="center">

### 🚀 [👉 点击这里立即在线体验 AetherOS (Vercel 全球极速版) 👈](https://webos-desktop-lyart.vercel.app)

**无需安装，任何浏览器双击即开，纯正 Windows 操作习惯，支持跨端自适应！**

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

## 🌟 核心架构与系统特性清单

### 1. Windows 纯正任务栏与任务管理器（Task Manager）
* **置底全宽毛玻璃任务栏（48px）**：固定置底的全宽亚克力毛玻璃任务栏（`h-12 w-full bg-zinc-950/85 backdrop-blur-2xl border-t border-white/[0.08]`）。
* **Windows 风格任务管理器（Task Manager）**：
  * **唤起方式**：桌面图标、开始菜单、Spotlight 搜索、**任务栏空白处右键菜单**、以及快捷键 **`Ctrl + Shift + Esc`**；
  * **进程管理（Processes）**：实时展示所有运行中 App 进程与内核服务状态、CPU 占用、内存消耗，支持选中一键【结束任务 (End Task)】；
  * **性能监视（Performance）**：Canvas 实时平滑滚动的 CPU & 内存波形折线图、实时核心基准参数与运行时间（Uptime）统计。
* **左侧【开始菜单（Start Menu）】**：
  * Windows 经典四色微标，顶部实时模糊搜索，中部已安装应用磁贴网格，底部用户身份与出厂重置关机。
* **运行窗口任务标签（Task List）**：
  * 点击活动窗口标签平滑最小化，点击非活动标签恢复并置顶，激活窗口带高亮底边指示条。
* **系统托盘区（System Tray）与日历**：
  * Windows 双行时钟，点击弹出 **Windows 11 风格悬浮毛玻璃月历小组件**；
  * 展开系统控制中心面板（全屏亮度滑块、音量滑块、全屏切换）。

### 2. 视觉通透度还原与纯净桌面
* **纯净通透桌面**：已按用户需求彻底移除遮挡画面的桌面大时钟小组件，恢复全高清通透大片壁纸原本质感。
* **显示明亮度无级调节**：全屏亮度滑块（50% - 125%）与壁纸暗化蒙层滑块（0% - 80%），在【系统设置】与【控制中心】中随手调节。

### 3. 联网高精度自动对时系统（Network Time Sync）
* 应用加载时，后台异步调用全球时间同步服务或 HTTP HEAD Date 响应头，毫秒级计算服务端与客户端偏移量 `serverTimeOffset`；
* 本地每秒自增精确刷新；在离线或断网时无感降级为客户端原生 `new Date()`。

### 4. 生产级内置浏览器（Web Browser Pro）
* **智能地址栏**：自动识别标准 URL 或是关键词，非 URL 自动发起 Bing 引擎检索；
* **快捷书签胶囊栏**：内置必应搜索、维基百科镜像、GitHub Trending、2048 小游戏、科学计算绘图；
* **CSP 拦截容灾引导层（Anti-Frame Shield）**：面对限制 iframe 内嵌的商业站点时，自动弹出磨砂提示罩，并提供【在新标签页独立打开 ↗】与【复制网址】按钮。

### 5. 全套极客生产力套件
* **极客系统终端（Cyber Terminal）**：高拟真 Bash 提示符 `guest@webos:~$`，内置 `neofetch`、`ping`、`matrix` 字符雨（按 Q 退出）、`help`、`clear`，支持上下键历史命令回溯。
* **Markdown 沉浸式知识库（Notepad Pro）**：分屏实时渲染模式与纯预览模式切换，实时防抖自动保存至 localStorage，支持一键导出 `.md` 文件与清空笔记。
* **Lo-Fi / Synthwave 极客音频电台**：Web Audio API 实时柱状音频频谱动画，支持本地 `.mp3` / `.wav` 拖入即拖即播。
* **AI 模型工作舱（AI Studio Terminal）**：标准 OpenAI 协议流式推理，带 Token 耗时统计与人设切换。

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

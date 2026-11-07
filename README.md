# AetherOS - 现代 Windows 风格极客 Web 桌面系统

<p align="center">
  <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&h=280&q=85" alt="AetherOS Banner" width="650" style="border-radius: 10px;" />
</p>

<div align="center">

### 🚀 [👉 点击这里立即在线体验 AetherOS (Vercel 全球极速版) 👈](https://webos-desktop-lyart.vercel.app)

**无需安装，任何浏览器双击即开，完美兼容 Windows 操作习惯，支持跨端自适应！**

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

### 1. Windows 纯正桌面布局与任务栏（Windows Taskbar）
* **置底全宽毛玻璃任务栏（48px）**：彻底取代 macOS 顶栏与悬浮 Dock，采用置底的全宽亚克力毛玻璃任务栏（`h-12 w-full bg-zinc-950/85 backdrop-blur-2xl border-t border-white/[0.08]`）。
* **左侧【开始菜单（Start Menu）】**：
  * Windows 经典四色微标，点击呼出 Windows 11 浮动开始菜单；
  * 顶部支持实时模糊检索应用并回车快速启动；
  * 中部展示已安装 App 磁贴网格；
  * 底部集成用户身份与出厂重置关机按钮。
* **中间【正在运行窗口任务栏（App Task List）】**：
  * 扁平任务卡片展示应用图标与窗口标题；
  * 点击活动窗口标签平滑最小化，点击未激活窗口置顶并获得焦点；
  * 激活窗口带有高亮底边指示条（`border-b-2 border-blue-500`）。
* **右侧【系统托盘区（System Tray）】**：
  * 包含网络在线指示灯、控制中心快捷展开按钮；
  * **Windows 经典双行时钟**：上行显示时间（如 `23:58`），下行显示完整日期（如 `2026/11/08`）；
  * 点击时间平滑弹出 **Windows 11 风格的精美毛玻璃月历面板**（当月公历网格、当天高亮、上月/下月翻页）。

### 2. 视觉通透度还原与全局显示明亮度调节
* **通透度还原**：剔除壁纸容器上的强制暗化与纯黑遮罩，恢复壁纸高清通透质感。
* **桌面显眼大时钟小组件（Desktop Clock Widget）**：右上侧半透明极简大数字时钟，上层超大字体显示时间与秒数，下层显示完整中文日期与星期，带柔和微阴影。
* **显示明亮度无级调节**：
  * 全屏亮度滑块（50% - 125%），通过全局根节点动态滤镜（`filter: brightness(...)`）实现；
  * 壁纸暗化蒙层滑块（0% - 80%），兼顾高清美观与文字识别；
  * 可在【系统偏好设置】与右下角【控制中心】中随手调节并自动持久化。

### 3. 联网高精度自动对时系统（Network Time Sync）
* 应用加载时，后台异步请求时间同步接口（`worldtimeapi` 与 HTTP HEAD 响应头解析），计算毫秒级服务端与客户端偏移量（`timeOffset`）；
* 本地每秒自增刷新，断网时自动降级使用本地原生时钟，确保永不出现 NaN 或白屏报错。

### 4. 生产级内置浏览器（Web Browser Pro）
* **智能地址栏**：自动识别标准 URL 或是关键词，非 URL 自动发起 Bing 引擎检索；
* **快捷书签栏**：内置必应搜索、维基百科镜像、GitHub Trending、2048 小游戏、科学计算工具；
* **CSP 拦截容灾引导层（Anti-Frame Shield）**：面对商业网站的 `X-Frame-Options` 拦截时，自动弹出磨砂提示罩，并提供【在新标签页独立打开 ↗】与【复制链接】。

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

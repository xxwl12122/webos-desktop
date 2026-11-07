# AetherOS - 现代 WebOS 桌面操作系统

<p align="center">
  <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80" alt="AetherOS Banner" width="100%" style="border-radius: 12px; max-height: 380px; object-fit: cover;" />
</p>

<div align="center">

### 🌐 [👉 点击这里立即在线体验 AetherOS 桌面 👈](https://xxwl12122.github.io/webos-desktop/)

**无需安装，任何浏览器双击即开，已支持手机/平板/电脑跨端访问！**

[![Deploy to GitHub Pages](https://github.com/xxwl12122/webos-desktop/actions/workflows/deploy.yml/badge.svg)](https://github.com/xxwl12122/webos-desktop/actions/workflows/deploy.yml)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📍 在哪里点开？（3 步在 GitHub 开启并访问）

你的项目已经配置了自动部署工作流，只需要在 GitHub 仓库开启 Pages 服务即可：

1. **进入设置页面**：
   点击进入你的仓库设置 👉 [https://github.com/xxwl12122/webos-desktop/settings/pages](https://github.com/xxwl12122/webos-desktop/settings/pages)
2. **选择构建来源（两种任选一种均可）**：
   * **方式一（推荐，最省心）**：
     * 在 **Build and deployment** -> **Source** 下拉菜单选择：`GitHub Actions`
   * **方式二（分支部署）**：
     * **Source** 选择：`Deploy from a branch`
     * **Branch** 选择：`gh-pages` / 目录选择 `/ (root)`，点击 **Save**
3. **点开访问**：
   保存后等待 30 秒至 1 分钟，页面上方就会出现带绿色勾勾的专属公开网址：
   🔗 **`https://xxwl12122.github.io/webos-desktop/`**
   直接把这个链接发给朋友、同学或发在朋友圈，所有人都可以随时点开体验！

---

## ☁️ 有没有免费的在线服务器？让别人也能高速访问

如果你想获得**更快的国内访问速度**、**专属自定义域名**或**抗高峰流量**，市面上有以下完全免费、免买服务器、免备案的顶级在线托管平台，全部支持将你的 GitHub 仓库一键关联部署：

| 平台名称 | 费用 | 国内访问速度 | 特点与优势 | 推荐指数 |
| :--- | :--- | :--- | :--- | :--- |
| **Vercel** *(最推荐)* | **永久免费** | ⚡ 极快 (全球 Edge CDN) | 30 秒一键导入 GitHub，自带 `*.vercel.app` 免费域名，自动分配 HTTPS 证书，每次代码更新自动上线 | ⭐⭐⭐⭐⭐ |
| **Cloudflare Pages** | **永久免费** | ⚡ 极快且稳定 (无限流量) | Cloudflare 顶级全球 CDN，抗高并发防 DDoS，提供免费 `*.pages.dev` 域名 | ⭐⭐⭐⭐⭐ |
| **GitHub Pages** | **永久免费** | 良好 | GitHub 原生自带，无需注册其他账号，直接在仓库设置中开启 | ⭐⭐⭐⭐ |
| **Netlify** | **永久免费** | 良好 | 类似 Vercel，提供每月 100GB 免费高速流量与一键自动化部署 | ⭐⭐⭐⭐ |

---

### 🚀 强烈推荐：使用 Vercel 进行免费极速部署（只要 30 秒）

如果希望别人无需魔法、在国内手机或微信里秒开你的 WebOS，推荐使用 **Vercel**：

1. 打开 [https://vercel.com](https://vercel.com)，点击右上角 **Sign Up**，直接选择 **Continue with GitHub**（用你的 GitHub 账号直接登录，无需另外注册）。
2. 登录后点击 **Add New...** -> 选择 **Project**。
3. 在列表里你会直接看到刚刚创建的 **`webos-desktop`** 仓库，点击它旁边的 **Import** 按钮。
4. Framework Preset 会自动识别为 `Vite`，无需修改任何参数，直接点击底部的 **Deploy** 按钮。
5. 等待 20 秒左右，屏幕上会绽放烟花 🎉，并赠送给你一个所有人都能高速访问的网址（如 `https://webos-desktop-xxx.vercel.app`）！

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

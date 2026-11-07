import { SystemState } from '../types';

export const PRESET_WALLPAPERS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2560&q=85', // 纯黑微流体暗黑质感
  'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2560&q=85', // 暗夜极简星云
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=85', // 暮色冷冽雪峰
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2560&q=85'  // 极客古堡暗影
];

export const STORAGE_KEY = 'aether_webos_geek_v3';

export const DEFAULT_STATE: SystemState = {
  wallpaper: PRESET_WALLPAPERS[0],
  windows: {
    terminal: {
      id: 'terminal',
      title: 'guest@webos: ~ (bash)',
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      snapMode: 'none',
      x: 80,
      y: 60,
      width: 720,
      height: 480,
      minWidth: 460,
      minHeight: 300,
    },
    notepad: {
      id: 'notepad',
      title: 'Notepad Pro (Markdown)',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      snapMode: 'none',
      x: 160,
      y: 90,
      width: 680,
      height: 520,
      minWidth: 420,
      minHeight: 300,
    },
    player: {
      id: 'player',
      title: 'Lo-Fi / Synthwave Audio Station',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      snapMode: 'none',
      x: 240,
      y: 110,
      width: 580,
      height: 420,
      minWidth: 400,
      minHeight: 320,
    },
    aistudio: {
      id: 'aistudio',
      title: 'AI Studio Terminal',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      snapMode: 'none',
      x: 180,
      y: 80,
      width: 680,
      height: 560,
      minWidth: 440,
      minHeight: 360,
    },
    settings: {
      id: 'settings',
      title: 'System Preferences',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      snapMode: 'none',
      x: 220,
      y: 100,
      width: 620,
      height: 480,
      minWidth: 440,
      minHeight: 300,
    },
  },
  notepadContent: `# AetherOS 极客知识库

欢迎使用 **Notepad Pro**。支持分栏实时渲染与本地即时热存储。

### 核心特性
- [x] 原生 macOS / Linear 磨砂质感
- [x] 边缘吸附（Snap Assist: 拖到左/右/顶边缘自动半屏/全屏）
- [x] 全局 Command / Ctrl + K Spotlight 启动器
- [x] 极客终端 (包含 neofetch, ping, matrix 字符雨)
- [x] Web Audio API 实时频谱播放器

\`\`\`bash
# 启动终端运行 neofetch
guest@webos:~$ neofetch
\`\`\`

> 极客不是形式主义，而是将每一处细节淬炼至极致。
`,
  aiConfig: {
    baseUrl: '',
    model: 'gpt-4o-mini',
    apiKey: '',
    systemPrompt: '你是 AetherOS 内置的资深极客全栈架构师，回答精炼严谨，代码风格专业规范。',
  },
};

export function loadSavedState(): SystemState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_STATE,
        ...parsed,
        windows: {
          ...DEFAULT_STATE.windows,
          ...(parsed.windows || {}),
        },
        aiConfig: {
          ...DEFAULT_STATE.aiConfig,
          ...(parsed.aiConfig || {}),
        },
      };
    }
  } catch (err) {
    console.error('Failed to load system state:', err);
  }
  return DEFAULT_STATE;
}

export function saveSystemState(state: SystemState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save system state:', err);
  }
}

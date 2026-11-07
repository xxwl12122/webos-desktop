import { SystemState } from '../types';

export const PRESET_WALLPAPERS = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2560&q=85', // 通透山峦暮光
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2560&q=85', // 极客古堡暗影
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=85', // 暮色冷冽雪峰
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2560&q=85', // 纯黑微流体暗黑质感
];

export const STORAGE_KEY = 'aether_webos_win_v5';

export const DEFAULT_STATE: SystemState = {
  wallpaper: PRESET_WALLPAPERS[0],
  brightness: 100,
  wallpaperOverlayOpacity: 12,
  systemVolume: 80,
  windows: {
    browser: {
      id: 'browser',
      title: 'Web 浏览器 (Pro)',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      snapMode: 'none',
      x: 100,
      y: 50,
      width: 860,
      height: 560,
      minWidth: 460,
      minHeight: 320,
    },
    terminal: {
      id: 'terminal',
      title: 'guest@webos: ~ (bash)',
      isOpen: false,
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
      x: 140,
      y: 80,
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
      x: 200,
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
      x: 160,
      y: 70,
      width: 680,
      height: 560,
      minWidth: 440,
      minHeight: 360,
    },
    taskmanager: {
      id: 'taskmanager',
      title: '任务管理器 (Task Manager)',
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      snapMode: 'none',
      x: 180,
      y: 80,
      width: 680,
      height: 490,
      minWidth: 460,
      minHeight: 320,
    },
    settings: {
      id: 'settings',
      title: '系统偏好设置',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      snapMode: 'none',
      x: 220,
      y: 90,
      width: 640,
      height: 500,
      minWidth: 440,
      minHeight: 320,
    },
  },
  notepadContent: `# AetherOS 极客知识库

欢迎使用 **Notepad Pro**。支持分栏实时渲染与本地即时热存储。

### 核心特性
- [x] Windows 风格全宽底部任务栏与开始菜单
- [x] 纯正 Windows 任务管理器 (进程管理与性能监控)
- [x] 快捷键 Ctrl+Shift+Esc 快速唤出任务管理器
- [x] 联网自动校准时间系统（带离线自增保护）
- [x] 原生内置生产级浏览器（带 CSP 安全容灾保护）
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

import { SystemState } from '../types';

export const PRESET_WALLPAPERS = [
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80'
];

export const STORAGE_KEY = 'aether_webos_state_v2';

export const DEFAULT_STATE: SystemState = {
  wallpaper: PRESET_WALLPAPERS[0],
  windows: {
    browser: {
      id: 'browser',
      title: '轻舟浏览器',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      x: 100,
      y: 60,
      width: 840,
      height: 540,
      minWidth: 360,
      minHeight: 240
    },
    copilot: {
      id: 'copilot',
      title: 'Aether AI 极客副驾驶',
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      x: 260,
      y: 70,
      width: 580,
      height: 560,
      minWidth: 360,
      minHeight: 300
    },
    notepad: {
      id: 'notepad',
      title: '随手记',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      x: 160,
      y: 120,
      width: 520,
      height: 460,
      minWidth: 320,
      minHeight: 200
    },
    settings: {
      id: 'settings',
      title: '系统设置',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      x: 220,
      y: 100,
      width: 580,
      height: 490,
      minWidth: 360,
      minHeight: 260
    }
  },
  notepadContent: '# AetherOS 随手记\n\n- 欢迎使用现代 WebOS 系统。\n- 本系统支持无缝窗口调度与拖拽防断触保护。\n- 所有数据均已实时保存在本地存储中！\n',
  aiConfig: {
    baseUrl: '',
    model: 'gpt-4o-mini',
    apiKey: ''
  }
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
          ...(parsed.windows || {})
        },
        aiConfig: {
          ...DEFAULT_STATE.aiConfig,
          ...(parsed.aiConfig || {})
        }
      };
    }
  } catch (err) {
    console.error('Failed to load system state from localStorage:', err);
  }
  return DEFAULT_STATE;
}

export function saveSystemState(state: SystemState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save system state to localStorage:', err);
  }
}

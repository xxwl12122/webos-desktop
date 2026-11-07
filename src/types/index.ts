export type AppId = 'browser' | 'terminal' | 'notepad' | 'player' | 'aistudio' | 'taskmanager' | 'settings';

export type SnapMode = 'none' | 'left' | 'right' | 'maximize';

export interface WindowState {
  id: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  snapMode: SnapMode;
  x: number;
  y: number;
  width: number;
  height: number;
  prevX?: number;
  prevY?: number;
  prevWidth?: number;
  prevHeight?: number;
  minWidth: number;
  minHeight: number;
}

export interface AiStudioConfig {
  baseUrl: string;
  model: string;
  apiKey: string;
  systemPrompt: string;
}

export interface SystemState {
  wallpaper: string;
  brightness: number;               // 50% - 120%, 默认 100
  wallpaperOverlayOpacity: number;  // 0% - 80%, 默认 12
  systemVolume: number;             // 0 - 100, 默认 80
  windows: Record<AppId, WindowState>;
  notepadContent: string;
  aiConfig: AiStudioConfig;
}

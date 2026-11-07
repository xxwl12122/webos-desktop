export type AppId = 'browser' | 'copilot' | 'notepad' | 'settings';

export interface WindowState {
  id: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
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

export interface AiConfig {
  baseUrl: string;
  model: string;
  apiKey: string;
}

export interface SystemState {
  wallpaper: string;
  windows: Record<AppId, WindowState>;
  notepadContent: string;
  aiConfig: AiConfig;
}

export type AppId = 'terminal' | 'notepad' | 'player' | 'aistudio' | 'settings';

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
  windows: Record<AppId, WindowState>;
  notepadContent: string;
  aiConfig: AiStudioConfig;
}

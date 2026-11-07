import React, { useState, useEffect, useCallback } from 'react';
import { Globe, Sparkles, FileText, Settings as SettingsIcon } from 'lucide-react';
import { AppId, SystemState, WindowState, AiConfig } from './types';
import { loadSavedState, saveSystemState, PRESET_WALLPAPERS, DEFAULT_STATE } from './utils/storage';
import { TopBar } from './components/TopBar';
import { Dock } from './components/Dock';
import { ContextMenu } from './components/ContextMenu';
import { WindowFrame } from './components/WindowFrame';
import { BrowserApp } from './apps/BrowserApp';
import { AiCopilotApp } from './apps/AiCopilotApp';
import { NotepadApp } from './apps/NotepadApp';
import { SettingsApp } from './apps/SettingsApp';

export const App: React.FC = () => {
  const [systemState, setSystemState] = useState<SystemState>(loadSavedState);
  const [windowStack, setWindowStack] = useState<AppId[]>(['browser', 'notepad', 'settings', 'copilot']);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // 状态自动持久化
  useEffect(() => {
    saveSystemState(systemState);
  }, [systemState]);

  // 窗口置顶调度器 (数组栈管理器)
  const bringToFront = useCallback((id: AppId) => {
    setWindowStack((prev) => {
      const filtered = prev.filter((item) => item !== id);
      return [...filtered, id];
    });
  }, []);

  // 打开/还原窗口
  const openApp = useCallback((id: AppId) => {
    setSystemState((prev) => {
      const current = prev.windows[id];
      return {
        ...prev,
        windows: {
          ...prev.windows,
          [id]: {
            ...current,
            isOpen: true,
            isMinimized: false,
          },
        },
      };
    });
    bringToFront(id);
  }, [bringToFront]);

  // 关闭窗口
  const closeApp = useCallback((id: AppId) => {
    setSystemState((prev) => ({
      ...prev,
      windows: {
        ...prev.windows,
        [id]: {
          ...prev.windows[id],
          isOpen: false,
          isMinimized: false,
        },
      },
    }));
  }, []);

  // 最小化窗口
  const minimizeApp = useCallback((id: AppId) => {
    setSystemState((prev) => ({
      ...prev,
      windows: {
        ...prev.windows,
        [id]: {
          ...prev.windows[id],
          isMinimized: true,
        },
      },
    }));
  }, []);

  // 最大化/还原切换
  const toggleMaximizeApp = useCallback((id: AppId) => {
    setSystemState((prev) => {
      const win = prev.windows[id];
      return {
        ...prev,
        windows: {
          ...prev.windows,
          [id]: {
            ...win,
            isMaximized: !win.isMaximized,
          },
        },
      };
    });
    bringToFront(id);
  }, [bringToFront]);

  // Dock 栏点击调度
  const handleToggleFromDock = useCallback((id: AppId) => {
    const win = systemState.windows[id];
    const isTop = windowStack[windowStack.length - 1] === id;

    if (!win.isOpen || win.isMinimized) {
      openApp(id);
    } else if (isTop) {
      minimizeApp(id);
    } else {
      bringToFront(id);
    }
  }, [systemState.windows, windowStack, openApp, minimizeApp, bringToFront]);

  // 更新窗口坐标
  const updatePosition = useCallback((id: AppId, x: number, y: number) => {
    setSystemState((prev) => ({
      ...prev,
      windows: {
        ...prev.windows,
        [id]: {
          ...prev.windows[id],
          x,
          y,
        },
      },
    }));
  }, []);

  // 更新窗口尺寸
  const updateSize = useCallback((id: AppId, width: number, height: number) => {
    setSystemState((prev) => ({
      ...prev,
      windows: {
        ...prev.windows,
        [id]: {
          ...prev.windows[id],
          width,
          height,
        },
      },
    }));
  }, []);

  // 桌面右键上下文菜单事件
  const handleContextMenu = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('textarea')) {
      return;
    }
    e.preventDefault();
    const x = Math.min(e.clientX, window.innerWidth - 200);
    const y = Math.min(e.clientY, window.innerHeight - 200);
    setContextMenu({ x, y });
  };

  const handleGlobalClick = () => {
    if (contextMenu) setContextMenu(null);
  };

  // 随机更换壁纸
  const handleRandomWallpaper = () => {
    const randomWp = PRESET_WALLPAPERS[Math.floor(Math.random() * PRESET_WALLPAPERS.length)];
    setSystemState((prev) => ({ ...prev, wallpaper: randomWp }));
  };

  // 重置系统
  const handleResetSystem = () => {
    setSystemState(DEFAULT_STATE);
    setWindowStack(['browser', 'notepad', 'settings', 'copilot']);
    localStorage.clear();
    window.location.reload();
  };

  const activeWindowId = windowStack[windowStack.length - 1];
  const BASE_Z_INDEX = 100;

  return (
    <div
      onContextMenu={handleContextMenu}
      onClick={handleGlobalClick}
      className="w-screen h-screen overflow-hidden text-slate-100 bg-slate-950 select-none relative font-sans antialiased"
    >
      {/* 桌面壁纸背景 */}
      <div
        style={{ backgroundImage: `url("${systemState.wallpaper}")` }}
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out z-0 filter brightness-90"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none z-[1]" />

      {/* 1. 顶部状态栏 */}
      <TopBar onOpenApp={openApp} />

      {/* 2. 桌面网格图标 */}
      <main className="absolute inset-0 pt-12 pb-24 px-6 z-10 flex flex-col flex-wrap items-start content-start gap-5">
        <div
          onClick={() => openApp('browser')}
          className="w-20 flex flex-col items-center group cursor-pointer p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200 border border-white/20">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <span className="mt-1.5 text-xs text-white drop-shadow-md text-center font-medium group-hover:text-blue-300">
            轻舟浏览器
          </span>
        </div>

        <div
          onClick={() => openApp('copilot')}
          className="w-20 flex flex-col items-center group cursor-pointer p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200 border border-white/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="mt-1.5 text-xs text-white drop-shadow-md text-center font-medium group-hover:text-purple-300">
            AI 助理
          </span>
        </div>

        <div
          onClick={() => openApp('notepad')}
          className="w-20 flex flex-col items-center group cursor-pointer p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200 border border-white/20">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <span className="mt-1.5 text-xs text-white drop-shadow-md text-center font-medium group-hover:text-amber-300">
            随手记
          </span>
        </div>

        <div
          onClick={() => openApp('settings')}
          className="w-20 flex flex-col items-center group cursor-pointer p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-600 to-slate-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200 border border-white/20">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <span className="mt-1.5 text-xs text-white drop-shadow-md text-center font-medium group-hover:text-slate-300">
            偏好设置
          </span>
        </div>
      </main>

      {/* 3. 窗口集合 */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* 浏览器 */}
        <WindowFrame
          window={systemState.windows.browser}
          icon={<Globe className="w-3.5 h-3.5 text-blue-400" />}
          zIndex={BASE_Z_INDEX + windowStack.indexOf('browser')}
          isActive={activeWindowId === 'browser'}
          onFocus={() => bringToFront('browser')}
          onClose={() => closeApp('browser')}
          onMinimize={() => minimizeApp('browser')}
          onToggleMaximize={() => toggleMaximizeApp('browser')}
          onUpdatePosition={(x, y) => updatePosition('browser', x, y)}
          onUpdateSize={(w, h) => updateSize('browser', w, h)}
        >
          <BrowserApp />
        </WindowFrame>

        {/* AI Copilot */}
        <WindowFrame
          window={systemState.windows.copilot}
          icon={<Sparkles className="w-3.5 h-3.5 text-purple-400" />}
          zIndex={BASE_Z_INDEX + windowStack.indexOf('copilot')}
          isActive={activeWindowId === 'copilot'}
          onFocus={() => bringToFront('copilot')}
          onClose={() => closeApp('copilot')}
          onMinimize={() => minimizeApp('copilot')}
          onToggleMaximize={() => toggleMaximizeApp('copilot')}
          onUpdatePosition={(x, y) => updatePosition('copilot', x, y)}
          onUpdateSize={(w, h) => updateSize('copilot', w, h)}
        >
          <AiCopilotApp
            config={systemState.aiConfig}
            onUpdateConfig={(newConfig: AiConfig) =>
              setSystemState((prev) => ({ ...prev, aiConfig: newConfig }))
            }
          />
        </WindowFrame>

        {/* 随手记 */}
        <WindowFrame
          window={systemState.windows.notepad}
          icon={<FileText className="w-3.5 h-3.5 text-amber-400" />}
          zIndex={BASE_Z_INDEX + windowStack.indexOf('notepad')}
          isActive={activeWindowId === 'notepad'}
          onFocus={() => bringToFront('notepad')}
          onClose={() => closeApp('notepad')}
          onMinimize={() => minimizeApp('notepad')}
          onToggleMaximize={() => toggleMaximizeApp('notepad')}
          onUpdatePosition={(x, y) => updatePosition('notepad', x, y)}
          onUpdateSize={(w, h) => updateSize('notepad', w, h)}
        >
          <NotepadApp
            content={systemState.notepadContent}
            onUpdateContent={(content: string) =>
              setSystemState((prev) => ({ ...prev, notepadContent: content }))
            }
          />
        </WindowFrame>

        {/* 系统设置 */}
        <WindowFrame
          window={systemState.windows.settings}
          icon={<SettingsIcon className="w-3.5 h-3.5 text-slate-400" />}
          zIndex={BASE_Z_INDEX + windowStack.indexOf('settings')}
          isActive={activeWindowId === 'settings'}
          onFocus={() => bringToFront('settings')}
          onClose={() => closeApp('settings')}
          onMinimize={() => minimizeApp('settings')}
          onToggleMaximize={() => toggleMaximizeApp('settings')}
          onUpdatePosition={(x, y) => updatePosition('settings', x, y)}
          onUpdateSize={(w, h) => updateSize('settings', w, h)}
        >
          <SettingsApp
            currentWallpaper={systemState.wallpaper}
            onSetWallpaper={(wp: string) =>
              setSystemState((prev) => ({ ...prev, wallpaper: wp }))
            }
            onResetSystem={handleResetSystem}
          />
        </WindowFrame>
      </div>

      {/* 4. 底部 Dock 任务栏 */}
      <Dock windows={systemState.windows} onToggleApp={handleToggleFromDock} />

      {/* 5. 右键上下文菜单 */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onNewNote={() => openApp('notepad')}
          onRandomWallpaper={handleRandomWallpaper}
          onToggleFullscreen={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(() => {});
            } else {
              document.exitFullscreen().catch(() => {});
            }
          }}
          onOpenSettings={() => openApp('settings')}
        />
      )}
    </div>
  );
};

export default App;

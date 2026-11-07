import React, { useState, useEffect, useCallback } from 'react';
import { Terminal, FileText, Music, Sparkles, Settings as SettingsIcon } from 'lucide-react';
import { AppId, SystemState, SnapMode, AiStudioConfig } from './types';
import { loadSavedState, saveSystemState, PRESET_WALLPAPERS, DEFAULT_STATE } from './utils/storage';
import { TopBar } from './components/TopBar';
import { Dock } from './components/Dock';
import { ContextMenu } from './components/ContextMenu';
import { WindowFrame } from './components/WindowFrame';
import { Spotlight } from './components/Spotlight';
import { CyberTerminalApp } from './apps/CyberTerminalApp';
import { NotepadProApp } from './apps/NotepadProApp';
import { AudioPlayerApp } from './apps/AudioPlayerApp';
import { AiStudioApp } from './apps/AiStudioApp';
import { SettingsApp } from './apps/SettingsApp';

export const App: React.FC = () => {
  const [systemState, setSystemState] = useState<SystemState>(loadSavedState);
  const [windowStack, setWindowStack] = useState<AppId[]>(['terminal', 'notepad', 'player', 'aistudio', 'settings']);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [snapPreview, setSnapPreview] = useState<SnapMode | null>(null);

  // 状态自动持久化
  useEffect(() => {
    saveSystemState(systemState);
  }, [systemState]);

  // 全局屏蔽浏览器原生右键菜单，彻底解决打架问题
  useEffect(() => {
    const handleGlobalContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const x = Math.min(e.clientX, window.innerWidth - 210);
      const y = Math.min(e.clientY, window.innerHeight - 220);
      setContextMenu({ x, y });
    };

    window.addEventListener('contextmenu', handleGlobalContextMenu);
    return () => window.removeEventListener('contextmenu', handleGlobalContextMenu);
  }, []);

  // 全局 ⌘K / Ctrl+K 唤起 Spotlight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSpotlightOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      const nextMaximized = !win.isMaximized;
      return {
        ...prev,
        windows: {
          ...prev.windows,
          [id]: {
            ...win,
            isMaximized: nextMaximized,
            snapMode: 'none',
            prevWidth: win.prevWidth || win.width,
            prevHeight: win.prevHeight || win.height,
          },
        },
      };
    });
    bringToFront(id);
  }, [bringToFront]);

  // 边缘吸附应用 (Snap Assist)
  const applySnap = useCallback((id: AppId, mode: SnapMode) => {
    setSystemState((prev) => {
      const win = prev.windows[id];
      return {
        ...prev,
        windows: {
          ...prev.windows,
          [id]: {
            ...win,
            snapMode: mode,
            isMaximized: mode === 'maximize',
            prevWidth: win.snapMode === 'none' && !win.isMaximized ? win.width : win.prevWidth,
            prevHeight: win.snapMode === 'none' && !win.isMaximized ? win.height : win.prevHeight,
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
          snapMode: 'none',
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

  // 随机更换壁纸
  const handleRandomWallpaper = () => {
    const randomWp = PRESET_WALLPAPERS[Math.floor(Math.random() * PRESET_WALLPAPERS.length)];
    setSystemState((prev) => ({ ...prev, wallpaper: randomWp }));
  };

  // 重置系统
  const handleResetSystem = () => {
    setSystemState(DEFAULT_STATE);
    setWindowStack(['terminal', 'notepad', 'player', 'aistudio', 'settings']);
    localStorage.clear();
    window.location.reload();
  };

  const activeWindowId = windowStack[windowStack.length - 1];
  const BASE_Z_INDEX = 100;

  // 边缘吸附虚线框样式
  const getSnapPreviewStyle = (): React.CSSProperties | null => {
    if (!snapPreview) return null;
    if (snapPreview === 'left') {
      return { top: '38px', left: '6px', width: 'calc(50vw - 9px)', height: 'calc(100vh - 105px)' };
    }
    if (snapPreview === 'right') {
      return { top: '38px', left: 'calc(50vw + 3px)', width: 'calc(50vw - 9px)', height: 'calc(100vh - 105px)' };
    }
    if (snapPreview === 'maximize') {
      return { top: '38px', left: '6px', width: 'calc(100vw - 12px)', height: 'calc(100vh - 105px)' };
    }
    return null;
  };

  return (
    <div
      onClick={() => contextMenu && setContextMenu(null)}
      className="w-screen h-screen overflow-hidden text-zinc-100 bg-[#09090b] select-none relative font-sans antialiased"
    >
      {/* 极客暗黑壁纸背景 */}
      <div
        style={{ backgroundImage: `url("${systemState.wallpaper}")` }}
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out z-0 filter brightness-75 contrast-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/50 pointer-events-none z-[1]" />

      {/* 1. 顶部状态栏 */}
      <TopBar onOpenApp={openApp} onOpenSpotlight={() => setIsSpotlightOpen(true)} />

      {/* 2. 桌面极客图标网格 */}
      <main className="absolute inset-0 pt-12 pb-24 px-6 z-10 flex flex-col flex-wrap items-start content-start gap-4">
        {/* Terminal */}
        <div
          onClick={() => openApp('terminal')}
          className="w-20 flex flex-col items-center group cursor-pointer p-2 rounded-xl hover:bg-white/[0.06] transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-zinc-900/90 border border-white/[0.08] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-150">
            <Terminal className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="mt-1.5 text-xs text-zinc-300 drop-shadow text-center font-medium group-hover:text-white">
            终端
          </span>
        </div>

        {/* Notepad Pro */}
        <div
          onClick={() => openApp('notepad')}
          className="w-20 flex flex-col items-center group cursor-pointer p-2 rounded-xl hover:bg-white/[0.06] transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-zinc-900/90 border border-white/[0.08] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-150">
            <FileText className="w-5 h-5 text-amber-400" />
          </div>
          <span className="mt-1.5 text-xs text-zinc-300 drop-shadow text-center font-medium group-hover:text-white">
            知识便签
          </span>
        </div>

        {/* Player */}
        <div
          onClick={() => openApp('player')}
          className="w-20 flex flex-col items-center group cursor-pointer p-2 rounded-xl hover:bg-white/[0.06] transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-zinc-900/90 border border-white/[0.08] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-150">
            <Music className="w-5 h-5 text-blue-400" />
          </div>
          <span className="mt-1.5 text-xs text-zinc-300 drop-shadow text-center font-medium group-hover:text-white">
            电台播放器
          </span>
        </div>

        {/* AI Studio */}
        <div
          onClick={() => openApp('aistudio')}
          className="w-20 flex flex-col items-center group cursor-pointer p-2 rounded-xl hover:bg-white/[0.06] transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-zinc-900/90 border border-white/[0.08] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-150">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <span className="mt-1.5 text-xs text-zinc-300 drop-shadow text-center font-medium group-hover:text-white">
            AI 工作舱
          </span>
        </div>

        {/* Settings */}
        <div
          onClick={() => openApp('settings')}
          className="w-20 flex flex-col items-center group cursor-pointer p-2 rounded-xl hover:bg-white/[0.06] transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-zinc-900/90 border border-white/[0.08] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-150">
            <SettingsIcon className="w-5 h-5 text-zinc-400" />
          </div>
          <span className="mt-1.5 text-xs text-zinc-300 drop-shadow text-center font-medium group-hover:text-white">
            偏好设置
          </span>
        </div>
      </main>

      {/* 3. Snap Assist 边缘吸附虚线占位框 */}
      {snapPreview && (
        <div style={getSnapPreviewStyle() || {}} className="snap-preview" />
      )}

      {/* 4. 窗口集合 (Z-Index Stack 管理) */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Cyber Terminal */}
        <WindowFrame
          window={systemState.windows.terminal}
          icon={<Terminal className="w-3.5 h-3.5 text-emerald-400" />}
          zIndex={BASE_Z_INDEX + windowStack.indexOf('terminal')}
          isActive={activeWindowId === 'terminal'}
          onFocus={() => bringToFront('terminal')}
          onClose={() => closeApp('terminal')}
          onMinimize={() => minimizeApp('terminal')}
          onToggleMaximize={() => toggleMaximizeApp('terminal')}
          onUpdatePosition={(x, y) => updatePosition('terminal', x, y)}
          onUpdateSize={(w, h) => updateSize('terminal', w, h)}
          onApplySnap={(mode) => applySnap('terminal', mode)}
          onSetSnapPreview={setSnapPreview}
        >
          <CyberTerminalApp />
        </WindowFrame>

        {/* Notepad Pro */}
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
          onApplySnap={(mode) => applySnap('notepad', mode)}
          onSetSnapPreview={setSnapPreview}
        >
          <NotepadProApp
            content={systemState.notepadContent}
            onUpdateContent={(content) =>
              setSystemState((prev) => ({ ...prev, notepadContent: content }))
            }
          />
        </WindowFrame>

        {/* Lo-Fi Player */}
        <WindowFrame
          window={systemState.windows.player}
          icon={<Music className="w-3.5 h-3.5 text-blue-400" />}
          zIndex={BASE_Z_INDEX + windowStack.indexOf('player')}
          isActive={activeWindowId === 'player'}
          onFocus={() => bringToFront('player')}
          onClose={() => closeApp('player')}
          onMinimize={() => minimizeApp('player')}
          onToggleMaximize={() => toggleMaximizeApp('player')}
          onUpdatePosition={(x, y) => updatePosition('player', x, y)}
          onUpdateSize={(w, h) => updateSize('player', w, h)}
          onApplySnap={(mode) => applySnap('player', mode)}
          onSetSnapPreview={setSnapPreview}
        >
          <AudioPlayerApp />
        </WindowFrame>

        {/* AI Studio */}
        <WindowFrame
          window={systemState.windows.aistudio}
          icon={<Sparkles className="w-3.5 h-3.5 text-purple-400" />}
          zIndex={BASE_Z_INDEX + windowStack.indexOf('aistudio')}
          isActive={activeWindowId === 'aistudio'}
          onFocus={() => bringToFront('aistudio')}
          onClose={() => closeApp('aistudio')}
          onMinimize={() => minimizeApp('aistudio')}
          onToggleMaximize={() => toggleMaximizeApp('aistudio')}
          onUpdatePosition={(x, y) => updatePosition('aistudio', x, y)}
          onUpdateSize={(w, h) => updateSize('aistudio', w, h)}
          onApplySnap={(mode) => applySnap('aistudio', mode)}
          onSetSnapPreview={setSnapPreview}
        >
          <AiStudioApp
            config={systemState.aiConfig}
            onUpdateConfig={(newConfig: AiStudioConfig) =>
              setSystemState((prev) => ({ ...prev, aiConfig: newConfig }))
            }
          />
        </WindowFrame>

        {/* Settings */}
        <WindowFrame
          window={systemState.windows.settings}
          icon={<SettingsIcon className="w-3.5 h-3.5 text-zinc-400" />}
          zIndex={BASE_Z_INDEX + windowStack.indexOf('settings')}
          isActive={activeWindowId === 'settings'}
          onFocus={() => bringToFront('settings')}
          onClose={() => closeApp('settings')}
          onMinimize={() => minimizeApp('settings')}
          onToggleMaximize={() => toggleMaximizeApp('settings')}
          onUpdatePosition={(x, y) => updatePosition('settings', x, y)}
          onUpdateSize={(w, h) => updateSize('settings', w, h)}
          onApplySnap={(mode) => applySnap('settings', mode)}
          onSetSnapPreview={setSnapPreview}
        >
          <SettingsApp
            currentWallpaper={systemState.wallpaper}
            onSetWallpaper={(wp) => setSystemState((prev) => ({ ...prev, wallpaper: wp }))}
            onResetSystem={handleResetSystem}
          />
        </WindowFrame>
      </div>

      {/* 5. 底部悬浮 Dock */}
      <Dock windows={systemState.windows} onToggleApp={handleToggleFromDock} />

      {/* 6. Spotlight 全局启动器 (⌘K / Ctrl+K) */}
      <Spotlight
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        onOpenApp={openApp}
        onRandomWallpaper={handleRandomWallpaper}
        onToggleFullscreen={() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        }}
      />

      {/* 7. 全局右键上下文菜单 */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onNewNote={() => openApp('notepad')}
          onOpenTerminal={() => openApp('terminal')}
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

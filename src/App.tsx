import React, { useState, useEffect, useCallback } from 'react';
import { Globe, Terminal, FileText, Music, Sparkles, Settings as SettingsIcon } from 'lucide-react';
import { AppId, SystemState, SnapMode, AiStudioConfig } from './types';
import { loadSavedState, saveSystemState, PRESET_WALLPAPERS, DEFAULT_STATE } from './utils/storage';
import { syncNetworkTime } from './utils/timeSync';
import { WindowsTaskbar } from './components/WindowsTaskbar';
import { StartMenu } from './components/StartMenu';
import { CalendarPopover } from './components/CalendarPopover';
import { ControlCenterPopover } from './components/ControlCenterPopover';
import { DesktopClockWidget } from './components/DesktopClockWidget';
import { ContextMenu } from './components/ContextMenu';
import { WindowFrame } from './components/WindowFrame';
import { Spotlight } from './components/Spotlight';
import { BrowserApp } from './apps/BrowserApp';
import { CyberTerminalApp } from './apps/CyberTerminalApp';
import { NotepadProApp } from './apps/NotepadProApp';
import { AudioPlayerApp } from './apps/AudioPlayerApp';
import { AiStudioApp } from './apps/AiStudioApp';
import { SettingsApp } from './apps/SettingsApp';

export const App: React.FC = () => {
  const [systemState, setSystemState] = useState<SystemState>(loadSavedState);
  const [windowStack, setWindowStack] = useState<AppId[]>(['terminal', 'browser', 'notepad', 'player', 'aistudio', 'settings']);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [snapPreview, setSnapPreview] = useState<SnapMode | null>(null);

  // 初始化网络时间同步
  useEffect(() => {
    syncNetworkTime();
  }, []);

  // 状态自动持久化
  useEffect(() => {
    saveSystemState(systemState);
  }, [systemState]);

  // 全局屏蔽原生右键菜单
  useEffect(() => {
    const handleGlobalContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const x = Math.min(e.clientX, window.innerWidth - 210);
      const y = Math.min(e.clientY, window.innerHeight - 240);
      setContextMenu({ x, y });
      setIsStartOpen(false);
      setIsCalendarOpen(false);
      setIsControlCenterOpen(false);
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

  // 任务栏点击调度
  const handleTaskClick = useCallback((id: AppId) => {
    const win = systemState.windows[id];
    const isTop = windowStack[windowStack.length - 1] === id;

    if (win.isMinimized) {
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
    setWindowStack(['terminal', 'browser', 'notepad', 'player', 'aistudio', 'settings']);
    localStorage.clear();
    window.location.reload();
  };

  const closeAllPopovers = () => {
    if (contextMenu) setContextMenu(null);
    if (isStartOpen) setIsStartOpen(false);
    if (isCalendarOpen) setIsCalendarOpen(false);
    if (isControlCenterOpen) setIsControlCenterOpen(false);
  };

  const activeWindowId = windowStack[windowStack.length - 1];
  const BASE_Z_INDEX = 100;

  // 边缘吸附虚线框样式 (贴齐底栏 48px)
  const getSnapPreviewStyle = (): React.CSSProperties | null => {
    if (!snapPreview) return null;
    if (snapPreview === 'left') {
      return { top: '6px', left: '6px', width: 'calc(50vw - 9px)', height: 'calc(100vh - 60px)' };
    }
    if (snapPreview === 'right') {
      return { top: '6px', left: 'calc(50vw + 3px)', width: 'calc(50vw - 9px)', height: 'calc(100vh - 60px)' };
    }
    if (snapPreview === 'maximize') {
      return { top: '6px', left: '6px', width: 'calc(100vw - 12px)', height: 'calc(100vh - 60px)' };
    }
    return null;
  };

  return (
    <div
      onClick={closeAllPopovers}
      style={{ filter: `brightness(${systemState.brightness}%)` }}
      className="w-screen h-screen overflow-hidden text-zinc-100 bg-[#09090b] select-none relative font-sans antialiased transition-[filter] duration-150"
    >
      {/* 1. 高清通透壁纸背景 (无死黑强制遮罩) */}
      <div
        style={{ backgroundImage: `url("${systemState.wallpaper}")` }}
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out z-0 filter contrast-105"
      />
      {/* 自定义动态通透蒙层 */}
      <div
        style={{ backgroundColor: `rgba(0, 0, 0, ${systemState.wallpaperOverlayOpacity / 100})` }}
        className="absolute inset-0 pointer-events-none z-[1] transition-colors duration-200"
      />

      {/* 2. 桌面醒目大时钟小组件 (Desktop Clock Widget) */}
      <DesktopClockWidget />

      {/* 3. 桌面图标网格 */}
      <main className="absolute inset-0 pt-6 pb-16 px-6 z-10 flex flex-col flex-wrap items-start content-start gap-3">
        {/* Web 浏览器 */}
        <div
          onClick={() => openApp('browser')}
          className="w-20 flex flex-col items-center group cursor-pointer p-2 rounded-xl hover:bg-white/[0.08] transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-zinc-950/80 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-150">
            <Globe className="w-5 h-5 text-blue-400" />
          </div>
          <span className="mt-1 text-xs text-zinc-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] text-center font-medium group-hover:text-white">
            Web 浏览器
          </span>
        </div>

        {/* Cyber Terminal */}
        <div
          onClick={() => openApp('terminal')}
          className="w-20 flex flex-col items-center group cursor-pointer p-2 rounded-xl hover:bg-white/[0.08] transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-zinc-950/80 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-150">
            <Terminal className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="mt-1 text-xs text-zinc-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] text-center font-medium group-hover:text-white">
            极客终端
          </span>
        </div>

        {/* Notepad Pro */}
        <div
          onClick={() => openApp('notepad')}
          className="w-20 flex flex-col items-center group cursor-pointer p-2 rounded-xl hover:bg-white/[0.08] transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-zinc-950/80 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-150">
            <FileText className="w-5 h-5 text-amber-400" />
          </div>
          <span className="mt-1 text-xs text-zinc-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] text-center font-medium group-hover:text-white">
            知识便签
          </span>
        </div>

        {/* Lo-Fi Player */}
        <div
          onClick={() => openApp('player')}
          className="w-20 flex flex-col items-center group cursor-pointer p-2 rounded-xl hover:bg-white/[0.08] transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-zinc-950/80 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-150">
            <Music className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="mt-1 text-xs text-zinc-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] text-center font-medium group-hover:text-white">
            音频电台
          </span>
        </div>

        {/* AI Studio */}
        <div
          onClick={() => openApp('aistudio')}
          className="w-20 flex flex-col items-center group cursor-pointer p-2 rounded-xl hover:bg-white/[0.08] transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-zinc-950/80 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-150">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <span className="mt-1 text-xs text-zinc-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] text-center font-medium group-hover:text-white">
            AI 工作舱
          </span>
        </div>

        {/* Settings */}
        <div
          onClick={() => openApp('settings')}
          className="w-20 flex flex-col items-center group cursor-pointer p-2 rounded-xl hover:bg-white/[0.08] transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-zinc-950/80 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-150">
            <SettingsIcon className="w-5 h-5 text-zinc-400" />
          </div>
          <span className="mt-1 text-xs text-zinc-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] text-center font-medium group-hover:text-white">
            系统设置
          </span>
        </div>
      </main>

      {/* 4. Snap Assist 边缘吸附虚线占位框 */}
      {snapPreview && (
        <div style={getSnapPreviewStyle() || {}} className="snap-preview" />
      )}

      {/* 5. 窗口集合 (Z-Index Stack 管理) */}
      <div className="absolute inset-0 pointer-events-none z-20 pb-12">
        {/* Web Browser Pro */}
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
          onApplySnap={(mode) => applySnap('browser', mode)}
          onSetSnapPreview={setSnapPreview}
        >
          <BrowserApp />
        </WindowFrame>

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
          icon={<Music className="w-3.5 h-3.5 text-cyan-400" />}
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
            brightness={systemState.brightness}
            onBrightnessChange={(b) => setSystemState((prev) => ({ ...prev, brightness: b }))}
            overlayOpacity={systemState.wallpaperOverlayOpacity}
            onOverlayOpacityChange={(o) => setSystemState((prev) => ({ ...prev, wallpaperOverlayOpacity: o }))}
            onResetSystem={handleResetSystem}
          />
        </WindowFrame>
      </div>

      {/* 6. Windows 风格置底任务栏 (Windows Taskbar 48px) */}
      <WindowsTaskbar
        windows={systemState.windows}
        activeWindowId={activeWindowId}
        isStartOpen={isStartOpen}
        onToggleStart={() => {
          setIsStartOpen((prev) => !prev);
          setIsCalendarOpen(false);
          setIsControlCenterOpen(false);
        }}
        isCalendarOpen={isCalendarOpen}
        onToggleCalendar={() => {
          setIsCalendarOpen((prev) => !prev);
          setIsStartOpen(false);
          setIsControlCenterOpen(false);
        }}
        isControlCenterOpen={isControlCenterOpen}
        onToggleControlCenter={() => {
          setIsControlCenterOpen((prev) => !prev);
          setIsStartOpen(false);
          setIsCalendarOpen(false);
        }}
        onTaskClick={handleTaskClick}
      />

      {/* 7. Windows 浮动开始菜单 (Start Menu) */}
      <StartMenu
        isOpen={isStartOpen}
        onClose={() => setIsStartOpen(false)}
        onOpenApp={openApp}
        onResetSystem={handleResetSystem}
      />

      {/* 8. Windows 11 风格悬浮毛玻璃月历面板 (Calendar Popover) */}
      {isCalendarOpen && (
        <CalendarPopover onClose={() => setIsCalendarOpen(false)} />
      )}

      {/* 9. 系统控制中心面板 (Control Center Popover) */}
      {isControlCenterOpen && (
        <ControlCenterPopover
          brightness={systemState.brightness}
          onBrightnessChange={(b) => setSystemState((prev) => ({ ...prev, brightness: b }))}
          volume={systemState.systemVolume}
          onVolumeChange={(v) => setSystemState((prev) => ({ ...prev, systemVolume: v }))}
          overlayOpacity={systemState.wallpaperOverlayOpacity}
          onOverlayOpacityChange={(o) => setSystemState((prev) => ({ ...prev, wallpaperOverlayOpacity: o }))}
          onClose={() => setIsControlCenterOpen(false)}
        />
      )}

      {/* 10. 全局 Spotlight 快速启动器 (⌘K / Ctrl+K) */}
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

      {/* 11. 全局右键上下文菜单 */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onOpenBrowser={() => openApp('browser')}
          onOpenTerminal={() => openApp('terminal')}
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

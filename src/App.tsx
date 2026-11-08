import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Globe, Terminal, FileText, Music, Sparkles, Settings as SettingsIcon, Activity } from 'lucide-react';
import { AppId, SystemState, SnapMode, AiStudioConfig } from './types';
import { loadSavedState, saveSystemState, PRESET_WALLPAPERS, DEFAULT_STATE } from './utils/storage';
import { syncNetworkTime } from './utils/timeSync';
import { WindowsTaskbar } from './components/WindowsTaskbar';
import { StartMenu } from './components/StartMenu';
import { CalendarPopover } from './components/CalendarPopover';
import { ControlCenterPopover } from './components/ControlCenterPopover';
import { ContextMenu } from './components/ContextMenu';
import { WindowFrame } from './components/WindowFrame';
import { Spotlight } from './components/Spotlight';
import { TaskSwitcher } from './components/TaskSwitcher';
import { BrowserApp } from './apps/BrowserApp';
import { CyberTerminalApp } from './apps/CyberTerminalApp';
import { NotepadProApp } from './apps/NotepadProApp';
import { AudioPlayerApp } from './apps/AudioPlayerApp';
import { AiStudioApp } from './apps/AiStudioApp';
import { TaskManagerApp } from './apps/TaskManagerApp';
import { SettingsApp } from './apps/SettingsApp';

export const App: React.FC = () => {
  const [systemState, setSystemState] = useState<SystemState>(loadSavedState);
  const [windowStack, setWindowStack] = useState<AppId[]>([
    'terminal',
    'browser',
    'notepad',
    'player',
    'aistudio',
    'taskmanager',
    'settings',
  ]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [snapPreview, setSnapPreview] = useState<SnapMode | null>(null);

  // 多任务 Alt+Tab 切换器状态
  const [isTaskSwitcherOpen, setIsTaskSwitcherOpen] = useState(false);
  const [switcherIndex, setSwitcherIndex] = useState(0);

  // 桌面框选多选状态
  const [selectionBox, setSelectionBox] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);
  const [selectedAppIds, setSelectedAppIds] = useState<AppId[]>([]);
  const [isDesktopRefreshing, setIsDesktopRefreshing] = useState(false);
  const desktopMainRef = useRef<HTMLElement>(null);

  // 初始化网络时间同步
  useEffect(() => {
    syncNetworkTime();
  }, []);

  // 状态自动持久化
  useEffect(() => {
    saveSystemState(systemState);
  }, [systemState]);

  // 打开/还原窗口
  const bringToFront = useCallback((id: AppId) => {
    setWindowStack((prev) => {
      const filtered = prev.filter((item) => item !== id);
      return [...filtered, id];
    });
  }, []);

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

  // 全局屏蔽原生右键菜单 (仅在桌面空白处弹出全局菜单，任务栏与窗口内部由其自身右键接管)
  useEffect(() => {
    const handleGlobalContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const target = e.target as HTMLElement;
      if (target.closest('footer') || target.closest('.glass-panel')) {
        return;
      }
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

  // 桌面刷新微动 (Windows F5 体验)
  const handleRefreshDesktop = useCallback(() => {
    setIsDesktopRefreshing(true);
    setSelectedAppIds([]);
    setTimeout(() => setIsDesktopRefreshing(false), 150);
  }, []);

  // 全局快捷键监听 (⌘K / Ctrl+K 搜索，Ctrl+Shift+Esc 任务管理器，Alt+Tab 任务切换，F5 刷新)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSpotlightOpen((prev) => !prev);
      } else if (e.ctrlKey && e.shiftKey && e.key === 'Escape') {
        e.preventDefault();
        openApp('taskmanager');
      } else if (e.key === 'F5') {
        e.preventDefault();
        handleRefreshDesktop();
      } else if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        const opened = [...windowStack].reverse().filter((id) => systemState.windows[id]?.isOpen);
        if (opened.length > 0) {
          setIsTaskSwitcherOpen(true);
          setSwitcherIndex((prev) => (prev + 1) % opened.length);
        }
      } else if (e.key === 'Enter' && selectedAppIds.length > 0) {
        selectedAppIds.forEach((id) => openApp(id));
        setSelectedAppIds([]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt' && isTaskSwitcherOpen) {
        const opened = [...windowStack].reverse().filter((id) => systemState.windows[id]?.isOpen);
        if (opened[switcherIndex]) {
          openApp(opened[switcherIndex]);
        }
        setIsTaskSwitcherOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [openApp, windowStack, systemState.windows, isTaskSwitcherOpen, switcherIndex, selectedAppIds]);

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

  // 显示桌面 (最小化全部)
  const minimizeAll = useCallback(() => {
    setSystemState((prev) => {
      const nextWin = { ...prev.windows };
      (Object.keys(nextWin) as AppId[]).forEach((id) => {
        if (nextWin[id].isOpen) {
          nextWin[id] = { ...nextWin[id], isMinimized: true };
        }
      });
      return { ...prev, windows: nextWin };
    });
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
    setWindowStack(['terminal', 'browser', 'notepad', 'player', 'aistudio', 'taskmanager', 'settings']);
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

  // 桌面空白处鼠标框选 (Marquee Selection)
  const handleDesktopPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('.group') || target.closest('.glass-panel') || target.closest('footer')) return;

    setSelectionBox({
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
    });
    setSelectedAppIds([]);
  };

  const handleDesktopPointerMove = (e: React.PointerEvent) => {
    if (!selectionBox) return;

    const currentX = e.clientX;
    const currentY = e.clientY;
    setSelectionBox((prev) => (prev ? { ...prev, currentX, currentY } : null));

    const boxLeft = Math.min(selectionBox.startX, currentX);
    const boxRight = Math.max(selectionBox.startX, currentX);
    const boxTop = Math.min(selectionBox.startY, currentY);
    const boxBottom = Math.max(selectionBox.startY, currentY);

    const iconElements = document.querySelectorAll<HTMLElement>('[data-app-id]');
    const newSelected: AppId[] = [];

    iconElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const isOverlap = !(
        rect.right < boxLeft ||
        rect.left > boxRight ||
        rect.bottom < boxTop ||
        rect.top > boxBottom
      );
      const appId = el.dataset.appId as AppId;
      if (isOverlap && appId) {
        newSelected.push(appId);
      }
    });

    setSelectedAppIds(newSelected);
  };

  const handleDesktopPointerUp = () => {
    setSelectionBox(null);
  };

  return (
    <div
      onClick={closeAllPopovers}
      onPointerDown={handleDesktopPointerDown}
      onPointerMove={handleDesktopPointerMove}
      onPointerUp={handleDesktopPointerUp}
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

      {/* 2. 桌面图标网格 (小屏与移动端响应式，纯净桌面无遮挡) */}
      <main
        className={`absolute inset-0 pt-3 sm:pt-6 pb-16 px-3 sm:px-6 z-10 flex flex-col flex-wrap items-start content-start gap-1 sm:gap-3 transition-opacity duration-150 ${
          isDesktopRefreshing ? 'opacity-40 scale-[0.998]' : 'opacity-100 scale-100'
        }`}
      >
        {/* Web 浏览器 */}
        <div
          data-app-id="browser"
          onClick={() => openApp('browser')}
          className={`w-16 sm:w-20 flex flex-col items-center group cursor-pointer p-1.5 sm:p-2 rounded-xl transition-all ${
            selectedAppIds.includes('browser')
              ? 'ring-2 ring-blue-500/80 bg-blue-500/20 shadow-lg'
              : 'hover:bg-white/[0.08] active:bg-white/15'
          }`}
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-zinc-950/80 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-150">
            <Globe className="w-5 h-5 text-blue-400" />
          </div>
          <span className="mt-1 text-[11px] sm:text-xs text-zinc-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] text-center font-medium group-hover:text-white">
            Web 浏览器
          </span>
        </div>

        {/* 任务管理器 (Windows 风格) */}
        <div
          data-app-id="taskmanager"
          onClick={() => openApp('taskmanager')}
          className={`w-16 sm:w-20 flex flex-col items-center group cursor-pointer p-1.5 sm:p-2 rounded-xl transition-all ${
            selectedAppIds.includes('taskmanager')
              ? 'ring-2 ring-blue-500/80 bg-blue-500/20 shadow-lg'
              : 'hover:bg-white/[0.08] active:bg-white/15'
          }`}
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-zinc-950/80 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-150">
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <span className="mt-1 text-[11px] sm:text-xs text-zinc-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] text-center font-medium group-hover:text-white">
            任务管理器
          </span>
        </div>

        {/* Cyber Terminal */}
        <div
          data-app-id="terminal"
          onClick={() => openApp('terminal')}
          className={`w-16 sm:w-20 flex flex-col items-center group cursor-pointer p-1.5 sm:p-2 rounded-xl transition-all ${
            selectedAppIds.includes('terminal')
              ? 'ring-2 ring-blue-500/80 bg-blue-500/20 shadow-lg'
              : 'hover:bg-white/[0.08] active:bg-white/15'
          }`}
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-zinc-950/80 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-150">
            <Terminal className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="mt-1 text-[11px] sm:text-xs text-zinc-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] text-center font-medium group-hover:text-white">
            极客终端
          </span>
        </div>

        {/* Notepad Pro */}
        <div
          data-app-id="notepad"
          onClick={() => openApp('notepad')}
          className={`w-16 sm:w-20 flex flex-col items-center group cursor-pointer p-1.5 sm:p-2 rounded-xl transition-all ${
            selectedAppIds.includes('notepad')
              ? 'ring-2 ring-blue-500/80 bg-blue-500/20 shadow-lg'
              : 'hover:bg-white/[0.08] active:bg-white/15'
          }`}
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-zinc-950/80 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-150">
            <FileText className="w-5 h-5 text-amber-400" />
          </div>
          <span className="mt-1 text-[11px] sm:text-xs text-zinc-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] text-center font-medium group-hover:text-white">
            知识便签
          </span>
        </div>

        {/* Lo-Fi Player */}
        <div
          data-app-id="player"
          onClick={() => openApp('player')}
          className={`w-16 sm:w-20 flex flex-col items-center group cursor-pointer p-1.5 sm:p-2 rounded-xl transition-all ${
            selectedAppIds.includes('player')
              ? 'ring-2 ring-blue-500/80 bg-blue-500/20 shadow-lg'
              : 'hover:bg-white/[0.08] active:bg-white/15'
          }`}
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-zinc-950/80 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-150">
            <Music className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="mt-1 text-[11px] sm:text-xs text-zinc-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] text-center font-medium group-hover:text-white">
            音频电台
          </span>
        </div>

        {/* AI Studio */}
        <div
          data-app-id="aistudio"
          onClick={() => openApp('aistudio')}
          className={`w-16 sm:w-20 flex flex-col items-center group cursor-pointer p-1.5 sm:p-2 rounded-xl transition-all ${
            selectedAppIds.includes('aistudio')
              ? 'ring-2 ring-blue-500/80 bg-blue-500/20 shadow-lg'
              : 'hover:bg-white/[0.08] active:bg-white/15'
          }`}
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-zinc-950/80 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-150">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <span className="mt-1 text-[11px] sm:text-xs text-zinc-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] text-center font-medium group-hover:text-white">
            AI 工作舱
          </span>
        </div>

        {/* Settings */}
        <div
          data-app-id="settings"
          onClick={() => openApp('settings')}
          className={`w-16 sm:w-20 flex flex-col items-center group cursor-pointer p-1.5 sm:p-2 rounded-xl transition-all ${
            selectedAppIds.includes('settings')
              ? 'ring-2 ring-blue-500/80 bg-blue-500/20 shadow-lg'
              : 'hover:bg-white/[0.08] active:bg-white/15'
          }`}
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-zinc-950/80 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-150">
            <SettingsIcon className="w-5 h-5 text-zinc-400" />
          </div>
          <span className="mt-1 text-[11px] sm:text-xs text-zinc-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] text-center font-medium group-hover:text-white">
            系统设置
          </span>
        </div>
      </main>

      {/* 桌面半透明矩形拉框选择 (Marquee Selection Overlay) */}
      {selectionBox && (
        <div
          style={{
            left: `${Math.min(selectionBox.startX, selectionBox.currentX)}px`,
            top: `${Math.min(selectionBox.startY, selectionBox.currentY)}px`,
            width: `${Math.abs(selectionBox.currentX - selectionBox.startX)}px`,
            height: `${Math.abs(selectionBox.currentY - selectionBox.startY)}px`,
          }}
          className="fixed border border-blue-400/80 bg-blue-500/15 pointer-events-none z-[9990] rounded-sm transition-none shadow-sm"
        />
      )}

      {/* 3. Snap Assist 边缘吸附虚线占位框 */}
      {snapPreview && (
        <div style={getSnapPreviewStyle() || {}} className="snap-preview" />
      )}

      {/* 4. 窗口集合 (Z-Index Stack 管理) */}
      <div className="absolute inset-0 pointer-events-none z-20 pb-12">
        {/* Task Manager (Windows 任务管理器) */}
        <WindowFrame
          window={systemState.windows.taskmanager}
          icon={<Activity className="w-3.5 h-3.5 text-blue-500" />}
          zIndex={BASE_Z_INDEX + windowStack.indexOf('taskmanager')}
          isActive={activeWindowId === 'taskmanager'}
          onFocus={() => bringToFront('taskmanager')}
          onClose={() => closeApp('taskmanager')}
          onMinimize={() => minimizeApp('taskmanager')}
          onToggleMaximize={() => toggleMaximizeApp('taskmanager')}
          onUpdatePosition={(x, y) => updatePosition('taskmanager', x, y)}
          onUpdateSize={(w, h) => updateSize('taskmanager', w, h)}
          onApplySnap={(mode) => applySnap('taskmanager', mode)}
          onSetSnapPreview={setSnapPreview}
        >
          <TaskManagerApp
            windows={systemState.windows}
            onCloseApp={closeApp}
            onOpenApp={openApp}
          />
        </WindowFrame>

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

      {/* 5. Windows 风格置底任务栏 (Windows Taskbar 48px) */}
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
        onOpenTaskManager={() => openApp('taskmanager')}
        onOpenSettings={() => openApp('settings')}
        onToggleTaskSwitcher={() => setIsTaskSwitcherOpen(true)}
        onCloseApp={closeApp}
        onMinimizeAll={minimizeAll}
      />

      {/* 6. Windows 浮动开始菜单 (Start Menu) */}
      <StartMenu
        isOpen={isStartOpen}
        onClose={() => setIsStartOpen(false)}
        onOpenApp={openApp}
        onResetSystem={handleResetSystem}
      />

      {/* 7. Windows 11 风格悬浮毛玻璃月历面板 (Calendar Popover) */}
      {isCalendarOpen && (
        <CalendarPopover onClose={() => setIsCalendarOpen(false)} />
      )}

      {/* 8. 系统控制中心面板 (Control Center Popover) */}
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

      {/* 9. 全局 Spotlight 快速启动器 (⌘K / Ctrl+K) */}
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

      {/* 10. 全局右键上下文菜单 */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onOpenBrowser={() => openApp('browser')}
          onOpenTerminal={() => openApp('terminal')}
          onOpenTaskManager={() => openApp('taskmanager')}
          onNewNote={() => openApp('notepad')}
          onRandomWallpaper={handleRandomWallpaper}
          onRefreshDesktop={handleRefreshDesktop}
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

      {/* 11. Alt + Tab 多任务窗口平视切换器 */}
      <TaskSwitcher
        isOpen={isTaskSwitcherOpen}
        windows={systemState.windows}
        windowStack={windowStack}
        selectedIndex={switcherIndex}
        onSelectIndex={setSwitcherIndex}
        onConfirm={(id) => openApp(id)}
        onClose={() => setIsTaskSwitcherOpen(false)}
      />
    </div>
  );
};

export default App;

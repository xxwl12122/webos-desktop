import React, { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal, Wifi, WifiOff, Globe, Terminal, FileText, Music, Sparkles, Settings, Activity, Monitor, RotateCw, Layers, X } from 'lucide-react';
import { AppId, WindowState } from '../types';
import { getSyncedDate } from '../utils/timeSync';

interface WindowsTaskbarProps {
  windows: Record<AppId, WindowState>;
  activeWindowId: AppId | undefined;
  isStartOpen: boolean;
  onToggleStart: () => void;
  isCalendarOpen: boolean;
  onToggleCalendar: () => void;
  isControlCenterOpen: boolean;
  onToggleControlCenter: () => void;
  onTaskClick: (id: AppId) => void;
  onOpenTaskManager: () => void;
  onOpenSettings?: () => void;
  onToggleTaskSwitcher?: () => void;
  onCloseApp?: (id: AppId) => void;
  onMinimizeAll: () => void;
}

export const WindowsTaskbar: React.FC<WindowsTaskbarProps> = ({
  windows,
  activeWindowId,
  isStartOpen,
  onToggleStart,
  isCalendarOpen,
  onToggleCalendar,
  isControlCenterOpen,
  onToggleControlCenter,
  onTaskClick,
  onOpenTaskManager,
  onOpenSettings,
  onToggleTaskSwitcher,
  onCloseApp,
  onMinimizeAll,
}) => {
  const [date, setDate] = useState<Date>(getSyncedDate);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [taskbarContextMenu, setTaskbarContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [hoveredAppId, setHoveredAppId] = useState<AppId | null>(null);
  const [previewPos, setPreviewPos] = useState<{ x: number } | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(getSyncedDate());
    }, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleWindowClick = () => setTaskbarContextMenu(null);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('click', handleWindowClick);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('click', handleWindowClick);
    };
  }, []);

  const timeStr = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateStr = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;

  const appIcons: Record<AppId, React.ReactNode> = {
    browser: <Globe className="w-4 h-4 text-blue-400" />,
    terminal: <Terminal className="w-4 h-4 text-emerald-400" />,
    notepad: <FileText className="w-4 h-4 text-amber-400" />,
    player: <Music className="w-4 h-4 text-cyan-400" />,
    aistudio: <Sparkles className="w-4 h-4 text-purple-400" />,
    taskmanager: <Activity className="w-4 h-4 text-blue-500" />,
    settings: <Settings className="w-4 h-4 text-zinc-400" />,
  };

  const openedWindows = (Object.keys(windows) as AppId[]).filter((id) => windows[id].isOpen);

  // 任务栏右键菜单 (经典 Windows 行为)
  const handleTaskbarContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTaskbarContextMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <footer
      onContextMenu={handleTaskbarContextMenu}
      onClick={() => taskbarContextMenu && setTaskbarContextMenu(null)}
      className="absolute bottom-0 left-0 right-0 h-12 w-full bg-zinc-950/85 backdrop-blur-2xl border-t border-white/[0.08] z-[9990] flex items-center justify-between px-2 select-none"
    >
      {/* 1. 左侧【开始菜单】按钮 */}
      <div className="flex items-center space-x-1.5 shrink-0">
        <button
          onClick={onToggleStart}
          className={`h-9 px-3 rounded-lg flex items-center justify-center transition-all ${
            isStartOpen
              ? 'bg-white/15 text-blue-400'
              : 'hover:bg-white/[0.08] text-zinc-300 hover:text-white'
          }`}
          title="开始菜单"
        >
          {/* Windows 经典 4 块磁贴微标 */}
          <div className="grid grid-cols-2 gap-0.5">
            <div className="w-2 h-2 rounded-[1.5px] bg-blue-500" />
            <div className="w-2 h-2 rounded-[1.5px] bg-cyan-400" />
            <div className="w-2 h-2 rounded-[1.5px] bg-indigo-500" />
            <div className="w-2 h-2 rounded-[1.5px] bg-sky-400" />
          </div>
        </button>
      </div>

      {/* 2. 中间【正在运行的窗口标签栏】 */}
      <div className="flex-1 flex items-center space-x-1 px-1 sm:px-2 overflow-x-auto no-scrollbar">
        {openedWindows.map((id) => {
          const win = windows[id];
          const isActive = activeWindowId === id && !win.isMinimized;

          return (
            <button
              key={id}
              onClick={() => {
                onTaskClick(id);
                setHoveredAppId(null);
              }}
              onMouseEnter={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                hoverTimerRef.current = setTimeout(() => {
                  setHoveredAppId(id);
                  setPreviewPos({ x: centerX });
                }, 250);
              }}
              onMouseLeave={() => {
                if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                setHoveredAppId(null);
              }}
              className={`h-9 px-2 sm:px-3 rounded-lg max-w-[110px] sm:max-w-[180px] shrink-0 sm:shrink flex items-center space-x-1.5 sm:space-x-2 transition-all border-b-2 text-xs truncate ${
                isActive
                  ? 'bg-white/[0.08] text-zinc-100 border-blue-500 shadow-sm'
                  : 'bg-transparent hover:bg-white/[0.05] text-zinc-400 hover:text-zinc-200 border-transparent'
              }`}
              title={win.title}
            >
              <span className="shrink-0">{appIcons[id]}</span>
              <span className="truncate font-medium">{win.title}</span>
            </button>
          );
        })}
      </div>

      {/* 3. 右侧【系统托盘区】 */}
      <div className="flex items-center space-x-1 shrink-0 text-zinc-400">
        {/* 控制中心快捷展开按钮 */}
        <button
          onClick={onToggleControlCenter}
          className={`h-9 px-2 rounded-lg flex items-center space-x-1.5 transition-colors ${
            isControlCenterOpen ? 'bg-white/15 text-zinc-100' : 'hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200'
          }`}
          title="系统控制中心"
        >
          {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-rose-400" />}
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>

        {/* Windows 经典双行时间日期按钮 */}
        <button
          onClick={onToggleCalendar}
          className={`h-9 px-2 sm:px-2.5 rounded-lg flex flex-col items-end justify-center transition-colors font-mono leading-tight text-right ${
            isCalendarOpen ? 'bg-white/15 text-zinc-100' : 'hover:bg-white/[0.08] text-zinc-300 hover:text-white'
          }`}
          title="点击查看日历小组件"
        >
          <span className="text-[11px] font-medium tracking-tight text-zinc-200">{timeStr}</span>
          <span className="text-[10px] text-zinc-400 hidden xs:inline sm:inline">{dateStr}</span>
        </button>
      </div>

      {/* 任务栏专属右键菜单 (经典 Windows 11 风格) */}
      {taskbarContextMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            left: `${Math.max(8, Math.min(taskbarContextMenu.x - 20, window.innerWidth - 220))}px`,
            bottom: '52px',
          }}
          className="fixed z-[99999] w-52 rounded-xl bg-zinc-950/95 border border-white/10 p-1.5 shadow-2xl shadow-black/90 backdrop-blur-2xl text-xs text-zinc-300 divide-y divide-zinc-800/80 animate-in fade-in duration-100 select-none"
        >
          <div className="py-1">
            <button
              onClick={() => {
                onOpenTaskManager();
                setTaskbarContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-zinc-800 hover:text-white flex items-center justify-between transition-colors group cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <Activity className="w-4 h-4 text-blue-400 group-hover:scale-105 transition-transform" />
                <span className="font-medium text-zinc-100">任务管理器</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Ctrl+Shift+Esc</span>
            </button>
          </div>

          <div className="py-1 space-y-0.5">
            {onToggleTaskSwitcher && (
              <button
                onClick={() => {
                  onToggleTaskSwitcher();
                  setTaskbarContextMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-zinc-800 hover:text-white flex items-center space-x-2.5 transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                <span>任务视图 (Alt+Tab)</span>
              </button>
            )}

            <button
              onClick={() => {
                onMinimizeAll();
                setTaskbarContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-zinc-800 hover:text-white flex items-center space-x-2.5 transition-colors cursor-pointer"
            >
              <Monitor className="w-3.5 h-3.5 text-zinc-400" />
              <span>显示桌面</span>
            </button>

            {onOpenSettings && (
              <button
                onClick={() => {
                  onOpenSettings();
                  setTaskbarContextMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-zinc-800 hover:text-white flex items-center space-x-2.5 transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-zinc-400" />
                <span>任务栏与系统设置</span>
              </button>
            )}

            <button
              onClick={() => {
                window.location.reload();
              }}
              className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-zinc-800 hover:text-white flex items-center space-x-2.5 transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-zinc-400" />
              <span>重启桌面环境</span>
            </button>
          </div>
        </div>
      )}
      {/* 4. 任务栏卡片 Hover 动态缩略图预览卡片 (Windows 11 Hover Preview) */}
      {hoveredAppId && previewPos && windows[hoveredAppId] && windows[hoveredAppId].isOpen && (
        <div
          style={{
            left: `${Math.max(12, Math.min(previewPos.x - 100, window.innerWidth - 220))}px`,
            bottom: '52px',
          }}
          onMouseEnter={() => {
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
          }}
          onMouseLeave={() => setHoveredAppId(null)}
          className="fixed z-[99995] w-52 rounded-xl bg-zinc-950/95 border border-white/10 p-2.5 shadow-2xl shadow-black/90 backdrop-blur-2xl text-xs text-zinc-300 pointer-events-auto select-none animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80">
            <div className="flex items-center space-x-2 truncate">
              {appIcons[hoveredAppId]}
              <span className="font-medium text-zinc-200 truncate text-[11px]">{windows[hoveredAppId].title}</span>
            </div>
            {onCloseApp && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseApp(hoveredAppId);
                  setHoveredAppId(null);
                }}
                className="p-1 rounded hover:bg-red-500 hover:text-white text-zinc-400 transition-colors"
                title="关闭"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* 实时微缩意象视图 */}
          <div
            onClick={() => {
              onTaskClick(hoveredAppId);
              setHoveredAppId(null);
            }}
            className="mt-2 h-24 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-blue-500/60 cursor-pointer p-2 flex flex-col justify-between transition-colors overflow-hidden group"
          >
            <div className="w-full flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span>{windows[hoveredAppId].isMinimized ? '后台挂起' : '前台活动'}</span>
              <span className="text-blue-400 group-hover:underline">点击聚焦</span>
            </div>
            <div className="flex items-center justify-center text-zinc-500 group-hover:scale-110 transition-transform">
              {appIcons[hoveredAppId]}
            </div>
            <div className="text-[10px] text-zinc-400 truncate text-center">
              {windows[hoveredAppId].title}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Wifi, WifiOff, Globe, Terminal, FileText, Music, Sparkles, Settings, Activity, Monitor, RotateCw } from 'lucide-react';
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
  onMinimizeAll,
}) => {
  const [date, setDate] = useState<Date>(getSyncedDate);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [taskbarContextMenu, setTaskbarContextMenu] = useState<{ x: number; y: number } | null>(null);

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
              onClick={() => onTaskClick(id)}
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
    </footer>
  );
};

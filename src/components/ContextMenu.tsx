import React from 'react';
import { Globe, Terminal, FilePlus, Image as ImageIcon, Maximize, Settings, RotateCw, Activity } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onOpenBrowser: () => void;
  onOpenTerminal: () => void;
  onOpenTaskManager?: () => void;
  onNewNote: () => void;
  onRandomWallpaper: () => void;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
  onRefreshDesktop?: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  onOpenBrowser,
  onOpenTerminal,
  onOpenTaskManager,
  onNewNote,
  onRandomWallpaper,
  onToggleFullscreen,
  onOpenSettings,
  onRefreshDesktop,
}) => {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ left: `${Math.max(8, x)}px`, top: `${Math.max(8, y)}px` }}
      className="fixed z-[99999] w-52 max-w-[calc(100vw-16px)] rounded-xl bg-zinc-950/95 border border-white/10 py-1.5 shadow-2xl shadow-black/80 backdrop-blur-2xl text-xs text-zinc-300 divide-y divide-zinc-800/80 animate-in fade-in duration-100 select-none"
    >
      <div className="py-1">
        <button
          onClick={() => {
            onOpenBrowser();
            onClose();
          }}
          className="w-full text-left px-3 py-1.5 hover:bg-zinc-800/80 active:bg-zinc-800 hover:text-white flex items-center space-x-2.5 transition-colors cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span>打开 Web 浏览器</span>
        </button>
        <button
          onClick={() => {
            onOpenTerminal();
            onClose();
          }}
          className="w-full text-left px-3 py-1.5 hover:bg-zinc-800/80 active:bg-zinc-800 hover:text-white flex items-center space-x-2.5 transition-colors cursor-pointer"
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>打开系统终端</span>
        </button>
        {onOpenTaskManager && (
          <button
            onClick={() => {
              onOpenTaskManager();
              onClose();
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-zinc-800/80 active:bg-zinc-800 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              <span>任务管理器</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">Ctrl+Shift+Esc</span>
          </button>
        )}
        <button
          onClick={() => {
            onNewNote();
            onClose();
          }}
          className="w-full text-left px-3 py-1.5 hover:bg-zinc-800/80 active:bg-zinc-800 hover:text-white flex items-center space-x-2.5 transition-colors cursor-pointer"
        >
          <FilePlus className="w-3.5 h-3.5 text-amber-400" />
          <span>新建知识便签</span>
        </button>
        <button
          onClick={() => {
            onRandomWallpaper();
            onClose();
          }}
          className="w-full text-left px-3 py-1.5 hover:bg-zinc-800/80 active:bg-zinc-800 hover:text-white flex items-center space-x-2.5 transition-colors cursor-pointer"
        >
          <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>换一张高清壁纸</span>
        </button>
      </div>

      <div className="py-1">
        <button
          onClick={() => {
            if (onRefreshDesktop) {
              onRefreshDesktop();
            } else {
              window.location.reload();
            }
            onClose();
          }}
          className="w-full text-left px-3 py-1.5 hover:bg-zinc-800/80 active:bg-zinc-800 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2.5">
            <RotateCw className="w-3.5 h-3.5 text-zinc-400" />
            <span>刷新桌面</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">F5</span>
        </button>
        <button
          onClick={() => {
            onToggleFullscreen();
            onClose();
          }}
          className="w-full text-left px-3 py-1.5 hover:bg-zinc-800/80 active:bg-zinc-800 hover:text-white flex items-center space-x-2.5 transition-colors cursor-pointer"
        >
          <Maximize className="w-3.5 h-3.5 text-zinc-400" />
          <span>进入 / 退出全屏</span>
        </button>
        <button
          onClick={() => {
            onOpenSettings();
            onClose();
          }}
          className="w-full text-left px-3 py-1.5 hover:bg-zinc-800/80 active:bg-zinc-800 hover:text-white flex items-center space-x-2.5 transition-colors cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5 text-zinc-400" />
          <span>显示与系统设置</span>
        </button>
      </div>
    </div>
  );
};

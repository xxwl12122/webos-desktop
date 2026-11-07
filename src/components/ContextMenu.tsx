import React from 'react';
import { FilePlus, Image as ImageIcon, Maximize, Settings, RotateCw } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onNewNote: () => void;
  onRandomWallpaper: () => void;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  onNewNote,
  onRandomWallpaper,
  onToggleFullscreen,
  onOpenSettings,
}) => {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ left: `${x}px`, top: `${y}px` }}
      className="fixed z-[9999] w-48 rounded-xl glass-panel py-1.5 shadow-2xl border border-white/15 text-xs text-slate-200 divide-y divide-white/5"
    >
      <div className="py-1">
        <button
          onClick={() => {
            onNewNote();
            onClose();
          }}
          className="w-full text-left px-3.5 py-1.5 hover:bg-blue-600/30 hover:text-white flex items-center space-x-2 transition-colors"
        >
          <FilePlus className="w-3.5 h-3.5 text-amber-400" />
          <span>新建随手记</span>
        </button>
        <button
          onClick={() => {
            onRandomWallpaper();
            onClose();
          }}
          className="w-full text-left px-3.5 py-1.5 hover:bg-blue-600/30 hover:text-white flex items-center space-x-2 transition-colors"
        >
          <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
          <span>随机换一张壁纸</span>
        </button>
      </div>

      <div className="py-1">
        <button
          onClick={() => {
            onToggleFullscreen();
            onClose();
          }}
          className="w-full text-left px-3.5 py-1.5 hover:bg-blue-600/30 hover:text-white flex items-center space-x-2 transition-colors"
        >
          <Maximize className="w-3.5 h-3.5 text-slate-300" />
          <span>进入 / 退出全屏</span>
        </button>
        <button
          onClick={() => {
            onOpenSettings();
            onClose();
          }}
          className="w-full text-left px-3.5 py-1.5 hover:bg-blue-600/30 hover:text-white flex items-center space-x-2 transition-colors"
        >
          <Settings className="w-3.5 h-3.5 text-slate-300" />
          <span>系统设置</span>
        </button>
        <button
          onClick={() => {
            window.location.reload();
          }}
          className="w-full text-left px-3.5 py-1.5 hover:bg-blue-600/30 hover:text-white flex items-center space-x-2 transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5 text-slate-300" />
          <span>刷新桌面系统</span>
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { Sun, Volume2, Maximize, Minimize, Wifi, WifiOff } from 'lucide-react';

interface ControlCenterPopoverProps {
  brightness: number;
  onBrightnessChange: (v: number) => void;
  volume: number;
  onVolumeChange: (v: number) => void;
  overlayOpacity: number;
  onOverlayOpacityChange: (v: number) => void;
  onClose: () => void;
}

export const ControlCenterPopover: React.FC<ControlCenterPopoverProps> = ({
  brightness,
  onBrightnessChange,
  volume,
  onVolumeChange,
  overlayOpacity,
  onOverlayOpacityChange,
  onClose,
}) => {
  const isFullscreen = !!document.fullscreenElement;
  const isOnline = navigator.onLine;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-14 right-24 z-[99999] w-80 rounded-2xl bg-zinc-950/90 border border-white/10 p-4 shadow-2xl backdrop-blur-2xl text-xs text-zinc-200 animate-in fade-in slide-in-from-bottom-2 duration-150 select-none space-y-4"
    >
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <span className="font-semibold text-sm text-zinc-100">控制中心</span>
        <div className={`flex items-center space-x-1.5 text-xs ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span>{isOnline ? '已连接网络' : '网络已断开'}</span>
        </div>
      </div>

      {/* 快捷磁贴 */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={toggleFullscreen}
          className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 flex items-center space-x-2.5 transition-colors"
        >
          {isFullscreen ? <Minimize className="w-4 h-4 text-blue-400" /> : <Maximize className="w-4 h-4 text-blue-400" />}
          <div className="text-left">
            <div className="font-medium text-xs text-zinc-200">全屏显示</div>
            <div className="text-[10px] text-zinc-500">{isFullscreen ? '退出全屏' : '进入沉浸'}</div>
          </div>
        </button>

        <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center space-x-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div className="text-left">
            <div className="font-medium text-xs text-zinc-200">AetherOS 运行中</div>
            <div className="text-[10px] text-zinc-500">状态良好</div>
          </div>
        </div>
      </div>

      {/* 滑动条控制 */}
      <div className="space-y-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/80">
        {/* 全屏亮度调节 */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span className="flex items-center space-x-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>全屏亮度</span>
            </span>
            <span>{brightness}%</span>
          </div>
          <input
            type="range"
            min="60"
            max="125"
            value={brightness}
            onChange={(e) => onBrightnessChange(parseInt(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
          />
        </div>

        {/* 壁纸通透/暗化调节 */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>壁纸暗化遮罩</span>
            <span>{overlayOpacity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            value={overlayOpacity}
            onChange={(e) => onOverlayOpacityChange(parseInt(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
          />
        </div>

        {/* 系统音量 */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span className="flex items-center space-x-1.5">
              <Volume2 className="w-3.5 h-3.5 text-zinc-300" />
              <span>系统音量</span>
            </span>
            <span>{volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(parseInt(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

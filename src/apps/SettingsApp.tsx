import React from 'react';
import { Image as ImageIcon, Upload, RotateCcw, Monitor, ShieldCheck, Terminal, Sun, Sliders } from 'lucide-react';
import { PRESET_WALLPAPERS } from '../utils/storage';

interface SettingsAppProps {
  currentWallpaper: string;
  onSetWallpaper: (url: string) => void;
  brightness: number;
  onBrightnessChange: (val: number) => void;
  overlayOpacity: number;
  onOverlayOpacityChange: (val: number) => void;
  onResetSystem: () => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({
  currentWallpaper,
  onSetWallpaper,
  brightness,
  onBrightnessChange,
  overlayOpacity,
  onOverlayOpacityChange,
  onResetSystem,
}) => {
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (typeof evt.target?.result === 'string') {
        onSetWallpaper(evt.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] p-3.5 sm:p-5 overflow-y-auto space-y-4 sm:space-y-6 text-xs text-zinc-300">
      {/* 1. 桌面壁纸与视觉通透度调节 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center space-x-2">
            <ImageIcon className="w-4 h-4 text-zinc-400" />
            <span>壁纸偏好</span>
          </h3>
          <label className="cursor-pointer px-2.5 sm:px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-300 hover:text-white transition-colors font-medium flex items-center space-x-1.5 shrink-0">
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">上传自定义壁纸</span>
            <span className="sm:hidden">上传壁纸</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {PRESET_WALLPAPERS.map((wp, idx) => {
            const isSelected = currentWallpaper === wp;
            return (
              <div
                key={idx}
                onClick={() => onSetWallpaper(wp)}
                className={`group cursor-pointer rounded-lg overflow-hidden border transition-all aspect-video relative ${
                  isSelected ? 'border-blue-500 ring-2 ring-blue-500/40' : 'border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <img src={wp} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="壁纸" />
                <span className="absolute bottom-1 left-1.5 text-[10px] bg-black/70 px-1.5 py-0.5 rounded text-zinc-300 font-mono">
                  Preset 0{idx + 1}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. 显示明亮度调节专项 (解决发暗问题) */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-100 border-b border-zinc-800 pb-2 flex items-center space-x-2">
          <Sun className="w-4 h-4 text-amber-400" />
          <span>显示与明亮度调节</span>
        </h3>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-4">
          {/* 屏幕亮度 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-zinc-200">
              <span className="font-medium flex items-center space-x-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>全屏亮度滤镜</span>
              </span>
              <span className="font-mono text-zinc-400">{brightness}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="125"
              value={brightness}
              onChange={(e) => onBrightnessChange(parseInt(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
            <div className="text-[10px] text-zinc-500">
              通过在全局根容器挂载 CSS 动态滤镜（brightness）进行全屏无级调节
            </div>
          </div>

          {/* 壁纸暗化遮罩 */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-800/60">
            <div className="flex items-center justify-between text-xs text-zinc-200">
              <span className="font-medium flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                <span>壁纸暗化蒙层</span>
              </span>
              <span className="font-mono text-zinc-400">{overlayOpacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              value={overlayOpacity}
              onChange={(e) => onOverlayOpacityChange(parseInt(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
            <div className="text-[10px] text-zinc-500">
              数值越小壁纸越明亮通透，数值越大桌面图标文字识别度更高
            </div>
          </div>
        </div>
      </section>

      {/* 3. 数据持久化重置 */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-100 border-b border-zinc-800 pb-2 flex items-center space-x-2">
          <RotateCcw className="w-4 h-4 text-rose-400" />
          <span>系统状态与出厂重置</span>
        </h3>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="font-medium text-zinc-200">恢复出厂系统初始状态</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">
              清空本地缓存（壁纸、各窗口尺寸位置、随手记及 AI 配置数据）
            </div>
          </div>
          <button
            onClick={() => {
              if (window.confirm('确认清空 AetherOS 的全部本地数据并恢复初始状态？')) {
                onResetSystem();
              }
            }}
            className="px-3.5 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg transition-colors font-medium shrink-0 ml-3"
          >
            重置系统
          </button>
        </div>
      </section>

      {/* 4. 系统架构概要 */}
      <section className="space-y-2 text-zinc-400 text-[11px]">
        <h3 className="text-xs font-semibold text-zinc-200 mb-2 flex items-center space-x-1.5">
          <Monitor className="w-3.5 h-3.5 text-zinc-400" />
          <span>内核与时间系统规范</span>
        </h3>
        <div className="flex justify-between py-1.5 border-b border-zinc-800/80">
          <span className="flex items-center space-x-1.5">
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <span>核心架构</span>
          </span>
          <span className="font-mono text-zinc-300">Windows-Style Taskbar + React 18 + Vite 6</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-zinc-800/80">
          <span className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>对时系统</span>
          </span>
          <span className="font-mono text-zinc-300">Network Synced Offset + Fallback Native Date</span>
        </div>
        <div className="flex justify-between py-1.5">
          <span>防穿透机制</span>
          <span className="font-mono text-zinc-300">Iframe Shield + Native Snap Assist</span>
        </div>
      </section>
    </div>
  );
};

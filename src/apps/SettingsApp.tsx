import React from 'react';
import { Image as ImageIcon, Upload, RotateCcw, Monitor, ShieldCheck, Terminal } from 'lucide-react';
import { PRESET_WALLPAPERS } from '../utils/storage';

interface SettingsAppProps {
  currentWallpaper: string;
  onSetWallpaper: (url: string) => void;
  onResetSystem: () => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({
  currentWallpaper,
  onSetWallpaper,
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
    <div className="flex flex-col h-full bg-[#09090b] p-5 overflow-y-auto space-y-6 text-xs text-zinc-300">
      {/* 桌面壁纸管理 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center space-x-2">
            <ImageIcon className="w-4 h-4 text-zinc-400" />
            <span>壁纸偏好</span>
          </h3>
          <label className="cursor-pointer px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-300 hover:text-white transition-colors font-medium flex items-center space-x-1.5">
            <Upload className="w-3.5 h-3.5" />
            <span>上传自定义壁纸</span>
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
                  isSelected ? 'border-zinc-200 ring-2 ring-zinc-500/40' : 'border-zinc-800 hover:border-zinc-600'
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

      {/* 数据持久化重置 */}
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

      {/* 系统硬件与架构概要 */}
      <section className="space-y-2 text-zinc-400 text-[11px]">
        <h3 className="text-xs font-semibold text-zinc-200 mb-2 flex items-center space-x-1.5">
          <Monitor className="w-3.5 h-3.5 text-zinc-400" />
          <span>内核规范</span>
        </h3>
        <div className="flex justify-between py-1.5 border-b border-zinc-800/80">
          <span className="flex items-center space-x-1.5">
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <span>核心架构规范</span>
          </span>
          <span className="font-mono text-zinc-300">React 18 + TypeScript + Vite 6</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-zinc-800/80">
          <span className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>手势与窗口吸附机制</span>
          </span>
          <span className="font-mono text-zinc-300">Native Snap Assist + Anti-Drop Overlay</span>
        </div>
        <div className="flex justify-between py-1.5">
          <span>层级调度机制</span>
          <span className="font-mono text-zinc-300">Array Stack Z-Index Manager</span>
        </div>
      </section>
    </div>
  );
};

import React from 'react';
import { Image as ImageIcon, Upload, RotateCcw, Monitor, ShieldCheck, Cpu } from 'lucide-react';
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
    <div className="flex flex-col h-full bg-slate-950 p-5 overflow-y-auto space-y-6 text-xs text-slate-300">
      {/* 桌面壁纸管理 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <ImageIcon className="w-4 h-4 text-blue-400" />
            <span>桌面壁纸设置</span>
          </h3>
          <label className="cursor-pointer px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-blue-400 transition-colors font-medium flex items-center space-x-1.5">
            <Upload className="w-3.5 h-3.5" />
            <span>上传自定义壁纸...</span>
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
                  isSelected ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-white/10 hover:border-blue-400/60'
                }`}
              >
                <img src={wp} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="壁纸预设" />
                <span className="absolute bottom-1 left-1.5 text-[10px] bg-black/60 px-1.5 py-0.5 rounded text-white/90">
                  预设 {idx + 1}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 数据持久化重置 */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-2 flex items-center space-x-2">
          <RotateCcw className="w-4 h-4 text-rose-400" />
          <span>本地存储与出厂重置</span>
        </h3>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="font-medium text-slate-200">恢复出厂系统初始状态</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
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
      <section className="space-y-2 text-slate-400 text-[11px]">
        <h3 className="text-xs font-semibold text-slate-300 mb-2 flex items-center space-x-1.5">
          <Monitor className="w-3.5 h-3.5 text-slate-400" />
          <span>系统架构规范</span>
        </h3>
        <div className="flex justify-between py-1.5 border-b border-white/5">
          <span className="flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>核心架构规范</span>
          </span>
          <span className="font-mono text-slate-200">React 18 + TypeScript + Vite 6</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-white/5">
          <span className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>焦点与事件安全保护</span>
          </span>
          <span className="font-mono text-slate-200">Iframe Anti-Drop Overlay + Pointer Shield</span>
        </div>
        <div className="flex justify-between py-1.5">
          <span>层级调度机制</span>
          <span className="font-mono text-slate-200">Array Stack Z-Index Manager</span>
        </div>
      </section>
    </div>
  );
};

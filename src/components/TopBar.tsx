import React, { useState, useEffect } from 'react';
import { Terminal, Wifi, WifiOff, Maximize, Minimize, Command } from 'lucide-react';
import { AppId } from '../types';

interface TopBarProps {
  onOpenApp: (id: AppId) => void;
  onOpenSpotlight: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenApp, onOpenSpotlight }) => {
  const [timeStr, setTimeStr] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const day = days[now.getDay()];
      const time = now.toLocaleTimeString('zh-CN', { hour12: false });
      setTimeStr(`${day} ${time}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 h-8 px-3.5 flex items-center justify-between z-[9990] bg-zinc-950/70 backdrop-blur-2xl border-b border-white/[0.07] text-xs text-zinc-300">
      <div className="flex items-center space-x-4">
        {/* 系统标志 */}
        <div
          onClick={() => onOpenApp('settings')}
          className="flex items-center space-x-2 font-semibold tracking-tight text-zinc-100 cursor-pointer hover:text-white transition-colors"
        >
          <div className="w-4 h-4 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
            <Terminal className="w-2.5 h-2.5" />
          </div>
          <span>AetherOS</span>
        </div>

        {/* 顶部常用快捷入口 */}
        <div className="hidden sm:flex items-center space-x-3 text-zinc-400">
          <span className="hover:text-zinc-200 cursor-pointer transition-colors" onClick={() => onOpenApp('terminal')}>
            终端
          </span>
          <span className="hover:text-zinc-200 cursor-pointer transition-colors" onClick={() => onOpenApp('notepad')}>
            笔记
          </span>
          <span className="hover:text-zinc-200 cursor-pointer transition-colors" onClick={() => onOpenApp('player')}>
            电台
          </span>
          <span className="hover:text-zinc-200 cursor-pointer transition-colors" onClick={() => onOpenApp('aistudio')}>
            AI Studio
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3.5">
        {/* Spotlight 搜索启动器入口 */}
        <button
          onClick={onOpenSpotlight}
          className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
          title="按下 ⌘K 或 Ctrl+K 打开全局搜索"
        >
          <Command className="w-3 h-3" />
          <span className="text-[11px] font-mono">K</span>
        </button>

        {/* 网络状态指示 */}
        <div className={`flex items-center space-x-1.5 ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          <span className="text-[11px] hidden sm:inline">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </div>

        {/* 全屏切换 */}
        <button
          onClick={toggleFullscreen}
          title="切换全屏模式"
          className="text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded hover:bg-zinc-800"
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
        </button>

        {/* 精确时钟 */}
        <div className="font-mono text-zinc-300 text-[11px] tracking-wide tabular-nums">
          {timeStr}
        </div>
      </div>
    </header>
  );
};

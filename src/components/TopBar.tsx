import React, { useState, useEffect } from 'react';
import { Layers, Wifi, WifiOff, Maximize, Minimize } from 'lucide-react';
import { AppId } from '../types';

interface TopBarProps {
  onOpenApp: (id: AppId) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenApp }) => {
  const [timeStr, setTimeStr] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
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
    <header className="absolute top-0 left-0 right-0 h-8 px-4 flex items-center justify-between z-[9990] bg-black/40 backdrop-blur-md border-b border-white/10 text-xs text-white/90">
      <div className="flex items-center space-x-4">
        <div
          onClick={() => onOpenApp('settings')}
          className="flex items-center space-x-1.5 font-bold tracking-wider text-blue-400 cursor-pointer hover:text-blue-300 transition-colors"
        >
          <Layers className="w-4 h-4" />
          <span>AetherOS</span>
        </div>
        <div className="hidden sm:flex items-center space-x-3 text-white/70">
          <span className="hover:text-white cursor-pointer transition-colors" onClick={() => onOpenApp('browser')}>
            轻舟浏览器
          </span>
          <span className="hover:text-white cursor-pointer transition-colors" onClick={() => onOpenApp('notepad')}>
            随手记
          </span>
          <span className="hover:text-white cursor-pointer transition-colors" onClick={() => onOpenApp('copilot')}>
            AI 终端
          </span>
          <span className="hover:text-white cursor-pointer transition-colors" onClick={() => onOpenApp('settings')}>
            偏好设置
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* 网络状态检测 */}
        <div className={`flex items-center space-x-1.5 ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">已联网</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">网络断开</span>
            </>
          )}
        </div>

        {/* 全屏切换 */}
        <button
          onClick={toggleFullscreen}
          title="切换全屏"
          className="text-white/70 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
        </button>

        {/* 系统时间 */}
        <div className="font-medium tracking-wide tabular-nums text-white/90 text-xs">
          {timeStr}
        </div>
      </div>
    </header>
  );
};

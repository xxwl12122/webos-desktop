import React from 'react';
import { Globe, Sparkles, FileText, Settings } from 'lucide-react';
import { AppId, WindowState } from '../types';

interface DockProps {
  windows: Record<AppId, WindowState>;
  onToggleApp: (id: AppId) => void;
}

export const Dock: React.FC<DockProps> = ({ windows, onToggleApp }) => {
  const dockItems: { id: AppId; name: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'browser',
      name: '轻舟浏览器',
      icon: <Globe className="w-6 h-6 text-white" />,
      color: 'from-blue-600 to-cyan-400',
    },
    {
      id: 'copilot',
      name: 'AI 助理终端',
      icon: <Sparkles className="w-6 h-6 text-white" />,
      color: 'from-purple-600 to-pink-500',
    },
    {
      id: 'notepad',
      name: '随手记',
      icon: <FileText className="w-6 h-6 text-white" />,
      color: 'from-amber-500 to-orange-400',
    },
    {
      id: 'settings',
      name: '系统偏好设置',
      icon: <Settings className="w-6 h-6 text-white" />,
      color: 'from-slate-600 to-slate-400',
    },
  ];

  return (
    <div className="absolute bottom-3 left-0 right-0 flex justify-center z-[9995] pointer-events-none">
      <div className="pointer-events-auto flex items-center space-x-3 px-4 py-2 rounded-2xl glass-dock shadow-2xl transition-all duration-300">
        {dockItems.map((item, index) => {
          const win = windows[item.id];
          const isOpen = win?.isOpen;
          const isMinimized = win?.isMinimized;

          return (
            <React.Fragment key={item.id}>
              {index === 3 && <div className="h-8 w-[1px] bg-white/15 my-auto mx-1" />}
              <div
                onClick={() => onToggleApp(item.id)}
                className="dock-item flex flex-col items-center cursor-pointer group relative"
                title={item.name}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center shadow-md border border-white/20`}
                >
                  {item.icon}
                </div>

                {/* 状态指示小圆点 */}
                <div
                  className={`w-1.5 h-1.5 rounded-full mt-1 transition-all ${
                    isOpen
                      ? isMinimized
                        ? 'bg-slate-400'
                        : 'bg-blue-400 shadow-[0_0_8px_#60a5fa]'
                      : 'bg-transparent'
                  }`}
                />
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

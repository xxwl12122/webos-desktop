import React from 'react';
import { Terminal, FileText, Music, Sparkles, Settings } from 'lucide-react';
import { AppId, WindowState } from '../types';

interface DockProps {
  windows: Record<AppId, WindowState>;
  onToggleApp: (id: AppId) => void;
}

export const Dock: React.FC<DockProps> = ({ windows, onToggleApp }) => {
  const dockItems: { id: AppId; name: string; icon: React.ReactNode }[] = [
    {
      id: 'terminal',
      name: 'Cyber Terminal',
      icon: <Terminal className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'notepad',
      name: 'Notepad Pro',
      icon: <FileText className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'player',
      name: 'Synthwave Radio',
      icon: <Music className="w-5 h-5 text-blue-400" />,
    },
    {
      id: 'aistudio',
      name: 'AI Studio',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
    },
    {
      id: 'settings',
      name: 'System Preferences',
      icon: <Settings className="w-5 h-5 text-zinc-400" />,
    },
  ];

  return (
    <div className="absolute bottom-3 left-0 right-0 flex justify-center z-[9995] pointer-events-none">
      <div className="pointer-events-auto flex items-center space-x-2.5 px-3 py-1.5 rounded-2xl glass-dock shadow-2xl transition-all duration-200">
        {dockItems.map((item, index) => {
          const win = windows[item.id];
          const isOpen = win?.isOpen;
          const isMinimized = win?.isMinimized;

          return (
            <React.Fragment key={item.id}>
              {index === 4 && <div className="h-6 w-[1px] bg-white/10 my-auto mx-0.5" />}
              <div
                onClick={() => onToggleApp(item.id)}
                className="dock-item flex flex-col items-center cursor-pointer group relative"
                title={item.name}
              >
                <div className="w-11 h-11 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-white/[0.08] flex items-center justify-center shadow-lg transition-all group-active:scale-90">
                  {item.icon}
                </div>

                {/* 状态指示小圆点 */}
                <div
                  className={`w-1 h-1 rounded-full mt-1 transition-all ${
                    isOpen
                      ? isMinimized
                        ? 'bg-zinc-500'
                        : 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
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

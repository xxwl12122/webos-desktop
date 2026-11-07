import React, { useState, useRef, useEffect } from 'react';
import { Search, Globe, Terminal, FileText, Music, Sparkles, Settings, Power, User, Activity } from 'lucide-react';
import { AppId } from '../types';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (id: AppId) => void;
  onResetSystem: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  isOpen,
  onClose,
  onOpenApp,
  onResetSystem,
}) => {
  const [searchVal, setSearchVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const apps: { id: AppId; name: string; desc: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'browser',
      name: 'Web 浏览器',
      desc: '支持安全 CSP 容灾与智能搜索',
      icon: <Globe className="w-6 h-6 text-blue-400" />,
      color: 'hover:border-blue-500/50',
    },
    {
      id: 'taskmanager',
      name: '任务管理器',
      desc: '进程管理与 CPU/内存性能监控',
      icon: <Activity className="w-6 h-6 text-blue-500" />,
      color: 'hover:border-blue-500/50',
    },
    {
      id: 'terminal',
      name: '极客系统终端',
      desc: 'Bash、Neofetch 与 Matrix 字符雨',
      icon: <Terminal className="w-6 h-6 text-emerald-400" />,
      color: 'hover:border-emerald-500/50',
    },
    {
      id: 'notepad',
      name: 'Notepad Pro',
      desc: 'Markdown 分屏渲染与笔记导出',
      icon: <FileText className="w-6 h-6 text-amber-400" />,
      color: 'hover:border-amber-500/50',
    },
    {
      id: 'player',
      name: '音频电台',
      desc: 'WebAudio 实时柱状音频频谱',
      icon: <Music className="w-6 h-6 text-cyan-400" />,
      color: 'hover:border-cyan-500/50',
    },
    {
      id: 'aistudio',
      name: 'AI 工作舱',
      desc: 'OpenAI 协议流式推理与分析',
      icon: <Sparkles className="w-6 h-6 text-purple-400" />,
      color: 'hover:border-purple-500/50',
    },
    {
      id: 'settings',
      name: '系统偏好设置',
      desc: '壁纸与全局显示亮度调节',
      icon: <Settings className="w-6 h-6 text-zinc-400" />,
      color: 'hover:border-zinc-500/50',
    },
  ];

  const filtered = apps.filter(
    (a) => a.name.toLowerCase().includes(searchVal.toLowerCase()) || a.desc.toLowerCase().includes(searchVal.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearchVal('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-14 left-2 right-2 sm:right-auto sm:left-3 z-[99999] w-auto sm:w-[440px] max-w-[calc(100vw-16px)] rounded-2xl bg-zinc-950/90 border border-white/10 shadow-2xl backdrop-blur-2xl text-xs text-zinc-200 animate-in fade-in slide-in-from-bottom-2 duration-150 flex flex-col overflow-hidden select-none"
    >
      {/* 顶部搜索框 */}
      <div className="p-4 pb-2">
        <div className="flex items-center px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 focus-within:border-zinc-600 transition-colors">
          <Search className="w-4 h-4 text-zinc-500 mr-2.5 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filtered.length > 0) {
                onOpenApp(filtered[0].id);
                onClose();
              }
            }}
            placeholder="搜索应用、任务管理器... (Enter 启动)"
            className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 outline-none"
          />
        </div>
      </div>

      {/* 中部应用磁贴网格 */}
      <div className="px-4 py-2 flex-1">
        <div className="text-[11px] font-medium text-zinc-500 mb-2 px-1">已安装应用</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[50vh] sm:max-h-[300px] overflow-y-auto">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onOpenApp(item.id);
                onClose();
              }}
              className={`flex items-center space-x-3 p-2.5 rounded-xl bg-zinc-900/50 hover:bg-zinc-900/90 border border-zinc-800/80 cursor-pointer transition-all active:scale-98 ${item.color}`}
            >
              <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0 shadow">
                {item.icon}
              </div>
              <div className="overflow-hidden">
                <div className="font-medium text-zinc-200 truncate">{item.name}</div>
                <div className="text-[10px] text-zinc-500 truncate mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部用户信息与电源区 */}
      <div className="p-3 bg-zinc-900/60 border-t border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium text-zinc-200 text-xs">Aether Operator</div>
            <div className="text-[10px] text-zinc-500 font-mono">guest@webos-kernel</div>
          </div>
        </div>

        <button
          onClick={() => {
            if (window.confirm('确认清空系统缓存并重启系统？')) {
              onResetSystem();
            }
          }}
          title="恢复出厂重置与关机"
          className="p-2 rounded-xl hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition-colors"
        >
          <Power className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

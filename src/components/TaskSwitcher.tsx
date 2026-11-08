import React, { useEffect } from 'react';
import { Globe, Terminal, FileText, Music, Sparkles, Settings, Activity, Layers, X } from 'lucide-react';
import { AppId, WindowState } from '../types';

interface TaskSwitcherProps {
  isOpen: boolean;
  windows: Record<AppId, WindowState>;
  windowStack: AppId[];
  selectedIndex: number;
  onSelectIndex: (idx: number) => void;
  onConfirm: (id: AppId) => void;
  onClose: () => void;
}

export const TaskSwitcher: React.FC<TaskSwitcherProps> = ({
  isOpen,
  windows,
  windowStack,
  selectedIndex,
  onSelectIndex,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const appIcons: Record<AppId, React.ReactNode> = {
    browser: <Globe className="w-5 h-5 text-blue-400" />,
    terminal: <Terminal className="w-5 h-5 text-emerald-400" />,
    notepad: <FileText className="w-5 h-5 text-amber-400" />,
    player: <Music className="w-5 h-5 text-cyan-400" />,
    aistudio: <Sparkles className="w-5 h-5 text-purple-400" />,
    taskmanager: <Activity className="w-5 h-5 text-blue-500" />,
    settings: <Settings className="w-5 h-5 text-zinc-400" />,
  };

  // 获取所有当前打开的窗口，按照最近使用栈逆序排列 (最前台排第一)
  const openedIds = [...windowStack]
    .reverse()
    .filter((id) => windows[id] && windows[id].isOpen);

  if (openedIds.length === 0) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99998] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl bg-zinc-950/90 border border-white/10 p-5 shadow-2xl shadow-black/90 backdrop-blur-2xl flex flex-col space-y-4"
      >
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
          <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-200">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>活动任务切换器 (Alt + Tab / 任务平视)</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-zinc-400 font-mono">
            <span>Tab / 左右箭头选择 · 松开切换</span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 窗口卡片水平陈列网格 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto p-1">
          {openedIds.map((id, index) => {
            const win = windows[id];
            const isSelected = index === selectedIndex;

            return (
              <div
                key={id}
                onClick={() => {
                  onConfirm(id);
                  onClose();
                }}
                onMouseEnter={() => onSelectIndex(index)}
                className={`group cursor-pointer rounded-xl p-3 border transition-all flex flex-col justify-between aspect-[4/3] relative overflow-hidden ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/50'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                {/* 顶部微图标与标题 */}
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded-md bg-zinc-950 border border-zinc-800 shrink-0">
                    {appIcons[id]}
                  </div>
                  <span className="text-xs font-medium text-zinc-200 truncate">{win.title}</span>
                </div>

                {/* 卡片微缩图形意象 */}
                <div className="flex-1 my-2 rounded-lg bg-zinc-950/80 border border-zinc-800/80 p-2 flex flex-col justify-center items-center text-[10px] text-zinc-500 font-mono">
                  {win.isMinimized ? (
                    <span className="text-amber-400/80">已最小化</span>
                  ) : (
                    <div className="w-full space-y-1 opacity-60">
                      <div className="h-1.5 bg-zinc-700 rounded-full w-3/4" />
                      <div className="h-1.5 bg-zinc-800 rounded-full w-1/2" />
                      <div className="h-1.5 bg-zinc-800 rounded-full w-5/6" />
                    </div>
                  )}
                </div>

                {/* 底部指示 */}
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span>{win.isMinimized ? '后台挂起' : '前台运行'}</span>
                  {isSelected && <span className="text-blue-400 font-sans font-bold">↵ 回车切入</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Search, Terminal, FileText, Music, Sparkles, Settings, Maximize, RotateCw, Image as ImageIcon } from 'lucide-react';
import { AppId } from '../types';

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (id: AppId) => void;
  onRandomWallpaper: () => void;
  onToggleFullscreen: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  action: () => void;
}

export const Spotlight: React.FC<SpotlightProps> = ({
  isOpen,
  onClose,
  onOpenApp,
  onRandomWallpaper,
  onToggleFullscreen,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    {
      id: 'app-terminal',
      title: '极客系统终端 (Cyber Terminal)',
      description: '运行 Neofetch、Ping 延迟诊断与 Matrix 字符雨',
      icon: <Terminal className="w-4 h-4 text-emerald-400" />,
      category: 'Applications',
      action: () => onOpenApp('terminal'),
    },
    {
      id: 'app-notepad',
      title: 'Notepad Pro (Markdown 沉浸式知识库)',
      description: '双栏实时渲染、本地热存与 Markdown 导出',
      icon: <FileText className="w-4 h-4 text-amber-400" />,
      category: 'Applications',
      action: () => onOpenApp('notepad'),
    },
    {
      id: 'app-player',
      title: 'Lo-Fi / Synthwave 极客音频电台',
      icon: <Music className="w-4 h-4 text-blue-400" />,
      description: 'Web Audio API 实时柱状音频频谱动画与合成器旋律',
      category: 'Applications',
      action: () => onOpenApp('player'),
    },
    {
      id: 'app-aistudio',
      title: 'AI Studio 模型工作舱',
      description: 'OpenAI 兼容协议终端，支持流式打字与耗时分析',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      category: 'Applications',
      action: () => onOpenApp('aistudio'),
    },
    {
      id: 'app-settings',
      title: '系统偏好设置 (System Preferences)',
      description: '壁纸切换、自定义上传与出厂状态管理',
      icon: <Settings className="w-4 h-4 text-zinc-400" />,
      category: 'Applications',
      action: () => onOpenApp('settings'),
    },
    {
      id: 'act-wallpaper',
      title: '切换随机壁纸',
      description: '从内置高清暗黑壁纸库中随机换一张',
      icon: <ImageIcon className="w-4 h-4 text-cyan-400" />,
      category: 'Quick Actions',
      action: onRandomWallpaper,
    },
    {
      id: 'act-fullscreen',
      title: '切换全屏模式 (Toggle Fullscreen)',
      description: '进入或退出沉浸式桌面全屏',
      icon: <Maximize className="w-4 h-4 text-zinc-300" />,
      category: 'Quick Actions',
      action: onToggleFullscreen,
    },
    {
      id: 'act-reload',
      title: '重新载入 AetherOS',
      description: '刷新系统桌面状态',
      icon: <RotateCw className="w-4 h-4 text-zinc-400" />,
      category: 'Quick Actions',
      action: () => window.location.reload(),
    },
  ];

  const filtered = commands.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl bg-zinc-950/90 border border-white/10 shadow-2xl shadow-black/90 overflow-hidden flex flex-col divide-y divide-zinc-800/80"
      >
        {/* 输入框 */}
        <div className="flex items-center px-4 py-3 space-x-3">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索指令、快速启动应用... (Esc 退出)"
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 rounded font-mono border border-zinc-700/60">
            ESC
          </kbd>
        </div>

        {/* 结果列表 */}
        <div className="max-h-[360px] overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">未找到匹配的命令或应用</div>
          ) : (
            filtered.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-zinc-800/90 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">{item.icon}</div>
                    <div>
                      <div className="text-xs font-medium text-zinc-200">{item.title}</div>
                      <div className="text-[11px] text-zinc-400">{item.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">{item.category}</span>
                    {isSelected && (
                      <kbd className="px-1.5 py-0.5 text-[10px] bg-zinc-700 text-zinc-200 rounded font-mono">
                        ↵
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 底部导航提示 */}
        <div className="px-4 py-2 bg-zinc-900/60 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <div className="flex items-center space-x-3">
            <span>↑↓ 切换选择</span>
            <span>↵ 确认执行</span>
          </div>
          <div>AetherOS Quick Command</div>
        </div>
      </div>
    </div>
  );
};

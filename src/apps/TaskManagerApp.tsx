import React, { useState, useEffect, useRef } from 'react';
import { Activity, Cpu, Layers, HardDrive, Wifi, PowerOff, Play, Globe, Terminal, FileText, Music, Sparkles, Settings, ShieldAlert, ExternalLink, Copy, Check } from 'lucide-react';
import { AppId, WindowState } from '../types';

interface TaskManagerAppProps {
  windows: Record<AppId, WindowState>;
  onCloseApp: (id: AppId) => void;
  onOpenApp: (id: AppId) => void;
}

type TabType = 'processes' | 'performance';
type PerfMetric = 'cpu' | 'memory' | 'network';

export const TaskManagerApp: React.FC<TaskManagerAppProps> = ({
  windows,
  onCloseApp,
  onOpenApp,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('processes');
  const [selectedProcessId, setSelectedProcessId] = useState<AppId | 'kernel' | null>(null);
  const [activeMetric, setActiveMetric] = useState<PerfMetric>('cpu');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    appId: AppId | 'kernel';
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 模拟真实实时指标数据
  const [cpuUsage, setCpuUsage] = useState(18);
  const [memoryUsage, setMemoryUsage] = useState(2.8); // GB
  const [uptime, setUptime] = useState(120); // 秒

  const cpuCanvasRef = useRef<HTMLCanvasElement>(null);
  const cpuHistoryRef = useRef<number[]>(Array(40).fill(15));

  // 运行时间自增
  useEffect(() => {
    const timer = setInterval(() => {
      setUptime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 实时波形绘制
  useEffect(() => {
    const canvas = cpuCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const interval = setInterval(() => {
      // 随机波动 CPU (10% - 45%)
      const nextCpu = Math.floor(Math.random() * 25 + 12);
      setCpuUsage(nextCpu);

      // 内存微动
      setMemoryUsage(+(2.7 + Math.random() * 0.25).toFixed(2));

      cpuHistoryRef.current.shift();
      cpuHistoryRef.current.push(nextCpu);

      // 绘制 Canvas 折线波形
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 网格线
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let y = 0; y < canvas.height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // 面积渐变填充
      const stepX = canvas.width / (cpuHistoryRef.current.length - 1);
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);

      cpuHistoryRef.current.forEach((val, i) => {
        const x = i * stepX;
        const y = canvas.height - (val / 100) * canvas.height;
        ctx.lineTo(x, y);
      });
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
      grad.addColorStop(1, 'rgba(59, 130, 246, 0.02)');
      ctx.fillStyle = grad;
      ctx.fill();

      // 折线描边
      ctx.beginPath();
      cpuHistoryRef.current.forEach((val, i) => {
        const x = i * stepX;
        const y = canvas.height - (val / 100) * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();
    }, 800);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animId);
    };
  }, [activeTab]);

  const appMeta: Record<AppId, { name: string; icon: React.ReactNode; mem: string }> = {
    browser: { name: 'Web 浏览器 (Browser Pro)', icon: <Globe className="w-4 h-4 text-blue-400" />, mem: '68.4 MB' },
    terminal: { name: '极客终端 (Cyber Terminal)', icon: <Terminal className="w-4 h-4 text-emerald-400" />, mem: '34.2 MB' },
    notepad: { name: '知识便签 (Notepad Pro)', icon: <FileText className="w-4 h-4 text-amber-400" />, mem: '21.6 MB' },
    player: { name: '音频电台 (Audio Station)', icon: <Music className="w-4 h-4 text-cyan-400" />, mem: '45.1 MB' },
    aistudio: { name: 'AI Studio 工作舱', icon: <Sparkles className="w-4 h-4 text-purple-400" />, mem: '58.3 MB' },
    settings: { name: '系统偏好设置 (Settings)', icon: <Settings className="w-4 h-4 text-zinc-400" />, mem: '18.9 MB' },
    taskmanager: { name: '任务管理器 (Task Manager)', icon: <Activity className="w-4 h-4 text-blue-500" />, mem: '24.8 MB' },
  };

  const handleEndTask = () => {
    if (!selectedProcessId || selectedProcessId === 'kernel') return;
    onCloseApp(selectedProcessId);
    setSelectedProcessId(null);
  };

  // 进程行右键菜单处理
  const handleRowContextMenu = (e: React.MouseEvent, appId: AppId | 'kernel') => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProcessId(appId);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      appId,
    });
  };

  // 全局关闭右键菜单与快捷键支持 (Delete 结束任务)
  useEffect(() => {
    const handleCloseMenu = () => setContextMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
      } else if (e.key === 'Delete') {
        if (selectedProcessId && selectedProcessId !== 'kernel' && windows[selectedProcessId]?.isOpen) {
          onCloseApp(selectedProcessId);
        }
      }
    };

    window.addEventListener('click', handleCloseMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('click', handleCloseMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedProcessId, windows, onCloseApp]);

  const handleCopyProcessName = (name: string, id: string) => {
    navigator.clipboard.writeText(name);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const formatUptime = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-zinc-200 select-none overflow-hidden font-sans">
      {/* 顶部标签切换栏 (Windows 11 风格) */}
      <div className="h-10 px-2 sm:px-3 bg-zinc-950/90 border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('processes')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1 sm:space-x-1.5 ${
              activeTab === 'processes' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>进程</span>
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1 sm:space-x-1.5 ${
              activeTab === 'performance' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>性能</span>
          </button>
        </div>

        {/* 进程页右上角动作按钮 */}
        {activeTab === 'processes' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEndTask}
              disabled={!selectedProcessId || selectedProcessId === 'kernel'}
              className="px-2.5 sm:px-3 py-1 bg-rose-600/80 hover:bg-rose-600 disabled:opacity-30 disabled:pointer-events-none text-white rounded-lg text-xs transition-colors font-medium flex items-center space-x-1"
            >
              <PowerOff className="w-3 h-3" />
              <span className="hidden xs:inline">结束任务</span>
              <span className="xs:hidden">结束</span>
            </button>
          </div>
        )}
      </div>

      {/* 选项卡一：进程列表 (Processes) */}
      {activeTab === 'processes' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 表头 */}
          <div className="grid grid-cols-[1fr_75px_55px_65px] sm:grid-cols-[1fr_100px_90px_100px_90px] px-3 sm:px-4 py-2 bg-zinc-900/60 border-b border-zinc-800/80 text-[10px] sm:text-[11px] font-medium text-zinc-400">
            <div>应用 / 进程</div>
            <div>状态</div>
            <div className="text-right">CPU</div>
            <div className="text-right">内存</div>
            <div className="text-right pr-2 hidden sm:block">网络</div>
          </div>

          {/* 进程滚动列表 */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-900">
            {/* 系统内核进程 (只读) */}
            <div
              onClick={() => setSelectedProcessId('kernel')}
              onContextMenu={(e) => handleRowContextMenu(e, 'kernel')}
              className={`grid grid-cols-[1fr_75px_55px_65px] sm:grid-cols-[1fr_100px_90px_100px_90px] px-3 sm:px-4 py-2 text-xs items-center cursor-pointer transition-colors ${
                selectedProcessId === 'kernel' ? 'bg-blue-600/20 border-l-2 border-blue-500' : 'hover:bg-zinc-900/50'
              }`}
            >
              <div className="flex items-center space-x-2 sm:space-x-2.5 truncate font-medium text-zinc-200">
                <div className="p-1 rounded bg-zinc-800 text-blue-400 shrink-0">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">AetherOS Core (内核)</span>
              </div>
              <div className="text-emerald-400 text-[10px] sm:text-[11px] truncate">稳定运行</div>
              <div className="text-right font-mono text-zinc-300">1.2%</div>
              <div className="text-right font-mono text-zinc-300">16.4M</div>
              <div className="text-right font-mono text-zinc-400 pr-2 hidden sm:block">0.1 Mbps</div>
            </div>

            {/* 用户各应用进程 */}
            {(Object.keys(windows) as AppId[]).map((appId) => {
              const win = windows[appId];
              const meta = appMeta[appId];
              if (!meta) return null;

              const isSelected = selectedProcessId === appId;
              const isRunning = win.isOpen;

              return (
                <div
                  key={appId}
                  onClick={() => setSelectedProcessId(appId)}
                  onContextMenu={(e) => handleRowContextMenu(e, appId)}
                  onDoubleClick={() => onOpenApp(appId)}
                  className={`grid grid-cols-[1fr_75px_55px_65px] sm:grid-cols-[1fr_100px_90px_100px_90px] px-3 sm:px-4 py-2 sm:py-2.5 text-xs items-center cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-600/20 border-l-2 border-blue-500' : 'hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-2.5 truncate font-medium text-zinc-200">
                    <div className="p-1 rounded bg-zinc-900 border border-zinc-800 shrink-0">
                      {meta.icon}
                    </div>
                    <span className="truncate">{meta.name}</span>
                  </div>

                  <div>
                    {isRunning ? (
                      win.isMinimized ? (
                        <span className="text-zinc-500 text-[10px] sm:text-[11px]">最小化</span>
                      ) : (
                        <span className="text-emerald-400 text-[10px] sm:text-[11px] font-medium">活动中</span>
                      )
                    ) : (
                      <span className="text-zinc-600 text-[10px] sm:text-[11px]">未启动</span>
                    )}
                  </div>

                  <div className="text-right font-mono text-zinc-300 text-[11px] sm:text-xs">
                    {isRunning ? `${(Math.random() * 3 + 0.5).toFixed(1)}%` : '0.0%'}
                  </div>

                  <div className="text-right font-mono text-zinc-300 text-[11px] sm:text-xs">
                    {isRunning ? meta.mem : '0.0 MB'}
                  </div>

                  <div className="text-right font-mono text-zinc-400 pr-2 hidden sm:block">
                    {isRunning ? '0.0 Mbps' : '-'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 底部状态栏 */}
          <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-400 font-mono">
            <div>进程: {(Object.keys(windows).length + 1)} · 句柄: 3,420</div>
            <div>CPU: {cpuUsage}% · 内存: {memoryUsage}G</div>
          </div>
        </div>
      )}

      {/* 选项卡二：性能监视 (Performance) */}
      {activeTab === 'performance' && (
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          {/* 左侧指标栏 (小屏横排滑动，大屏竖排) */}
          <div className="w-full sm:w-52 border-b sm:border-b-0 sm:border-r border-zinc-800 bg-zinc-950/60 p-2 flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-1 overflow-x-auto sm:overflow-x-visible shrink-0 no-scrollbar">
            <div
              onClick={() => setActiveMetric('cpu')}
              className={`p-2 sm:p-2.5 rounded-xl cursor-pointer transition-colors min-w-[130px] sm:min-w-0 flex-1 sm:flex-none ${
                activeMetric === 'cpu' ? 'bg-blue-600/20 border border-blue-500/40 text-white' : 'hover:bg-zinc-900 text-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>CPU</span>
                <span className="font-mono text-blue-400">{cpuUsage}%</span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-zinc-500 font-mono mt-0.5 truncate">3.40 GHz · 8 核</div>
            </div>

            <div
              onClick={() => setActiveMetric('memory')}
              className={`p-2 sm:p-2.5 rounded-xl cursor-pointer transition-colors min-w-[130px] sm:min-w-0 flex-1 sm:flex-none ${
                activeMetric === 'memory' ? 'bg-blue-600/20 border border-blue-500/40 text-white' : 'hover:bg-zinc-900 text-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>内存</span>
                <span className="font-mono text-blue-400">{memoryUsage} GB</span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-zinc-500 font-mono mt-0.5 truncate">已用 35% (共 8G)</div>
            </div>

            <div
              onClick={() => setActiveMetric('network')}
              className={`p-2 sm:p-2.5 rounded-xl cursor-pointer transition-colors min-w-[130px] sm:min-w-0 flex-1 sm:flex-none ${
                activeMetric === 'network' ? 'bg-blue-600/20 border border-blue-500/40 text-white' : 'hover:bg-zinc-900 text-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>网络</span>
                <span className="font-mono text-blue-400">0.2 Mbps</span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-zinc-500 font-mono mt-0.5 truncate">IPv4 已连接</div>
            </div>
          </div>

          {/* 右侧大图表与实时指标 */}
          <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center space-x-1.5 sm:space-x-2">
                  <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  <span>CPU 处理器性能监控</span>
                </h3>
                <div className="text-[10px] sm:text-xs text-zinc-400 font-mono mt-0.5 truncate">
                  Intel(R) Core(TM) Processor @ 3.40GHz
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-bold font-mono text-blue-400">{cpuUsage}%</div>
                <div className="text-[10px] sm:text-[11px] text-zinc-500">当前利用率</div>
              </div>
            </div>

            {/* 实时折线图 Canvas */}
            <div className="h-36 sm:h-44 w-full bg-zinc-950 rounded-xl border border-zinc-800 p-2 overflow-hidden shadow-inner">
              <canvas ref={cpuCanvasRef} width={500} height={160} className="w-full h-full block" />
            </div>

            {/* 详细指标网格 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-1">
              <div className="p-2 sm:p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <div className="text-[10px] text-zinc-500">利用率</div>
                <div className="text-xs sm:text-sm font-semibold font-mono text-zinc-200 mt-0.5">{cpuUsage}%</div>
              </div>
              <div className="p-2 sm:p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <div className="text-[10px] text-zinc-500">速度基准</div>
                <div className="text-xs sm:text-sm font-semibold font-mono text-zinc-200 mt-0.5">3.40 GHz</div>
              </div>
              <div className="p-2 sm:p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <div className="text-[10px] text-zinc-500">运行时间</div>
                <div className="text-xs sm:text-sm font-semibold font-mono text-zinc-200 mt-0.5">{formatUptime(uptime)}</div>
              </div>
              <div className="p-2 sm:p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <div className="text-[10px] text-zinc-500">句柄数</div>
                <div className="text-xs sm:text-sm font-semibold font-mono text-zinc-200 mt-0.5">3,420</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 进程专属右键上下文菜单 (Windows 11 风格) */}
      {contextMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            left: `${Math.max(8, Math.min(contextMenu.x, window.innerWidth - 220))}px`,
            top: `${Math.max(8, Math.min(contextMenu.y, window.innerHeight - 200))}px`,
          }}
          className="fixed z-[99999] w-52 rounded-xl bg-zinc-950/95 border border-white/10 p-1.5 shadow-2xl shadow-black/90 backdrop-blur-2xl text-xs text-zinc-300 divide-y divide-zinc-800/80 animate-in fade-in duration-100 select-none"
        >
          {contextMenu.appId === 'kernel' ? (
            <div className="py-1 px-2.5 text-zinc-500 flex items-center space-x-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <div className="text-[11px] leading-tight">
                <div>系统核心进程</div>
                <div className="text-[10px] text-zinc-600">Windows 核心保护，无法终止</div>
              </div>
            </div>
          ) : (
            <>
              {/* 核心操作：结束任务 / 启动应用 */}
              <div className="py-1">
                {windows[contextMenu.appId]?.isOpen ? (
                  <button
                    onClick={() => {
                      onCloseApp(contextMenu.appId as AppId);
                      setContextMenu(null);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-rose-300 hover:text-white hover:bg-rose-600/80 flex items-center justify-between transition-colors font-medium cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <PowerOff className="w-3.5 h-3.5" />
                      <span>结束任务 (End Task)</span>
                    </div>
                    <kbd className="text-[10px] font-mono opacity-70">Del</kbd>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onOpenApp(contextMenu.appId as AppId);
                      setContextMenu(null);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-600/80 flex items-center space-x-2 transition-colors font-medium cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>启动应用 (Launch)</span>
                  </button>
                )}
              </div>

              {/* 切换至此应用 */}
              {windows[contextMenu.appId]?.isOpen && (
                <div className="py-1">
                  <button
                    onClick={() => {
                      onOpenApp(contextMenu.appId as AppId);
                      setContextMenu(null);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-zinc-800 hover:text-white flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                    <span>切换至此窗口 (Switch To)</span>
                  </button>
                </div>
              )}

              {/* 复制进程名称 */}
              <div className="py-1">
                <button
                  onClick={() => {
                    const name = appMeta[contextMenu.appId as AppId]?.name || contextMenu.appId;
                    handleCopyProcessName(name, contextMenu.appId);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-zinc-800 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>复制进程名称</span>
                  </div>
                  {copiedId === contextMenu.appId && (
                    <Check className="w-3 h-3 text-emerald-400" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

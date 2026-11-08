import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Sparkles, Activity, CloudSun, Calculator } from 'lucide-react';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'system' | 'error';
  text?: string;
  component?: React.ReactNode;
}

type TerminalTheme = 'default' | 'matrix' | 'cyberpunk' | 'monokai' | 'dracula';

export const CyberTerminalApp: React.FC = () => {
  const [history, setHistory] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      type: 'system',
      text: 'AetherOS Cyber Terminal v2.6.0-release (x86_64-pc-none-wasm)',
    },
    {
      id: 'init-2',
      type: 'system',
      text: 'Type "help" for a list of available built-in commands or "neofetch" for system telemetry.',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isMatrixRunning, setIsMatrixRunning] = useState(false);
  const [isTopRunning, setIsTopRunning] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<TerminalTheme>('default');
  const [topCpu, setTopCpu] = useState(18);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
  }, [history]);

  // 动态 Top 进程波动刷新
  useEffect(() => {
    if (!isTopRunning) return;
    const timer = setInterval(() => {
      setTopCpu(Math.floor(Math.random() * 22 + 14));
    }, 1000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'q' || e.key === 'Escape') {
        setIsTopRunning(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTopRunning]);

  // 点击终端任意空白自动聚焦输入框
  const handleTerminalClick = () => {
    if (!isMatrixRunning) {
      inputRef.current?.focus();
    }
  };

  // Matrix 字符雨特效
  useEffect(() => {
    if (!isMatrixRunning) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 640;
    canvas.height = canvas.parentElement?.clientHeight || 420;

    const chars = '0123456789ABCDEFHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソタチツテト';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const interval = setInterval(() => {
      ctx.fillStyle = 'rgba(9, 9, 11, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#22c55e';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }, 33);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'q' || e.key === 'Escape') {
        setIsMatrixRunning(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMatrixRunning]);

  // 执行命令解析
  const executeCommand = (rawInput: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      setHistory((prev) => [...prev, { id: Date.now().toString(), type: 'input', text: '' }]);
      return;
    }

    // 记录历史指令
    setCommandHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const newLines: TerminalLine[] = [
      { id: Date.now().toString(), type: 'input', text: trimmed },
    ];

    switch (cmd) {
      case 'help':
        newLines.push({
          id: (Date.now() + 1).toString(),
          type: 'output',
          component: (
            <div className="space-y-1 text-zinc-300 font-mono py-1">
              <div className="text-zinc-400 font-semibold mb-1">AetherOS Shell Builtins:</div>
              <div className="grid grid-cols-[130px_1fr] gap-x-2 gap-y-1 text-xs">
                <span className="text-emerald-400 font-bold">help</span>
                <span className="text-zinc-400">Display this command summary</span>
                <span className="text-emerald-400 font-bold">top / htop</span>
                <span className="text-zinc-400">Live dynamic CPU/Process monitoring (Q to exit)</span>
                <span className="text-emerald-400 font-bold">neofetch</span>
                <span className="text-zinc-400">Print system architecture info & logo</span>
                <span className="text-emerald-400 font-bold">weather [city]</span>
                <span className="text-zinc-400">Print ASCII weather telemetry</span>
                <span className="text-emerald-400 font-bold">theme &lt;name&gt;</span>
                <span className="text-zinc-400">Change palette (matrix, cyberpunk, monokai, dracula)</span>
                <span className="text-emerald-400 font-bold">calc &lt;expr&gt;</span>
                <span className="text-zinc-400">Evaluate math expression (e.g. 25*4 + sqrt(64))</span>
                <span className="text-emerald-400 font-bold">ping &lt;host&gt;</span>
                <span className="text-zinc-400">Test network latency diagnostics</span>
                <span className="text-emerald-400 font-bold">matrix</span>
                <span className="text-zinc-400">Launch Matrix digital rain (Q to exit)</span>
                <span className="text-emerald-400 font-bold">history</span>
                <span className="text-zinc-400">List executed command history</span>
                <span className="text-emerald-400 font-bold">whoami / date</span>
                <span className="text-zinc-400">User identity & ISO clock</span>
                <span className="text-emerald-400 font-bold">clear</span>
                <span className="text-zinc-400">Clear terminal screen buffer</span>
              </div>
            </div>
          ),
        });
        break;

      case 'top':
      case 'htop':
        setIsTopRunning(true);
        return;

      case 'weather': {
        const city = args.join(' ') || 'Beijing, CN';
        newLines.push({
          id: (Date.now() + 1).toString(),
          type: 'output',
          component: (
            <div className="p-3 my-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="font-bold text-zinc-100 flex items-center space-x-1.5">
                  <CloudSun className="w-4 h-4 text-amber-400" />
                  <span>Telemetry Report: {city}</span>
                </span>
                <span className="text-[10px] text-emerald-400">Online Sat-Feed</span>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
                <pre className="text-amber-400 font-bold leading-tight select-none">
{`   \\  /       Clear Sky / 晴朗
 _ /""\\ _    +23.5°C (体感 25°C)
   \\__/      西北风 12 km/h
   /  \\      空气优 AQI 28`}
                </pre>
                <div className="space-y-1 text-zinc-400 text-[11px] border-l border-zinc-800 pl-3">
                  <div>湿度: <span className="text-zinc-200">42%</span></div>
                  <div>气压: <span className="text-zinc-200">1014 hPa</span></div>
                  <div>紫外线: <span className="text-zinc-200">UV 3 (中等)</span></div>
                  <div>能见度: <span className="text-zinc-200">16.0 km</span></div>
                </div>
              </div>
            </div>
          ),
        });
        break;
      }

      case 'theme': {
        const chosen = (args[0] || '').toLowerCase() as TerminalTheme;
        const validThemes: TerminalTheme[] = ['default', 'matrix', 'cyberpunk', 'monokai', 'dracula'];
        if (validThemes.includes(chosen)) {
          setCurrentTheme(chosen);
          newLines.push({
            id: (Date.now() + 1).toString(),
            type: 'output',
            text: `[✓] Terminal theme switched to: [${chosen}].`,
          });
        } else {
          newLines.push({
            id: (Date.now() + 1).toString(),
            type: 'error',
            text: `Usage: theme <default | matrix | cyberpunk | monokai | dracula>`,
          });
        }
        break;
      }

      case 'calc': {
        const expr = args.join('');
        if (!expr) {
          newLines.push({ id: (Date.now() + 1).toString(), type: 'error', text: 'Usage: calc <expression>, e.g. calc 2*15+4' });
          break;
        }
        try {
          const sanitized = expr.replace(/sqrt/g, 'Math.sqrt').replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos').replace(/pi/gi, 'Math.PI');
          if (/^[0-9+\-*/().^% \tMath.sqrt|sin|cos|tan|abs|floor|ceil|random|PI|E]+$/.test(sanitized)) {
            const result = Function(`"use strict"; return (${sanitized})`)();
            newLines.push({
              id: (Date.now() + 1).toString(),
              type: 'output',
              component: (
                <div className="flex items-center space-x-2 text-zinc-200 font-mono py-0.5">
                  <Calculator className="w-3.5 h-3.5 text-blue-400" />
                  <span>{expr} = <strong className="text-emerald-400 font-bold">{result}</strong></span>
                </div>
              ),
            });
          } else {
            newLines.push({ id: (Date.now() + 1).toString(), type: 'error', text: 'Error: invalid mathematical tokens in expression' });
          }
        } catch (err) {
          newLines.push({ id: (Date.now() + 1).toString(), type: 'error', text: `Syntax error: ${(err as Error).message}` });
        }
        break;
      }

      case 'history':
        newLines.push({
          id: (Date.now() + 1).toString(),
          type: 'output',
          component: (
            <div className="space-y-0.5 text-xs text-zinc-400 font-mono py-1">
              {commandHistory.length === 0 ? (
                <div>No commands recorded yet.</div>
              ) : (
                commandHistory.map((item, idx) => (
                  <div key={idx} className="flex space-x-3">
                    <span className="text-zinc-600 w-6 text-right">{idx + 1}</span>
                    <span className="text-zinc-200">{item}</span>
                  </div>
                ))
              )}
            </div>
          ),
        });
        break;

      case 'echo':
        newLines.push({ id: (Date.now() + 1).toString(), type: 'output', text: args.join(' ') });
        break;

      case 'clear':
        setHistory([]);
        return;

      case 'neofetch':
        newLines.push({
          id: (Date.now() + 1).toString(),
          type: 'output',
          component: (
            <div className="flex flex-col sm:flex-row gap-4 py-2 text-xs font-mono">
              <pre className="text-emerald-400 font-bold select-none leading-none">
{`   ___     ___  
  / _ \\   / _ \\ 
 | (_) | | (_) |
  \\___/   \\___/ 
  |___|   |___| 
 /     \\ /     \\
|  A E T H E R  |
 \\_____/ \\_____/`}
              </pre>
              <div className="space-y-0.5 text-zinc-300">
                <div className="text-emerald-400 font-bold">guest@aether-webos</div>
                <div className="text-zinc-500">----------------------</div>
                <div><span className="text-zinc-400">OS:</span> AetherOS v2.5.0-enterprise x86_64</div>
                <div><span className="text-zinc-400">Host:</span> WebAssembly Hypervisor</div>
                <div><span className="text-zinc-400">Kernel:</span> 6.12.0-webos-hardened</div>
                <div><span className="text-zinc-400">Uptime:</span> {Math.floor(performance.now() / 60000)} mins</div>
                <div><span className="text-zinc-400">Shell:</span> Aether-sh 5.2.15</div>
                <div><span className="text-zinc-400">Resolution:</span> {window.innerWidth}x{window.innerHeight}</div>
                <div><span className="text-zinc-400">Theme:</span> Linear Dark / Zinc Minimal</div>
                <div><span className="text-zinc-400">Memory:</span> ~48MB / 4096MB (Allocated)</div>
                <div className="flex space-x-1.5 pt-2">
                  <span className="w-3 h-3 rounded-full bg-zinc-800" />
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="w-3 h-3 rounded-full bg-cyan-500" />
                  <span className="w-3 h-3 rounded-full bg-zinc-200" />
                </div>
              </div>
            </div>
          ),
        });
        break;

      case 'ping': {
        const host = args[0] || '1.1.1.1';
        newLines.push({
          id: (Date.now() + 1).toString(),
          type: 'output',
          component: (
            <div className="space-y-0.5 text-xs text-zinc-300 font-mono py-1">
              <div>PING {host} (56 data bytes):</div>
              <div>64 bytes from {host}: icmp_seq=1 ttl=58 time={(Math.random() * 8 + 12).toFixed(1)} ms</div>
              <div>64 bytes from {host}: icmp_seq=2 ttl=58 time={(Math.random() * 8 + 11).toFixed(1)} ms</div>
              <div>64 bytes from {host}: icmp_seq=3 ttl=58 time={(Math.random() * 8 + 13).toFixed(1)} ms</div>
              <div>64 bytes from {host}: icmp_seq=4 ttl=58 time={(Math.random() * 8 + 12).toFixed(1)} ms</div>
              <div className="text-zinc-500">--- {host} ping statistics ---</div>
              <div>4 packets transmitted, 4 packets received, 0.0% packet loss</div>
            </div>
          ),
        });
        break;
      }

      case 'matrix':
        setIsMatrixRunning(true);
        return;

      case 'whoami':
        newLines.push({ id: (Date.now() + 1).toString(), type: 'output', text: 'guest (AetherOS Operator)' });
        break;

      case 'date':
        newLines.push({ id: (Date.now() + 1).toString(), type: 'output', text: new Date().toString() });
        break;

      case 'uname':
        newLines.push({
          id: (Date.now() + 1).toString(),
          type: 'output',
          text: 'AetherOS 2.5.0-enterprise x86_64 WebAssembly GNU/Linux',
        });
        break;

      default:
        newLines.push({
          id: (Date.now() + 1).toString(),
          type: 'error',
          text: `bash: ${cmd}: command not found. Type "help" to view built-in commands.`,
        });
        break;
    }

    setHistory((prev) => [...prev, ...newLines]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal);
      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIndex);
        setInputVal(commandHistory[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIndex = historyIndex + 1;
        if (nextIndex < commandHistory.length) {
          setHistoryIndex(nextIndex);
          setInputVal(commandHistory[nextIndex]);
        } else {
          setHistoryIndex(-1);
          setInputVal('');
        }
      }
    }
  };

  const themeMap: Record<TerminalTheme, { bg: string; text: string; prompt: string; caret: string }> = {
    default: { bg: 'bg-[#0a0a0c]', text: 'text-zinc-300', prompt: 'text-emerald-400', caret: 'caret-emerald-400' },
    matrix: { bg: 'bg-[#020d04]', text: 'text-green-400', prompt: 'text-green-500', caret: 'caret-green-400' },
    cyberpunk: { bg: 'bg-[#0f0917]', text: 'text-pink-300', prompt: 'text-cyan-400', caret: 'caret-cyan-400' },
    monokai: { bg: 'bg-[#181610]', text: 'text-amber-100', prompt: 'text-amber-400', caret: 'caret-amber-400' },
    dracula: { bg: 'bg-[#120f1f]', text: 'text-purple-200', prompt: 'text-purple-400', caret: 'caret-purple-400' },
  };

  const currentT = themeMap[currentTheme] || themeMap.default;

  return (
    <div
      onClick={handleTerminalClick}
      className={`relative flex flex-col h-full ${currentT.bg} ${currentT.text} font-mono text-xs select-text overflow-hidden transition-colors duration-200`}
    >
      {/* 终端内容滚动区 */}
      <div ref={containerRef} className="flex-1 p-3.5 overflow-y-auto space-y-2">
        {history.map((line) => {
          if (line.type === 'system') {
            return (
              <div key={line.id} className="text-zinc-500 italic">
                {line.text}
              </div>
            );
          }
          if (line.type === 'input') {
            return (
              <div key={line.id} className="flex items-center space-x-2">
                <span className={`${currentT.prompt} font-semibold select-none`}>guest@webos:~$</span>
                <span className="text-zinc-100">{line.text}</span>
              </div>
            );
          }
          if (line.type === 'error') {
            return (
              <div key={line.id} className="text-rose-400">
                {line.text}
              </div>
            );
          }
          return (
            <div key={line.id}>
              {line.component ? line.component : <div className="text-zinc-300">{line.text}</div>}
            </div>
          );
        })}

        {/* 交互输入提示符行 */}
        {!isMatrixRunning && !isTopRunning && (
          <div className="flex items-center space-x-2 pt-0.5">
            <span className={`${currentT.prompt} font-semibold select-none shrink-0`}>guest@webos:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className={`flex-1 bg-transparent text-zinc-100 outline-none border-none p-0 font-mono text-xs ${currentT.caret}`}
            />
          </div>
        )}
      </div>

      {/* Top / Htop 动态系统监视覆盖层 */}
      {isTopRunning && (
        <div className="absolute inset-0 bg-zinc-950 z-40 p-4 font-mono text-xs text-zinc-300 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="font-bold text-zinc-100">AETHER-TOP — Realtime Process Monitor</span>
            </div>
            <button
              onClick={() => setIsTopRunning(false)}
              className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] transition-colors"
            >
              退出监控 (Q)
            </button>
          </div>

          <div className="space-y-1 text-[11px] text-zinc-400">
            <div className="flex justify-between">
              <span>Tasks: 18 total, 1 running, 17 sleeping</span>
              <span className="text-emerald-400">Load average: 0.18, 0.22, 0.15</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-16">CPU:</span>
              <div className="flex-1 bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                <div style={{ width: `${topCpu}%` }} className="bg-emerald-400 h-full transition-all duration-300" />
              </div>
              <span className="w-12 text-right font-bold text-zinc-200">{topCpu}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-16">Mem:</span>
              <div className="flex-1 bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                <div style={{ width: '34%' }} className="bg-blue-400 h-full" />
              </div>
              <span className="w-12 text-right font-bold text-zinc-200">34%</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-900 pt-2">
            <div className="grid grid-cols-[60px_1fr_60px_60px] pb-1 text-[10px] font-bold text-zinc-500 uppercase">
              <span>PID</span>
              <span>COMMAND</span>
              <span className="text-right">%CPU</span>
              <span className="text-right">%MEM</span>
            </div>
            <div className="grid grid-cols-[60px_1fr_60px_60px] py-1 text-[11px]">
              <span className="text-zinc-500 font-mono">1</span>
              <span className="text-emerald-400 font-medium">aetheros-kernel</span>
              <span className="text-right font-mono">1.2</span>
              <span className="text-right font-mono">2.1</span>
            </div>
            <div className="grid grid-cols-[60px_1fr_60px_60px] py-1 text-[11px]">
              <span className="text-zinc-500 font-mono">412</span>
              <span className="text-zinc-200">desktop-compositor</span>
              <span className="text-right font-mono">{(topCpu * 0.4).toFixed(1)}</span>
              <span className="text-right font-mono">4.8</span>
            </div>
            <div className="grid grid-cols-[60px_1fr_60px_60px] py-1 text-[11px]">
              <span className="text-zinc-500 font-mono">518</span>
              <span className="text-zinc-200">webaudio-synthesizer</span>
              <span className="text-right font-mono">0.8</span>
              <span className="text-right font-mono">3.2</span>
            </div>
            <div className="grid grid-cols-[60px_1fr_60px_60px] py-1 text-[11px]">
              <span className="text-zinc-500 font-mono">724</span>
              <span className="text-zinc-200">markdown-parser-v8</span>
              <span className="text-right font-mono">0.2</span>
              <span className="text-right font-mono">1.9</span>
            </div>
          </div>
        </div>
      )}

      {/* Matrix 字符雨覆盖层 */}
      {isMatrixRunning && (
        <div className="absolute inset-0 bg-[#09090b] z-50 flex flex-col">
          <div className="px-3 py-1 bg-zinc-950/80 border-b border-zinc-800 text-[10px] text-zinc-400 flex items-center justify-between">
            <span className="text-emerald-400 flex items-center space-x-1.5">
              <Sparkles className="w-3 h-3" />
              <span>THE MATRIX CODE STREAM</span>
            </span>
            <button
              onClick={() => setIsMatrixRunning(false)}
              className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] transition-colors flex items-center space-x-1"
            >
              <span>退出 (Q)</span>
            </button>
          </div>
          <canvas ref={canvasRef} className="flex-1 w-full h-full block" />
        </div>
      )}
    </div>
  );
};

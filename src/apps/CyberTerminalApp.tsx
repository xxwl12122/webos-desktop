import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Sparkles } from 'lucide-react';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'system' | 'error';
  text?: string;
  component?: React.ReactNode;
}

export const CyberTerminalApp: React.FC = () => {
  const [history, setHistory] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      type: 'system',
      text: 'AetherOS Cyber Terminal v2.5.0-release (x86_64-pc-none-wasm)',
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

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
  }, [history]);

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
              <div className="text-zinc-400 font-semibold mb-1">Available Shell Builtins:</div>
              <div className="grid grid-cols-[140px_1fr] gap-x-2 gap-y-1 text-xs">
                <span className="text-emerald-400">help</span>
                <span className="text-zinc-400">Display this command summary</span>
                <span className="text-emerald-400">neofetch</span>
                <span className="text-zinc-400">Print system architecture info & logo</span>
                <span className="text-emerald-400">ping &lt;host&gt;</span>
                <span className="text-zinc-400">Test network latency diagnostics</span>
                <span className="text-emerald-400">matrix</span>
                <span className="text-zinc-400">Launch Matrix digital rain (Press Q to exit)</span>
                <span className="text-emerald-400">whoami</span>
                <span className="text-zinc-400">Print current user identity</span>
                <span className="text-emerald-400">date</span>
                <span className="text-zinc-400">Print current ISO date/time</span>
                <span className="text-emerald-400">uname -a</span>
                <span className="text-zinc-400">Print system kernel string</span>
                <span className="text-emerald-400">clear</span>
                <span className="text-zinc-400">Clear terminal screen buffer</span>
              </div>
            </div>
          ),
        });
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

  return (
    <div
      onClick={handleTerminalClick}
      className="relative flex flex-col h-full bg-[#0a0a0c] text-zinc-300 font-mono text-xs select-text overflow-hidden"
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
                <span className="text-emerald-400 font-semibold select-none">guest@webos:~$</span>
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
        {!isMatrixRunning && (
          <div className="flex items-center space-x-2 pt-0.5">
            <span className="text-emerald-400 font-semibold select-none shrink-0">guest@webos:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="flex-1 bg-transparent text-zinc-100 outline-none border-none p-0 font-mono text-xs caret-emerald-400"
            />
          </div>
        )}
      </div>

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

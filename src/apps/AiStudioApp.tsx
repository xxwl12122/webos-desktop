import React, { useState, useRef, useEffect } from 'react';
import { Send, Settings, Sparkles, User, Bot, Copy, Check, Download, RotateCcw } from 'lucide-react';
import { AiStudioConfig } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metrics?: {
    tokens: number;
    elapsedMs: number;
  };
}

interface AiStudioAppProps {
  config: AiStudioConfig;
  onUpdateConfig: (newConfig: AiStudioConfig) => void;
}

const PRESET_PROMPTS = [
  { name: '极客全栈架构师', prompt: '你是 AetherOS 内置的资深全栈系统架构师，精通现代 Web 体系，回答干练精准，代码规范。' },
  { name: '代码质量审查官', prompt: '你是顶尖的 Code Reviewer，严苛审查代码中的性能瓶颈、内存泄漏、安全漏洞与设计模式问题。' },
  { name: '赛博哲学黑客', prompt: '你是一个身处赛博朋克世界的黑客哲学家，用简短冷峻且充满黑客底蕴的口吻讨论技术与未来。' },
];

export const AiStudioApp: React.FC<AiStudioAppProps> = ({ config, onUpdateConfig }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '你好！我是 **Aether AI Studio** 模型工作舱。\n\n本终端支持连接任何标准 OpenAI 兼容大模型（如 OpenAI / DeepSeek / Ollama 本地模型）。你可以在右上角配置密钥与预设角色，支持实时流式打字与耗时监控。',
    },
  ]);
  const [input, setInput] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerConfig, setDrawerConfig] = useState<AiStudioConfig>(config);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSaveConfig = () => {
    onUpdateConfig(drawerConfig);
    setIsDrawerOpen(false);
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'system', content: 'OpenAI 兼容配置已成功更新并持久化。' },
    ]);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportChat = (format: 'md' | 'json') => {
    let content = '';
    let filename = `AetherOS-Chat-${new Date().toISOString().slice(0, 10)}`;

    if (format === 'json') {
      content = JSON.stringify(messages, null, 2);
      filename += '.json';
    } else {
      content = messages
        .map((m) => `### ${m.role === 'user' ? 'User' : 'Assistant'}\n\n${m.content}\n`)
        .join('\n---\n\n');
      filename += '.md';
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const startTime = performance.now();
    const { baseUrl, model, apiKey, systemPrompt } = config;

    // 若未填 Key，则启动内置极客模拟流
    if (!apiKey) {
      setTimeout(() => {
        let simulatedText = '';
        if (text.toLowerCase().includes('hello') || text.includes('你好')) {
          simulatedText = `你好！我是 **Aether AI Studio** 本地助理。\n\n当前处于离线沙箱。你可以点击右上角配置真实的 OpenAI / DeepSeek API 密钥与端点，即可无缝解锁千亿参数流式推理能力。`;
        } else if (text.includes('架构') || text.includes('window') || text.includes('snap')) {
          simulatedText = `### AetherOS 桌面系统核心架构：\n\n1. **边缘吸附 Snap Assist**：拖拽至左右或顶部呼出半透明占位框，松开自动平滑栅格化。\n2. **数组栈层级调度**：杜绝 \`zIndex++\` 累加溢出。\n3. **全局快捷启动**：支持 \`Ctrl+K\` / \`Cmd+K\` 全局 Spotlight 快速调起。`;
        } else {
          simulatedText = `收到指令：\`${text}\`。\n\nAI Studio 正在以极客纯净流式模式工作。你可以随时在右上角切换系统设定为“代码审查官”或导出当前对话。`;
        }

        const botMsgId = (Date.now() + 1).toString();
        setMessages((prev) => [...prev, { id: botMsgId, role: 'assistant', content: '' }]);

        let charIndex = 0;
        const interval = setInterval(() => {
          charIndex += 2;
          const slice = simulatedText.slice(0, charIndex);
          const elapsed = Math.round(performance.now() - startTime);

          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId
                ? {
                    ...m,
                    content: slice,
                    metrics: { tokens: Math.round(slice.length * 0.8), elapsedMs: elapsed },
                  }
                : m
            )
          );

          if (charIndex >= simulatedText.length) {
            clearInterval(interval);
            setIsLoading(false);
          }
        }, 16);
      }, 300);
      return;
    }

    // 真实 OpenAI 兼容流式请求
    const apiEndpoint = (baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '') + '/chat/completions';
    const botMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: botMsgId, role: 'assistant', content: '' }]);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt || '你是 AetherOS 资深系统助手。' },
            { role: 'user', content: text },
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API 异常: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const json = JSON.parse(line.replace('data: ', ''));
                const token = json.choices?.[0]?.delta?.content || '';
                fullText += token;
                const elapsed = Math.round(performance.now() - startTime);

                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botMsgId
                      ? {
                          ...m,
                          content: fullText,
                          metrics: { tokens: Math.round(fullText.length * 0.8), elapsedMs: elapsed },
                        }
                      : m
                  )
                );
              } catch (_) {}
            }
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId
            ? { ...m, content: `请求异常: ${err.message}。请核验 Base URL、Key 或网络跨域情况。` }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = (content: string, msgId: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0].includes(' ') ? '' : lines[0];
        const code = lang ? lines.slice(1).join('\n') : lines.join('\n');
        const blockId = `${msgId}-${index}`;

        return (
          <div key={index} className="my-2.5 rounded-lg border border-zinc-800 bg-[#09090c] overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1 bg-zinc-900/90 border-b border-zinc-800 text-[10px] text-zinc-400 font-mono">
              <span>{lang || 'code'}</span>
              <button
                onClick={() => handleCopy(code, blockId)}
                className="flex items-center space-x-1 hover:text-white transition-colors"
              >
                {copiedId === blockId ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>复制</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      return (
        <span key={index} className="whitespace-pre-wrap leading-relaxed text-xs">
          {part.split('\n').map((line, lIndex) => {
            if (line.startsWith('### ')) {
              return <h4 key={lIndex} className="text-sm font-bold text-zinc-100 mt-2.5 mb-1">{line.slice(4)}</h4>;
            }
            return (
              <React.Fragment key={lIndex}>
                {line}
                {lIndex < part.split('\n').length - 1 && <br />}
              </React.Fragment>
            );
          })}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-zinc-200">
      {/* 顶部工具栏 */}
      <div className="px-3.5 py-2 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-medium text-zinc-300">
          <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
          <span>AI Studio 工作舱</span>
          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800/80 px-1.5 py-0.5 rounded">
            {config.model || 'gpt-4o-mini'}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleExportChat('md')}
            title="导出为 Markdown"
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMessages([messages[0]])}
            title="清空会话"
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="text-[11px] text-zinc-300 hover:text-white flex items-center space-x-1 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 transition-colors ml-1"
          >
            <Settings className="w-3 h-3" />
            <span>{isDrawerOpen ? '关闭' : '配置'}</span>
          </button>
        </div>
      </div>

      {/* 模型配置面板 */}
      {isDrawerOpen && (
        <div className="bg-zinc-900/95 border-b border-zinc-800 p-3.5 space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-zinc-200 font-semibold mb-1">
            <span>OpenAI 兼容模型与系统人设</span>
            <span className="text-[10px] text-zinc-400 font-normal">支持 DeepSeek / Ollama / OpenAI</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">Base URL</label>
              <input
                type="text"
                value={drawerConfig.baseUrl}
                onChange={(e) => setDrawerConfig({ ...drawerConfig, baseUrl: e.target.value })}
                placeholder="https://api.openai.com/v1"
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-zinc-200 text-xs focus:border-zinc-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">Model Name</label>
              <input
                type="text"
                value={drawerConfig.model}
                onChange={(e) => setDrawerConfig({ ...drawerConfig, model: e.target.value })}
                placeholder="gpt-4o-mini / deepseek-chat"
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-zinc-200 text-xs focus:border-zinc-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 block mb-1">API Key</label>
            <input
              type="password"
              value={drawerConfig.apiKey}
              onChange={(e) => setDrawerConfig({ ...drawerConfig, apiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-zinc-200 text-xs focus:border-zinc-500 outline-none font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-zinc-400">System Prompt (系统人设)</label>
              <div className="space-x-1">
                {PRESET_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setDrawerConfig({ ...drawerConfig, systemPrompt: p.prompt })}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={2}
              value={drawerConfig.systemPrompt}
              onChange={(e) => setDrawerConfig({ ...drawerConfig, systemPrompt: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300 text-xs outline-none focus:border-zinc-500 resize-none font-mono"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleSaveConfig}
              className="px-3.5 py-1 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-xs transition-colors font-medium shadow"
            >
              保存配置
            </button>
          </div>
        </div>
      )}

      {/* 消息历史列表 */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans">
        {messages.map((msg) => {
          if (msg.role === 'system') {
            return (
              <div key={msg.id} className="w-full text-center text-[10px] text-zinc-500 my-1 font-mono">
                [系统通知] {msg.content}
              </div>
            );
          }

          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                  isUser ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className="max-w-[85%] space-y-1">
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-zinc-200 ${
                    isUser ? 'bg-zinc-800/90 border border-zinc-700/60 rounded-tr-sm text-white' : 'bg-zinc-900/70 border border-zinc-800 rounded-tl-sm'
                  }`}
                >
                  {renderContent(msg.content, msg.id)}
                </div>
                {msg.metrics && (
                  <div className="text-[10px] font-mono text-zinc-500 px-1">
                    耗时 {msg.metrics.elapsedMs}ms · 约 {msg.metrics.tokens} tokens
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入控制栏 */}
      <div className="p-3 bg-zinc-900/60 border-t border-zinc-800 flex items-center space-x-2">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="给 AI Studio 发送指令... (Enter 发送, Shift+Enter 换行)"
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-zinc-600 resize-none transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="p-2.5 bg-zinc-100 hover:bg-white text-zinc-950 disabled:opacity-40 rounded-xl shadow-lg transition-transform active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { Send, Settings, Sparkles, User, Bot, Copy, Check } from 'lucide-react';
import { AiConfig } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AiCopilotAppProps {
  config: AiConfig;
  onUpdateConfig: (newConfig: AiConfig) => void;
}

export const AiCopilotApp: React.FC<AiCopilotAppProps> = ({ config, onUpdateConfig }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '你好！我是 **AetherOS** 内置 AI 助理。\n\n我可以辅助你编写代码、检索知识或探讨系统架构。你可以点击右上角配置真实 API 密钥，亦可在此体验极客交互与 Markdown 代码块渲染！',
    },
  ]);
  const [input, setInput] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerConfig, setDrawerConfig] = useState<AiConfig>(config);
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
      { id: Date.now().toString(), role: 'system', content: 'OpenAI API 兼容配置已成功更新并持久化至本地。' },
    ]);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const { baseUrl, model, apiKey } = config;

    // 若无 Key 则执行本地模拟打字机输出
    if (!apiKey) {
      setTimeout(() => {
        let simulatedText = '';
        if (text.toLowerCase().includes('hello') || text.includes('你好')) {
          simulatedText = `你好！我是 **AetherOS** 本地助理内核。\n\n当前处于离线沙箱模式。你可以在右上角配置真实的 OpenAI / DeepSeek API 密钥，即可解锁千亿级全量流式大模型能力。`;
        } else if (text.includes('架构') || text.includes('window') || text.includes('窗口')) {
          simulatedText = `### AetherOS 窗口管理器核心设计：\n\n1. **防断触遮罩**：拖拽/缩放时动态应用 \`pointer-events: none\`，彻底杜绝穿透。\n2. **数组调度栈**：基于 \`windowStack\` 索引动态分配 \`zIndex\`，拒绝数值溢出。\n\n\`\`\`typescript\nfunction bringToFront(id: string) {\n  setWindowStack((prev) => [...prev.filter((i) => i !== id), id]);\n}\n\`\`\``;
        } else {
          simulatedText = `收到指令：\`${text}\`。\n\nAetherOS 生产版已就绪，当前可正常体验窗口拖拽、Dock 栏伸缩与本地记事本实时持久化。`;
        }

        const botMsgId = (Date.now() + 1).toString();
        setMessages((prev) => [...prev, { id: botMsgId, role: 'assistant', content: '' }]);

        let charIndex = 0;
        const interval = setInterval(() => {
          charIndex += 2;
          const slice = simulatedText.slice(0, charIndex);
          setMessages((prev) =>
            prev.map((m) => (m.id === botMsgId ? { ...m, content: slice } : m))
          );
          if (charIndex >= simulatedText.length) {
            clearInterval(interval);
            setIsLoading(false);
          }
        }, 16);
      }, 300);
      return;
    }

    // 若配置了 API 则请求真实接口
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
            { role: 'system', content: '你是 AetherOS 极客桌面内置助理，技术功底扎实，回答简练专业。' },
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
                setMessages((prev) =>
                  prev.map((m) => (m.id === botMsgId ? { ...m, content: fullText } : m))
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
            ? { ...m, content: `请求失败: ${err.message}。请检查 Base URL 与 API Key 是否有效。` }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = (content: string, msgId: string) => {
    // 简易 Markdown 解析器（处理代码块、行内代码、粗体、标题）
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0].includes(' ') ? '' : lines[0];
        const code = lang ? lines.slice(1).join('\n') : lines.join('\n');
        const blockId = `${msgId}-${index}`;

        return (
          <div key={index} className="my-2 rounded-lg overflow-hidden border border-white/10 bg-black/70">
            <div className="flex items-center justify-between px-3 py-1 bg-white/5 border-b border-white/10 text-[10px] text-slate-400 font-mono">
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
            <pre className="p-3 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // 文本部分
      return (
        <span key={index} className="whitespace-pre-wrap leading-relaxed">
          {part.split('\n').map((line, lIndex) => {
            if (line.startsWith('### ')) {
              return <h4 key={lIndex} className="text-sm font-bold text-purple-300 mt-2 mb-1">{line.slice(4)}</h4>;
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
    <div className="flex flex-col h-full bg-slate-950 text-slate-200">
      {/* 顶部副工具栏 */}
      <div className="px-3.5 py-2 bg-slate-900/90 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-medium text-purple-300">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>终端会话</span>
        </div>
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center space-x-1 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/30 transition-colors"
        >
          <Settings className="w-3 h-3" />
          <span>{isDrawerOpen ? '关闭设置' : '模型配置'}</span>
        </button>
      </div>

      {/* 配置抽屉 */}
      {isDrawerOpen && (
        <div className="bg-slate-900/95 border-b border-purple-500/20 p-3.5 space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-purple-300 font-semibold mb-1">
            <span>OpenAI 兼容 API 设置</span>
            <span className="text-[10px] text-slate-400 font-normal">留空即启用内置模拟引擎</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Base URL (接口地址)</label>
              <input
                type="text"
                value={drawerConfig.baseUrl}
                onChange={(e) => setDrawerConfig({ ...drawerConfig, baseUrl: e.target.value })}
                placeholder="https://api.openai.com/v1"
                className="w-full bg-slate-950 border border-white/10 rounded px-2.5 py-1 text-slate-200 text-xs focus:border-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Model Name (模型标识)</label>
              <input
                type="text"
                value={drawerConfig.model}
                onChange={(e) => setDrawerConfig({ ...drawerConfig, model: e.target.value })}
                placeholder="gpt-4o-mini / deepseek-chat"
                className="w-full bg-slate-950 border border-white/10 rounded px-2.5 py-1 text-slate-200 text-xs focus:border-purple-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">API Key (本地安全持久化)</label>
            <input
              type="password"
              value={drawerConfig.apiKey}
              onChange={(e) => setDrawerConfig({ ...drawerConfig, apiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full bg-slate-950 border border-white/10 rounded px-2.5 py-1 text-slate-200 text-xs focus:border-purple-500 outline-none font-mono"
            />
          </div>
          <div className="flex justify-end pt-1">
            <button
              onClick={handleSaveConfig}
              className="px-3.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs transition-colors font-medium"
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
              <div key={msg.id} className="w-full text-center text-[10px] text-purple-400/80 my-1 font-mono">
                [系统通知] {msg.content}
              </div>
            );
          }

          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                  isUser
                    ? 'bg-blue-600 border-blue-400/30'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600 border-purple-400/30'
                }`}
              >
                {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-slate-200 ${
                  isUser
                    ? 'bg-blue-600/80 border border-blue-400/20 rounded-tr-sm text-white'
                    : 'bg-white/5 border border-white/10 rounded-tl-sm'
                }`}
              >
                {renderContent(msg.content, msg.id)}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入控制栏 */}
      <div className="p-3 bg-slate-900/90 border-t border-white/10 flex items-center space-x-2">
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
          placeholder="给 AI 助理发送消息... (Enter 发送, Shift+Enter 换行)"
          className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500 resize-none transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 rounded-xl text-white shadow-lg transition-transform active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Columns, Eye, Edit3, Download, Trash2, Check, Clock } from 'lucide-react';

interface NotepadProAppProps {
  content: string;
  onUpdateContent: (val: string) => void;
}

type ViewMode = 'split' | 'edit' | 'preview';

export const NotepadProApp: React.FC<NotepadProAppProps> = ({ content, onUpdateContent }) => {
  const [text, setText] = useState(content);
  const [viewMode, setViewMode] = useState<ViewMode>(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 'edit' : 'split'));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setText(content);
  }, [content]);

  useEffect(() => {
    setIsSaving(true);
    const handler = setTimeout(() => {
      onUpdateContent(text);
      setIsSaving(false);
    }, 300);
    return () => clearTimeout(handler);
  }, [text, onUpdateContent]);

  // 导出 .md 文件
  const handleExport = () => {
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AetherOS-Note-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (window.confirm('确认清空所有笔记内容？')) {
      setText('');
    }
  };

  // 轻量级 Markdown 语法渲染器
  const renderMarkdown = (raw: string) => {
    const lines = raw.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let codeLang = '';

    lines.forEach((line, idx) => {
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLang = line.slice(3).trim();
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          elements.push(
            <div key={`code-${idx}`} className="my-2.5 rounded-lg border border-zinc-800 bg-[#0c0c0e] overflow-hidden">
              <div className="px-3 py-1 bg-zinc-900/80 border-b border-zinc-800 text-[10px] text-zinc-400 font-mono flex justify-between">
                <span>{codeLang || 'plaintext'}</span>
              </div>
              <pre className="p-3 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                <code>{codeBuffer.join('\n')}</code>
              </pre>
            </div>
          );
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // H1
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={idx} className="text-lg font-bold text-zinc-100 pb-1 mb-2 border-b border-zinc-800/80 mt-3 first:mt-0">
            {line.slice(2)}
          </h1>
        );
        return;
      }
      // H2
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={idx} className="text-base font-semibold text-zinc-200 mt-3 mb-1.5 pb-0.5 border-b border-zinc-800/50">
            {line.slice(3)}
          </h2>
        );
        return;
      }
      // H3
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={idx} className="text-sm font-semibold text-zinc-300 mt-2.5 mb-1">
            {line.slice(4)}
          </h3>
        );
        return;
      }

      // Blockquote
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={idx} className="border-l-2 border-zinc-600 pl-3 my-2 text-zinc-400 italic text-xs">
            {line.slice(2)}
          </blockquote>
        );
        return;
      }

      // Task list item
      if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
        const checked = line.startsWith('- [x] ');
        const label = line.slice(6);
        elements.push(
          <div key={idx} className="flex items-center space-x-2 my-1 text-xs">
            <input type="checkbox" checked={checked} readOnly className="rounded border-zinc-700 accent-zinc-500" />
            <span className={checked ? 'line-through text-zinc-500' : 'text-zinc-300'}>{label}</span>
          </div>
        );
        return;
      }

      // List item
      if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={idx} className="ml-4 list-disc text-zinc-300 text-xs my-0.5 leading-relaxed">
            {line.slice(2)}
          </li>
        );
        return;
      }

      // Empty line
      if (!line.trim()) {
        elements.push(<div key={idx} className="h-2" />);
        return;
      }

      // Paragraph with inline bold and inline code
      elements.push(
        <p key={idx} className="text-xs text-zinc-300 leading-relaxed my-1">
          {line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((token, tIdx) => {
            if (token.startsWith('`') && token.endsWith('`')) {
              return (
                <code key={tIdx} className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700/60 font-mono text-[11px] text-amber-300">
                  {token.slice(1, -1)}
                </code>
              );
            }
            if (token.startsWith('**') && token.endsWith('**')) {
              return (
                <strong key={tIdx} className="font-semibold text-zinc-100">
                  {token.slice(2, -2)}
                </strong>
              );
            }
            return token;
          })}
        </p>
      );
    });

    return elements;
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-zinc-300">
      {/* 顶部次级操作栏 */}
      <div className="px-3 py-1.5 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1 bg-zinc-950/80 p-0.5 rounded-lg border border-zinc-800">
          <button
            onClick={() => setViewMode('edit')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center space-x-1 ${
              viewMode === 'edit' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            <span className="hidden sm:inline">编辑</span>
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center space-x-1 ${
              viewMode === 'split' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Columns className="w-3 h-3" />
            <span className="hidden sm:inline">分屏</span>
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center space-x-1 ${
              viewMode === 'preview' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">预览</span>
          </button>
        </div>

        <div className="flex items-center space-x-3 text-[11px] text-zinc-400">
          <div className="flex items-center space-x-1.5 font-mono">
            {isSaving ? (
              <span className="flex items-center space-x-1 text-amber-400">
                <Clock className="w-3 h-3 animate-spin" />
                <span>同步中</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-emerald-400">
                <Check className="w-3 h-3" />
                <span>已同步</span>
              </span>
            )}
            <span className="text-zinc-600">|</span>
            <span>{text.length} 字符</span>
          </div>

          <div className="flex items-center space-x-1 border-l border-zinc-800 pl-3">
            <button
              onClick={handleExport}
              title="导出为 .md 文件"
              className="p-1 rounded hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleClear}
              title="清空笔记"
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 主工作区 (移动端小屏上下分屏，大屏左右分屏) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* 编辑区 */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`flex flex-col ${viewMode === 'split' ? 'h-1/2 md:h-full w-full md:w-1/2 border-b md:border-b-0 md:border-r border-zinc-800/80' : 'w-full h-full'}`}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="# 开始记录你的极客灵感与架构设计..."
              className="w-full flex-1 bg-transparent p-3 sm:p-4 text-xs font-mono text-zinc-200 outline-none resize-none leading-relaxed placeholder-zinc-600 selection:bg-zinc-700 selection:text-white"
            />
          </div>
        )}

        {/* 预览区 */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`p-3 sm:p-4 overflow-y-auto bg-zinc-950/40 select-text ${viewMode === 'split' ? 'h-1/2 md:h-full w-full md:w-1/2' : 'w-full h-full'}`}>
            {renderMarkdown(text)}
          </div>
        )}
      </div>
    </div>
  );
};

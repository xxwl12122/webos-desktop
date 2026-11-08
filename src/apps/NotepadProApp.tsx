import React, { useState, useEffect } from 'react';
import { Columns, Eye, Edit3, Download, Trash2, Check, Clock, FilePlus, Folder, ChevronRight, ChevronLeft, FileText } from 'lucide-react';

interface NotepadProAppProps {
  content: string;
  onUpdateContent: (val: string) => void;
}

interface NoteDoc {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

type ViewMode = 'split' | 'edit' | 'preview';

const INITIAL_DOCS: NoteDoc[] = [
  {
    id: 'doc-1',
    title: 'AetherOS 架构设计.md',
    updatedAt: '今天 12:00',
    content: `# AetherOS 极客桌面核心架构

欢迎使用 **Notepad Pro 知识库**。现代系统级 WebOS 体验。

---

### 一、 核心技术栈
- **渲染核心**: React 18 + TypeScript + Vite 6
- **设计规范**: Tailwind CSS 暗黑极客质感，多层亚克力毛玻璃
- **视口断点**: 手机端沉浸式全屏卡片化，平板与桌面自由浮动吸附

### 二、 系统核心交互
- [x] **Snap Assist 边缘吸附**: 拖拽靠近左、右、顶侧自动半屏或全屏贴靠
- [x] **任务栏 Hover Preview**: 悬停任务栏即时预览微缩卡片
- [x] **Alt + Tab 任务切换**: 经典 Windows 多任务平视轮播
- [x] **网络时间毫秒校准**: 离线自增与防漂移算法
`,
  },
  {
    id: 'doc-2',
    title: '系统快捷键备忘.md',
    updatedAt: '今天 11:30',
    content: `# AetherOS 必备极客快捷键

| 快捷键 | 功能描述 |
| :--- | :--- |
| **Ctrl + K** / **⌘K** | 呼出全局 Spotlight 快速启动器 |
| **Ctrl + Shift + Esc** | 极速呼出 Windows 任务管理器 |
| **Alt + Tab** | 窗口平视多任务切换轮播 |
| **Delete** | 任务管理器进程列表中快速结束选中任务 |
| **Esc** | 退出 Spotlight、Matrix 字符雨与右键菜单 |
`,
  },
];

export const NotepadProApp: React.FC<NotepadProAppProps> = ({ content, onUpdateContent }) => {
  const [docs, setDocs] = useState<NoteDoc[]>(() => {
    try {
      const saved = localStorage.getItem('aether_notepad_docs');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_DOCS;
  });

  const [activeDocId, setActiveDocId] = useState<string>(docs[0]?.id || 'doc-1');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const activeDoc = docs.find((d) => d.id === activeDocId) || docs[0];

  const [text, setText] = useState(activeDoc ? activeDoc.content : content);
  const [viewMode, setViewMode] = useState<ViewMode>(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 'edit' : 'split'));
  const [isSaving, setIsSaving] = useState(false);

  // 切换文档时同步文本
  useEffect(() => {
    if (activeDoc) {
      setText(activeDoc.content);
    }
  }, [activeDocId]);

  // 文档持久化
  useEffect(() => {
    setIsSaving(true);
    const handler = setTimeout(() => {
      setDocs((prev) => {
        const next = prev.map((d) => (d.id === activeDocId ? { ...d, content: text, updatedAt: '刚刚' } : d));
        try {
          localStorage.setItem('aether_notepad_docs', JSON.stringify(next));
        } catch (_) {}
        return next;
      });
      onUpdateContent(text);
      setIsSaving(false);
    }, 300);
    return () => clearTimeout(handler);
  }, [text, activeDocId, onUpdateContent]);

  // 新建笔记
  const handleNewDoc = () => {
    const newId = `doc-${Date.now()}`;
    const newDoc: NoteDoc = {
      id: newId,
      title: `未命名文档-${docs.length + 1}.md`,
      content: '# 新建文档\n\n在此开始记录新的灵感...',
      updatedAt: '刚刚',
    };
    const nextDocs = [newDoc, ...docs];
    setDocs(nextDocs);
    setActiveDocId(newId);
    setText(newDoc.content);
  };

  // 删除笔记
  const handleDeleteDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (docs.length <= 1) {
      alert('至少保留一篇文档！');
      return;
    }
    if (window.confirm('确认删除此篇文档？')) {
      const nextDocs = docs.filter((d) => d.id !== id);
      setDocs(nextDocs);
      if (activeDocId === id) {
        setActiveDocId(nextDocs[0].id);
        setText(nextDocs[0].content);
      }
    }
  };

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
        <div className="flex items-center space-x-2">
          {/* 文档库展开按钮 */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center space-x-1.5 ${
              isSidebarOpen ? 'bg-zinc-800 text-zinc-100' : 'bg-zinc-950/80 text-zinc-400 hover:text-zinc-200'
            }`}
            title="展开/折叠笔记列表"
          >
            <Folder className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">文档库</span>
          </button>

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

      {/* 主体双栏：左侧文档列表 + 右侧工作区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧文档树列表 */}
        {isSidebarOpen && (
          <div className="w-44 sm:w-48 bg-zinc-950/90 border-r border-zinc-800/80 flex flex-col shrink-0 text-xs">
            <div className="p-2 border-b border-zinc-800/80 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400">知识笔记 ({docs.length})</span>
              <button
                onClick={handleNewDoc}
                className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white transition-colors"
                title="新建笔记"
              >
                <FilePlus className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-900/60 p-1 space-y-0.5">
              {docs.map((doc) => {
                const isActive = doc.id === activeDocId;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setActiveDocId(doc.id)}
                    className={`group px-2 py-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                      isActive ? 'bg-zinc-800/90 text-zinc-100 font-medium' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                      <span className="truncate text-xs">{doc.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteDoc(doc.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-opacity"
                      title="删除笔记"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 右侧主工作区 (移动端小屏上下分屏，大屏左右分屏) */}
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
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Check, Clock } from 'lucide-react';

interface NotepadAppProps {
  content: string;
  onUpdateContent: (val: string) => void;
}

export const NotepadApp: React.FC<NotepadAppProps> = ({ content, onUpdateContent }) => {
  const [text, setText] = useState(content);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setText(content);
  }, [content]);

  useEffect(() => {
    setIsSaving(true);
    const handler = setTimeout(() => {
      onUpdateContent(text);
      setIsSaving(false);
    }, 400);

    return () => clearTimeout(handler);
  }, [text, onUpdateContent]);

  return (
    <div className="flex flex-col h-full bg-slate-950/70 text-slate-200">
      <div className="px-3.5 py-1.5 bg-slate-900/60 border-b border-white/10 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center space-x-1.5">
          {isSaving ? (
            <span className="flex items-center space-x-1 text-amber-400">
              <Clock className="w-3 h-3 animate-spin" />
              <span>同步中...</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-emerald-400">
              <Check className="w-3 h-3" />
              <span>已自动保存</span>
            </span>
          )}
        </div>
        <div className="font-mono text-slate-400">{text.length} 字符</div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="在此记录你的灵感、备忘录或代码笔记 (内容自动实时持久化)..."
        className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-slate-200 outline-none resize-none leading-relaxed placeholder-slate-600"
      />
    </div>
  );
};

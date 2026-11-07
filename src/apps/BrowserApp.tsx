import React, { useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, ExternalLink, Globe, AlertTriangle } from 'lucide-react';

export const BrowserApp: React.FC = () => {
  const [currentUrl, setCurrentUrl] = useState('https://cn.bing.com');
  const [inputUrl, setInputUrl] = useState('https://cn.bing.com');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleNavigate = (target?: string) => {
    let url = (target || inputUrl).trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    setInputUrl(url);
    setCurrentUrl(url);
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = currentUrl;
    }
  };

  const openExternal = () => {
    window.open(currentUrl, '_blank', 'noopener,noreferrer');
  };

  const bookmarks = [
    { name: '必应搜索', url: 'https://cn.bing.com' },
    { name: '维基百科', url: 'https://zh.wikipedia.org' },
    { name: 'MDN Web', url: 'https://developer.mozilla.org/zh-CN/' },
    { name: 'Hacker News', url: 'https://news.ycombinator.com' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200">
      {/* 浏览器外壳导航条 */}
      <div className="bg-slate-900/90 border-b border-white/10 px-3 py-2 flex items-center space-x-2">
        <div className="flex items-center space-x-1 text-slate-300">
          <button
            onClick={() => {
              try { iframeRef.current?.contentWindow?.history.back(); } catch (_) {}
            }}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title="后退"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              try { iframeRef.current?.contentWindow?.history.forward(); } catch (_) {}
            }}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title="前进"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleRefresh}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title="重新载入"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* 地址栏输入框 */}
        <div className="flex-1 flex items-center bg-slate-950/80 rounded-lg px-2.5 py-1 border border-white/10 focus-within:border-blue-500/80 transition-colors">
          <Globe className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
            className="w-full bg-transparent text-xs text-slate-200 outline-none font-mono placeholder-slate-500"
            placeholder="输入网址并回车 (如 https://...)"
          />
        </div>
        <button
          onClick={() => handleNavigate()}
          className="px-3 py-1 bg-blue-600/80 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors font-medium shrink-0"
        >
          跳转
        </button>
      </div>

      {/* 快速书签栏 */}
      <div className="bg-slate-900/60 border-b border-white/5 px-3 py-1 flex items-center space-x-2 text-[11px] text-slate-300 overflow-x-auto">
        <span className="text-slate-500 font-mono">书签:</span>
        {bookmarks.map((b) => (
          <button
            key={b.url}
            onClick={() => handleNavigate(b.url)}
            className="px-2 py-0.5 rounded hover:bg-white/10 transition-colors whitespace-nowrap"
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* 浏览器主体与安全策略引导层 */}
      <div className="flex-1 relative bg-slate-950 overflow-hidden">
        <iframe
          ref={iframeRef}
          src={currentUrl}
          className="w-full h-full border-0 bg-white"
          title="web-browser"
        />

        {/* 针对 X-Frame-Options 拦截的友好防崩提示栏 */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-white/15 backdrop-blur-md px-4 py-2 rounded-xl text-xs flex items-center space-x-3 shadow-xl z-20">
          <span className="text-amber-400 flex items-center space-x-1 shrink-0">
            <AlertTriangle className="w-4 h-4" />
            <span>如遇空白或拒绝内嵌：</span>
          </span>
          <span className="text-slate-300 hidden sm:inline">部分站点因同源策略拒绝 iframe</span>
          <button
            onClick={openExternal}
            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-md text-blue-400 font-medium transition-colors flex items-center space-x-1 shrink-0"
          >
            <span>在新标签页打开</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

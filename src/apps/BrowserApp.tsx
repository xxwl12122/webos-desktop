import React, { useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Home, Search, ExternalLink, Copy, Check, ShieldAlert, Globe } from 'lucide-react';

export const BrowserApp: React.FC = () => {
  const [currentUrl, setCurrentUrl] = useState('https://cn.bing.com');
  const [inputVal, setInputVal] = useState('https://cn.bing.com');
  const [isLoading, setIsLoading] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 智能网址与搜索识别
  const navigateTo = (targetText: string) => {
    let clean = targetText.trim();
    if (!clean) return;

    const isUrl =
      clean.startsWith('http://') ||
      clean.startsWith('https://') ||
      /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/.test(clean);

    let finalUrl = clean;
    if (isUrl) {
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
    } else {
      // 智能识别为搜索关键词
      finalUrl = `https://cn.bing.com/search?q=${encodeURIComponent(clean)}`;
    }

    setInputVal(finalUrl);
    setCurrentUrl(finalUrl);
    setIsLoading(true);
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = currentUrl;
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleOpenExternal = () => {
    window.open(currentUrl, '_blank', 'noopener,noreferrer');
  };

  const bookmarks = [
    { name: '必应搜索', url: 'https://cn.bing.com' },
    { name: '维基百科', url: 'https://zh.wikipedia.org' },
    { name: 'GitHub Trending', url: 'https://github.com/trending' },
    { name: '2048 小游戏', url: 'https://play2048.co' },
    { name: 'Desmos 科学绘图', url: 'https://www.desmos.com/calculator' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0a0a0c] text-zinc-200 select-text overflow-hidden">
      {/* 浏览器顶部导航与地址栏 */}
      <div className="bg-zinc-950/80 border-b border-zinc-800/80 px-2 sm:px-3 py-1.5 sm:py-2 flex items-center space-x-1.5 sm:space-x-2 select-none">
        <div className="flex items-center space-x-1 text-zinc-400">
          <button
            onClick={() => {
              try { iframeRef.current?.contentWindow?.history.back(); } catch (_) {}
            }}
            className="p-1 rounded hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            title="后退"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              try { iframeRef.current?.contentWindow?.history.forward(); } catch (_) {}
            }}
            className="p-1 rounded hover:bg-zinc-800 hover:text-zinc-200 transition-colors hidden sm:inline-flex"
            title="前进"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleRefresh}
            className={`p-1 rounded hover:bg-zinc-800 hover:text-zinc-200 transition-colors ${isLoading ? 'animate-spin text-zinc-200' : ''}`}
            title="重新载入"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigateTo('https://cn.bing.com')}
            className="p-1 rounded hover:bg-zinc-800 hover:text-zinc-200 transition-colors hidden sm:inline-flex"
            title="主页"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* 智能地址栏 */}
        <div className="flex-1 flex items-center bg-zinc-900/90 rounded-lg px-2 sm:px-2.5 py-1 border border-zinc-800 focus-within:border-zinc-600 transition-colors">
          <Search className="w-3.5 h-3.5 text-zinc-500 mr-1.5 sm:mr-2 shrink-0" />
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && navigateTo(inputVal)}
            className="w-full bg-transparent text-xs text-zinc-200 outline-none font-mono placeholder-zinc-500"
            placeholder="输入网址或搜索词..."
          />
        </div>

        <button
          onClick={() => navigateTo(inputVal)}
          className="px-2.5 sm:px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg transition-colors font-medium shrink-0 border border-zinc-700/60"
        >
          前往
        </button>
      </div>

      {/* 书签快捷栏 */}
      <div className="bg-zinc-950/60 border-b border-zinc-800/60 px-2 sm:px-3 py-1 flex items-center space-x-1.5 sm:space-x-2 text-[11px] text-zinc-400 overflow-x-auto no-scrollbar select-none">
        <span className="text-zinc-600 font-mono text-[10px] hidden xs:inline">书签:</span>
        {bookmarks.map((b) => (
          <button
            key={b.url}
            onClick={() => navigateTo(b.url)}
            className="px-2 py-0.5 rounded-md hover:bg-zinc-800 hover:text-zinc-200 transition-colors whitespace-nowrap flex items-center space-x-1 shrink-0"
          >
            <Globe className="w-3 h-3 text-zinc-500" />
            <span>{b.name}</span>
          </button>
        ))}
      </div>

      {/* 浏览器主体与安全防白屏容灾引导层 */}
      <div className="flex-1 relative bg-zinc-950 overflow-hidden">
        <iframe
          ref={iframeRef}
          src={currentUrl}
          onLoad={() => setIsLoading(false)}
          className="w-full h-full border-0 bg-white"
          title="web-browser-frame"
        />

        {/* 同源策略与 CSP 拦截容灾引导层 (Anti-Frame Shield) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-zinc-950/95 border border-white/10 backdrop-blur-xl px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs flex items-center justify-between sm:justify-start space-x-2 sm:space-x-3 shadow-2xl z-20 max-w-[95%] sm:max-w-[90%] select-none">
          <div className="flex items-center space-x-1.5 text-amber-400 shrink-0">
            <ShieldAlert className="w-4 h-4" />
            <span className="font-medium hidden sm:inline">内嵌安全防护提示:</span>
          </div>
          <span className="text-zinc-400 truncate hidden md:inline text-[11px]">
            若遇白屏拒绝访问，说明该站点配置了 X-Frame-Options 策略
          </span>
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-300 font-medium transition-colors flex items-center space-x-1 text-[11px]"
            >
              {hasCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{hasCopied ? '已复制' : '复制网址'}</span>
            </button>
            <button
              onClick={handleOpenExternal}
              className="px-2 sm:px-2.5 py-1 bg-zinc-100 hover:bg-white text-zinc-950 rounded-md font-medium transition-colors flex items-center space-x-1 text-[11px] shadow"
            >
              <span className="hidden xs:inline">新标签页打开</span>
              <span className="xs:hidden">打开</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

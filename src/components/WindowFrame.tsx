import React, { useRef, useState, useEffect } from 'react';
import { Minus, Square, X } from 'lucide-react';
import { WindowState, SnapMode } from '../types';

interface WindowFrameProps {
  window: WindowState;
  icon: React.ReactNode;
  zIndex: number;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onUpdatePosition: (x: number, y: number) => void;
  onUpdateSize: (w: number, h: number) => void;
  onApplySnap: (mode: SnapMode) => void;
  onSetSnapPreview: (mode: SnapMode | null) => void;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  window: win,
  icon,
  zIndex,
  isActive,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onUpdatePosition,
  onUpdateSize,
  onApplySnap,
  onSetSnapPreview,
  children,
}) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = viewportWidth < 768; // 手机端断点
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024; // 平板端断点

  if (!win.isOpen) return null;

  // 标题栏拖拽逻辑 (使用 PointerEvent 无缝统一支持触摸与鼠标)
  const handleTitlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
      return;
    }
    // 手机端全屏模式下不进行自由拖拽
    if (isMobile) return;

    e.preventDefault();
    onFocus();

    const startX = e.clientX;
    const startY = e.clientY;
    let initialX = win.x;
    let initialY = win.y;

    if (win.snapMode !== 'none' || win.isMaximized) {
      const restoredW = win.prevWidth || Math.min(680, viewportWidth - 20);
      const restoredH = win.prevHeight || 480;
      initialX = e.clientX - restoredW / 2;
      initialY = e.clientY - 18;
      onApplySnap('none');
      onUpdateSize(restoredW, restoredH);
    }

    document.body.classList.add('is-dragging');
    windowRef.current?.classList.add('is-moving');

    let currentX = initialX;
    let currentY = initialY;
    let detectedSnap: SnapMode = 'none';

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newX = initialX + deltaX;
      let newY = initialY + deltaY;

      // 边界防护
      const maxLeft = window.innerWidth - 60;
      const maxTop = window.innerHeight - 80;
      newX = Math.max(-win.width + 80, Math.min(newX, maxLeft));
      newY = Math.max(6, Math.min(newY, maxTop));

      currentX = newX;
      currentY = newY;

      if (windowRef.current) {
        windowRef.current.style.left = `${newX}px`;
        windowRef.current.style.top = `${newY}px`;
      }

      // 边缘吸附检测
      if (moveEvent.clientX <= 20) {
        detectedSnap = 'left';
        onSetSnapPreview('left');
      } else if (moveEvent.clientX >= window.innerWidth - 20) {
        detectedSnap = 'right';
        onSetSnapPreview('right');
      } else if (moveEvent.clientY <= 24) {
        detectedSnap = 'maximize';
        onSetSnapPreview('maximize');
      } else {
        detectedSnap = 'none';
        onSetSnapPreview(null);
      }
    };

    const onPointerUp = () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.body.classList.remove('is-dragging');
      windowRef.current?.classList.remove('is-moving');
      onSetSnapPreview(null);

      if (detectedSnap !== 'none') {
        onApplySnap(detectedSnap);
      } else {
        onUpdatePosition(currentX, currentY);
      }
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  // 自由拉伸逻辑 (仅在桌面/大屏平板有效)
  const handleResizePointerDown = (e: React.PointerEvent, axis: 'x' | 'y' | 'xy') => {
    if (isMobile) return;
    e.preventDefault();
    e.stopPropagation();
    onFocus();

    if (win.isMaximized || win.snapMode !== 'none') return;

    const startX = e.clientX;
    const startY = e.clientY;
    const initialW = win.width;
    const initialH = win.height;

    document.body.classList.add('is-resizing');
    windowRef.current?.classList.add('is-moving');

    let currentW = initialW;
    let currentH = initialH;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      if (axis.includes('x')) {
        currentW = Math.max(win.minWidth, Math.min(window.innerWidth - win.x - 6, initialW + deltaX));
      }
      if (axis.includes('y')) {
        currentH = Math.max(win.minHeight, Math.min(window.innerHeight - win.y - 54, initialH + deltaY));
      }

      if (windowRef.current) {
        windowRef.current.style.width = `${currentW}px`;
        windowRef.current.style.height = `${currentH}px`;
      }
    };

    const onPointerUp = () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.body.classList.remove('is-resizing');
      windowRef.current?.classList.remove('is-moving');

      onUpdateSize(currentW, currentH);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  // 响应式窗口布局计算
  const getWindowStyle = (): React.CSSProperties => {
    // 手机端：自动全屏卡片化，避开底部 48px 任务栏
    if (isMobile) {
      return {
        top: '0px',
        left: '0px',
        width: '100vw',
        height: 'calc(100vh - 48px)',
        zIndex,
        borderRadius: '0px',
      };
    }

    // 边缘吸附样式
    if (win.snapMode === 'left') {
      return {
        top: '6px',
        left: '6px',
        width: 'calc(50vw - 9px)',
        height: 'calc(100vh - 60px)',
        zIndex,
      };
    }
    if (win.snapMode === 'right') {
      return {
        top: '6px',
        left: 'calc(50vw + 3px)',
        width: 'calc(50vw - 9px)',
        height: 'calc(100vh - 60px)',
        zIndex,
      };
    }
    if (win.snapMode === 'maximize' || win.isMaximized) {
      return {
        top: '6px',
        left: '6px',
        width: 'calc(100vw - 12px)',
        height: 'calc(100vh - 60px)',
        zIndex,
      };
    }

    // 平板或桌面自由浮动尺寸适配
    const maxSafeW = Math.min(win.width, viewportWidth - 12);
    const maxSafeH = Math.min(win.height, window.innerHeight - 60);

    return {
      top: `${Math.min(win.y, window.innerHeight - 100)}px`,
      left: `${Math.min(win.x, viewportWidth - maxSafeW)}px`,
      width: `${maxSafeW}px`,
      height: `${maxSafeH}px`,
      zIndex,
    };
  };

  return (
    <div
      ref={windowRef}
      onPointerDown={onFocus}
      style={getWindowStyle()}
      className={`absolute glass-panel window-anim flex flex-col overflow-hidden pointer-events-auto ${
        isMobile ? 'rounded-none border-x-0 border-t-0' : 'rounded-xl'
      } ${isActive ? 'active-window' : ''} ${win.isMinimized ? 'opacity-0 scale-95 pointer-events-none !hidden' : ''}`}
    >
      {/* 标题栏 */}
      <div
        onPointerDown={handleTitlePointerDown}
        onDoubleClick={!isMobile ? onToggleMaximize : undefined}
        className="h-10 bg-zinc-950/85 pl-3.5 pr-0 flex items-center justify-between border-b border-white/[0.08] cursor-move shrink-0 select-none touch-none"
      >
        {/* 左侧：应用图标与标题 */}
        <div className="flex items-center space-x-2 text-xs font-medium text-zinc-300 tracking-tight truncate max-w-[70%]">
          <span className="text-zinc-400 shrink-0">{icon}</span>
          <span className="truncate">{win.title}</span>
        </div>

        {/* 右侧：Windows 风格控制按钮 (触屏舒适触控设计) */}
        <div className="flex items-center h-full shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            className="h-full px-3.5 sm:px-3 text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.08] active:bg-white/[0.15] transition-colors flex items-center justify-center"
            title="最小化"
          >
            <Minus className="w-3.5 h-3.5 stroke-[2]" />
          </button>

          {/* 手机端隐藏最大化切换按钮 */}
          {!isMobile && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleMaximize();
              }}
              className="h-full px-3 text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.08] active:bg-white/[0.15] transition-colors flex items-center justify-center"
              title={win.isMaximized || win.snapMode !== 'none' ? '还原' : '最大化'}
            >
              <Square className="w-3 h-3 stroke-[2]" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="h-full px-4 sm:px-3.5 text-zinc-400 hover:bg-red-500 hover:text-white active:bg-red-600 transition-colors flex items-center justify-center"
            title="关闭"
          >
            <X className="w-3.5 h-3.5 stroke-[2]" />
          </button>
        </div>
      </div>

      {/* 窗口主体工作区 */}
      <div className="flex-1 relative overflow-hidden bg-zinc-950/60">
        {children}
      </div>

      {/* 缩放手柄 (仅非手机端显示) */}
      {!isMobile && win.snapMode === 'none' && !win.isMaximized && (
        <>
          <div onPointerDown={(e) => handleResizePointerDown(e, 'x')} className="resize-handle resize-handle-r" />
          <div onPointerDown={(e) => handleResizePointerDown(e, 'y')} className="resize-handle resize-handle-b" />
          <div onPointerDown={(e) => handleResizePointerDown(e, 'xy')} className="resize-handle resize-handle-rb" />
        </>
      )}
    </div>
  );
};

import React, { useRef } from 'react';
import { Minus, Square, X } from 'lucide-react';
import { WindowState } from '../types';

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
  children,
}) => {
  const windowRef = useRef<HTMLDivElement>(null);

  if (!win.isOpen) return null;

  // 标题栏拖拽逻辑 (含视口边界防护与防断触遮罩)
  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
      return;
    }
    if (win.isMaximized) return;

    e.preventDefault();
    onFocus();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = win.x;
    const initialY = win.y;

    // 激活防断触全局状态
    document.body.classList.add('is-dragging');
    windowRef.current?.classList.add('is-moving');

    let currentX = initialX;
    let currentY = initialY;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newX = initialX + deltaX;
      let newY = initialY + deltaY;

      // 边界碰撞防护：顶部不能越过 32px 顶栏，左右下保留至少 80px 可见区域
      const maxLeft = window.innerWidth - 80;
      const maxTop = window.innerHeight - 80;
      newX = Math.max(-win.width + 100, Math.min(newX, maxLeft));
      newY = Math.max(32, Math.min(newY, maxTop));

      currentX = newX;
      currentY = newY;

      if (windowRef.current) {
        windowRef.current.style.left = `${newX}px`;
        windowRef.current.style.top = `${newY}px`;
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.classList.remove('is-dragging');
      windowRef.current?.classList.remove('is-moving');

      onUpdatePosition(currentX, currentY);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // 自由缩放拉伸逻辑 (Resize Handles)
  const handleResizeStart = (e: React.MouseEvent, axis: 'x' | 'y' | 'xy') => {
    e.preventDefault();
    e.stopPropagation();
    onFocus();

    if (win.isMaximized) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const initialW = win.width;
    const initialH = win.height;

    document.body.classList.add('is-resizing');
    windowRef.current?.classList.add('is-moving');

    let currentW = initialW;
    let currentH = initialH;

    const onResizeMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      if (axis.includes('x')) {
        currentW = Math.max(win.minWidth, initialW + deltaX);
      }
      if (axis.includes('y')) {
        currentH = Math.max(win.minHeight, initialH + deltaY);
      }

      if (windowRef.current) {
        windowRef.current.style.width = `${currentW}px`;
        windowRef.current.style.height = `${currentH}px`;
      }
    };

    const onResizeUp = () => {
      document.removeEventListener('mousemove', onResizeMove);
      document.removeEventListener('mouseup', onResizeUp);
      document.body.classList.remove('is-resizing');
      windowRef.current?.classList.remove('is-moving');

      onUpdateSize(currentW, currentH);
    };

    document.addEventListener('mousemove', onResizeMove);
    document.addEventListener('mouseup', onResizeUp);
  };

  const windowStyle: React.CSSProperties = win.isMaximized
    ? {
        top: '36px',
        left: '6px',
        width: 'calc(100vw - 12px)',
        height: 'calc(100vh - 105px)',
        zIndex,
      }
    : {
        top: `${win.y}px`,
        left: `${win.x}px`,
        width: `${win.width}px`,
        height: `${win.height}px`,
        zIndex,
      };

  return (
    <div
      ref={windowRef}
      onMouseDown={onFocus}
      style={windowStyle}
      className={`absolute rounded-xl glass-panel window-anim flex flex-col overflow-hidden shadow-2xl pointer-events-auto ${
        isActive ? 'active-window' : ''
      } ${win.isMinimized ? 'opacity-0 scale-95 pointer-events-none !hidden' : ''}`}
    >
      {/* 标题栏 */}
      <div
        onMouseDown={handleTitleMouseDown}
        onDoubleClick={onToggleMaximize}
        className="h-10 bg-slate-900/80 px-3.5 flex items-center justify-between border-b border-white/10 cursor-move shrink-0"
      >
        <div className="flex items-center space-x-2">
          {/* 经典交通灯控制按钮 */}
          <div className="flex items-center space-x-2 mr-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 transition-colors flex items-center justify-center group"
              title="关闭"
            >
              <X className="w-2 h-2 text-rose-950 font-bold opacity-0 group-hover:opacity-100" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMinimize();
              }}
              className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-600 transition-colors flex items-center justify-center group"
              title="最小化"
            >
              <Minus className="w-2 h-2 text-amber-950 font-bold opacity-0 group-hover:opacity-100" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleMaximize();
              }}
              className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors flex items-center justify-center group"
              title="最大化 / 还原"
            >
              <Square className="w-1.5 h-1.5 text-emerald-950 font-bold opacity-0 group-hover:opacity-100" />
            </button>
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300">
            {icon}
            <span>{win.title}</span>
          </div>
        </div>
      </div>

      {/* 窗口主体内容 */}
      <div className="flex-1 relative overflow-hidden bg-slate-950/40">
        {children}
      </div>

      {/* 缩放手柄 */}
      {!win.isMaximized && (
        <>
          <div
            onMouseDown={(e) => handleResizeStart(e, 'x')}
            className="resize-handle resize-handle-r"
          />
          <div
            onMouseDown={(e) => handleResizeStart(e, 'y')}
            className="resize-handle resize-handle-b"
          />
          <div
            onMouseDown={(e) => handleResizeStart(e, 'xy')}
            className="resize-handle resize-handle-rb"
          />
        </>
      )}
    </div>
  );
};

import React, { useRef } from 'react';
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

  if (!win.isOpen) return null;

  // 标题栏拖拽逻辑 (含边缘吸附 Snap Assist 实时探测与边界碰撞防护)
  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
      return;
    }

    e.preventDefault();
    onFocus();

    const startX = e.clientX;
    const startY = e.clientY;
    let initialX = win.x;
    let initialY = win.y;

    // 如果当前已经是 snap 或最大化状态，拖动时自动解吸附并保持合理比例
    if (win.snapMode !== 'none' || win.isMaximized) {
      const restoredW = win.prevWidth || 680;
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

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newX = initialX + deltaX;
      let newY = initialY + deltaY;

      // 视口边界碰撞防护
      const maxLeft = window.innerWidth - 60;
      const maxTop = window.innerHeight - 80;
      newX = Math.max(-win.width + 80, Math.min(newX, maxLeft));
      newY = Math.max(34, Math.min(newY, maxTop));

      currentX = newX;
      currentY = newY;

      if (windowRef.current) {
        windowRef.current.style.left = `${newX}px`;
        windowRef.current.style.top = `${newY}px`;
      }

      // 边缘吸附检测 (Snap Assist)
      if (moveEvent.clientX <= 20) {
        detectedSnap = 'left';
        onSetSnapPreview('left');
      } else if (moveEvent.clientX >= window.innerWidth - 20) {
        detectedSnap = 'right';
        onSetSnapPreview('right');
      } else if (moveEvent.clientY <= 34) {
        detectedSnap = 'maximize';
        onSetSnapPreview('maximize');
      } else {
        detectedSnap = 'none';
        onSetSnapPreview(null);
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.classList.remove('is-dragging');
      windowRef.current?.classList.remove('is-moving');
      onSetSnapPreview(null);

      if (detectedSnap !== 'none') {
        onApplySnap(detectedSnap);
      } else {
        onUpdatePosition(currentX, currentY);
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // 自由拉伸逻辑
  const handleResizeStart = (e: React.MouseEvent, axis: 'x' | 'y' | 'xy') => {
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

  // 计算吸附模式下的布局样式
  const getWindowStyle = (): React.CSSProperties => {
    if (win.snapMode === 'left') {
      return {
        top: '38px',
        left: '6px',
        width: 'calc(50vw - 9px)',
        height: 'calc(100vh - 105px)',
        zIndex,
      };
    }
    if (win.snapMode === 'right') {
      return {
        top: '38px',
        left: 'calc(50vw + 3px)',
        width: 'calc(50vw - 9px)',
        height: 'calc(100vh - 105px)',
        zIndex,
      };
    }
    if (win.snapMode === 'maximize' || win.isMaximized) {
      return {
        top: '38px',
        left: '6px',
        width: 'calc(100vw - 12px)',
        height: 'calc(100vh - 105px)',
        zIndex,
      };
    }

    return {
      top: `${win.y}px`,
      left: `${win.x}px`,
      width: `${win.width}px`,
      height: `${win.height}px`,
      zIndex,
    };
  };

  return (
    <div
      ref={windowRef}
      onMouseDown={onFocus}
      style={getWindowStyle()}
      className={`absolute rounded-xl glass-panel window-anim flex flex-col overflow-hidden pointer-events-auto ${
        isActive ? 'active-window' : ''
      } ${win.isMinimized ? 'opacity-0 scale-95 pointer-events-none !hidden' : ''}`}
    >
      {/* 标题栏 (压低至 38px 细腻系统级高度) */}
      <div
        onMouseDown={handleTitleMouseDown}
        onDoubleClick={onToggleMaximize}
        className="h-[38px] bg-zinc-950/70 px-3.5 flex items-center justify-between border-b border-white/[0.08] cursor-move shrink-0"
      >
        <div className="flex items-center space-x-2.5">
          {/* 原生 macOS 质感三色控制按钮 */}
          <div className="flex items-center space-x-2 mr-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff4b42] active:scale-90 transition-transform flex items-center justify-center group"
              title="关闭"
            >
              <X className="w-2 h-2 text-red-950 opacity-0 group-hover:opacity-100 transition-opacity stroke-[2.5]" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMinimize();
              }}
              className="w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#fea81e] active:scale-90 transition-transform flex items-center justify-center group"
              title="最小化"
            >
              <Minus className="w-2 h-2 text-amber-950 opacity-0 group-hover:opacity-100 transition-opacity stroke-[2.5]" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleMaximize();
              }}
              className="w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#1db334] active:scale-90 transition-transform flex items-center justify-center group"
              title="最大化 / 还原"
            >
              <Square className="w-1.5 h-1.5 text-emerald-950 opacity-0 group-hover:opacity-100 transition-opacity stroke-[2.5]" />
            </button>
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-medium text-zinc-300 tracking-tight">
            <span className="text-zinc-400">{icon}</span>
            <span>{win.title}</span>
          </div>
        </div>
      </div>

      {/* 窗口工作区 */}
      <div className="flex-1 relative overflow-hidden bg-zinc-950/50">
        {children}
      </div>

      {/* 缩放手柄 */}
      {win.snapMode === 'none' && !win.isMaximized && (
        <>
          <div onMouseDown={(e) => handleResizeStart(e, 'x')} className="resize-handle resize-handle-r" />
          <div onMouseDown={(e) => handleResizeStart(e, 'y')} className="resize-handle resize-handle-b" />
          <div onMouseDown={(e) => handleResizeStart(e, 'xy')} className="resize-handle resize-handle-rb" />
        </>
      )}
    </div>
  );
};

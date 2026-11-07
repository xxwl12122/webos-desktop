import React, { useState, useEffect } from 'react';
import { getSyncedDate, isTimeNetworkSynced } from '../utils/timeSync';
import { Wifi } from 'lucide-react';

export const DesktopClockWidget: React.FC = () => {
  const [date, setDate] = useState<Date>(getSyncedDate);

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(getSyncedDate());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const dayName = days[date.getDay()];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return (
    <div className="absolute top-12 right-12 z-10 pointer-events-none select-none text-right flex flex-col items-end">
      {/* 极简磨砂半透明卡片容器 */}
      <div className="px-5 py-3 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 shadow-2xl">
        <div className="flex items-baseline justify-end space-x-1.5 font-bold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          <span className="text-5xl font-mono tabular-nums leading-none">
            {hours}:{minutes}
          </span>
          <span className="text-xl font-mono text-zinc-400 tabular-nums">
            :{seconds}
          </span>
        </div>

        <div className="mt-2 text-xs font-medium text-zinc-300 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)] flex items-center justify-end space-x-2">
          {isTimeNetworkSynced() && (
            <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
              <Wifi className="w-2.5 h-2.5" />
              <span>网络已校准</span>
            </span>
          )}
          <span>{year}年{month}月{day}日 · {dayName}</span>
        </div>
      </div>
    </div>
  );
};

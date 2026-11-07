import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getSyncedDate } from '../utils/timeSync';

interface CalendarPopoverProps {
  onClose: () => void;
}

export const CalendarPopover: React.FC<CalendarPopoverProps> = ({ onClose }) => {
  const today = getSyncedDate();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const resetToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // 生成当月网格
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 是周日
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const days: { day: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

  // 上月补足
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push({
      day: totalDaysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // 当月天数
  for (let i = 1; i <= totalDaysInMonth; i++) {
    const isToday =
      currentYear === today.getFullYear() &&
      currentMonth === today.getMonth() &&
      i === today.getDate();
    days.push({
      day: i,
      isCurrentMonth: true,
      isToday,
    });
  }

  // 下月补足 42 格
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  const weekHeaders = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-14 right-3 z-[99999] w-80 rounded-2xl bg-zinc-950/90 border border-white/10 p-4 shadow-2xl backdrop-blur-2xl text-xs text-zinc-200 animate-in fade-in slide-in-from-bottom-2 duration-150 select-none"
    >
      {/* 顶部年月与翻页 */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="font-semibold text-sm text-zinc-100">
          {currentYear}年 {currentMonth + 1}月
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={resetToToday}
            className="px-2 py-0.5 rounded text-[11px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            今天
          </button>
          <button
            onClick={prevMonth}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 星期行 */}
      <div className="grid grid-cols-7 gap-1 text-center py-2 text-[11px] text-zinc-500 font-medium">
        {weekHeaders.map((w, i) => (
          <div key={i}>{w}</div>
        ))}
      </div>

      {/* 日历格子 */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((item, idx) => (
          <div
            key={idx}
            className={`h-8 flex items-center justify-center rounded-lg text-xs font-mono transition-colors ${
              item.isToday
                ? 'bg-blue-600 text-white font-bold shadow-[0_0_10px_rgba(59,130,246,0.6)]'
                : item.isCurrentMonth
                ? 'text-zinc-200 hover:bg-zinc-800'
                : 'text-zinc-600'
            }`}
          >
            {item.day}
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { Flame, Trophy, Award, Calendar, CheckCircle2, Sparkles } from 'lucide-react';
import { HabitStreak } from '../types';

interface HabitStreakCardProps {
  streak: HabitStreak;
  onNavigateToAnalytics?: () => void;
}

export const HabitStreakCard: React.FC<HabitStreakCardProps> = ({
  streak,
  onNavigateToAnalytics,
}) => {
  // Generate last 7 days keys
  const daysOfWeek = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
  const last7Days: { dateStr: string; dayLabel: string; count: number; isToday: boolean }[] = [];
  
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = daysOfWeek[d.getDay()];
    const count = streak.completedDates[dateStr] || 0;
    last7Days.push({
      dateStr,
      dayLabel,
      count,
      isToday: i === 0,
    });
  }

  const getMotivationPhrase = () => {
    if (streak.currentStreak >= 7) {
      return 'أسطوري! أنت في قمة التركيز والإنتاجية 👑';
    } else if (streak.currentStreak >= 3) {
      return 'رائع جداً! سلسلة إنجاز مستمرة ومحفزة 🔥';
    }
    return 'بداية ممتازة! الاستمرار اليومي هو سر الإتقان ⭐';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Streak Numbers */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 shadow-inner">
            <Flame className="w-7 h-7 fill-amber-500 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {streak.currentStreak}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                أيام متتالية من الإنجاز
              </span>
              {streak.currentStreak > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  نشط الآن 🔥
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {getMotivationPhrase()}
            </p>
          </div>
        </div>

        {/* Longest streak badge */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700 self-start sm:self-auto text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>أطول سلسلة: <strong className="text-slate-900 dark:text-white">{streak.longestStreak} أيام</strong></span>
        </div>
      </div>

      {/* 7-day mini activity heat track */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between gap-1">
          {last7Days.map((item) => (
            <div key={item.dateStr} className="flex flex-col items-center flex-1">
              <span className={`text-[10px] font-bold mb-1.5 ${item.isToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {item.dayLabel}
              </span>
              
              <div 
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all ${
                  item.count > 0 
                    ? 'bg-emerald-500 text-white shadow-xs shadow-emerald-500/30' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
                } ${item.isToday ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900' : ''}`}
                title={`${item.dateStr}: ${item.count} مهام مكتملة`}
              >
                {item.count > 0 ? (
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <span className="text-[10px]">•</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  Plus, 
  Download, 
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { Task, Goal } from '../../types';
import { TaskCard } from '../TaskCard';
import { 
  ARABIC_MONTHS, 
  ARABIC_WEEKDAYS_SHORT, 
  getMonthDays, 
  getTodayStr, 
  formatArabicDate 
} from '../../utils/dateUtils';
import { PRIORITY_CONFIG } from '../../utils/constants';
import { generateIcsContent, downloadIcsFile } from '../../utils/calendarSync';

interface CalendarViewProps {
  tasks: Task[];
  goals: Goal[];
  onToggleTaskComplete: (taskId: string) => void;
  onUpdateSubtask: (taskId: string, subtaskIndex: number, completed: boolean) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDuplicateTask: (task: Task) => void;
  onOpenNewTaskWithDate: (dateStr: string) => void;
  onOpenCalendarSyncModal: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  goals,
  onToggleTaskComplete,
  onUpdateSubtask,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
  onOpenNewTaskWithDate,
  onOpenCalendarSyncModal,
}) => {
  const todayStr = getTodayStr();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const initialDate = new Date();
  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth()); // 0-indexed

  const calendarDays = useMemo(() => {
    return getMonthDays(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Map of dateStr -> tasks
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((t) => {
      if (!t.dueDate) return;
      if (!map[t.dueDate]) map[t.dueDate] = [];
      map[t.dueDate].push(t);
    });
    return map;
  }, [tasks]);

  const selectedDateTasks = useMemo(() => {
    return tasksByDate[selectedDate] || [];
  }, [tasksByDate, selectedDate]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleTodayClick = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(todayStr);
  };

  const handleExportMonthIcs = () => {
    const monthTasks = tasks.filter((t) => {
      if (!t.dueDate) return false;
      const [y, m] = t.dueDate.split('-').map(Number);
      return y === currentYear && m === currentMonth + 1;
    });
    const ics = generateIcsContent(monthTasks, `مهام ${ARABIC_MONTHS[currentMonth]} ${currentYear}`);
    downloadIcsFile(`تقويم_إنجاز_${currentYear}_${currentMonth + 1}`, ics);
  };

  return (
    <div className="space-y-6 pb-24">
      
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            جدول التقويم والمزامنة
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            تصفح مهامك مجدولة على الأيام مع دعم المزامنة الفورية
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCalendarSyncModal}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>خيارات المزامنة والربط</span>
          </button>

          <button
            onClick={handleExportMonthIcs}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="تنزيل ملف .ics للشهر الحالي"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            <span>تصدير الشهر (.ics)</span>
          </button>
        </div>
      </div>

      {/* Main Calendar Grid Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
        
        {/* Month Navigation Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {ARABIC_MONTHS[currentMonth]} {currentYear}
            </h3>
            <button
              onClick={handleTodayClick}
              className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer"
            >
              اليوم
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="الشهر السابق"
              aria-label="الشهر السابق"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="الشهر التالي"
              aria-label="الشهر التالي"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday Labels Header (Starts Saturday for Arabic RTL) */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {ARABIC_WEEKDAYS_SHORT.map((dayName, idx) => (
            <div 
              key={idx} 
              className={`text-xs font-bold py-1.5 ${
                idx === 6 || idx === 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar Grid Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((day) => {
            const isSelected = day.dateStr === selectedDate;
            const dayTasks = tasksByDate[day.dateStr] || [];
            const hasHigh = dayTasks.some(t => !t.completed && t.priority === 'high');
            const hasMed = dayTasks.some(t => !t.completed && t.priority === 'medium');
            const hasLow = dayTasks.some(t => !t.completed && t.priority === 'low');
            const allCompleted = dayTasks.length > 0 && dayTasks.every(t => t.completed);

            return (
              <button
                key={day.dateStr}
                onClick={() => setSelectedDate(day.dateStr)}
                className={`min-h-[58px] sm:min-h-[72px] p-1 sm:p-2 rounded-2xl flex flex-col items-center justify-between transition-all cursor-pointer relative border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30 scale-102 z-10'
                    : day.isToday
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : day.isCurrentMonth
                        ? 'bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-700/60 border-transparent text-slate-800 dark:text-slate-200'
                        : 'bg-transparent border-transparent text-slate-300 dark:text-slate-600'
                }`}
              >
                {/* Day number */}
                <div className="flex items-center justify-between w-full px-1">
                  <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-white' : ''}`}>
                    {day.dayNumber}
                  </span>
                  {day.isToday && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </div>

                {/* Tasks Priority indicator dots / badge */}
                <div className="flex items-center justify-center gap-1 my-1">
                  {hasHigh && (
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`} title="مهمة عالية الأولوية" />
                  )}
                  {hasMed && (
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-200' : 'bg-amber-500'}`} title="مهمة متوسطة الأولوية" />
                  )}
                  {hasLow && (
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-200' : 'bg-emerald-500'}`} title="مهمة منخفضة الأولوية" />
                  )}
                  {allCompleted && !hasHigh && !hasMed && !hasLow && (
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-100' : 'bg-emerald-400'}`} />
                  )}
                </div>

                {/* Tasks Count Badge */}
                {dayTasks.length > 0 && (
                  <span 
                    className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isSelected 
                        ? 'bg-white/20 text-white' 
                        : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {dayTasks.length} {dayTasks.length === 1 ? 'مهمة' : 'مهام'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Priority Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>أولوية عالية</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>أولوية متوسطة</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>أولوية منخفضة</span>
          </div>
        </div>
      </div>

      {/* Selected Day Agenda Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              جدول مهام: {formatArabicDate(selectedDate)}
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              {selectedDateTasks.length} {selectedDateTasks.length === 1 ? 'مهمة' : 'مهام'}
            </span>
          </div>

          <button
            onClick={() => onOpenNewTaskWithDate(selectedDate)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>إضافة مهمة في هذا التاريخ</span>
          </button>
        </div>

        {selectedDateTasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-8 text-center border border-dashed border-slate-300 dark:border-slate-700">
            <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              لا توجد مهام مجدولة في {formatArabicDate(selectedDate)}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              يمكنك إضافة مهمة جديدة مباشرة في هذا اليوم لتنظيم جدولك
            </p>
            <button
              onClick={() => onOpenNewTaskWithDate(selectedDate)}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة مهمة لهذا اليوم</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {selectedDateTasks.map((task) => {
              const goal = goals.find(g => g.id === task.goalId);
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  goalTitle={goal?.title}
                  onToggleComplete={onToggleTaskComplete}
                  onUpdateSubtask={onUpdateSubtask}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onDuplicate={onDuplicateTask}
                />
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

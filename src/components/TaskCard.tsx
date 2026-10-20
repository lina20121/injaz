import React, { useState } from 'react';
import { 
  Check, 
  Clock, 
  Calendar as CalendarIcon, 
  Repeat, 
  Bell, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Copy, 
  Share2, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  ExternalLink,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, Subtask } from '../types';
import { PRIORITY_CONFIG, CATEGORY_CONFIG, RECURRENCE_LABELS } from '../utils/constants';
import { formatArabicDate, formatTimeArabic, isOverdue, isDueToday } from '../utils/dateUtils';
import { generateGoogleCalendarUrl, downloadIcsFile, generateIcsContent } from '../utils/calendarSync';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onUpdateSubtask: (taskId: string, subtaskIndex: number, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDuplicate: (task: Task) => void;
  onStartPomodoro?: (taskId: string) => void;
  goalTitle?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onUpdateSubtask,
  onEdit,
  onDelete,
  onDuplicate,
  onStartPomodoro,
  goalTitle,
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const priorityMeta = PRIORITY_CONFIG[task.priority];
  const categoryMeta = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.other;
  const overdue = isOverdue(task.dueDate, task.dueTime, task.completed);
  const dueToday = isDueToday(task.dueDate);

  const subtasksCount = task.subtasks?.length || 0;
  const completedSubtasksCount = task.subtasks?.filter(s => s.completed).length || 0;
  const subtasksProgress = subtasksCount > 0 ? Math.round((completedSubtasksCount / subtasksCount) * 100) : 0;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.completed) {
      // Trigger celebration confetti
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']
      });
    }
    onToggleComplete(task.id);
  };

  const handleDownloadIcs = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    const ics = generateIcsContent([task], task.title);
    downloadIcsFile(`مهمة-${task.title.slice(0, 20)}`, ics);
  };

  const handleOpenGoogleCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    const url = generateGoogleCalendarUrl(task);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    const shareText = `📌 مهمة: ${task.title}\n📅 الموعد: ${formatArabicDate(task.dueDate)} ${task.dueTime ? formatTimeArabic(task.dueTime) : ''}\nالأولوية: ${priorityMeta.label}\nالتصنيف: ${categoryMeta.label}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: task.title,
          text: shareText,
        });
      } catch {
        // Ignored if cancelled
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('تم نسخ تفاصيل المهمة إلى الحافظة!');
    }
  };

  return (
    <div 
      className={`group relative bg-white dark:bg-slate-800/90 rounded-2xl p-4 transition-all duration-200 border shadow-xs hover:shadow-md ${
        task.completed 
          ? 'border-slate-200/60 dark:border-slate-800 opacity-75 bg-slate-50/50 dark:bg-slate-900/40' 
          : overdue 
            ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10' 
            : 'border-slate-200/80 dark:border-slate-700/60 hover:border-emerald-400 dark:hover:border-emerald-600'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Checkbox button */}
        <button
          onClick={handleCheckboxClick}
          className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all cursor-pointer border ${
            task.completed
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
              : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 bg-white dark:bg-slate-800'
          }`}
          aria-label={task.completed ? 'تعيين كغير مكتملة' : 'تعيين كمكتملة'}
        >
          {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        {/* Content body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              {/* Priority badge */}
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${priorityMeta.badgeBg} ${priorityMeta.badgeText}`}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priorityMeta.dotColor }} />
                {priorityMeta.label}
              </span>

              {/* Category pill */}
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                {categoryMeta.label}
              </span>

              {/* Recurrence badge */}
              {task.recurrence !== 'none' && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center gap-1">
                  <Repeat className="w-3 h-3" />
                  {RECURRENCE_LABELS[task.recurrence]}
                </span>
              )}

              {/* Reminder badge */}
              {task.reminderEnabled && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center gap-1" title="تنبيه مفعل">
                  <Bell className="w-2.5 h-2.5" />
                </span>
              )}

              {/* Pomodoro badge */}
              {task.pomodorosCompleted ? (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center gap-1" title="جلسات بومودورو المكتملة">
                  <span>🍅</span>
                  <span>{task.pomodorosCompleted}</span>
                </span>
              ) : null}
            </div>

            {/* More Menu dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="خيارات المهمة"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                    }} 
                  />
                  <div className="absolute left-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-30 text-xs text-slate-700 dark:text-slate-200 animate-in fade-in zoom-in-95">
                    {!task.completed && onStartPomodoro && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(false);
                          onStartPomodoro(task.id);
                        }}
                        className="w-full text-right px-3.5 py-2 flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold"
                      >
                        <span>🍅</span>
                        <span>بدء جلسة بومودورو</span>
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onEdit(task);
                      }}
                      className="w-full text-right px-3.5 py-2 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                      <span>تعديل المهمة</span>
                    </button>

                    <button
                      onClick={handleOpenGoogleCalendar}
                      className="w-full text-right px-3.5 py-2 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                      <span>إضافة لتقويم Google</span>
                    </button>

                    <button
                      onClick={handleDownloadIcs}
                      className="w-full text-right px-3.5 py-2 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-500" />
                      <span>تنزيل ملف تقويم .ics</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onDuplicate(task);
                      }}
                      className="w-full text-right px-3.5 py-2 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                    >
                      <Copy className="w-3.5 h-3.5 text-amber-500" />
                      <span>تكرار المهمة</span>
                    </button>

                    <button
                      onClick={handleShare}
                      className="w-full text-right px-3.5 py-2 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                    >
                      <Share2 className="w-3.5 h-3.5 text-teal-500" />
                      <span>مشاركة المهمة</span>
                    </button>

                    <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onDelete(task.id);
                      }}
                      className="w-full text-right px-3.5 py-2 flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف المهمة</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 
            className={`font-bold text-sm sm:text-base leading-snug transition-colors ${
              task.completed 
                ? 'line-through text-slate-400 dark:text-slate-500' 
                : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Linked Goal indicator */}
          {goalTitle && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-200 dark:border-emerald-800">
              <span>🎯 مرتبط بهدف:</span>
              <span className="font-bold">{goalTitle}</span>
            </div>
          )}

          {/* Subtasks Progress Bar & Toggle */}
          {subtasksCount > 0 && (
            <div className="mt-2.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSubtasks(!showSubtasks);
                }}
                className="flex items-center justify-between w-full text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-1"
              >
                <span className="font-semibold flex items-center gap-1.5">
                  <span>المهام الفرعية ({completedSubtasksCount}/{subtasksCount})</span>
                  <span className="text-[10px] text-slate-400">({subtasksProgress}%)</span>
                </span>
                <span className="text-slate-400">
                  {showSubtasks ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </span>
              </button>

              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mt-0.5 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${subtasksProgress}%` }}
                />
              </div>

              {/* Subtasks items list */}
              {showSubtasks && (
                <div className="mt-2 space-y-1.5 pr-2 border-r-2 border-slate-200 dark:border-slate-700">
                  {task.subtasks.map((st: Subtask, idx: number) => (
                    <div 
                      key={st.id} 
                      className="flex items-center gap-2 py-0.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:opacity-80"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateSubtask(task.id, idx, !st.completed);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => onUpdateSubtask(task.id, idx, !st.completed)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className={st.completed ? 'line-through text-slate-400' : ''}>
                        {st.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer Dates and Alerts */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-xs">
            <div className="flex items-center gap-2">
              {/* Due Date */}
              <div 
                className={`flex items-center gap-1 font-medium ${
                  overdue 
                    ? 'text-rose-600 dark:text-rose-400 font-bold' 
                    : dueToday 
                      ? 'text-amber-600 dark:text-amber-400 font-semibold' 
                      : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{formatArabicDate(task.dueDate)}</span>
              </div>

              {/* Due Time */}
              {task.dueTime && (
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimeArabic(task.dueTime)}</span>
                </div>
              )}
            </div>

            {/* Overdue Warning */}
            {overdue && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                <AlertCircle className="w-3 h-3" />
                متأخرة!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

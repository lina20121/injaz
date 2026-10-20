import React, { useState } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  ChevronLeft, 
  Brain, 
  Calendar,
  MoreVertical,
  Check
} from 'lucide-react';
import { Task, KanbanStatus } from '../../types';
import { PRIORITY_CONFIG, CATEGORY_CONFIG } from '../../utils/constants';
import { formatArabicDate, formatTimeArabic, isOverdue, isDueToday } from '../../utils/dateUtils';

interface KanbanBoardProps {
  tasks: Task[];
  onUpdateTaskStatus: (taskId: string, newStatus: KanbanStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStartPomodoro?: (taskId: string) => void;
  onOpenNewTask: () => void;
}

interface ColumnDef {
  id: KanbanStatus;
  title: string;
  badgeBg: string;
  badgeText: string;
  icon: React.FC<{ className?: string }>;
  borderTop: string;
}

const COLUMNS: ColumnDef[] = [
  {
    id: 'todo',
    title: 'قيد الانتظار',
    badgeBg: 'bg-slate-200 dark:bg-slate-700',
    badgeText: 'text-slate-800 dark:text-slate-200',
    icon: Clock,
    borderTop: 'border-t-slate-400',
  },
  {
    id: 'in_progress',
    title: 'قيد التنفيذ والتركيز',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
    badgeText: 'text-amber-700 dark:text-amber-300',
    icon: Brain,
    borderTop: 'border-t-amber-500',
  },
  {
    id: 'completed',
    title: 'المهام المكتملة',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    icon: CheckCircle2,
    borderTop: 'border-t-emerald-500',
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onUpdateTaskStatus,
  onEditTask,
  onDeleteTask,
  onStartPomodoro,
  onOpenNewTask,
}) => {
  const [mobileActiveCol, setMobileActiveCol] = useState<KanbanStatus | 'all'>('all');

  // Helper to resolve task status
  const getTaskStatus = (task: Task): KanbanStatus => {
    if (task.completed) return 'completed';
    if (task.status) return task.status;
    return 'todo';
  };

  const getNextStatus = (current: KanbanStatus): KanbanStatus | null => {
    if (current === 'todo') return 'in_progress';
    if (current === 'in_progress') return 'completed';
    return null;
  };

  const getPrevStatus = (current: KanbanStatus): KanbanStatus | null => {
    if (current === 'completed') return 'in_progress';
    if (current === 'in_progress') return 'todo';
    return null;
  };

  const filteredColumns = COLUMNS.filter(col => {
    if (mobileActiveCol === 'all') return true;
    return col.id === mobileActiveCol;
  });

  return (
    <div className="space-y-3">
      {/* Mobile-Only Column Selector Tabs */}
      <div className="flex md:hidden items-center gap-1 overflow-x-auto no-scrollbar p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl text-xs font-bold">
        <button
          onClick={() => setMobileActiveCol('all')}
          className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer ${
            mobileActiveCol === 'all'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          كل المراحل
        </button>

        {COLUMNS.map(col => {
          const count = tasks.filter(t => getTaskStatus(t) === col.id).length;
          const isSelected = mobileActiveCol === col.id;
          return (
            <button
              key={col.id}
              onClick={() => setMobileActiveCol(col.id)}
              className={`flex-1 min-w-[85px] py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <span className="truncate">{col.title}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${col.badgeBg} ${col.badgeText}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {filteredColumns.map((column) => {
          const colTasks = tasks.filter(t => getTaskStatus(t) === column.id);
          const Icon = column.icon;

          return (
            <div
              key={column.id}
              className={`bg-slate-100/90 dark:bg-slate-900/60 rounded-3xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-800 flex flex-col min-h-[420px] md:min-h-[500px] border-t-4 ${column.borderTop}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {column.title}
                  </h3>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${column.badgeBg} ${column.badgeText}`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards in Column */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[60vh] md:max-h-[70vh] pr-0.5">
                {colTasks.map((task) => {
                  const priorityMeta = PRIORITY_CONFIG[task.priority];
                  const categoryMeta = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.other;
                  const overdue = isOverdue(task.dueDate, task.dueTime, task.completed);
                  const dueToday = isDueToday(task.dueDate);
                  const currentStatus = getTaskStatus(task);
                  const nextSt = getNextStatus(currentStatus);
                  const prevSt = getPrevStatus(currentStatus);

                  const subtasksCount = task.subtasks?.length || 0;
                  const subtasksDone = task.subtasks?.filter(s => s.completed).length || 0;

                  return (
                    <div
                      key={task.id}
                      className={`bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 sm:p-4 border transition-all shadow-xs hover:shadow-md group ${
                        task.completed 
                          ? 'border-emerald-200 dark:border-emerald-900/40 opacity-80' 
                          : overdue 
                            ? 'border-rose-300 dark:border-rose-900/60' 
                            : 'border-slate-200 dark:border-slate-700/60'
                      }`}
                    >
                      {/* Top tags */}
                      <div className="flex items-center justify-between gap-1.5 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${priorityMeta.badgeBg} ${priorityMeta.badgeText}`}>
                            {priorityMeta.label}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                            {categoryMeta.label}
                          </span>
                        </div>

                        {/* Edit / Quick actions */}
                        <button
                          onClick={() => onEditTask(task)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md cursor-pointer"
                          title="تعديل"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Title */}
                      <h4 className={`text-xs sm:text-sm font-bold leading-snug ${
                        task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                      }`}>
                        {task.title}
                      </h4>

                      {/* Description preview */}
                      {task.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Subtasks Progress */}
                      {subtasksCount > 0 && (
                        <div className="mt-2.5">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                            <span>المهام الفرعية:</span>
                            <span>{subtasksDone}/{subtasksCount}</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-500 h-1 rounded-full"
                              style={{ width: `${(subtasksDone / subtasksCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Due Date & Pomodoro indicators */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/50 text-[11px]">
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span className={overdue ? 'text-rose-500 font-bold' : dueToday ? 'text-amber-500 font-semibold' : ''}>
                            {formatArabicDate(task.dueDate)}
                          </span>
                        </div>

                        {task.pomodorosCompleted ? (
                          <span className="text-[10px] font-bold text-rose-500 flex items-center gap-0.5">
                            🍅 {task.pomodorosCompleted}
                          </span>
                        ) : null}
                      </div>

                      {/* Shift Column Workflow Buttons (RTL) */}
                      <div className="flex items-center justify-between gap-1.5 mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                        {/* Backward move */}
                        {prevSt ? (
                          <button
                            onClick={() => onUpdateTaskStatus(task.id, prevSt)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            title="نقل للمرحلة السابقة"
                          >
                            <ChevronRight className="w-3 h-3" />
                            <span>رجوع</span>
                          </button>
                        ) : <span />}

                        {/* Launch Pomodoro Button */}
                        {!task.completed && onStartPomodoro && (
                          <button
                            onClick={() => onStartPomodoro(task.id)}
                            className="px-2 py-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            title="بدء جلسة بومودورو لهذه المهمة"
                          >
                            <span>🍅</span>
                            <span>تركيز</span>
                          </button>
                        )}

                        {/* Forward move */}
                        {nextSt ? (
                          <button
                            onClick={() => onUpdateTaskStatus(task.id, nextSt)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                            title="نقل للمرحلة التالية"
                          >
                            <span>{nextSt === 'completed' ? 'إكمال ✓' : 'تنفيذ ⚡'}</span>
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            مكتملة ✓
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    لا توجد مهام في هذه المرحلة
                  </div>
                )}
              </div>

              {/* Quick add in column */}
              <button
                onClick={onOpenNewTask}
                className="mt-3 w-full py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مهمة</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

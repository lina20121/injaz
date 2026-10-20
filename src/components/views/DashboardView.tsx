import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Target, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Plus, 
  Sparkles, 
  ArrowRight, 
  Sun, 
  Flame, 
  FileDown,
  Brain,
  Zap,
  Gift,
  ArrowRightLeft
} from 'lucide-react';
import { Task, Goal, ActiveTab, HabitStreak } from '../../types';
import { TaskCard } from '../TaskCard';
import { HabitStreakCard } from '../HabitStreakCard';
import { SmartQuickAdd } from '../SmartQuickAdd';
import { isDueToday, isOverdue } from '../../utils/dateUtils';
import { PRIORITY_CONFIG } from '../../utils/constants';

interface DashboardViewProps {
  tasks: Task[];
  goals: Goal[];
  streak: HabitStreak;
  onNavigateTab: (tab: ActiveTab) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onUpdateSubtask: (taskId: string, subtaskIndex: number, completed: boolean) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDuplicateTask: (task: Task) => void;
  onOpenNewTask: () => void;
  onOpenNewGoal: () => void;
  onQuickAddTask: (taskData: Partial<Task>) => void;
  onOpenPdfExport: () => void;
  onStartPomodoro?: (taskId: string) => void;
  onOpenWhatsNew?: () => void;
  onOpenDeviceSync?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  goals,
  streak,
  onNavigateTab,
  onToggleTaskComplete,
  onUpdateSubtask,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
  onOpenNewTask,
  onOpenNewGoal,
  onQuickAddTask,
  onOpenPdfExport,
  onStartPomodoro,
  onOpenWhatsNew,
  onOpenDeviceSync,
}) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const todayTasks = tasks.filter(t => isDueToday(t.dueDate));
  const todayPendingTasks = todayTasks.filter(t => !t.completed);
  const overdueTasks = tasks.filter(t => isOverdue(t.dueDate, t.dueTime, t.completed));
  const highPriorityTasks = tasks.filter(t => !t.completed && t.priority === 'high');

  return (
    <div className="space-y-6 pb-24">
      
      {/* Welcome & Motivational Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 shadow-lg shadow-emerald-900/20">
        {/* Background decorative circles */}
        <div className="absolute top-0 left-0 -translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 translate-x-12 translate-y-12 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-200 text-xs sm:text-sm font-semibold">
              <Sun className="w-4 h-4 text-amber-300" />
              <span>مرحباً بك! خطط ليوم مليء بالإنجاز والإنتاجية</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                V2.0
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              لوحة التحكم الذكية
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-xl leading-relaxed">
              لديك <span className="font-bold underline text-white">{todayPendingTasks.length} مهام</span> متبقية لليوم، و <span className="font-bold underline text-amber-300">{highPriorityTasks.length} مهام ذات أولوية قصوى</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenNewTask}
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-xs sm:text-sm shadow-md hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>إضافة مهمة جديدة</span>
            </button>

            <button
              onClick={() => onNavigateTab('pomodoro')}
              className="px-3.5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
              title="بدء جلسة تركيز بومودورو"
            >
              <Brain className="w-4 h-4" />
              <span>مؤقت التركيز 🍅</span>
            </button>

            {onOpenDeviceSync && (
              <button
                onClick={onOpenDeviceSync}
                className="px-3 py-2.5 rounded-xl bg-teal-600/80 hover:bg-teal-600 text-white font-bold text-xs sm:text-sm border border-teal-400/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                title="مزامنة مع الجوال والكمبيوتر"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>مزامنة الأجهزة</span>
              </button>
            )}

            {onOpenWhatsNew && (
              <button
                onClick={onOpenWhatsNew}
                className="px-3 py-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-900/90 text-white font-semibold text-xs border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                title="ما الجديد في الإصدار 2.0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>جديد V2.0</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Habit & Activity Streak Tracker */}
      <HabitStreakCard
        streak={streak}
        onNavigateToAnalytics={() => onNavigateTab('analytics')}
      />

      {/* Smart Quick-Add Bar with Presets and 1-Click Templates */}
      <SmartQuickAdd
        onAddTask={onQuickAddTask}
        onOpenFullModal={onOpenNewTask}
      />

      {/* Quick Stat Cards Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Pending Tasks */}
        <div 
          onClick={() => onNavigateTab('tasks')}
          className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/60 shadow-xs hover:border-emerald-400 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">المهام المتبقية</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{pendingTasks}</span>
            <span className="text-xs text-slate-400">من {totalTasks}</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>عرض قائمة المهام</span>
            <ArrowRight className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>

        {/* High Priority Urgencies */}
        <div 
          onClick={() => onNavigateTab('tasks')}
          className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/60 shadow-xs hover:border-rose-400 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">أولوية عالية 🔴</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">{highPriorityTasks.length}</span>
            {overdueTasks.length > 0 && (
              <span className="text-[11px] font-bold text-rose-500 bg-rose-100 dark:bg-rose-950 px-1.5 py-0.5 rounded-md">
                {overdueTasks.length} متأخرة
              </span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>تركيز فوري</span>
            <ArrowRight className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Today's Tasks */}
        <div 
          onClick={() => onNavigateTab('calendar')}
          className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/60 shadow-xs hover:border-amber-400 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">مهام اليوم</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{todayTasks.length}</span>
            <span className="text-xs text-amber-600 font-semibold">{todayPendingTasks.length} متبقية</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>فتح التقويم</span>
            <ArrowRight className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Completion Rate & Streak */}
        <div 
          onClick={() => onNavigateTab('analytics')}
          className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/60 shadow-xs hover:border-emerald-400 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">معدل الإنجاز</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{completionRate}%</span>
            <span className="flex items-center gap-0.5 text-xs text-amber-500 font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              <span>{streak.currentStreak} أيام</span>
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>التحليلات والمؤشرات</span>
            <ArrowRight className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Main Grid: Urgent Priority Tasks + Active Goals Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: High Priority & Today's Agenda */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                مهام اليوم والأولوية العالية
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                {highPriorityTasks.length + todayPendingTasks.length}
              </span>
            </div>

            <button
              onClick={() => onNavigateTab('tasks')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>عرض كل المهام</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Task list preview */}
          {todayTasks.length === 0 && highPriorityTasks.length === 0 ? (
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-8 text-center border border-dashed border-slate-300 dark:border-slate-700">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                رائع! لا توجد مهام عاجلة متبقية لليوم
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                استمتع بيومك أو أضف مهام وأهداف جديدة لتعزيز إنتاجيتك
              </p>
              <button
                onClick={onOpenNewTask}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>إضافة مهمة جديدة</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Combine unique urgent and today tasks */}
              {Array.from(new Set([...highPriorityTasks, ...todayTasks])).slice(0, 5).map((task) => {
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
                    onStartPomodoro={onStartPomodoro}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Active Goals Snapshot & Quick Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                تتبع الأهداف
              </h3>
            </div>

            <button
              onClick={() => onNavigateTab('goals')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>جميع الأهداف</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {goals.slice(0, 3).map((goal) => {
              const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) || 0;
              return (
                <div 
                  key={goal.id}
                  onClick={() => onNavigateTab('goals')}
                  className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60 shadow-xs hover:border-emerald-400 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                      {goal.title}
                    </span>
                    <span className="text-xs font-extrabold" style={{ color: goal.color }}>
                      {pct}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden mb-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: goal.color }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                    <span>{goal.milestones.filter(m => m.completed).length} من {goal.milestones.length} محطات</span>
                  </div>
                </div>
              );
            })}

            <button
              onClick={onOpenNewGoal}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة هدف جديد</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

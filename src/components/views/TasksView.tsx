import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Filter, 
  ArrowUpDown, 
  Calendar as CalendarIcon, 
  Download, 
  CheckCheck, 
  Sparkles,
  Search,
  CheckCircle2,
  Trash2,
  Kanban,
  List
} from 'lucide-react';
import { Task, Goal, Priority, Category, KanbanStatus } from '../../types';
import { TaskCard } from '../TaskCard';
import { KanbanBoard } from './KanbanBoard';
import { SmartQuickAdd } from '../SmartQuickAdd';
import { PRIORITY_CONFIG, CATEGORY_CONFIG } from '../../utils/constants';
import { isDueToday, isOverdue, isDueThisWeek } from '../../utils/dateUtils';
import { generateIcsContent, downloadIcsFile } from '../../utils/calendarSync';

interface TasksViewProps {
  tasks: Task[];
  goals: Goal[];
  searchQuery: string;
  onToggleComplete: (taskId: string) => void;
  onUpdateSubtask: (taskId: string, subtaskIndex: number, completed: boolean) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDuplicateTask: (task: Task) => void;
  onOpenNewTask: () => void;
  onQuickAddTask?: (taskData: Partial<Task>) => void;
  onUpdateTaskStatus?: (taskId: string, newStatus: KanbanStatus) => void;
  onStartPomodoro?: (taskId: string) => void;
}

type StatusFilter = 'all_pending' | 'today' | 'this_week' | 'overdue' | 'completed' | 'all';
type SortOption = 'priority_desc' | 'due_date_asc' | 'created_desc' | 'title_asc';

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  goals,
  searchQuery,
  onToggleComplete,
  onUpdateSubtask,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
  onOpenNewTask,
  onQuickAddTask,
  onUpdateTaskStatus,
  onStartPomodoro,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all_pending');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('priority_desc');
  const [localSearch, setLocalSearch] = useState('');

  const activeSearch = searchQuery || localSearch;

  // Filtered and sorted tasks calculation
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Search Query
      if (activeSearch.trim()) {
        const q = activeSearch.toLowerCase().trim();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q);
        const matchTag = task.tags?.some(t => t.toLowerCase().includes(q));
        const matchCat = CATEGORY_CONFIG[task.category]?.label.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchTag && !matchCat) return false;
      }

      // 2. Priority Filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }

      // 3. Category Filter
      if (selectedCategory !== 'all' && task.category !== selectedCategory) {
        return false;
      }

      // 4. Status Filter (Only applied in List mode, in Kanban all active workflow tasks are visible)
      if (viewMode === 'list') {
        const overdue = isOverdue(task.dueDate, task.dueTime, task.completed);
        const dueToday = isDueToday(task.dueDate);
        const dueThisWeek = isDueThisWeek(task.dueDate);

        switch (statusFilter) {
          case 'all_pending':
            return !task.completed;
          case 'today':
            return !task.completed && dueToday;
          case 'this_week':
            return !task.completed && dueThisWeek;
          case 'overdue':
            return !task.completed && overdue;
          case 'completed':
            return task.completed;
          case 'all':
          default:
            return true;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'priority_desc') {
        const orderA = PRIORITY_CONFIG[a.priority].order;
        const orderB = PRIORITY_CONFIG[b.priority].order;
        if (orderA !== orderB) return orderB - orderA;
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      } else if (sortBy === 'due_date_asc') {
        return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
      } else if (sortBy === 'created_desc') {
        return b.createdAt.localeCompare(a.createdAt);
      } else if (sortBy === 'title_asc') {
        return a.title.localeCompare(b.title, 'ar');
      }
      return 0;
    });
  }, [tasks, activeSearch, priorityFilter, selectedCategory, statusFilter, sortBy, viewMode]);

  const handleExportFilteredIcs = () => {
    if (filteredTasks.length === 0) return;
    const ics = generateIcsContent(filteredTasks, 'مهام إنجاز المفلترة');
    downloadIcsFile(`مهام_إنجاز_${statusFilter}`, ics);
  };

  return (
    <div className="space-y-5 pb-24">
      
      {/* Header with Title and New Task CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              إدارة المهام والأولويات
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              V2.0
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            عرض {filteredTasks.length} من أصل {tasks.length} مهمة مسجلة
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle: List vs Kanban */}
          <div className="bg-slate-200/80 dark:bg-slate-800 p-1 rounded-2xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>قائمة</span>
            </button>

            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>كانبان</span>
            </button>
          </div>

          {filteredTasks.length > 0 && (
            <button
              onClick={handleExportFilteredIcs}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="تصدير هذه المجموعة إلى التقويم بصيغة .ics"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">تصدير .ics</span>
            </button>
          )}

          <button
            onClick={onOpenNewTask}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>مهمة جديدة</span>
          </button>
        </div>
      </div>

      {/* Smart Quick-Add Bar with Templates */}
      {onQuickAddTask && (
        <SmartQuickAdd
          onAddTask={onQuickAddTask}
          onOpenFullModal={onOpenNewTask}
        />
      )}

      {/* Inline Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="بحث سريع بالعناوين، الأوصاف، الوسوم أو التصنيفات..."
          className="w-full pl-4 pr-10 py-2.5 rounded-2xl text-sm bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-white placeholder:text-slate-400 shadow-xs focus:outline-hidden focus:border-emerald-500"
        />
        {localSearch && (
          <button
            onClick={() => setLocalSearch('')}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* List Mode Filters & Controls */}
      {viewMode === 'list' && (
        <>
          {/* Priority Level Buttons (High, Medium, Low, All) */}
          <div className="bg-white dark:bg-slate-800/90 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
            <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
              
              {/* All Priorities */}
              <button
                onClick={() => setPriorityFilter('all')}
                className={`flex-1 min-w-[70px] py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                  priorityFilter === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                جميع الأولويات ({tasks.length})
              </button>

              {/* High Priority */}
              <button
                onClick={() => setPriorityFilter('high')}
                className={`flex-1 min-w-[70px] py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  priorityFilter === 'high'
                    ? 'bg-rose-600 text-white shadow-xs shadow-rose-600/30'
                    : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>عالية ({tasks.filter(t => t.priority === 'high').length})</span>
              </button>

              {/* Medium Priority */}
              <button
                onClick={() => setPriorityFilter('medium')}
                className={`flex-1 min-w-[70px] py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  priorityFilter === 'medium'
                    ? 'bg-amber-500 text-white shadow-xs shadow-amber-500/30'
                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>متوسطة ({tasks.filter(t => t.priority === 'medium').length})</span>
              </button>

              {/* Low Priority */}
              <button
                onClick={() => setPriorityFilter('low')}
                className={`flex-1 min-w-[70px] py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  priorityFilter === 'low'
                    ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30'
                    : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>منخفضة ({tasks.filter(t => t.priority === 'low').length})</span>
              </button>
            </div>
          </div>

          {/* Status Filter & Sort Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Status Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
              {[
                { id: 'all_pending', label: 'المهام المعلقة' },
                { id: 'today', label: 'اليوم' },
                { id: 'this_week', label: 'هذا الأسبوع' },
                { id: 'overdue', label: 'المتأخرة ⚠️' },
                { id: 'completed', label: 'المكتملة ✓' },
                { id: 'all', label: 'الكل' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setStatusFilter(item.id as StatusFilter)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === item.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="priority_desc">الأعلى أولوية أولاً</option>
                <option value="due_date_asc">تاريخ الاستحقاق (الأقرب)</option>
                <option value="created_desc">الأحدث إضافة</option>
                <option value="title_asc">أبجدياً (أ-ي)</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              جميع التصنيفات
            </button>

            {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => {
              const catKey = key as Category;
              const isSel = selectedCategory === catKey;
              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isSel
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* MAIN VIEW CONTENT: LIST vs KANBAN */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          tasks={filteredTasks}
          onUpdateTaskStatus={onUpdateTaskStatus || (() => {})}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onStartPomodoro={onStartPomodoro}
          onOpenNewTask={onOpenNewTask}
        />
      ) : (
        /* Task Cards List */
        filteredTasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-700">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
              لا توجد مهام تطابق هذا التصفية
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              يمكنك تغيير معايير التصفية أو إضافة مهمة جديدة لبدء تنظيم يومك
            </p>
            <button
              onClick={onOpenNewTask}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>إضافة مهمة جديدة</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredTasks.map((task) => {
              const goal = goals.find(g => g.id === task.goalId);
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  goalTitle={goal?.title}
                  onToggleComplete={onToggleComplete}
                  onUpdateSubtask={onUpdateSubtask}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onDuplicate={onDuplicateTask}
                  onStartPomodoro={onStartPomodoro}
                />
              );
            })}
          </div>
        )
      )}

    </div>
  );
};

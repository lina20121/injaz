import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  TrendingUp,
  Filter
} from 'lucide-react';
import { Goal, Task, Category } from '../../types';
import { GoalCard } from '../GoalCard';
import { CATEGORY_CONFIG } from '../../utils/constants';

interface GoalsViewProps {
  goals: Goal[];
  tasks: Task[];
  onUpdateGoalProgress: (goalId: string, newValue: number) => void;
  onToggleGoalMilestone: (goalId: string, milestoneId: string) => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
  onOpenNewGoal: () => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  tasks,
  onUpdateGoalProgress,
  onToggleGoalMilestone,
  onEditGoal,
  onDeleteGoal,
  onOpenNewGoal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');

  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.currentValue >= g.targetValue).length;
  
  // Calculate average completion rate
  const averageProgress = totalGoals > 0
    ? Math.round(
        goals.reduce((acc, g) => acc + Math.min(100, (g.currentValue / g.targetValue) * 100), 0) / totalGoals
      )
    : 0;

  const filteredGoals = goals.filter((g) => {
    if (selectedCategory !== 'all' && g.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-24">
      
      {/* Header and Add Goal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            تتبع الأهداف والمحطات
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            راقب تقدمك على المدى الطويل وحقق أهدافك خطوة بخطوة
          </p>
        </div>

        <button
          onClick={onOpenNewGoal}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>إضافة هدف جديد</span>
        </button>
      </div>

      {/* Hero Overview Goal Metric Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Average progress */}
        <div className="bg-gradient-to-tr from-emerald-700 to-teal-700 rounded-3xl p-6 text-white shadow-lg shadow-emerald-900/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-200">متوسط الإنجاز العام</span>
            <TrendingUp className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold mb-3">
            {averageProgress}%
          </div>
          {/* Progress bar */}
          <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500" 
              style={{ width: `${averageProgress}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Completed goals */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الأهداف المحققة بالكامل</span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div className="my-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {completedGoals}
            </span>
            <span className="text-xs text-slate-400 mr-2">من أصل {totalGoals}</span>
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            {totalGoals - completedGoals} أهداف قيد المتابعة النشطة
          </span>
        </div>

        {/* Metric 3: Total Milestones */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">المحطات المنجزة</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="my-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {goals.reduce((acc, g) => acc + g.milestones.filter(m => m.completed).length, 0)}
            </span>
            <span className="text-xs text-slate-400 mr-2">
              من {goals.reduce((acc, g) => acc + g.milestones.length, 0)} محطة
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            كل محطة تقربك أكثر من هدفك الأكبر
          </span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
          }`}
        >
          جميع الأهداف ({goals.length})
        </button>

        {(Object.keys(CATEGORY_CONFIG) as Category[]).map((catKey) => {
          const cat = CATEGORY_CONFIG[catKey];
          const count = goals.filter(g => g.category === catKey).length;
          if (count === 0 && selectedCategory !== catKey) return null;
          const isSel = selectedCategory === catKey;

          return (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                isSel
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Goals Cards Grid */}
      {filteredGoals.length === 0 ? (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-700">
          <Target className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
            لا توجد أهداف في هذا التصنيف
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            قم بصياغة هدف جديد وحدد محطاته الرئيسية لتبدأ رحلة الإنجاز
          </p>
          <button
            onClick={onOpenNewGoal}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>إضافة هدف جديد</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => {
            const linkedTasks = tasks.filter(t => t.goalId === goal.id);
            return (
              <GoalCard
                key={goal.id}
                goal={goal}
                linkedTasks={linkedTasks}
                onUpdateProgress={onUpdateGoalProgress}
                onToggleMilestone={onToggleGoalMilestone}
                onEdit={onEditGoal}
                onDelete={onDeleteGoal}
              />
            );
          })}
        </div>
      )}

    </div>
  );
};

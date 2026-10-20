import React, { useState } from 'react';
import { 
  Target, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  Plus, 
  Minus, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  ListChecks, 
  ChevronDown, 
  ChevronUp,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Goal, GoalMilestone, Task } from '../types';
import { CATEGORY_CONFIG } from '../utils/constants';
import { formatArabicDate } from '../utils/dateUtils';

interface GoalCardProps {
  goal: Goal;
  linkedTasks: Task[];
  onUpdateProgress: (goalId: string, newValue: number) => void;
  onToggleMilestone: (goalId: string, milestoneId: string) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  linkedTasks,
  onUpdateProgress,
  onToggleMilestone,
  onEdit,
  onDelete,
}) => {
  const [showMilestones, setShowMilestones] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const categoryMeta = CATEGORY_CONFIG[goal.category] || CATEGORY_CONFIG.other;
  const percentage = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) || 0;
  const isCompleted = goal.currentValue >= goal.targetValue;

  const totalMilestones = goal.milestones?.length || 0;
  const completedMilestones = goal.milestones?.filter(m => m.completed).length || 0;

  const handleIncrement = (amount: number) => {
    const nextVal = Math.max(0, goal.currentValue + amount);
    if (nextVal >= goal.targetValue && goal.currentValue < goal.targetValue) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 },
        colors: [goal.color, '#10b981', '#f59e0b']
      });
    }
    onUpdateProgress(goal.id, nextVal);
  };

  const handleMilestoneClick = (milestone: GoalMilestone) => {
    if (!milestone.completed) {
      confetti({
        particleCount: 25,
        spread: 40,
        origin: { y: 0.8 },
      });
    }
    onToggleMilestone(goal.id, milestone.id);
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/60 shadow-xs hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        
        {/* Goal Category & Color indicator */}
        <div className="flex items-center gap-2">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
            style={{ backgroundColor: goal.color || '#0ea5e9' }}
          >
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
              {categoryMeta.label}
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <CalendarIcon className="w-3 h-3" />
              <span>الموعد النهائي: {formatArabicDate(goal.targetDate)}</span>
            </div>
          </div>
        </div>

        {/* Options menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            aria-label="خيارات الهدف"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
              <div className="absolute left-0 mt-1 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-30 text-xs animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(goal);
                  }}
                  className="w-full text-right px-3 py-1.5 flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                  <span>تعديل الهدف</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(goal.id);
                  }}
                  className="w-full text-right px-3 py-1.5 flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف الهدف</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Goal Title & Description */}
      <div className="mt-3">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            {goal.title}
          </h3>
          {isCompleted && (
            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              مكتمل 🎉
            </span>
          )}
        </div>
        {goal.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {goal.description}
          </p>
        )}
      </div>

      {/* Progress Bar & Value Display */}
      <div className="mt-4 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            نسبة الإنجاز الإجمالية
          </span>
          <span className="font-extrabold text-sm" style={{ color: goal.color || '#0ea5e9' }}>
            {percentage}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-2.5 rounded-full transition-all duration-500"
            style={{
              width: `${percentage}%`,
              backgroundColor: goal.color || '#0ea5e9'
            }}
          />
        </div>

        {/* Value Tracker Controls */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
          <div className="text-xs text-slate-600 dark:text-slate-300">
            <span className="font-bold text-slate-900 dark:text-white text-sm">{goal.currentValue}</span>
            <span className="text-slate-400 mx-1">/</span>
            <span>{goal.targetValue} {goal.unit}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleIncrement(-1)}
              disabled={goal.currentValue <= 0}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer"
              title="إنقاص القيمة بمقدار 1"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleIncrement(1)}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-all cursor-pointer"
              title="زيادة القيمة بمقدار 1"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Milestones checklist expansion */}
      {totalMilestones > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowMilestones(!showMilestones)}
            className="flex items-center justify-between w-full text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 py-1 font-semibold cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <ListChecks className="w-4 h-4 text-emerald-500" />
              <span>المحطات الرئيسية ({completedMilestones}/{totalMilestones})</span>
            </span>
            <span>{showMilestones ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
          </button>

          {showMilestones && (
            <div className="mt-2 space-y-2 pr-2 border-r-2 border-slate-200 dark:border-slate-700">
              {goal.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  onClick={() => handleMilestoneClick(milestone)}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={milestone.completed}
                      onChange={() => handleMilestoneClick(milestone)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className={milestone.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200 font-medium'}>
                      {milestone.title}
                    </span>
                  </div>
                  {milestone.targetDate && (
                    <span className="text-[10px] text-slate-400">
                      {formatArabicDate(milestone.targetDate, false)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Linked Tasks counter */}
      {linkedTasks.length > 0 && (
        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>المهام المرتبطة بالهدف:</span>
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {linkedTasks.filter(t => t.completed).length} من {linkedTasks.length} مكتملة
          </span>
        </div>
      )}
    </div>
  );
};

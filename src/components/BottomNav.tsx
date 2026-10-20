import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Target, 
  BarChart3, 
  Plus,
  Brain
} from 'lucide-react';
import { ActiveTab, Task } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenNewTask: () => void;
  tasks: Task[];
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenNewTask,
  tasks,
}) => {
  const pendingHighTasks = tasks.filter(t => !t.completed && t.priority === 'high').length;
  const pendingTasksTotal = tasks.filter(t => !t.completed).length;

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'الرئيسية',
      icon: LayoutDashboard,
    },
    {
      id: 'tasks' as ActiveTab,
      label: 'المهام',
      icon: CheckSquare,
      badge: pendingHighTasks > 0 ? `${pendingHighTasks} عاجل` : (pendingTasksTotal > 0 ? `${pendingTasksTotal}` : undefined),
      badgeColor: pendingHighTasks > 0 ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
    },
    {
      id: 'calendar' as ActiveTab,
      label: 'التقويم',
      icon: CalendarIcon,
    },
    {
      id: 'pomodoro' as ActiveTab,
      label: 'التركيز 🍅',
      icon: Brain,
    },
    {
      id: 'goals' as ActiveTab,
      label: 'الأهداف',
      icon: Target,
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'التحليلات',
      icon: BarChart3,
    },
  ];

  return (
    <>
      {/* Floating Action Button for Mobile/Tablet */}
      <div className="fixed bottom-20 left-4 sm:left-6 z-30 lg:hidden">
        <button
          onClick={onOpenNewTask}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-90 transition-transform cursor-pointer"
          aria-label="إضافة مهمة جديدة"
        >
          <Plus className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 transition-colors pb-[max(env(safe-area-inset-bottom),0.5rem)]">
        <div className="max-w-md sm:max-w-2xl lg:max-w-4xl mx-auto px-1 sm:px-6">
          <div className="flex items-center justify-around h-15 sm:h-16">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex flex-col items-center justify-center flex-1 h-full px-0.5 sm:px-1 relative transition-all cursor-pointer ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {/* Active Indicator bar */}
                  {isActive && (
                    <span className="absolute top-0 w-6 sm:w-8 h-1 bg-emerald-500 rounded-b-full shadow-xs shadow-emerald-500/50" />
                  )}

                  <div className="relative">
                    <Icon className={`w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                    {item.badge && (
                      <span className={`absolute -top-1.5 -left-2.5 text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.2 rounded-full whitespace-nowrap shadow-xs ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[9.5px] sm:text-[11px] mt-0.5 sm:mt-1 tracking-tight truncate max-w-full">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

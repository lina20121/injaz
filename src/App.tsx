import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/views/DashboardView';
import { TasksView } from './components/views/TasksView';
import { CalendarView } from './components/views/CalendarView';
import { GoalsView } from './components/views/GoalsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { PomodoroView } from './components/views/PomodoroView';
import { TaskModal } from './components/modals/TaskModal';
import { GoalModal } from './components/modals/GoalModal';
import { NotificationCenterModal } from './components/modals/NotificationCenterModal';
import { CalendarSyncModal } from './components/modals/CalendarSyncModal';
import { PdfExportModal } from './components/modals/PdfExportModal';
import { WhatsNewModal } from './components/modals/WhatsNewModal';
import { DeviceSyncModal } from './components/modals/DeviceSyncModal';
import { Task, Goal, AppNotification, DailyBriefingSettings, ActiveTab, Priority, HabitStreak, KanbanStatus } from './types';
import { StorageService } from './utils/storage';
import { CloudSyncService } from './utils/cloudSyncService';
import { checkAndTriggerReminders } from './utils/notificationService';
import { getNextRecurringDate } from './utils/dateUtils';

export default function App() {
  // State initialization
  const [theme, setTheme] = useState<'light' | 'dark'>(() => StorageService.getTheme());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [tasks, setTasks] = useState<Task[]>(() => StorageService.getTasks());
  const [goals, setGoals] = useState<Goal[]>(() => StorageService.getGoals());
  const [notifications, setNotifications] = useState<AppNotification[]>(() => StorageService.getNotifications());
  const [briefingSettings, setBriefingSettings] = useState<DailyBriefingSettings>(() => StorageService.getBriefingSettings());
  const [streak, setStreak] = useState<HabitStreak>(() => StorageService.getHabitStreak());
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultTaskDate, setDefaultTaskDate] = useState<string | undefined>(undefined);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);

  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isCalendarSyncModalOpen, setIsCalendarSyncModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [isDeviceSyncModalOpen, setIsDeviceSyncModalOpen] = useState(false);

  // Pomodoro focus selected task
  const [focusTaskId, setFocusTaskId] = useState<string | undefined>(undefined);

  // Reload state when synced from another device
  const handleDataSynced = useCallback(() => {
    setTasks(StorageService.getTasks());
    setGoals(StorageService.getGoals());
    setNotifications(StorageService.getNotifications());
    setBriefingSettings(StorageService.getBriefingSettings());
    setStreak(StorageService.getHabitStreak());
  }, []);

  // Background auto-sync if user has enabled it and has a syncKey
  useEffect(() => {
    if (!CloudSyncService.isAutoSyncEnabled()) return;
    const storedKey = CloudSyncService.getStoredSyncKey();
    if (!storedKey) return;

    const autoSyncInterval = setInterval(async () => {
      await CloudSyncService.pushToServer(storedKey);
    }, 60000);

    return () => clearInterval(autoSyncInterval);
  }, [tasks, goals, notifications, streak]);

  // Sync theme with DOM
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    StorageService.saveTheme(theme);
  }, [theme]);

  // Persist tasks, goals, notifications
  useEffect(() => {
    StorageService.saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    StorageService.saveGoals(goals);
  }, [goals]);

  useEffect(() => {
    StorageService.saveNotifications(notifications);
  }, [notifications]);

  // Handle incoming notifications
  const handleNewNotification = useCallback((newNotif: AppNotification) => {
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  // Periodic Reminder & Daily Briefing Worker with exact scheduling
  // Synchronously updates React state when briefing triggers so it NEVER repeats every minute
  useEffect(() => {
    const runWorker = () => {
      checkAndTriggerReminders(
        tasks,
        briefingSettings,
        handleNewNotification,
        (updatedBriefing) => {
          setBriefingSettings(updatedBriefing);
        }
      );
    };

    runWorker();

    const interval = setInterval(runWorker, 30000);
    return () => clearInterval(interval);
  }, [tasks, briefingSettings, handleNewNotification]);

  // Theme Toggle
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Task Handlers
  const handleToggleTaskComplete = (taskId: string) => {
    setTasks(prevTasks => {
      let nextTaskToSpawn: Task | null = null;

      const updated = prevTasks.map(task => {
        if (task.id === taskId) {
          const nextCompletedState = !task.completed;
          const completedAt = nextCompletedState ? new Date().toISOString() : undefined;

          // Update habit streak on task completion
          const updatedStreak = StorageService.recordStreakActivity(nextCompletedState);
          setStreak(updatedStreak);

          // If completing a recurring task, create the next occurrence!
          if (nextCompletedState && task.recurrence && task.recurrence !== 'none') {
            const nextDueDate = getNextRecurringDate(task.dueDate, task.recurrence);
            nextTaskToSpawn = {
              ...task,
              id: `t-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              dueDate: nextDueDate,
              completed: false,
              completedAt: undefined,
              createdAt: new Date().toISOString(),
              subtasks: task.subtasks.map(st => ({ ...st, completed: false })),
            };
          }

          return {
            ...task,
            completed: nextCompletedState,
            status: nextCompletedState ? ('completed' as KanbanStatus) : ('todo' as KanbanStatus),
            completedAt,
            subtasks: nextCompletedState 
              ? task.subtasks.map(st => ({ ...st, completed: true })) 
              : task.subtasks,
          };
        }
        return task;
      });

      if (nextTaskToSpawn) {
        return [...updated, nextTaskToSpawn];
      }
      return updated;
    });
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: KanbanStatus) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const completed = newStatus === 'completed';
          if (completed !== task.completed) {
            const updatedStreak = StorageService.recordStreakActivity(completed);
            setStreak(updatedStreak);
          }
          return {
            ...task,
            status: newStatus,
            completed,
            completedAt: completed ? new Date().toISOString() : undefined,
          };
        }
        return task;
      })
    );
  };

  const handleIncrementTaskPomodoro = (taskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            pomodorosCompleted: (task.pomodorosCompleted || 0) + 1,
          };
        }
        return task;
      })
    );
  };

  const handleStartPomodoro = (taskId: string) => {
    setFocusTaskId(taskId);
    setActiveTab('pomodoro');
  };

  const handleUpdateSubtask = (taskId: string, subtaskIndex: number, completed: boolean) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const updatedSubtasks = [...task.subtasks];
          if (updatedSubtasks[subtaskIndex]) {
            updatedSubtasks[subtaskIndex] = {
              ...updatedSubtasks[subtaskIndex],
              completed,
            };
          }
          const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.completed);
          if (allDone && !task.completed) {
            const updatedStreak = StorageService.recordStreakActivity(true);
            setStreak(updatedStreak);
          }
          return {
            ...task,
            subtasks: updatedSubtasks,
            completed: allDone ? true : task.completed,
          };
        }
        return task;
      })
    );
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (taskData.id) {
      // Edit existing
      setTasks(prev => prev.map(t => (t.id === taskData.id ? { ...t, ...taskData } as Task : t)));
    } else {
      // New task
      const newTask: Task = {
        id: `t-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: taskData.title || 'مهمة جديدة',
        description: taskData.description || '',
        priority: taskData.priority || 'medium',
        category: taskData.category || 'work',
        dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
        dueTime: taskData.dueTime,
        completed: false,
        recurrence: taskData.recurrence || 'none',
        reminderEnabled: taskData.reminderEnabled ?? true,
        reminderMinutesBefore: taskData.reminderMinutesBefore ?? 30,
        subtasks: taskData.subtasks || [],
        goalId: taskData.goalId,
        createdAt: new Date().toISOString(),
        tags: taskData.tags || [],
        status: 'todo',
        pomodorosCompleted: 0,
      };
      setTasks(prev => [newTask, ...prev]);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleDuplicateTask = (task: Task) => {
    const duplicated: Task = {
      ...task,
      id: `t-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: `${task.title} (نسخة)`,
      completed: false,
      completedAt: undefined,
      createdAt: new Date().toISOString(),
      subtasks: task.subtasks.map(s => ({ ...s, id: `st-${Date.now()}-${Math.random()}`, completed: false })),
    };
    setTasks(prev => [duplicated, ...prev]);
  };

  const handleQuickAddTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: `t-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: taskData.title || 'مهمة جديدة',
      description: taskData.description || '',
      priority: taskData.priority || 'medium',
      category: taskData.category || 'work',
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
      dueTime: taskData.dueTime || '12:00',
      completed: false,
      recurrence: taskData.recurrence || 'none',
      reminderEnabled: taskData.reminderEnabled ?? true,
      reminderMinutesBefore: taskData.reminderMinutesBefore ?? 15,
      subtasks: taskData.subtasks || [],
      createdAt: new Date().toISOString(),
      status: 'todo',
      pomodorosCompleted: 0,
    };
    setTasks(prev => [newTask, ...prev]);
  };

  // Goal Handlers
  const handleSaveGoal = (goalData: Partial<Goal>) => {
    if (goalData.id) {
      setGoals(prev => prev.map(g => (g.id === goalData.id ? { ...g, ...goalData } as Goal : g)));
    } else {
      const newGoal: Goal = {
        id: `g-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: goalData.title || 'هدف جديد',
        description: goalData.description || '',
        category: goalData.category || 'projects',
        startDate: goalData.startDate || new Date().toISOString().split('T')[0],
        targetDate: goalData.targetDate || new Date().toISOString().split('T')[0],
        currentValue: goalData.currentValue || 0,
        targetValue: goalData.targetValue || 100,
        unit: goalData.unit || '%',
        color: goalData.color || '#0ea5e9',
        milestones: goalData.milestones || [],
        createdAt: new Date().toISOString(),
      };
      setGoals(prev => [newGoal, ...prev]);
    }
  };

  const handleUpdateGoalProgress = (goalId: string, newValue: number) => {
    setGoals(prev =>
      prev.map(g => (g.id === goalId ? { ...g, currentValue: newValue } : g))
    );
  };

  const handleToggleGoalMilestone = (goalId: string, milestoneId: string) => {
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          const updatedMilestones = g.milestones.map(m =>
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
          );
          return { ...g, milestones: updatedMilestones };
        }
        return g;
      })
    );
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  // Notification actions
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleSaveBriefingSettings = (settings: DailyBriefingSettings) => {
    setBriefingSettings(settings);
    StorageService.saveBriefingSettings(settings);
  };

  // Helper openers
  const openNewTaskModal = (dateStr?: string) => {
    setTaskToEdit(null);
    setDefaultTaskDate(dateStr);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setTaskToEdit(task);
    setDefaultTaskDate(undefined);
    setIsTaskModalOpen(true);
  };

  const openNewGoalModal = () => {
    setGoalToEdit(null);
    setIsGoalModalOpen(true);
  };

  const openEditGoalModal = (goal: Goal) => {
    setGoalToEdit(goal);
    setIsGoalModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-['Cairo',sans-serif] selection:bg-emerald-500 selection:text-white transition-colors duration-200" dir="rtl">
      
      {/* Top Header */}
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onOpenCalendarSync={() => setIsCalendarSyncModalOpen(true)}
        onOpenPdfExport={() => setIsPdfModalOpen(true)}
        onOpenNewTask={() => openNewTaskModal()}
        onOpenDeviceSync={() => setIsDeviceSyncModalOpen(true)}
        onOpenPomodoro={() => setActiveTab('pomodoro')}
        onOpenWhatsNew={() => setIsWhatsNewOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        {activeTab === 'dashboard' && (
          <DashboardView
            tasks={tasks}
            goals={goals}
            streak={streak}
            onNavigateTab={setActiveTab}
            onToggleTaskComplete={handleToggleTaskComplete}
            onUpdateSubtask={handleUpdateSubtask}
            onEditTask={openEditTaskModal}
            onDeleteTask={handleDeleteTask}
            onDuplicateTask={handleDuplicateTask}
            onOpenNewTask={() => openNewTaskModal()}
            onOpenNewGoal={openNewGoalModal}
            onQuickAddTask={handleQuickAddTask}
            onOpenPdfExport={() => setIsPdfModalOpen(true)}
            onStartPomodoro={handleStartPomodoro}
            onOpenWhatsNew={() => setIsWhatsNewOpen(true)}
            onOpenDeviceSync={() => setIsDeviceSyncModalOpen(true)}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            goals={goals}
            searchQuery={searchQuery}
            onToggleComplete={handleToggleTaskComplete}
            onUpdateSubtask={handleUpdateSubtask}
            onEditTask={openEditTaskModal}
            onDeleteTask={handleDeleteTask}
            onDuplicateTask={handleDuplicateTask}
            onOpenNewTask={() => openNewTaskModal()}
            onQuickAddTask={handleQuickAddTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onStartPomodoro={handleStartPomodoro}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            tasks={tasks}
            goals={goals}
            onToggleTaskComplete={handleToggleTaskComplete}
            onUpdateSubtask={handleUpdateSubtask}
            onEditTask={openEditTaskModal}
            onDeleteTask={handleDeleteTask}
            onDuplicateTask={handleDuplicateTask}
            onOpenNewTaskWithDate={(date) => openNewTaskModal(date)}
            onOpenCalendarSyncModal={() => setIsCalendarSyncModalOpen(true)}
          />
        )}

        {activeTab === 'pomodoro' && (
          <PomodoroView
            tasks={tasks}
            initialTaskId={focusTaskId}
            onIncrementTaskPomodoro={handleIncrementTaskPomodoro}
            onToggleTaskComplete={handleToggleTaskComplete}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsView
            goals={goals}
            tasks={tasks}
            onUpdateGoalProgress={handleUpdateGoalProgress}
            onToggleGoalMilestone={handleToggleGoalMilestone}
            onEditGoal={openEditGoalModal}
            onDeleteGoal={handleDeleteGoal}
            onOpenNewGoal={openNewGoalModal}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            tasks={tasks}
            goals={goals}
            onOpenPdfExport={() => setIsPdfModalOpen(true)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewTask={() => openNewTaskModal()}
        tasks={tasks}
      />

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        taskToEdit={taskToEdit}
        defaultDate={defaultTaskDate}
        goals={goals}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleSaveGoal}
        goalToEdit={goalToEdit}
      />

      <NotificationCenterModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onClearNotifications={handleClearNotifications}
        briefingSettings={briefingSettings}
        onSaveBriefingSettings={handleSaveBriefingSettings}
        tasks={tasks}
      />

      <CalendarSyncModal
        isOpen={isCalendarSyncModalOpen}
        onClose={() => setIsCalendarSyncModalOpen(false)}
        tasks={tasks}
      />

      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        tasks={tasks}
        goals={goals}
      />

      <WhatsNewModal
        isOpen={isWhatsNewOpen}
        onClose={() => setIsWhatsNewOpen(false)}
        onExplorePomodoro={() => {
          setIsWhatsNewOpen(false);
          setActiveTab('pomodoro');
        }}
      />

      <DeviceSyncModal
        isOpen={isDeviceSyncModalOpen}
        onClose={() => setIsDeviceSyncModalOpen(false)}
        onDataSynced={handleDataSynced}
      />

    </div>
  );
}

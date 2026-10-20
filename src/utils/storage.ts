import { Task, Goal, AppNotification, DailyBriefingSettings, HabitStreak } from '../types';
import { INITIAL_TASKS, INITIAL_GOALS } from './constants';

const STORAGE_KEYS = {
  TASKS: 'injaz_tasks_v1',
  GOALS: 'injaz_goals_v1',
  NOTIFICATIONS: 'injaz_notifications_v1',
  BRIEFING: 'injaz_briefing_v1',
  THEME: 'injaz_theme_v1',
};

const DEMO_TASK_TITLES = new Map(INITIAL_TASKS.map((task) => [task.id, task.title]));
const DEMO_GOAL_TITLES = new Map(INITIAL_GOALS.map((goal) => [goal.id, goal.title]));

function getStoredRecords<T extends { id: string; title: string }>(key: string, demoTitles: Map<string, string>): T[] {
  try {
    const data = localStorage.getItem(key);
    if (!data) return [];

    const records: T[] = JSON.parse(data);
    if (!Array.isArray(records)) return [];

    const userRecords = records.filter((record) => demoTitles.get(record.id) !== record.title);
    if (userRecords.length !== records.length) {
      localStorage.setItem(key, JSON.stringify(userRecords));
    }
    return userRecords;
  } catch (e) {
    console.error(`Error loading records for ${key}:`, e);
    return [];
  }
}

export const StorageService = {
  getTasks(): Task[] {
    return getStoredRecords<Task>(STORAGE_KEYS.TASKS, DEMO_TASK_TITLES);
  },

  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Error saving tasks:', e);
    }
  },

  getGoals(): Goal[] {
    return getStoredRecords<Goal>(STORAGE_KEYS.GOALS, DEMO_GOAL_TITLES);
  },

  saveGoals(goals: Goal[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    } catch (e) {
      console.error('Error saving goals:', e);
    }
  },

  getNotifications(): AppNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading notifications:', e);
      return [];
    }
  },

  saveNotifications(notifications: AppNotification[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications.slice(0, 50)));
    } catch (e) {
      console.error('Error saving notifications:', e);
    }
  },

  getBriefingSettings(): DailyBriefingSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BRIEFING);
      const defaults: DailyBriefingSettings = {
        enabled: true,
        time: '09:00',
        notifyHighPriorityOnly: false,
        soundTheme: 'crystal',
        soundVolume: 0.7,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
      };
      return data ? { ...defaults, ...JSON.parse(data) } : defaults;
    } catch (e) {
      return {
        enabled: true,
        time: '09:00',
        notifyHighPriorityOnly: false,
        soundTheme: 'crystal',
        soundVolume: 0.7,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
      };
    }
  },

  saveBriefingSettings(settings: DailyBriefingSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BRIEFING, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving briefing settings:', e);
    }
  },

  getHabitStreak(): HabitStreak {
    const defaultStreak: HabitStreak = {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
      completedDates: {},
    };
    try {
      const data = localStorage.getItem('injaz_habit_streak_v2');
      if (!data) return defaultStreak;
      return JSON.parse(data);
    } catch {
      return defaultStreak;
    }
  },

  saveHabitStreak(streak: HabitStreak): void {
    try {
      localStorage.setItem('injaz_habit_streak_v2', JSON.stringify(streak));
    } catch (e) {
      console.error('Error saving streak:', e);
    }
  },

  recordStreakActivity(completed: boolean): HabitStreak {
    const streak = this.getHabitStreak();
    const today = new Date().toISOString().split('T')[0];
    const prevDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const currentTodayCount = streak.completedDates[today] || 0;
    if (completed) {
      streak.completedDates[today] = currentTodayCount + 1;
      if (streak.lastActiveDate === prevDate) {
        streak.currentStreak += 1;
      } else if (streak.lastActiveDate !== today) {
        streak.currentStreak = 1;
      }
      streak.lastActiveDate = today;
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }
    } else {
      if (currentTodayCount > 0) {
        streak.completedDates[today] = currentTodayCount - 1;
      }
    }
    this.saveHabitStreak(streak);
    return streak;
  },

  getTheme(): 'light' | 'dark' {
    try {
      const theme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (theme === 'dark' || theme === 'light') return theme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  },

  saveTheme(theme: 'light' | 'dark'): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.error('Error saving theme:', e);
    }
  },

  exportFullBackup(): string {
    const data = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      tasks: this.getTasks(),
      goals: this.getGoals(),
      notifications: this.getNotifications(),
      briefing: this.getBriefingSettings(),
      streak: this.getHabitStreak(),
    };
    return JSON.stringify(data, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.tasks)) this.saveTasks(data.tasks);
      if (Array.isArray(data.goals)) this.saveGoals(data.goals);
      if (Array.isArray(data.notifications)) this.saveNotifications(data.notifications);
      if (data.briefing) this.saveBriefingSettings(data.briefing);
      if (data.streak) this.saveHabitStreak(data.streak);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  },

  resetToDefault(): void {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
  }
};

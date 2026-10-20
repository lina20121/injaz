export type Priority = 'high' | 'medium' | 'low';

export type Category = 
  | 'work' 
  | 'personal' 
  | 'study' 
  | 'health' 
  | 'finance' 
  | 'projects' 
  | 'family' 
  | 'other';

export type RecurrenceType = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';

export type KanbanStatus = 'todo' | 'in_progress' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  category: Category;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  completed: boolean;
  completedAt?: string;
  recurrence: RecurrenceType;
  reminderEnabled: boolean;
  reminderMinutesBefore?: number; // e.g. 0 (at time), 15, 30, 60, 1440 (1 day before)
  subtasks: Subtask[];
  goalId?: string;
  createdAt: string;
  tags?: string[];
  status?: KanbanStatus; // v2: Kanban workflow status
  pomodorosCompleted?: number; // v2: tracked focus sessions
  estimatedPomodoros?: number; // v2: estimated focus sessions
}

export interface GoalMilestone {
  id: string;
  title: string;
  targetDate?: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: Category;
  startDate: string;
  targetDate: string;
  currentValue: number;
  targetValue: number;
  unit: string; // e.g., '%', 'ساعة', 'مهمة', 'صفحة', 'ريال', 'يوم'
  milestones: GoalMilestone[];
  color: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  taskId?: string;
  goalId?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'reminder' | 'daily_briefing' | 'goal_milestone' | 'system' | 'pomodoro';
  snoozedUntil?: string; // v2: snooze timestamp
}

export type SoundTheme = 'crystal' | 'warm_chime' | 'success_fanfare' | 'zen_pulse';

export interface DailyBriefingSettings {
  enabled: boolean;
  time: string; // HH:mm, default "09:00"
  notifyHighPriorityOnly: boolean;
  lastSentDate?: string; // YYYY-MM-DD
  soundTheme?: SoundTheme; // v2: selectable audio tone
  soundVolume?: number; // v2: 0.1 to 1.0 (default 0.7)
  quietHoursEnabled?: boolean; // v2: silence non-critical chimes
  quietHoursStart?: string; // e.g. "22:00"
  quietHoursEnd?: string; // e.g. "07:00"
}

export interface HabitStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  completedDates: Record<string, number>; // date -> count
}

export type ActiveTab = 'dashboard' | 'tasks' | 'calendar' | 'goals' | 'analytics' | 'pomodoro';


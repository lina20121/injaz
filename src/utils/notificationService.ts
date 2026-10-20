import { Task, AppNotification, DailyBriefingSettings, SoundTheme } from '../types';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { isDueToday, getTodayStr, formatTimeArabic, formatArabicDate } from './dateUtils';
import { StorageService } from './storage';

const STORAGE_KEYS = {
  TRIGGERED_REMINDERS: 'injaz_triggered_reminders_v2',
  SNOOZED_REMINDERS: 'injaz_snoozed_reminders_v2',
  BRIEFING_LAST_DATE: 'injaz_briefing_last_sent_date_v2',
};

// Play synthesized ambient notification chime using Web Audio API
export function playNotificationSound(theme: SoundTheme = 'crystal', volume: number = 0.7) {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const safeVol = Math.max(0.05, Math.min(1.0, volume));

    if (theme === 'warm_chime') {
      // Warm dual bell chime
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0.25 * safeVol, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.12); // A5
      gain2.gain.setValueAtTime(0.3 * safeVol, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.9);
    } else if (theme === 'success_fanfare') {
      // Ascending triad for task completion & major milestones
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.08;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.22 * safeVol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.45);
      });
    } else if (theme === 'zen_pulse') {
      // Calming low resonant Tibetan bowl tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(329.63, now); // E4
      gain.gain.setValueAtTime(0.35 * safeVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.2);
    } else {
      // 'crystal' (Default crisp glass chime)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1174.66, now); // D6
      gain1.gain.setValueAtTime(0.25 * safeVol, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1760.0, now + 0.1); // A6
      gain2.gain.setValueAtTime(0.28 * safeVol, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.8);
    }
  } catch (e) {
    console.log('Audio playback not supported or user has not interacted yet', e);
  }
}

// Check if quiet hours apply
export function isWithinQuietHours(settings: DailyBriefingSettings): boolean {
  if (!settings.quietHoursEnabled) return false;
  const start = settings.quietHoursStart || '22:00';
  const end = settings.quietHoursEnd || '07:00';

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [sH, sM] = start.split(':').map(Number);
  const startMinutes = sH * 60 + sM;

  const [eH, eM] = end.split(':').map(Number);
  const endMinutes = eH * 60 + eM;

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } else {
    // Spans midnight (e.g. 22:00 to 07:00)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
}

export async function checkNotificationPermission(): Promise<NotificationPermission> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { display } = await LocalNotifications.checkPermissions();
      return display === 'granted' ? 'granted' : display === 'prompt' ? 'default' : 'denied';
    } catch {
      return 'denied';
    }
  }
  return 'Notification' in window ? Notification.permission : 'denied';
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (Capacitor.isNativePlatform()) {
    try {
      const current = await LocalNotifications.checkPermissions();
      const permission = current.display === 'granted'
        ? current
        : await LocalNotifications.requestPermissions();
      if (permission.display === 'granted' && Capacitor.getPlatform() === 'android') {
        await LocalNotifications.createChannel({
          id: 'injaz-reminders',
          name: 'تنبيهات إنجاز',
          description: 'تذكيرات المهام والتنبيهات اليومية',
          importance: 4,
        });
      }
      return permission.display === 'granted' ? 'granted' : 'denied';
    } catch {
      return 'denied';
    }
  }

  if (!('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
}

export function sendBrowserNotification(title: string, options?: NotificationOptions) {
  if (Capacitor.isNativePlatform()) {
    void LocalNotifications.checkPermissions().then(({ display }) => {
      if (display !== 'granted') return;
      return LocalNotifications.schedule({
        notifications: [{
          id: Math.floor(Date.now() % 2147483647),
          title,
          body: options?.body || '',
          channelId: Capacitor.getPlatform() === 'android' ? 'injaz-reminders' : undefined,
          schedule: { at: new Date(Date.now() + 1000) },
        }],
      });
    }).catch((error) => console.warn('Native notification failed:', error));
    return;
  }

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        dir: 'rtl',
        lang: 'ar',
        ...options,
      });
    } catch (e) {
      console.warn('Native notification failed, falling back to in-app:', e);
    }
  }
}

// Persistent tracking of sent reminders to prevent duplicates across intervals & refreshes
function getSentRemindersMap(): Record<string, number> {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRIGGERED_REMINDERS);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function markReminderAsSent(key: string) {
  try {
    const map = getSentRemindersMap();
    map[key] = Date.now();
    // Prune entries older than 3 days to keep storage clean
    const threeDaysAgo = Date.now() - 3 * 86400000;
    const cleaned: Record<string, number> = {};
    Object.entries(map).forEach(([k, timestamp]) => {
      if (timestamp > threeDaysAgo) cleaned[k] = timestamp;
    });
    localStorage.setItem(STORAGE_KEYS.TRIGGERED_REMINDERS, JSON.stringify(cleaned));
  } catch (e) {
    console.error('Error saving sent reminder:', e);
  }
}

function isReminderAlreadySent(key: string): boolean {
  const map = getSentRemindersMap();
  return Boolean(map[key]);
}

// Snooze Management
interface SnoozeEntry {
  id: string;
  taskId: string;
  title: string;
  message: string;
  targetMs: number;
}

export function getSnoozeList(): SnoozeEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SNOOZED_REMINDERS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addSnoozeReminder(taskId: string, title: string, message: string, minutes: number) {
  try {
    const list = getSnoozeList();
    const targetMs = Date.now() + minutes * 60 * 1000;
    const entry: SnoozeEntry = {
      id: `snooze-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      taskId,
      title,
      message,
      targetMs,
    };
    list.push(entry);
    localStorage.setItem(STORAGE_KEYS.SNOOZED_REMINDERS, JSON.stringify(list));
  } catch (e) {
    console.error('Error adding snooze:', e);
  }
}

function removeSnoozeEntry(id: string) {
  try {
    const list = getSnoozeList().filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.SNOOZED_REMINDERS, JSON.stringify(list));
  } catch (e) {
    console.error('Error removing snooze:', e);
  }
}

// Main Periodic Reminder & Briefing Checker
export function checkAndTriggerReminders(
  tasks: Task[],
  briefingSettings: DailyBriefingSettings,
  onNewNotification: (notification: AppNotification) => void,
  onUpdateBriefingSettings?: (updated: DailyBriefingSettings) => void
) {
  const now = new Date();
  const todayStr = getTodayStr();
  const nowTimestamp = now.getTime();
  const inQuietHours = isWithinQuietHours(briefingSettings);
  const soundTheme = briefingSettings.soundTheme || 'crystal';
  const soundVolume = briefingSettings.soundVolume ?? 0.7;

  // 1. Check Snoozed Reminders
  const activeSnoozes = getSnoozeList();
  activeSnoozes.forEach((snooze) => {
    if (nowTimestamp >= snooze.targetMs) {
      removeSnoozeEntry(snooze.id);

      if (!inQuietHours) {
        playNotificationSound(soundTheme, soundVolume);
      }
      sendBrowserNotification(`⏰ غفوة تنبيه: ${snooze.title}`, { body: snooze.message });

      const notif: AppNotification = {
        id: `snooze-alert-${Date.now()}`,
        taskId: snooze.taskId,
        title: `⏰ غفوة تنبيه: ${snooze.title}`,
        message: snooze.message,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'reminder',
      };
      onNewNotification(notif);
    }
  });

  // 2. Check Daily Briefing
  // CRITICAL FIX: Only trigger during the scheduled time window (within 5 minutes of scheduled time)
  // and only ONCE per day!
  const lastSentStorage = localStorage.getItem(STORAGE_KEYS.BRIEFING_LAST_DATE);
  const alreadySentToday = briefingSettings.lastSentDate === todayStr || lastSentStorage === todayStr;

  if (briefingSettings.enabled && !alreadySentToday && briefingSettings.time) {
    const [bHours, bMinutes] = briefingSettings.time.split(':').map(Number);
    const briefingTarget = new Date(now.getFullYear(), now.getMonth(), now.getDate(), bHours, bMinutes, 0, 0);
    const briefingTargetMs = briefingTarget.getTime();
    const diffMs = nowTimestamp - briefingTargetMs;

    // Trigger ONLY if current time is within 0 to 5 minutes after scheduled briefing time
    if (diffMs >= 0 && diffMs <= 5 * 60 * 1000) {
      const todayTasks = tasks.filter(t => !t.completed && isDueToday(t.dueDate));
      const targetTasks = briefingSettings.notifyHighPriorityOnly
        ? todayTasks.filter(t => t.priority === 'high')
        : todayTasks;

      // Always mark as sent today so it never runs again today, even if 0 tasks
      localStorage.setItem(STORAGE_KEYS.BRIEFING_LAST_DATE, todayStr);
      const updatedBriefing: DailyBriefingSettings = {
        ...briefingSettings,
        lastSentDate: todayStr,
      };
      StorageService.saveBriefingSettings(updatedBriefing);
      onUpdateBriefingSettings?.(updatedBriefing);

      if (targetTasks.length > 0) {
        const title = '🌅 الموجز اليومي لمهامك';
        const message = `لديك ${targetTasks.length} مهام مجدولة لليوم، ابدأ يومك بإنجاز أولوياتك!`;

        if (!inQuietHours) {
          playNotificationSound('warm_chime', soundVolume);
        }
        sendBrowserNotification(title, { body: message });

        const notif: AppNotification = {
          id: `briefing-${Date.now()}`,
          title,
          message,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'daily_briefing',
        };
        onNewNotification(notif);
      }
    }
  }

  // 3. Check Specific Task Reminders
  tasks.forEach((task) => {
    if (task.completed || !task.reminderEnabled || !task.dueDate || !task.dueTime) return;

    // Check if task is scheduled for today
    if (task.dueDate === todayStr) {
      const [dueH, dueM] = task.dueTime.split(':').map(Number);
      if (isNaN(dueH) || isNaN(dueM)) return;

      const taskDueTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), dueH, dueM, 0, 0);
      const taskDueTimeMs = taskDueTime.getTime();
      const leadTimeMs = (task.reminderMinutesBefore || 0) * 60 * 1000;
      const reminderTargetMs = taskDueTimeMs - leadTimeMs;

      // Check if current time is inside trigger window: between target and target + 80 seconds
      const diffMs = nowTimestamp - reminderTargetMs;
      const reminderKey = `task_${task.id}_${todayStr}_${task.dueTime}_${task.reminderMinutesBefore || 0}`;

      if (diffMs >= 0 && diffMs <= 80000 && !isReminderAlreadySent(reminderKey)) {
        markReminderAsSent(reminderKey);

        const title = `⏰ تذكير بموعد المهمة: ${task.title}`;
        const timeFormatted = formatTimeArabic(task.dueTime);
        const leadLabel = task.reminderMinutesBefore ? `(خلال ${task.reminderMinutesBefore} دقيقة)` : '';
        const priorityLabel = task.priority === 'high' ? 'عالية 🔴' : task.priority === 'medium' ? 'متوسطة 🟡' : 'منخفضة 🟢';
        const message = `الموعد: ${timeFormatted} ${leadLabel} | الأولوية: ${priorityLabel}`;

        if (!inQuietHours) {
          playNotificationSound(soundTheme, soundVolume);
        }
        sendBrowserNotification(title, { body: message });

        const notif: AppNotification = {
          id: `task-remind-${task.id}-${Date.now()}`,
          taskId: task.id,
          title,
          message,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'reminder',
        };
        onNewNotification(notif);
      }
    }
  });
}

// Compute upcoming scheduled reminders list for UI inspector
export function getUpcomingScheduledReminders(tasks: Task[]) {
  const now = new Date();
  const nowMs = now.getTime();
  const upcoming: {
    task: Task;
    triggerDate: Date;
    leadMinutes: number;
    triggerFormattedTime: string;
    isToday: boolean;
    diffMinutes: number;
  }[] = [];

  tasks.forEach(task => {
    if (task.completed || !task.reminderEnabled || !task.dueDate || !task.dueTime) return;

    const [dueH, dueM] = task.dueTime.split(':').map(Number);
    if (isNaN(dueH) || isNaN(dueM)) return;

    const [tYear, tMonth, tDay] = task.dueDate.split('-').map(Number);
    const dueDateObj = new Date(tYear, tMonth - 1, tDay, dueH, dueM, 0, 0);
    const leadMinutes = task.reminderMinutesBefore || 0;
    const triggerMs = dueDateObj.getTime() - leadMinutes * 60 * 1000;

    // Only future reminders within the next 7 days
    if (triggerMs > nowMs && triggerMs - nowMs < 7 * 86400000) {
      const triggerDate = new Date(triggerMs);
      const h = String(triggerDate.getHours()).padStart(2, '0');
      const m = String(triggerDate.getMinutes()).padStart(2, '0');
      upcoming.push({
        task,
        triggerDate,
        leadMinutes,
        triggerFormattedTime: formatTimeArabic(`${h}:${m}`),
        isToday: isDueToday(triggerDate.toISOString().split('T')[0]),
        diffMinutes: Math.round((triggerMs - nowMs) / 60000),
      });
    }
  });

  return upcoming.sort((a, b) => a.triggerDate.getTime() - b.triggerDate.getTime());
}

// Manual trigger for testing daily briefing
export function triggerManualBriefing(
  tasks: Task[],
  briefingSettings: DailyBriefingSettings,
  onNewNotification: (notification: AppNotification) => void
) {
  const todayTasks = tasks.filter(t => !t.completed && isDueToday(t.dueDate));
  const targetTasks = briefingSettings.notifyHighPriorityOnly
    ? todayTasks.filter(t => t.priority === 'high')
    : todayTasks;

  const count = targetTasks.length;
  const title = '🌅 الموجز اليومي لمهامك (تجريبي)';
  const message = count > 0 
    ? `لديك ${count} مهام مجدولة لليوم، ابدأ يومك بإنجاز أولوياتك!`
    : 'ليس لديك أي مهام متبقية لليوم، يومك منظم ومكتمل!';

  playNotificationSound(briefingSettings.soundTheme || 'warm_chime', briefingSettings.soundVolume ?? 0.7);
  sendBrowserNotification(title, { body: message });

  const notif: AppNotification = {
    id: `briefing-manual-${Date.now()}`,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    type: 'daily_briefing',
  };
  onNewNotification(notif);
}

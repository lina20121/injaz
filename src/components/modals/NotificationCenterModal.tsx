import React, { useEffect, useState } from 'react';
import { 
  X, 
  Bell, 
  Check, 
  Trash2, 
  Volume2, 
  ShieldCheck, 
  Clock, 
  Sun, 
  CheckCheck,
  AlertCircle,
  Moon,
  Volume1,
  Sparkles,
  Calendar,
  Hourglass,
  AlarmClock
} from 'lucide-react';
import { AppNotification, DailyBriefingSettings, SoundTheme, Task } from '../../types';
import { 
  playNotificationSound, 
  checkNotificationPermission,
  requestNotificationPermission, 
  sendBrowserNotification,
  triggerManualBriefing,
  getUpcomingScheduledReminders,
  addSnoozeReminder
} from '../../utils/notificationService';
import { formatArabicDate, formatTimeArabic } from '../../utils/dateUtils';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onClearNotifications: () => void;
  briefingSettings: DailyBriefingSettings;
  onSaveBriefingSettings: (settings: DailyBriefingSettings) => void;
  tasks?: Task[];
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearNotifications,
  briefingSettings,
  onSaveBriefingSettings,
  tasks = [],
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'upcoming' | 'settings'>('history');
  const [briefing, setBriefing] = useState<DailyBriefingSettings>(briefingSettings);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const [snoozeFeedback, setSnoozeFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    void checkNotificationPermission().then(setPermissionStatus);
  }, [isOpen]);

  if (!isOpen) return null;

  const upcomingReminders = getUpcomingScheduledReminders(tasks);

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setPermissionStatus(perm);
    if (perm === 'granted') {
      sendBrowserNotification('🎉 تم تفعيل التنبيهات بنجاح!', {
        body: 'ستصلك الآن تنبيهات المهام المجدولة في موعدها المحدد تماماً.',
      });
    }
  };

  const handleTestSound = () => {
    playNotificationSound(briefing.soundTheme || 'crystal', briefing.soundVolume ?? 0.7);
    sendBrowserNotification('🔔 تجربة نغمة التنبيه المحددة', {
      body: 'هكذا ستسمع تنبيهات مهامك اليومية والأولويات.',
    });
  };

  const handleTestBriefing = () => {
    triggerManualBriefing(tasks, briefing, (newNotif) => {
      // In-app test triggered
    });
  };

  const handleSaveBriefing = (updated: Partial<DailyBriefingSettings>) => {
    const newSettings = { ...briefing, ...updated };
    setBriefing(newSettings);
    onSaveBriefingSettings(newSettings);
  };

  const handleSnooze = (notif: AppNotification, minutes: number) => {
    addSnoozeReminder(notif.taskId || 'general', notif.title, notif.message, minutes);
    setSnoozeFeedback(`تم تأجيل التنبيه لمدة ${minutes} دقائق بنجاح!`);
    setTimeout(() => setSnoozeFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                مركز التنبيهات والإشعارات الذكية
              </h3>
              <p className="text-[11px] text-slate-400">إنجاز V2 • جدولة دقيقة وتحكم كامل بالصوت</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-6 pt-2 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            سجل التنبيهات ({notifications.length})
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'upcoming'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <AlarmClock className="w-3.5 h-3.5" />
            <span>المجدولة القادمة ({upcomingReminders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            إعدادات التنبيهات والصوت
          </button>
        </div>

        {snoozeFeedback && (
          <div className="bg-emerald-500 text-white text-xs font-bold px-4 py-2 text-center animate-in fade-in">
            {snoozeFeedback}
          </div>
        )}

        {/* Body based on activeTab */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs">
          
          {/* TAB 1: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  الإشعارات المستلمة
                </span>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <>
                      <button
                        onClick={onMarkAllRead}
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>تحديد الكل كمقروء</span>
                      </button>
                      <button
                        onClick={onClearNotifications}
                        className="text-xs text-rose-500 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>مسح السجل</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <Bell className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <p className="font-semibold text-xs">لا توجد إشعارات جديدة حالياً</p>
                  <p className="text-[11px] text-slate-400">ستصلك التنبيهات بدقة عند حلول مواعيد مهامك المحددة.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        notif.read
                          ? 'bg-white dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 opacity-80'
                          : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                            {notif.title}
                          </span>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {formatTimeArabic(new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }))}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Snooze actions for reminder notifications */}
                      {notif.type === 'reminder' && (
                        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-200/40 dark:border-slate-700/40">
                          <span className="text-[10px] text-slate-400 font-bold ml-1">تأجيل (غفوة):</span>
                          <button
                            onClick={() => handleSnooze(notif, 5)}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-100 dark:hover:bg-emerald-950 hover:text-emerald-700 text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            5 دقائق
                          </button>
                          <button
                            onClick={() => handleSnooze(notif, 10)}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-100 dark:hover:bg-emerald-950 hover:text-emerald-700 text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            10 دقائق
                          </button>
                          <button
                            onClick={() => handleSnooze(notif, 30)}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-100 dark:hover:bg-emerald-950 hover:text-emerald-700 text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            30 دقيقة
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPCOMING SCHEDULED ALARMS */}
          {activeTab === 'upcoming' && (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlarmClock className="w-4 h-4 text-amber-600" />
                  <span>جدول التنبيهات التلقائية المبرمجة بدقة</span>
                </div>
                <p>
                  يتم إطلاق كل تنبيه بالضبط عند حلول التوقيت المحدد دون أي تكرار عشوائي.
                </p>
              </div>

              {upcomingReminders.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-bold text-xs">لا توجد مهام قادمة مفعلة التنبيه</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    عند تفعيل التنبيه لأي مهمة مع وقت محدد، ستظهر هنا في جدول المواعيد القادمة.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {upcomingReminders.map(({ task, triggerFormattedTime, isToday, diffMinutes, leadMinutes }, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {task.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <span>موعد المهمة: {formatArabicDate(task.dueDate)} {task.dueTime ? formatTimeArabic(task.dueTime) : ''}</span>
                          {leadMinutes > 0 && (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">(قبل {leadMinutes} د)</span>
                          )}
                        </div>
                      </div>

                      <div className="text-left shrink-0">
                        <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {triggerFormattedTime}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {isToday ? `اليوم (بعد ${diffMinutes} دقيقة)` : 'خلال الأيام القادمة'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SETTINGS & SOUND PROFILES */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Permission Banner */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      إشعارات المتصفح المنبثقة
                    </span>
                  </div>
                  <span className={`font-bold px-2 py-0.5 rounded-md ${
                    permissionStatus === 'granted'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  }`}>
                    {permissionStatus === 'granted' ? 'مفعلة ✓' : 'غير مفعلة'}
                  </span>
                </div>

                {permissionStatus !== 'granted' && (
                  <button
                    onClick={handleRequestPermission}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer text-center text-xs"
                  >
                    طلب إذن إشعارات المتصفح الآن
                  </button>
                )}
              </div>

              {/* Sound Theme & Volume */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      نغمة التنبيه ومستوى الصوت
                    </span>
                  </div>
                  <button
                    onClick={handleTestSound}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>تجربة النغمة 🔔</span>
                  </button>
                </div>

                {/* Tone Select */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    اختر نغمة التنبيه الصوتية:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'crystal', label: '💎 كريستال ناعمة' },
                      { id: 'warm_chime', label: '🔔 رنين دافئ' },
                      { id: 'success_fanfare', label: '🎺 نغمة إنجاز تصاعدية' },
                      { id: 'zen_pulse', label: '🧘 نبضة هدوء وتأمل' },
                    ].map(tone => (
                      <button
                        key={tone.id}
                        type="button"
                        onClick={() => handleSaveBriefing({ soundTheme: tone.id as SoundTheme })}
                        className={`p-2.5 rounded-xl text-xs font-bold text-right transition-all cursor-pointer border ${
                          (briefing.soundTheme || 'crystal') === tone.id
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {tone.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Volume Slider */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    <span>مستوى صوت التنبيه</span>
                    <span>{Math.round((briefing.soundVolume ?? 0.7) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={briefing.soundVolume ?? 0.7}
                    onChange={(e) => handleSaveBriefing({ soundVolume: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Quiet Hours (ساعات عدم الإزعاج) */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-indigo-500" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        ساعات الهدوء وعدم الإزعاج
                      </span>
                      <span className="text-[10px] text-slate-400">
                        كتم النغمات الصوتية أثناء فترات النوم أو الراحة
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={briefing.quietHoursEnabled || false}
                    onChange={(e) => handleSaveBriefing({ quietHoursEnabled: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                {briefing.quietHoursEnabled && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        تبدأ من الساعة:
                      </label>
                      <input
                        type="time"
                        value={briefing.quietHoursStart || '22:00'}
                        onChange={(e) => handleSaveBriefing({ quietHoursStart: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        تنتهي في الساعة:
                      </label>
                      <input
                        type="time"
                        value={briefing.quietHoursEnd || '07:00'}
                        onChange={(e) => handleSaveBriefing({ quietHoursEnd: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Daily Briefing Configuration */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        الموجز الصباحي اليومي التلقائي
                      </span>
                      <span className="text-[10px] text-slate-400">
                        تقرير يومي مرة واحدة فقط في توقيت الصباح المحدد
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={briefing.enabled}
                    onChange={(e) => handleSaveBriefing({ enabled: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                {briefing.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        وقت التنبيه الصباحي
                      </label>
                      <input
                        type="time"
                        value={briefing.time}
                        onChange={(e) => handleSaveBriefing({ time: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="highOnly"
                          checked={briefing.notifyHighPriorityOnly}
                          onChange={(e) => handleSaveBriefing({ notifyHighPriorityOnly: e.target.checked })}
                          className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <label htmlFor="highOnly" className="text-[11px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                          المهام العالية فقط
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={handleTestBriefing}
                        className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                      >
                        تجربة الموجز الآن ↗
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

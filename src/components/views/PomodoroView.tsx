import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Flame, 
  Sparkles, 
  Coffee, 
  Brain, 
  Clock, 
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task } from '../../types';
import { playNotificationSound, sendBrowserNotification } from '../../utils/notificationService';
import { FocusAudio } from '../../utils/focusSoundService';

interface PomodoroViewProps {
  tasks: Task[];
  onIncrementTaskPomodoro?: (taskId: string) => void;
  onToggleTaskComplete?: (taskId: string) => void;
  initialTaskId?: string;
}

type TimerMode = 'pomodoro' | 'deep' | 'short_break' | 'long_break';

const MODE_CONFIG: Record<TimerMode, { label: string; duration: number; icon: React.FC<{ className?: string }>; color: string }> = {
  pomodoro: { label: 'بومودورو (25د)', duration: 25 * 60, icon: Brain, color: 'text-rose-500' },
  deep: { label: 'تركيز عميق (50د)', duration: 50 * 60, icon: Sparkles, color: 'text-indigo-500' },
  short_break: { label: 'استراحة قصيرة (5د)', duration: 5 * 60, icon: Coffee, color: 'text-emerald-500' },
  long_break: { label: 'استراحة طويلة (15د)', duration: 15 * 60, icon: Clock, color: 'text-sky-500' },
};

export const PomodoroView: React.FC<PomodoroViewProps> = ({
  tasks,
  onIncrementTaskPomodoro,
  onToggleTaskComplete,
  initialTaskId,
}) => {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_CONFIG.pomodoro.duration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(initialTaskId || '');
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'waves' | 'pink_noise' | 'stream'>('none');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.5);
  const [completedSessionsToday, setCompletedSessionsToday] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('injaz_pomodoro_sessions_today');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const totalDuration = MODE_CONFIG[mode].duration;
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;
  const activeTask = tasks.find(t => t.id === selectedTaskId);

  // Sync ambient sound
  useEffect(() => {
    if (isRunning && ambientSound !== 'none') {
      FocusAudio.play(ambientSound, ambientVolume);
    } else {
      FocusAudio.stop();
    }
    return () => {
      FocusAudio.stop();
    };
  }, [isRunning, ambientSound]);

  useEffect(() => {
    FocusAudio.setVolume(ambientVolume);
  }, [ambientVolume]);

  // Main countdown timer interval
  useEffect(() => {
    let timer: number | null = null;
    if (isRunning && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft <= 0) {
      // Completed!
      handleSessionCompleted();
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft]);

  const handleSessionCompleted = () => {
    setIsRunning(false);
    FocusAudio.stop();

    const isWorkMode = mode === 'pomodoro' || mode === 'deep';

    if (isWorkMode) {
      // Confetti & Celebration
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899']
      });

      playNotificationSound('success_fanfare', 0.85);

      const updatedCount = completedSessionsToday + 1;
      setCompletedSessionsToday(updatedCount);
      localStorage.setItem('injaz_pomodoro_sessions_today', updatedCount.toString());

      if (selectedTaskId && onIncrementTaskPomodoro) {
        onIncrementTaskPomodoro(selectedTaskId);
      }

      sendBrowserNotification('🎉 أحسنت! اكتملت جلسة التركيز', {
        body: activeTask ? `أنجزت جلسة بومودورو لمهمة: "${activeTask.title}". خذ استراحة مستحقة!` : 'جلسة تركيز رائعة! خذ استراحة قصيرة لتجديد نشاطك.',
      });

      // Switch to short break
      setMode('short_break');
      setTimeLeft(MODE_CONFIG.short_break.duration);
    } else {
      playNotificationSound('crystal', 0.8);
      sendBrowserNotification('🔔 انتهت الاستراحة!', {
        body: 'هل أنت جاهز لبدء جلسة تركيز جديدة ومواصلة الإنجاز؟',
      });
      setMode('pomodoro');
      setTimeLeft(MODE_CONFIG.pomodoro.duration);
    }
  };

  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_CONFIG[newMode].duration);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(MODE_CONFIG[mode].duration);
  };

  const handleSkip = () => {
    handleSessionCompleted();
  };

  const formatTimerDigits = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Circular SVG ring constants
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold">
              <Brain className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">إنجاز V2 • بيئة التركيز العميق</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            مؤقت بومودورو والتركيز
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            قسّم وقتك إلى جلسات عمل مركزة واستراحات منتظمة لمضاعفة الإنتاجية.
          </p>
        </div>

        {/* Sessions Streak Metric */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-2xl shadow-xs self-start">
          <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
          <div>
            <div className="text-[10px] text-slate-400 font-medium">جلسات اليوم</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">
              {completedSessionsToday} <span className="text-xs font-normal text-slate-400">جلسات</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Focus Card */}
      <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-8 text-center relative overflow-hidden">
        
        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {(Object.keys(MODE_CONFIG) as TimerMode[]).map((key) => {
            const config = MODE_CONFIG[key];
            const Icon = config.icon;
            const isSelected = mode === key;

            return (
              <button
                key={key}
                onClick={() => handleModeChange(key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md shadow-slate-900/10'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? '' : config.color}`} />
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>

        {/* Linked Task Selector */}
        <div className="max-w-md mx-auto">
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 text-right">
            المهمة المرتبطة بجلسة التركيز الحالية:
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="">(جلسة تركيز عامة بدون ربط مهمة)</option>
            {tasks.filter(t => !t.completed).map(task => (
              <option key={task.id} value={task.id}>
                {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'} {task.title}
              </option>
            ))}
          </select>

          {activeTask && (
            <div className="mt-2 flex items-center justify-between text-xs px-2 text-slate-500 dark:text-slate-400">
              <span>الجلسات المكتملة لهذه المهمة: <strong className="text-emerald-600 dark:text-emerald-400">{activeTask.pomodorosCompleted || 0}</strong></span>
              {onToggleTaskComplete && (
                <button
                  onClick={() => onToggleTaskComplete(activeTask.id)}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>إكمال المهمة الآن</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Circular Progress & Large Timer Display */}
        <div className="relative flex items-center justify-center py-4">
          <svg className="w-64 h-64 sm:w-72 sm:h-72 transform -rotate-90">
            {/* Background circle track */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="12"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Animated progress circle */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              className={`transition-all duration-1000 ease-linear ${
                mode === 'short_break' || mode === 'long_break' 
                  ? 'text-teal-500' 
                  : 'text-rose-500'
              }`}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Center Digital Timer */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums font-mono">
              {formatTimerDigits(timeLeft)}
            </span>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-2">
              {isRunning ? 'جلسة جارية...' : 'في وضع الانتظار'}
            </span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleReset}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
            title="إعادة ضبط المؤقت"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-8 py-4 rounded-2xl text-white font-extrabold text-base shadow-xl flex items-center gap-3 transition-all transform active:scale-95 cursor-pointer ${
              isRunning 
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30' 
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-6 h-6 fill-white" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-white" />
                <span>بدء التركيز</span>
              </>
            )}
          </button>

          <button
            onClick={handleSkip}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
            title="إنهاء واحتساب الجلسة فوراً"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Ambient Sound Player (Synthesized Offline) */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-right">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                مؤثرات صوتية محيطية للتركيز (بدون إنترنت):
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'none', label: 'صامت' },
                { id: 'rain', label: '🌧️ مطر هادئ' },
                { id: 'waves', label: '🌊 أمواج بحر' },
                { id: 'pink_noise', label: '📻 ضوضاء وردية' },
                { id: 'stream', label: '💧 خرير ماء' },
              ].map(sound => (
                <button
                  key={sound.id}
                  onClick={() => setAmbientSound(sound.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    ambientSound === sound.id
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {sound.label}
                </button>
              ))}
            </div>
          </div>

          {ambientSound !== 'none' && (
            <div className="flex items-center gap-3 mt-3 max-w-xs mr-auto">
              <span className="text-[11px] text-slate-400">مستوى الصوت:</span>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={ambientVolume}
                onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

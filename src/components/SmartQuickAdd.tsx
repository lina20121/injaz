import React, { useState } from 'react';
import { 
  Plus, 
  Sparkles, 
  Calendar as CalendarIcon, 
  Flag, 
  FolderKanban, 
  Layers, 
  ChevronDown,
  Check,
  Zap,
  Mic,
  Radio,
  AlertCircle,
  X
} from 'lucide-react';
import { Priority, Category, Task } from '../types';
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from '../utils/constants';
import { getTodayStr } from '../utils/dateUtils';
import { useSpeechRecognition } from '../utils/useSpeechRecognition';

interface SmartQuickAddProps {
  onAddTask: (taskData: Partial<Task>) => void;
  onOpenFullModal?: () => void;
}

interface TemplatePreset {
  title: string;
  category: Category;
  priority: Priority;
  subtasks: string[];
  description: string;
}

const TEMPLATES: Record<string, TemplatePreset> = {
  project_launch: {
    title: 'إطلاق ميزة تقنية جديدة 🚀',
    category: 'projects',
    priority: 'high',
    description: 'خطة إطلاق وتدشين التحديث الجديد مع الفريق.',
    subtasks: ['مراجعة الكود النهائي', 'اختبار تجربة المستخدم والجوال', 'إعداد دليل التحديثات', 'نشر الإطلاق الرسمي'],
  },
  weekly_planning: {
    title: 'التخطيط الأسبوعي ومراجعة الأهداف 💼',
    category: 'work',
    priority: 'high',
    description: 'تحديد أولويات الـ 5 أيام القادمة وتنسيق المواعيد.',
    subtasks: ['تدقيق التقويم والمواعيد', 'فرز المهام العاجلة والهامة', 'تفويض المهام الممكنة', 'تحديد الهدف الأسبوعي الرئيسي'],
  },
  deep_study: {
    title: 'جلسة مذاكرة وتطوير مهارات 📚',
    category: 'study',
    priority: 'medium',
    description: 'جلسة قراءة وتركيز عميق مع تدوين الملاحظات.',
    subtasks: ['قراءة فصلين من المرجع', 'تدوين 5 نقاط جوهرية', 'حل تمرين عملي تطبيقي'],
  },
  morning_routine: {
    title: 'روتين الصباح الصحي والنشاط 🌿',
    category: 'health',
    priority: 'medium',
    description: 'بداية يوم مفعم بالطاقة والحيوية.',
    subtasks: ['شرب كأسين ماء دافئ', 'تمارين إطالة وتنفس 10 دقائق', 'فطور صحي متوازن', 'قراءة الأوراد والورد اليومي'],
  },
  financial_review: {
    title: 'تدقيق الميزانية وسداد المستحقات 💰',
    category: 'finance',
    priority: 'high',
    description: 'مراجعة الحسابات المصرفية وفواتير الخدمات الشهرية.',
    subtasks: ['سداد فاتورة الكهرباء والإنترنت', 'تحويل جزء للادخار والاستثمار', 'تسجيل نفقات الأسبوع'],
  },
};

export const SmartQuickAdd: React.FC<SmartQuickAddProps> = ({
  onAddTask,
  onOpenFullModal,
}) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('work');
  const [dateChoice, setDateChoice] = useState<'today' | 'tomorrow' | 'none'>('today');
  const [showTemplates, setShowTemplates] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Speech Recognition for Quick Add
  const {
    isSupported: isSpeechSupported,
    isListening,
    interimText,
    errorMessage: speechError,
    isPermissionDenied,
    requestPermission,
    clearError: clearSpeechError,
    startListening,
    stopListening,
  } = useSpeechRecognition({ lang: 'ar-SA' });

  const handleToggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      setIsExpanded(true);
      startListening('title', (finalSegment) => {
        if (finalSegment) {
          setTitle((prev) => (prev.trim() ? `${prev.trim()} ${finalSegment.trim()}` : finalSegment.trim()));
        }
      });
    }
  };

  const getComputedDueDate = (): string => {
    const today = new Date();
    if (dateChoice === 'today') {
      return getTodayStr();
    } else if (dateChoice === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    return getTodayStr();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isListening) {
      stopListening();
    }

    onAddTask({
      title: title.trim(),
      priority,
      category,
      dueDate: getComputedDueDate(),
      dueTime: '12:00',
      reminderEnabled: true,
      reminderMinutesBefore: 15,
      subtasks: [],
    });

    setTitle('');
  };

  const handleApplyTemplate = (key: keyof typeof TEMPLATES) => {
    const tpl = TEMPLATES[key];
    onAddTask({
      title: tpl.title,
      description: tpl.description,
      category: tpl.category,
      priority: tpl.priority,
      dueDate: getTodayStr(),
      dueTime: '11:00',
      reminderEnabled: true,
      reminderMinutesBefore: 30,
      subtasks: tpl.subtasks.map((st, idx) => ({
        id: `st-tpl-${Date.now()}-${idx}`,
        title: st,
        completed: false,
      })),
    });
    setShowTemplates(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-3.5 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-md">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Input Bar & Primary CTA */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder={isListening ? "🎙️ جارِ الاستماع إلى صوتك الآن..." : "⚡ إضافة مهمة سريعة أو اضغط المايكروفون للإملاء..."}
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden font-medium transition-all ${
                isListening
                  ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30 dark:bg-rose-950/20'
                  : 'border-slate-200 dark:border-slate-700/80 focus:ring-2 focus:ring-emerald-500'
              }`}
            />
            {/* Quick Mic Icon inside input */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`absolute left-2.5 p-1.5 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-sm shadow-rose-500/40'
                  : 'text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-slate-700'
              }`}
              title={
                !isSpeechSupported
                  ? 'التعرف الصوتي غير مدعوم في هذا المتصفح'
                  : isListening
                  ? 'اضغط لإيقاف الإملاء الصوتي'
                  : 'إملاء المهمة صوتياً بالمايكروفون'
              }
            >
              {isListening ? (
                <Radio className="w-4 h-4 animate-spin" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={!title.trim()}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">إضافة</span>
          </button>

          {/* Templates Trigger */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              title="قوالب مهام جاهزة"
            >
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold hidden md:inline">قوالب جاهزة</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Templates Popover */}
            {showTemplates && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowTemplates(false)} 
                />
                <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 z-40 text-xs animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <span>قوالب مهام مقترحة</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">بنقرة واحدة</span>
                  </div>
                  <div className="space-y-1 mt-1 max-h-60 overflow-y-auto">
                    {Object.entries(TEMPLATES).map(([key, tpl]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleApplyTemplate(key)}
                        className="w-full text-right p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer group"
                      >
                        <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600">
                          {tpl.title}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                          {tpl.subtasks.length} مهام فرعية • {CATEGORY_CONFIG[tpl.category]?.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Live Listening Indicator */}
        {isListening && (
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="truncate font-medium">
                {interimText ? `"${interimText}"` : 'تحدث الآن لإملاء عنوان المهمة...'}
              </span>
            </div>
            <button
              type="button"
              onClick={stopListening}
              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[11px] font-bold shrink-0 transition-colors"
            >
              إيقاف
            </button>
          </div>
        )}

        {/* Speech Recognition Error Banner */}
        {speechError && (
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex flex-col gap-1.5 animate-in fade-in">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{speechError}</span>
              </div>
              <button
                type="button"
                onClick={clearSpeechError}
                className="text-amber-600 hover:text-amber-800 dark:text-amber-400 p-0.5 rounded-lg shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {isPermissionDenied && (
              <div className="flex items-center gap-2 pt-1 border-t border-amber-200/60 dark:border-amber-800/60">
                <button
                  type="button"
                  onClick={async () => {
                    const granted = await requestPermission();
                    if (granted) clearSpeechError();
                  }}
                  className="px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold transition-colors cursor-pointer"
                >
                  طلب الإذن مجدداً
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Attribute Chips (Shows when focused or expanded) */}
        {(isExpanded || title.length > 0) && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs animate-in fade-in">
            {/* Due Date Chips */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400 font-bold ml-1">الموعد:</span>
              <button
                type="button"
                onClick={() => setDateChoice('today')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  dateChoice === 'today'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                اليوم
              </button>
              <button
                type="button"
                onClick={() => setDateChoice('tomorrow')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  dateChoice === 'tomorrow'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                غداً
              </button>
            </div>

            {/* Priority Chips */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400 font-bold ml-1">الأولوية:</span>
              {(['high', 'medium', 'low'] as Priority[]).map((p) => {
                const meta = PRIORITY_CONFIG[p];
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      priority === p
                        ? `${meta.badgeBg} ${meta.badgeText} ring-2 ring-emerald-500`
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>

            {/* Category Select */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400 font-bold ml-1">التصنيف:</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold focus:outline-hidden"
              >
                {Object.entries(CATEGORY_CONFIG).map(([catKey, catMeta]) => (
                  <option key={catKey} value={catKey}>
                    {catMeta.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Open Detailed Modal Option */}
            {onOpenFullModal && (
              <button
                type="button"
                onClick={onOpenFullModal}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold mr-auto cursor-pointer"
              >
                خيارات وتفاصيل إضافية ↗
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

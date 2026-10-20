import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Clock, 
  Calendar as CalendarIcon, 
  Repeat, 
  Bell, 
  Plus, 
  Trash2, 
  Tag, 
  Target, 
  Layers,
  Mic,
  MicOff,
  AlertCircle,
  Radio,
  Sparkles
} from 'lucide-react';
import { Task, Priority, Category, RecurrenceType, Goal, Subtask } from '../../types';
import { PRIORITY_CONFIG, CATEGORY_CONFIG, RECURRENCE_LABELS, REMINDER_MINUTES_OPTIONS } from '../../utils/constants';
import { getTodayStr } from '../../utils/dateUtils';
import { useSpeechRecognition } from '../../utils/useSpeechRecognition';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  taskToEdit?: Task | null;
  defaultDate?: string;
  goals: Goal[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  taskToEdit,
  defaultDate,
  goals,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('work');
  const [dueDate, setDueDate] = useState(defaultDate || getTodayStr());
  const [dueTime, setDueTime] = useState('12:00');
  const [hasTime, setHasTime] = useState(true);
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number>(30);
  const [goalId, setGoalId] = useState<string>('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Speech Recognition (Voice-to-Text)
  const {
    isSupported: isSpeechSupported,
    isListening,
    activeTarget,
    interimText,
    errorMessage: speechError,
    isPermissionDenied,
    selectedLang,
    setSelectedLang,
    startListening,
    stopListening,
    requestPermission,
    clearError: clearSpeechError,
  } = useSpeechRecognition({ lang: 'ar-SA' });

  // Stop listening when modal closes or unmounts
  useEffect(() => {
    if (!isOpen) {
      stopListening();
    }
  }, [isOpen, stopListening]);

  const handleClose = () => {
    stopListening();
    onClose();
  };

  const handleToggleVoice = (target: 'title' | 'description') => {
    if (isListening && activeTarget === target) {
      stopListening();
    } else {
      if (target === 'title') {
        startListening('title', (finalSegment) => {
          if (finalSegment) {
            setTitle((prev) => (prev.trim() ? `${prev.trim()} ${finalSegment.trim()}` : finalSegment.trim()));
          }
        });
      } else {
        startListening('description', (finalSegment) => {
          if (finalSegment) {
            setDescription((prev) => (prev.trim() ? `${prev.trim()} ${finalSegment.trim()}` : finalSegment.trim()));
          }
        });
      }
    }
  };

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority);
      setCategory(taskToEdit.category);
      setDueDate(taskToEdit.dueDate || getTodayStr());
      setDueTime(taskToEdit.dueTime || '12:00');
      setHasTime(Boolean(taskToEdit.dueTime));
      setRecurrence(taskToEdit.recurrence || 'none');
      setReminderEnabled(taskToEdit.reminderEnabled ?? true);
      setReminderMinutesBefore(taskToEdit.reminderMinutesBefore ?? 30);
      setGoalId(taskToEdit.goalId || '');
      setSubtasks(taskToEdit.subtasks || []);
      setTagsInput(taskToEdit.tags?.join('، ') || '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('work');
      setDueDate(defaultDate || getTodayStr());
      setDueTime('12:00');
      setHasTime(true);
      setRecurrence('none');
      setReminderEnabled(true);
      setReminderMinutesBefore(30);
      setGoalId('');
      setSubtasks([]);
      setTagsInput('');
    }
  }, [taskToEdit, defaultDate, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, title: newSubtaskTitle.trim(), completed: false },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tagsInput
      .split(/[,،]/)
      .map(t => t.trim())
      .filter(Boolean);

    onSave({
      ...(taskToEdit ? { id: taskToEdit.id } : {}),
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      dueDate,
      dueTime: hasTime ? dueTime : undefined,
      recurrence,
      reminderEnabled,
      reminderMinutesBefore: reminderEnabled ? reminderMinutesBefore : 0,
      goalId: goalId || undefined,
      subtasks,
      tags: parsedTags,
    });
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              {taskToEdit ? '✎' : '+'}
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight">
                {taskToEdit ? 'تعديل المهمة' : 'إنشاء مهمة جديدة'}
              </h3>
              <p className="text-[11px] text-slate-400">
                يمكنك كتابة التفاصيل أو إملاءها صوتياً بالضغط على أيقونة المايكروفون 🎙️
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Speech Error Alert */}
          {speechError && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex flex-col gap-2 animate-in fade-in">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{speechError}</span>
                </div>
                <button
                  type="button"
                  onClick={clearSpeechError}
                  className="text-amber-600 hover:text-amber-800 dark:text-amber-400 p-0.5 rounded-lg shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isPermissionDenied && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200/70 dark:border-amber-800/70 text-[11px]">
                  <button
                    type="button"
                    onClick={async () => {
                      const granted = await requestPermission();
                      if (granted) {
                        clearSpeechError();
                      }
                    }}
                    className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>طلب تفعيل المايكروفون</span>
                  </button>
                  <span className="text-amber-700 dark:text-amber-300">
                    أو يمكنك كتابة تفاصيل المهمة يدوياً مباشرة.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Title with Voice Dictation Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                عنوان المهمة <span className="text-rose-500">*</span>
              </label>
              
              <div className="flex items-center gap-1.5">
                {/* Language Switcher */}
                {isSpeechSupported && (
                  <button
                    type="button"
                    onClick={() => setSelectedLang(selectedLang === 'ar-SA' ? 'en-US' : 'ar-SA')}
                    className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="تبديل لغة التعرف على الصوت"
                  >
                    {selectedLang === 'ar-SA' ? '🇸🇦 عربي' : '🇬🇧 EN'}
                  </button>
                )}

                {/* Voice Dictation Button for Title */}
                <button
                  type="button"
                  onClick={() => handleToggleVoice('title')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isListening && activeTarget === 'title'
                      ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                      : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                  }`}
                  title={
                    !isSpeechSupported
                      ? 'خاصية التعرف الصوتي تتطلب متصفحاً مثل Chrome أو Safari'
                      : isListening && activeTarget === 'title'
                      ? 'اضغط للإيقاف'
                      : 'اضغط للإملاء الصوتي لعنوان المهمة'
                  }
                >
                  {isListening && activeTarget === 'title' ? (
                    <>
                      <Radio className="w-3.5 h-3.5 animate-spin" />
                      <span>جارِ الاستماع...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span>إملاء صوتي</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: تسليم التقرير السنوي للإدارة..."
                className={`w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white focus:outline-hidden font-medium transition-all ${
                  isListening && activeTarget === 'title'
                    ? 'border-rose-500 ring-2 ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500'
                }`}
                autoFocus
              />
            </div>

            {/* Live Dictation Status & Transcript for Title */}
            {isListening && activeTarget === 'title' && (
              <div className="mt-1.5 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="flex h-2 w-2 relative shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <span className="truncate font-medium">
                    {interimText ? `"${interimText}"` : 'تحدث الآن، صوتك يتحول تلقائياً إلى نص...'}
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
          </div>

          {/* Description with Voice Dictation Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                تفاصيل وملاحظات (اختياري)
              </label>
              
              {/* Voice Dictation Button for Description */}
              <button
                type="button"
                onClick={() => handleToggleVoice('description')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isListening && activeTarget === 'description'
                    ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title={
                  !isSpeechSupported
                    ? 'خاصية التعرف الصوتي تتطلب متصفحاً مثل Chrome أو Safari'
                    : isListening && activeTarget === 'description'
                    ? 'اضغط للإيقاف'
                    : 'اضغط للإملاء الصوتي لتفاصيل المهمة'
                }
              >
                {isListening && activeTarget === 'description' ? (
                  <>
                    <Radio className="w-3.5 h-3.5 animate-spin" />
                    <span>جارِ الاستماع...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>إملاء صوتي</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="أضف تفاصيل إضافية أو روابط مرجعية..."
              className={`w-full px-4 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white focus:outline-hidden resize-none transition-all ${
                isListening && activeTarget === 'description'
                  ? 'border-rose-500 ring-2 ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500'
              }`}
            />

            {/* Live Dictation Status & Transcript for Description */}
            {isListening && activeTarget === 'description' && (
              <div className="mt-1.5 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="flex h-2 w-2 relative shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <span className="truncate font-medium">
                    {interimText ? `"${interimText}"` : 'تحدث الآن، أملِ التفاصيل والملاحظات...'}
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
          </div>

          {/* Priority Level Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              مستوى الأولوية <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['high', 'medium', 'low'] as const).map((p) => {
                const meta = PRIORITY_CONFIG[p];
                const isSelected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? `${meta.badgeBg} ${meta.badgeText} ${meta.border} ring-2 ring-emerald-500/20 shadow-xs`
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.dotColor }} />
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              التصنيف والمجال
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
            >
              {(Object.keys(CATEGORY_CONFIG) as Category[]).map((catKey) => (
                <option key={catKey} value={catKey}>
                  {CATEGORY_CONFIG[catKey].label}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                تاريخ الاستحقاق
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  وقت محدد
                </label>
                <input
                  type="checkbox"
                  checked={hasTime}
                  onChange={(e) => setHasTime(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>
              <input
                type="time"
                disabled={!hasTime}
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 disabled:opacity-40"
              />
            </div>
          </div>

          {/* Recurrence Pattern */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              تكرار المهمة تلقائياً
            </label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 font-semibold"
            >
              {(Object.keys(RECURRENCE_LABELS) as RecurrenceType[]).map((r) => (
                <option key={r} value={r}>
                  {RECURRENCE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>

          {/* Reminder Notifications */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <span>التنبيه والإشعار اليومي</span>
              </span>
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
            </div>

            {reminderEnabled && (
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  موعد إرسال التنبيه
                </label>
                <select
                  value={reminderMinutesBefore}
                  onChange={(e) => setReminderMinutesBefore(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                >
                  {REMINDER_MINUTES_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Subtasks Checklist Manager */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              قائمة المهام الفرعية (Checklist)
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask(e);
                  }
                }}
                placeholder="أضف خطوة فرعية واضغط Enter..."
                className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {subtasks.map((st) => (
                  <div key={st.id} className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80">
                    <span className="text-slate-800 dark:text-slate-200">{st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Goal Linker */}
          {goals.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                <span>ربط المهمة بهدف استراتيجي</span>
              </label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="">-- بدون ربط بهدف --</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              <span>الوسوم والكلمات المفتاحية (مفصولة بفاصلة)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="مثال: عاجل، مالية، عميل، مهم"
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          </div>

          {/* Footer Submit buttons */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
            {taskToEdit ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(taskToEdit.id);
                  handleClose();
                }}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="h-4 w-4" />
                <span>حذف المهمة</span>
              </button>
            ) : <span />}
            <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{taskToEdit ? 'حفظ التعديلات' : 'إنشاء المهمة'}</span>
            </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

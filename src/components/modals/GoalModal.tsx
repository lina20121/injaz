import React, { useState, useEffect } from 'react';
import { X, Check, Target, Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Goal, GoalMilestone, Category } from '../../types';
import { CATEGORY_CONFIG } from '../../utils/constants';
import { getTodayStr } from '../../utils/dateUtils';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Partial<Goal>) => void;
  goalToEdit?: Goal | null;
}

const COLOR_PRESETS = [
  '#0ea5e9', // Sky Blue
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  goalToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('projects');
  const [startDate, setStartDate] = useState(getTodayStr());
  const [targetDate, setTargetDate] = useState('');
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [targetValue, setTargetValue] = useState<number>(100);
  const [unit, setUnit] = useState('%');
  const [color, setColor] = useState('#0ea5e9');
  const [milestones, setMilestones] = useState<GoalMilestone[]>([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title);
      setDescription(goalToEdit.description || '');
      setCategory(goalToEdit.category);
      setStartDate(goalToEdit.startDate || getTodayStr());
      setTargetDate(goalToEdit.targetDate || '');
      setCurrentValue(goalToEdit.currentValue || 0);
      setTargetValue(goalToEdit.targetValue || 100);
      setUnit(goalToEdit.unit || '%');
      setColor(goalToEdit.color || '#0ea5e9');
      setMilestones(goalToEdit.milestones || []);
    } else {
      setTitle('');
      setDescription('');
      setCategory('projects');
      setStartDate(getTodayStr());
      // Default target date 30 days from now
      const d = new Date(Date.now() + 86400000 * 30);
      setTargetDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
      setCurrentValue(0);
      setTargetValue(100);
      setUnit('%');
      setColor('#0ea5e9');
      setMilestones([]);
    }
  }, [goalToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;
    setMilestones([
      ...milestones,
      {
        id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: newMilestoneTitle.trim(),
        completed: false,
      },
    ]);
    setNewMilestoneTitle('');
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetDate) return;

    onSave({
      ...(goalToEdit ? { id: goalToEdit.id } : {}),
      title: title.trim(),
      description: description.trim(),
      category,
      startDate,
      targetDate,
      currentValue: Number(currentValue) || 0,
      targetValue: Number(targetValue) || 1,
      unit: unit.trim() || '%',
      color,
      milestones,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              {goalToEdit ? 'تعديل الهدف' : 'صياغة هدف استراتيجي جديد'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Goal Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              عنوان الهدف <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: قراءة 10 كتب في تطوير الذات..."
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 font-medium"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              وصف ورؤية الهدف
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ما هي النتيجة المنشودة والقيمة المضافة لتحقيق هذا الهدف؟"
              className="w-full px-4 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              المجال والتصنيف
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

          {/* Target Value, Current Value & Unit */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                القيمة الحالية
              </label>
              <input
                type="number"
                min="0"
                value={currentValue}
                onChange={(e) => setCurrentValue(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 font-bold text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                القيمة المستهدفة
              </label>
              <input
                type="number"
                min="1"
                required
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 font-bold text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                وحدة القياس
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="%, كتب, صفحة..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 text-center font-bold"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                تاريخ البداية
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                الموعد النهائي لتحقيق الهدف <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Color Preset Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              لون تمييز الهدف
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-xl transition-all cursor-pointer ${
                    color === c ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Milestones Manager */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              المحطات الرئيسية (Milestones)
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMilestone(e);
                  }
                }}
                placeholder="أضف محطة رئيسية واضغط Enter..."
                className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddMilestone}
                className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {milestones.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {milestones.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80">
                    <span className="text-slate-800 dark:text-slate-200">{m.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(m.id)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
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
              <span>{goalToEdit ? 'حفظ التعديلات' : 'إنشاء الهدف'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

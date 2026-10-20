import React, { useState } from 'react';
import { 
  X, 
  FileDown, 
  Printer, 
  CheckCircle2, 
  Target, 
  Calendar as CalendarIcon, 
  Clock, 
  Activity,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Task, Goal } from '../../types';
import { exportElementToPdf } from '../../utils/pdfExport';
import { formatArabicDate, getTodayStr } from '../../utils/dateUtils';
import { PRIORITY_CONFIG, CATEGORY_CONFIG } from '../../utils/constants';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  goals: Goal[];
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  tasks,
  goals,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [includeCompleted, setIncludeCompleted] = useState(true);
  const [includeGoals, setIncludeGoals] = useState(true);

  if (!isOpen) return null;

  const filteredTasks = includeCompleted ? tasks : tasks.filter(t => !t.completed);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const highPriorityTasks = tasks.filter(t => !t.completed && t.priority === 'high');

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    const success = await exportElementToPdf('pdf-printable-report', `تقرير_إنجاز_الشامل_${getTodayStr()}.pdf`);
    setIsExporting(false);
    if (success) {
      onClose();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <FileDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                تصدير التقرير التنفيذي الشامل (PDF)
              </h3>
              <p className="text-xs text-slate-400">
                معاينة مباشرة للمستند الجاهز للطباعة والتنزيل
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer hidden sm:flex items-center gap-1 text-xs font-bold"
              title="طباعة التقرير"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Options Toolbar */}
        <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-2.5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-semibold">
              <input
                type="checkbox"
                checked={includeCompleted}
                onChange={(e) => setIncludeCompleted(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>تضمين المهام المكتملة</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-semibold">
              <input
                type="checkbox"
                checked={includeGoals}
                onChange={(e) => setIncludeGoals(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>تضمين قسم تتبع الأهداف</span>
            </label>
          </div>

          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-600/20"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري إعداد وتوليد الـ PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>تنزيل PDF فوري</span>
              </>
            )}
          </button>
        </div>

        {/* Printable Preview Area */}
        <div className="p-4 sm:p-6 max-h-[65vh] overflow-y-auto bg-slate-100 dark:bg-slate-950/40">
          
          {/* Actual Printable Page Element */}
          <div
            id="pdf-printable-report"
            className="bg-white text-slate-900 p-8 sm:p-10 rounded-2xl shadow-md max-w-3xl mx-auto space-y-6 font-['Cairo',sans-serif]"
            dir="rtl"
          >
            
            {/* Header Document */}
            <div className="flex items-start justify-between border-b-2 border-emerald-600 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-sm">
                  ✓
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    تقرير إنجاز التنفيذي
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    الملخص الشامل للمهام والأولويات وتتبع الأهداف
                  </p>
                </div>
              </div>

              <div className="text-left text-xs text-slate-500 space-y-0.5">
                <div><strong>تاريخ التقرير:</strong> {formatArabicDate(getTodayStr())}</div>
                <div><strong>حالة النظام:</strong> وضع غير متصل (محفوظ محلياً)</div>
              </div>
            </div>

            {/* KPI Summary Strip */}
            <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <div>
                <div className="text-xs text-slate-500 font-bold">إجمالي المهام</div>
                <div className="text-xl font-extrabold text-slate-900">{totalTasks}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-bold">قيد التنفيذ</div>
                <div className="text-xl font-extrabold text-blue-600">{pendingTasks}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-bold">أولوية عالية</div>
                <div className="text-xl font-extrabold text-rose-600">{highPriorityTasks.length}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-bold">نسبة الإنجاز</div>
                <div className="text-xl font-extrabold text-emerald-600">{completionRate}%</div>
              </div>
            </div>

            {/* Tasks Section Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>جدول المهام والأولويات ({filteredTasks.length})</span>
                </h3>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-2.5">المهمة</th>
                      <th className="p-2.5">الأولوية</th>
                      <th className="p-2.5">التصنيف</th>
                      <th className="p-2.5">تاريخ الاستحقاق</th>
                      <th className="p-2.5">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTasks.slice(0, 15).map((task) => (
                      <tr key={task.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-800">
                          {task.title}
                          {task.description && (
                            <p className="text-[10px] text-slate-500 font-normal mt-0.5 line-clamp-1">
                              {task.description}
                            </p>
                          )}
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            task.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                            task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {PRIORITY_CONFIG[task.priority].label}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-600">
                          {CATEGORY_CONFIG[task.category]?.label || 'عام'}
                        </td>
                        <td className="p-2.5 text-slate-600 font-medium">
                          {formatArabicDate(task.dueDate, false)}
                        </td>
                        <td className="p-2.5">
                          {task.completed ? (
                            <span className="text-emerald-600 font-bold">✓ مكتملة</span>
                          ) : (
                            <span className="text-slate-500">قيد المتابعة</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Goals Section */}
            {includeGoals && goals.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-emerald-600" />
                    <span>موقف الأهداف الاستراتيجية ({goals.length})</span>
                  </h3>
                </div>

                <div className="space-y-3">
                  {goals.map((goal) => {
                    const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) || 0;
                    return (
                      <div key={goal.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                        <div className="flex items-center justify-between mb-1.5">
                          <strong className="text-slate-900">{goal.title}</strong>
                          <span className="font-extrabold text-emerald-700">{pct}% ({goal.currentValue} / {goal.targetValue} {goal.unit})</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
                          <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        {goal.milestones.length > 0 && (
                          <div className="text-[11px] text-slate-500">
                            المحطات: {goal.milestones.filter(m => m.completed).length} من {goal.milestones.length} مكتملة
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
              تم إنشاء هذا التقرير تلقائياً بواسطة تطبيق «إنجاز» لتنظيم المهام والأهداف الذكي.
            </div>

          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            يمكنك حفظ الملف بصيغة PDF ومشاركته عبر البريد أو الواتساب
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              إغلاق
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>تنزيل التقرير بصيغة PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

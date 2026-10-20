import React from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Smartphone, 
  Laptop, 
  Globe 
} from 'lucide-react';
import { Task } from '../../types';
import { generateIcsContent, downloadIcsFile } from '../../utils/calendarSync';

interface CalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

export const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({
  isOpen,
  onClose,
  tasks,
}) => {
  if (!isOpen) return null;

  const handleDownloadAllIcs = () => {
    const ics = generateIcsContent(tasks, 'جميع مهام تطبيق إنجاز');
    downloadIcsFile('جدول_مهام_إنجاز_الكامل', ics);
  };

  const handleDownloadPendingIcs = () => {
    const pending = tasks.filter(t => !t.completed);
    const ics = generateIcsContent(pending, 'مهام إنجاز قيد التنفيذ');
    downloadIcsFile('مهام_إنجاز_قيد_التنفيذ', ics);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              مزامنة المهام مع التقويم الشخصي
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            يدعم تطبيق إنجاز صيغة التقويم القياسية العالمية (iCalendar .ics)، مما يمكنك من مزامنة واستيراد جميع مهامك وتنبيهاتها إلى تقويم Google، تقويم Apple (آيفون وماك)، وتطبيق Outlook بنقرة واحدة بدون إنترنت.
          </p>

          {/* Download ICS Options */}
          <div className="space-y-3">
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  تصدير ملف التقويم الشامل (.ics)
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  يشمل جميع المهام ({tasks.length} مهمة) مع الأولويات والتنبيهات المكررة
                </p>
              </div>
              <button
                onClick={handleDownloadAllIcs}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors flex items-center gap-1.5 shrink-0 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تنزيل الملف</span>
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  تصدير المهام النشطة فقط
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  يحتوي على المهام المتبقية ({tasks.filter(t => !t.completed).length} مهمة)
                </p>
              </div>
              <button
                onClick={handleDownloadPendingIcs}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تنزيل .ics</span>
              </button>
            </div>
          </div>

          {/* Quick Guide Steps */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              <span>كيفية الاستيراد إلى تطبيقات التقويم:</span>
            </h4>

            <div className="space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <Smartphone className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white">أجهزة آيفون وiPad (Apple Calendar):</strong>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    حمّل ملف الـ .ics وافتحه مباشرة، سيقترح النظام إضافته إلى تقويمك بنقرة زر واحدة.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <Laptop className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white">تقويم Google (Google Calendar):</strong>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    من إعدادات تقويم Google، اختر «استيراد وتصدير» ثم ارفع ملف .ics المنزّل. كما يمكنك إضافة أي مهمة مفردة مباشرة عبر زر خيارات المهمة.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs cursor-pointer shadow-xs"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};

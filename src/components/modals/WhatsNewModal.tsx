import React from 'react';
import { 
  X, 
  Sparkles, 
  BellRing, 
  Brain, 
  Kanban, 
  Zap, 
  Flame, 
  Check, 
  ArrowLeft,
  Mic
} from 'lucide-react';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExplorePomodoro?: () => void;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({
  isOpen,
  onClose,
  onExplorePomodoro,
}) => {
  if (!isOpen) return null;

  const features = [
    {
      icon: BellRing,
      color: 'text-amber-500 bg-amber-100 dark:bg-amber-950/60',
      title: 'إصلاح وضبط نظام التنبيهات المجدولة بالكامل',
      desc: 'تم حل مشكلة تكرار التنبيه كل دقيقة! التنبيهات الآن تنطلق بدقة بالثواني في موعدها المجدول فقط، مع خاصية الغفوة الذكية (5 أو 10 دقائق)، وساعات الهدوء الليلية.',
    },
    {
      icon: Brain,
      color: 'text-rose-500 bg-rose-100 dark:bg-rose-950/60',
      title: 'مؤقت بومودورو وبيئة التركيز العميق (Pomodoro)',
      desc: 'ضاعف تركيزك مع مؤقت بومودورو مدمج، يدعم فترات العمل والاستراحات، أصوات خلفية طبيعية هادئة (مطر، أمواج، ماء) تعمل 100% دون إنترنت، مع ربط الجلسات بالمهام.',
    },
    {
      icon: Kanban,
      color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-950/60',
      title: 'لوحة كانبان التفاعلية (Kanban Board)',
      desc: 'تتبع مراحل مهامك بصرياً عبر 3 أعمدة مرنة: قيد الانتظار ➔ قيد التنفيذ ➔ مكتملة، مع نقل فوري للمهام بين المراحل بنقرة زر واحدة.',
    },
    {
      icon: Zap,
      color: 'text-teal-500 bg-teal-100 dark:bg-teal-950/60',
      title: 'شريط الإضافة السريعة وقوالب المهام الجاهزة',
      desc: 'أضف مهامك في ثانية واحدة مع اختصارات التاريخ والأولويات، أو استخدم القوالب الجاهزة المسبقة (إطلاق مشروع، بداية أسبوع، جلسة مذاكرة، روتين صباحي).',
    },
    {
      icon: Mic,
      color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-950/60',
      title: 'الإملاء الصوتي الذكي للمهام (Voice-to-Text)',
      desc: 'أملِ عنوان المهمة وتفاصيلها بصوتك مباشرة بنقرة واحدة على أيقونة المايكروفون مع تحويل فوري ودقيق إلى نص باللغتين العربية والإنجليزية.',
    },
    {
      icon: Flame,
      color: 'text-orange-500 bg-orange-100 dark:bg-orange-950/60',
      title: 'سجل العادات وسلاسل الإنجاز المتواصلة (Streaks)',
      desc: 'حافظ على حماسك مع عداد الأيام المتتالية من الإنجاز، وسجل النشاط الأسبوعي لتعزيز الالتزام اليومي والإنتاجية العالية.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-6">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black tracking-wider uppercase">
                الإصدار الثاني V2.0
              </span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl sm:text-2xl font-black mt-3 relative z-10">
            أهلاً بك في إنجــــاز V2.0 🚀
          </h3>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 relative z-10 leading-relaxed">
            تحديث شامل صُمم ليمنحك تجربة تنظيم دقيقة وذكية وخالية من الإزعاج.
          </p>
        </div>

        {/* Feature List */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className={`p-2 rounded-xl shrink-0 ${feat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {feat.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          {onExplorePomodoro && (
            <button
              onClick={() => {
                onClose();
                onExplorePomodoro();
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Brain className="w-4 h-4 text-rose-500" />
              <span>تجربة مؤقت بومودورو</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all mr-auto cursor-pointer"
          >
            استكشاف التحديث الآن
          </button>
        </div>
      </div>
    </div>
  );
};

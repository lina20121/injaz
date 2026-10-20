import { Category, Priority, RecurrenceType, Task, Goal } from '../types';

export const PRIORITY_CONFIG: Record<Priority, {
  label: string;
  badgeBg: string;
  badgeText: string;
  border: string;
  dotColor: string;
  order: number;
}> = {
  high: {
    label: 'عالية',
    badgeBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    badgeText: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-300 dark:border-rose-800',
    dotColor: '#f43f5e',
    order: 3,
  },
  medium: {
    label: 'متوسطة',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    badgeText: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-300 dark:border-amber-800',
    dotColor: '#f59e0b',
    order: 2,
  },
  low: {
    label: 'منخفضة',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-300 dark:border-emerald-800',
    dotColor: '#10b981',
    order: 1,
  },
};

export const CATEGORY_CONFIG: Record<Category, {
  label: string;
  color: string;
  iconName: string;
  bgLight: string;
}> = {
  work: { label: 'العمل والمهام المهنية', color: '#3b82f6', iconName: 'Briefcase', bgLight: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' },
  personal: { label: 'شخصي وعام', color: '#8b5cf6', iconName: 'User', bgLight: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400' },
  study: { label: 'التعليم والدراسة', color: '#ec4899', iconName: 'GraduationCap', bgLight: 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400' },
  health: { label: 'الصحة والرياضة', color: '#10b981', iconName: 'Activity', bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
  finance: { label: 'المالية والاستثمار', color: '#f59e0b', iconName: 'Coins', bgLight: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
  projects: { label: 'مشاريع خاصة', color: '#06b6d4', iconName: 'FolderKanban', bgLight: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400' },
  family: { label: 'العائلة والمنزل', color: '#f97316', iconName: 'HeartHandshake', bgLight: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400' },
  other: { label: 'أخرى', color: '#64748b', iconName: 'Tag', bgLight: 'bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400' },
};

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  none: 'بدون تكرار',
  daily: 'يومياً',
  weekdays: 'أيام العمل (الأحد - الخميس)',
  weekly: 'أسبوعياً',
  monthly: 'شهرياً',
};

export const REMINDER_MINUTES_OPTIONS = [
  { value: 0, label: 'في موعد المهمة تماماً' },
  { value: 15, label: 'قبل 15 دقيقة' },
  { value: 30, label: 'قبل 30 دقيقة' },
  { value: 60, label: 'قبل ساعة واحدة' },
  { value: 120, label: 'قبل ساعتين' },
  { value: 1440, label: 'قبل يوم واحد' },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'مراجعة التقرير المالي للربع السنوي',
    description: 'تدقيق الأرقام النهائية وإعداد العرض التقديمي للاجتماع مع الإدارة التنفيذية.',
    priority: 'high',
    category: 'finance',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '11:00',
    completed: false,
    recurrence: 'none',
    reminderEnabled: true,
    reminderMinutesBefore: 30,
    subtasks: [
      { id: 'st-1', title: 'جمع الفواتير وكشوف الحساب', completed: true },
      { id: 'st-2', title: 'تحديث الجداول البيانية في الإكسل', completed: true },
      { id: 'st-3', title: 'صياغة التوصيات الاستراتيجية', completed: false },
    ],
    goalId: 'g-1',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    tags: ['مالية', 'تقارير', 'مهم'],
  },
  {
    id: 't-2',
    title: 'جلسة تدريب رياضية ولياقة بدنية',
    description: 'تمارين الكارديو ورفع الأثقال لمدة 45 دقيقة مع شرب 1.5 لتر ماء.',
    priority: 'medium',
    category: 'health',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '17:30',
    completed: false,
    recurrence: 'daily',
    reminderEnabled: true,
    reminderMinutesBefore: 15,
    subtasks: [
      { id: 'st-4', title: 'تمارين الإحماء 10 دقائق', completed: false },
      { id: 'st-5', title: 'تمارين المقاومة', completed: false },
    ],
    goalId: 'g-2',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    tags: ['صحة', 'رياضة'],
  },
  {
    id: 't-3',
    title: 'قراءة الفصل الثالث والرابع من كتاب القيادة',
    description: 'تلخيص أهم الأفكار وتدوين الملاحظات المفتاحية في دفتر الملاحظات الشخصي.',
    priority: 'low',
    category: 'study',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '21:00',
    completed: true,
    completedAt: new Date().toISOString(),
    recurrence: 'daily',
    reminderEnabled: false,
    reminderMinutesBefore: 0,
    subtasks: [
      { id: 'st-6', title: 'قراءة 25 صفحة', completed: true },
      { id: 'st-7', title: 'تدوين النقاط الجوهرية', completed: true },
    ],
    goalId: 'g-3',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    tags: ['قراءة', 'تطوير ذات'],
  },
  {
    id: 't-4',
    title: 'إطلاق النسخة التجريبية للمشروع الجديد',
    description: 'فحص واجهات الاستخدام واختبار الأداء ومشاركة الرابط مع فريق العمل للاختبار.',
    priority: 'high',
    category: 'projects',
    dueDate: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
    dueTime: '14:00',
    completed: false,
    recurrence: 'none',
    reminderEnabled: true,
    reminderMinutesBefore: 60,
    subtasks: [
      { id: 'st-8', title: 'مراجعة كود البرمجة', completed: true },
      { id: 'st-9', title: 'إجراء اختبار التوافقية على الجوال', completed: false },
      { id: 'st-10', title: 'إرسال بريد التدشين', completed: false },
    ],
    goalId: 'g-1',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    tags: ['تطوير', 'برمجة', 'إطلاق'],
  },
  {
    id: 't-5',
    title: 'تسديد فواتير الخدمات الشهرية',
    description: 'فاتورة الكهرباء والمياه والإنترنت عبر التطبيق البنكي.',
    priority: 'medium',
    category: 'finance',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    dueTime: '10:00',
    completed: false,
    recurrence: 'monthly',
    reminderEnabled: true,
    reminderMinutesBefore: 120,
    subtasks: [],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    tags: ['فواتير', 'دفع'],
  },
  {
    id: 't-6',
    title: 'جلسة عائلية وزيارة الوالدين',
    description: 'قضاء وقت مميز مع العائلة والأبناء في نهاية الأسبوع.',
    priority: 'medium',
    category: 'family',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    dueTime: '18:00',
    completed: false,
    recurrence: 'weekly',
    reminderEnabled: true,
    reminderMinutesBefore: 60,
    subtasks: [],
    createdAt: new Date().toISOString(),
    tags: ['عائلة', 'صلة رحم'],
  },
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'g-1',
    title: 'إنجاز المشروع التقني السنوي',
    description: 'تطوير وإطلاق المنصة الجديدة المتكاملة بمواصفات عالية الجودة وفي الوقت المحدد.',
    category: 'projects',
    startDate: new Date(Date.now() - 86400000 * 30).toISOString().split('T')[0],
    targetDate: new Date(Date.now() + 86400000 * 45).toISOString().split('T')[0],
    currentValue: 68,
    targetValue: 100,
    unit: '%',
    milestones: [
      { id: 'm-1', title: 'التخطيط وتحديد المتطلبات', completed: true, targetDate: '2026-07-15' },
      { id: 'm-2', title: 'تصميم واجهات المستخدم والتجربة', completed: true, targetDate: '2026-08-01' },
      { id: 'm-3', title: 'تطوير البنية التحتية والبرمجيات', completed: true, targetDate: '2026-08-20' },
      { id: 'm-4', title: 'الاختبارات الشاملة والأمان', completed: false, targetDate: '2026-09-10' },
      { id: 'm-5', title: 'الإطلاق الرسمي والتسويق', completed: false, targetDate: '2026-10-01' },
    ],
    color: '#0ea5e9',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'g-2',
    title: 'المحافظة على الصحة واللياقة البدنية',
    description: 'الوصول إلى 20 حصة تمرين شهرياً واتباع نظام غذائي متوازن وصحي.',
    category: 'health',
    startDate: new Date(Date.now() - 86400000 * 20).toISOString().split('T')[0],
    targetDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    currentValue: 14,
    targetValue: 20,
    unit: 'تمرين',
    milestones: [
      { id: 'm-6', title: 'الالتزام بأول 5 تمارين', completed: true },
      { id: 'm-7', title: 'إتمام 10 تمارين بدون انقطاع', completed: true },
      { id: 'm-8', title: 'الوصول إلى 15 تمرين', completed: false },
      { id: 'm-9', title: 'تحقيق الهدف الكامل 20 تمرين', completed: false },
    ],
    color: '#10b981',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'g-3',
    title: 'قراءة 12 كتاباً هذا العام',
    description: 'توسيع المدارك المعرفية في مجالات الإدارة والتقنية وتطوير الذات.',
    category: 'study',
    startDate: new Date(Date.now() - 86400000 * 60).toISOString().split('T')[0],
    targetDate: new Date(Date.now() + 86400000 * 120).toISOString().split('T')[0],
    currentValue: 7,
    targetValue: 12,
    unit: 'كتب',
    milestones: [
      { id: 'm-10', title: 'قراءة 3 كتب في الربع الأول', completed: true },
      { id: 'm-11', title: 'قراءة 6 كتب بحلول منتصف السنة', completed: true },
      { id: 'm-12', title: 'قراءة الكتاب التاسع', completed: false },
      { id: 'm-13', title: 'ختام التحدي وقراءة 12 كتاباً', completed: false },
    ],
    color: '#8b5cf6',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
];

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Bell, 
  Moon, 
  Sun, 
  Calendar as CalendarIcon, 
  FileDown, 
  Search,
  Plus,
  ArrowRightLeft,
  MoreVertical,
  Brain,
  Download
} from 'lucide-react';
import { formatArabicDate, getTodayStr } from '../utils/dateUtils';
import { AppNotification } from '../types';

interface NavbarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  onOpenCalendarSync: () => void;
  onOpenPdfExport: () => void;
  onOpenNewTask: () => void;
  onOpenDeviceSync?: () => void;
  onOpenPomodoro?: () => void;
  onOpenWhatsNew?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  notifications,
  onOpenNotifications,
  onOpenCalendarSync,
  onOpenPdfExport,
  onOpenNewTask,
  onOpenDeviceSync,
  onOpenPomodoro,
  onOpenWhatsNew,
  searchQuery,
  onSearchChange,
  isSearchOpen,
  setIsSearchOpen,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const todayFormatted = formatArabicDate(getTodayStr(), true);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Brand & Date (RTL) */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-extrabold text-base sm:text-xl text-slate-900 dark:text-white tracking-tight">
                  إنجــــاز
                </h1>
                <button
                  onClick={onOpenWhatsNew}
                  className="text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:scale-105 transition-transform cursor-pointer"
                  title="عرض تفاصيل الإصدار الثاني V2.0"
                >
                  V2.0 ✨
                </button>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
                {todayFormatted}
              </p>
            </div>
          </div>

          {/* Desktop Search bar */}
          <div className="flex-1 max-w-md mx-3 hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="ابحث في المهام، الأهداف، والتصنيفات..."
                className="w-full pl-4 pr-10 py-2 rounded-xl text-xs sm:text-sm bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-emerald-500 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* DEVICE SYNC BUTTON (PC & Mobile Cloud Sync) */}
            {onOpenDeviceSync && (
              <button
                onClick={onOpenDeviceSync}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-800 transition-all cursor-pointer shadow-xs active:scale-95"
                title="مزامنة البيانات بين الجوال والكمبيوتر"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                <span className="text-[11px] sm:text-xs">مزامنة الأجهزة</span>
              </button>
            )}

            {/* Desktop Only Buttons */}
            {onOpenPomodoro && (
              <button
                onClick={onOpenPomodoro}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
                title="مؤقت التركيز وبومودورو"
              >
                <span>🍅</span>
                <span>بومودورو</span>
              </button>
            )}

            <button
              onClick={onOpenCalendarSync}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-colors cursor-pointer"
              title="مزامنة التقويم وتصدير .ICS"
            >
              <CalendarIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>التقويم</span>
            </button>

            <button
              onClick={onOpenPdfExport}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-colors cursor-pointer"
              title="تصدير تقرير PDF"
            >
              <FileDown className="w-4 h-4 text-rose-500" />
              <span className="hidden xl:inline">تقرير PDF</span>
            </button>

            {/* Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="مركز الإشعارات والتنبيهات"
              aria-label="الإشعارات"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotificationsCount > 9 ? '+9' : unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}
              aria-label="تبديل المظهر"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              )}
            </button>

            {/* Mobile Actions Dropdown Menu (Prevents header wrapping & overflow) */}
            <div className="relative md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="المزيد من الخيارات"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMobileMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                  />
                  <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-40 text-xs text-slate-700 dark:text-slate-200 animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsSearchOpen(!isSearchOpen);
                      }}
                      className="w-full text-right px-3.5 py-2 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                    >
                      <Search className="w-4 h-4 text-slate-500" />
                      <span>البحث السريع</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenCalendarSync();
                      }}
                      className="w-full text-right px-3.5 py-2 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                    >
                      <CalendarIcon className="w-4 h-4 text-emerald-500" />
                      <span>مزامنة التقويم (.ics)</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenPdfExport();
                      }}
                      className="w-full text-right px-3.5 py-2 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                    >
                      <FileDown className="w-4 h-4 text-rose-500" />
                      <span>تصدير تقرير PDF</span>
                    </button>

                    {onOpenPomodoro && (
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onOpenPomodoro();
                        }}
                        className="w-full text-right px-3.5 py-2 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-rose-600 dark:text-rose-400 font-bold"
                      >
                        <Brain className="w-4 h-4" />
                        <span>مؤقت بومودورو 🍅</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Desktop Add Task CTA */}
            <button
              onClick={onOpenNewTask}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>مهمة جديدة</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        {isSearchOpen && (
          <div className="py-2 md:hidden border-t border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="ابحث في المهام، الأهداف، والتصنيفات..."
                className="w-full pl-4 pr-10 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

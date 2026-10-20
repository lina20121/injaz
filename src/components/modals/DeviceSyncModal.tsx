import React, { useState, useEffect } from 'react';
import { 
  X, 
  RefreshCw, 
  Smartphone, 
  Laptop, 
  Check, 
  Copy, 
  UploadCloud, 
  DownloadCloud, 
  QrCode, 
  ShieldCheck, 
  ArrowRightLeft, 
  FileJson, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CloudSyncService, SyncPayload } from '../../utils/cloudSyncService';
import { StorageService } from '../../utils/storage';
import { formatTimeArabic } from '../../utils/dateUtils';

interface DeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataSynced: () => void;
}

export const DeviceSyncModal: React.FC<DeviceSyncModalProps> = ({
  isOpen,
  onClose,
  onDataSynced,
}) => {
  const [syncKey, setSyncKey] = useState<string>(() => {
    return CloudSyncService.getStoredSyncKey() || CloudSyncService.generateRandomKey();
  });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(CloudSyncService.getLastSyncTime());
  const [autoSync, setAutoSync] = useState<boolean>(CloudSyncService.isAutoSyncEnabled());
  const [activeTab, setActiveTab] = useState<'cloud' | 'file'>('cloud');

  useEffect(() => {
    if (isOpen) {
      const stored = CloudSyncService.getStoredSyncKey();
      if (!stored) {
        const newKey = CloudSyncService.generateRandomKey();
        setSyncKey(newKey);
        CloudSyncService.setStoredSyncKey(newKey);
      } else {
        setSyncKey(stored);
      }
      setLastSyncTime(CloudSyncService.getLastSyncTime());
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(syncKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateNewKey = () => {
    const newKey = CloudSyncService.generateRandomKey();
    setSyncKey(newKey);
    CloudSyncService.setStoredSyncKey(newKey);
    setStatusMessage({ text: 'تم إنشاء رمز مزامنة جديد بنجاح', type: 'info' });
  };

  const handleToggleAutoSync = (enabled: boolean) => {
    setAutoSync(enabled);
    CloudSyncService.setAutoSyncEnabled(enabled);
  };

  // Push: Upload current device data to cloud
  const handlePushData = async () => {
    if (!syncKey.trim()) {
      setStatusMessage({ text: 'يرجى كتابة أو إنشاء رمز المزامنة أولاً', type: 'error' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    const isMobile = window.innerWidth < 768;
    const deviceName = isMobile ? 'هاتف ذكي 📱' : 'كمبيوتر مكتبي 💻';

    CloudSyncService.setStoredSyncKey(syncKey);
    const result = await CloudSyncService.pushToServer(syncKey, deviceName);

    setLoading(false);

    if (result.success) {
      setLastSyncTime(result.updatedAt);
      setStatusMessage({
        text: `تم رفع بيانات هذا الجهاز بنجاح! أدخل الرمز [ ${syncKey} ] في جهازك الآخر للوصول لبياناتك.`,
        type: 'success',
      });
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
      });
    } else {
      setStatusMessage({
        text: result.error || 'تعذر الرفع، يرجى التحقق من الاتصال بالإنترنت.',
        type: 'error',
      });
    }
  };

  // Pull: Download other device data from cloud
  const handlePullData = async () => {
    if (!syncKey.trim()) {
      setStatusMessage({ text: 'يرجى إدخال رمز المزامنة للجهاز الآخر', type: 'error' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    CloudSyncService.setStoredSyncKey(syncKey);
    const result = await CloudSyncService.pullFromServer(syncKey);

    setLoading(false);

    if (result.success && result.data) {
      CloudSyncService.applyPayload(result.data);
      setLastSyncTime(new Date().toISOString());
      onDataSynced();
      setStatusMessage({
        text: `تم استيراد ومزامنة ${result.data.tasks?.length || 0} مهمة و ${result.data.goals?.length || 0} هدف بنجاح!`,
        type: 'success',
      });
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 },
      });
    } else {
      setStatusMessage({
        text: result.error || 'لم يتم العثور على بيانات مرتبطة برمز المزامنة هذا.',
        type: 'error',
      });
    }
  };

  // File export/import
  const handleExportBackupFile = () => {
    const backupJson = StorageService.exportFullBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `injaz_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && StorageService.importBackup(content)) {
        onDataSynced();
        setStatusMessage({ text: 'تم استيراد النسخة الاحتياطية بنجاح!', type: 'success' });
        confetti({ particleCount: 40 });
      } else {
        setStatusMessage({ text: 'فشل استيراد الملف، تأكد من صحة التنسيق.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-l from-emerald-800 via-teal-700 to-emerald-700 text-white p-5 sm:p-6">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-lg sm:text-xl">
                  مزامنة الأجهزة (جوال ↔ كمبيوتر)
                </h3>
                <p className="text-emerald-100 text-xs">
                  مزامنة تقدمك وجميع مهامك وأهدافك بين أجهزتك فورياً
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Visual Device Pair Illustration */}
          <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-white/20 text-xs text-emerald-100">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Laptop className="w-4 h-4 text-emerald-200" />
              <span>الكمبيوتر (PC)</span>
            </div>
            <div className="flex items-center gap-1 text-amber-300 font-black">
              <span>⟷</span>
              <span className="text-[10px] bg-amber-400/20 px-2 py-0.5 rounded-full">سحابي مباشر</span>
              <span>⟷</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Smartphone className="w-4 h-4 text-emerald-200" />
              <span>الجوال (Mobile)</span>
            </div>
          </div>
        </div>

        {/* Modal Navigation */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-5 pt-2 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('cloud')}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cloud'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>المزامنة السحابية بالرمز السريع</span>
          </button>

          <button
            onClick={() => setActiveTab('file')}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'file'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileJson className="w-4 h-4" />
            <span>نسخة احتياطية كملف (.json)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs">
          
          {/* Status Feedback Banner */}
          {statusMessage && (
            <div className={`p-3.5 rounded-2xl border text-xs font-bold flex items-start gap-2.5 animate-in fade-in ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : statusMessage.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                  : 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-200'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{statusMessage.text}</div>
            </div>
          )}

          {activeTab === 'cloud' && (
            <div className="space-y-4">
              
              {/* Sync Key Box */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-700 dark:text-slate-200">
                    رمز المزامنة السحابي الخاص بك (Sync Key):
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateNewKey}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
                  >
                    توليد رمز جديد ↺
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={syncKey}
                    onChange={(e) => setSyncKey(e.target.value.toUpperCase())}
                    placeholder="مثال: INJAZ-8942"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-mono font-black text-sm text-center tracking-wider focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />

                  <button
                    onClick={handleCopyKey}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    title="نسخ الرمز"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'تم النسخ!' : 'نسخ'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  💡 استخدم نفس الرمز في جوالك وكمبيوترك لربط الجهازين بنفس مساحة العمل ومزامنة التقدم.
                </p>
              </div>

              {/* Action Buttons: Push & Pull */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* 1. Upload / Push button */}
                <button
                  onClick={handlePushData}
                  disabled={loading}
                  className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold transition-all shadow-md shadow-emerald-600/20 flex flex-col items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <UploadCloud className="w-6 h-6 stroke-[2.5]" />
                  <span className="text-xs sm:text-sm">رفع وتحديث السحابة (Upload)</span>
                  <span className="text-[10px] text-emerald-100 font-normal">
                    حفظ تقدم هذا الجهاز بالسحابة
                  </span>
                </button>

                {/* 2. Download / Pull button */}
                <button
                  onClick={handlePullData}
                  disabled={loading}
                  className="p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold transition-all shadow-md shadow-indigo-600/20 flex flex-col items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <DownloadCloud className="w-6 h-6 stroke-[2.5]" />
                  <span className="text-xs sm:text-sm">جلب وتنزيل البيانات (Pull)</span>
                  <span className="text-[10px] text-indigo-100 font-normal">
                    تحميل أحدث تقدم من الجهاز الآخر
                  </span>
                </button>
              </div>

              {/* Auto Sync Toggle */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                    المزامنة التلقائية المستمرة
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    مزامنة التغييرات تلقائياً في الخلفية عند اكتمال أي مهمة
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => handleToggleAutoSync(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer h-4 w-4"
                />
              </div>

              {/* Last Sync Indicator */}
              {lastSyncTime && (
                <div className="text-center text-[11px] text-slate-400">
                  آخر مزامنة ناجحة: {new Date(lastSyncTime).toLocaleDateString('ar-SA')} - {formatTimeArabic(new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'file' && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">
                  النسخ الاحتياطي اليدوي بدون اتصال بالإنترنت
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  يمكنك حفظ جميع مهامك وأهدافك وسلسلة إنجازك في ملف JSON على جهازك ونقله يدوياً لأي هاتف أو كمبيوتر.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    onClick={handleExportBackupFile}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    <span>تنزيل ملف النسخة (.json)</span>
                  </button>

                  <label className="flex-1 py-2.5 px-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 cursor-pointer text-center">
                    <UploadCloud className="w-4 h-4 text-emerald-500" />
                    <span>استيراد ملف (.json)</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackupFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

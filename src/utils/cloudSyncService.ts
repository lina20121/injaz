import { Task, Goal, AppNotification, DailyBriefingSettings, HabitStreak } from '../types';
import { Capacitor } from '@capacitor/core';
import { StorageService } from './storage';

export interface SyncPayload {
  version: string;
  timestamp: string;
  deviceName: string;
  tasks: Task[];
  goals: Goal[];
  notifications: AppNotification[];
  briefing: DailyBriefingSettings;
  streak: HabitStreak;
}

const STORAGE_KEY_SYNC_ID = 'injaz_device_sync_key_v2';
const STORAGE_KEY_AUTO_SYNC = 'injaz_auto_sync_enabled_v2';
const STORAGE_KEY_LAST_SYNC_TIME = 'injaz_last_sync_time_v2';
const IS_ELECTRON = new URLSearchParams(window.location.search).get('platform') === 'electron';
const SYNC_API_BASE_URL = Capacitor.isNativePlatform() || IS_ELECTRON ? 'https://injaz-orpin.vercel.app' : '';

async function readSyncResponse(res: Response): Promise<{ error?: string; data?: SyncPayload; updatedAt?: string }> {
  if (!res.headers.get('content-type')?.includes('json')) {
    throw new Error('خادم المزامنة غير متاح. يجب ربط تطبيق Android بخادم API متاح عبر الإنترنت.');
  }
  return res.json();
}

export const CloudSyncService = {
  getStoredSyncKey(): string {
    return localStorage.getItem(STORAGE_KEY_SYNC_ID) || '';
  },

  setStoredSyncKey(key: string): void {
    localStorage.setItem(STORAGE_KEY_SYNC_ID, key.trim().toUpperCase());
  },

  isAutoSyncEnabled(): boolean {
    return localStorage.getItem(STORAGE_KEY_AUTO_SYNC) === 'true';
  },

  setAutoSyncEnabled(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEY_AUTO_SYNC, enabled ? 'true' : 'false');
  },

  getLastSyncTime(): string | null {
    return localStorage.getItem(STORAGE_KEY_LAST_SYNC_TIME);
  },

  generateRandomKey(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let pin = '';
    for (let i = 0; i < 4; i++) {
      pin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `INJAZ-${pin}`;
  },

  createCurrentPayload(deviceName = 'متصفح'): SyncPayload {
    return {
      version: '2.0',
      timestamp: new Date().toISOString(),
      deviceName,
      tasks: StorageService.getTasks(),
      goals: StorageService.getGoals(),
      notifications: StorageService.getNotifications(),
      briefing: StorageService.getBriefingSettings(),
      streak: StorageService.getHabitStreak(),
    };
  },

  async pushToServer(syncKey: string, deviceName?: string): Promise<{ success: boolean; updatedAt: string; error?: string }> {
    try {
      const payload = this.createCurrentPayload(deviceName);
      const res = await fetch(`${SYNC_API_BASE_URL}/api/sync/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncKey: syncKey.trim().toUpperCase(),
          data: payload,
        }),
      });

      const resData = await readSyncResponse(res);
      if (!res.ok) throw new Error(resData.error || `Server responded with ${res.status}`);
      localStorage.setItem(STORAGE_KEY_LAST_SYNC_TIME, new Date().toISOString());
      return { success: true, updatedAt: resData.updatedAt || new Date().toISOString() };
    } catch (e: any) {
      console.warn('Sync push to server failed:', e);
      return { success: false, updatedAt: '', error: e.message || 'فشل الاتصال بالخادم السحابي' };
    }
  },

  async pullFromServer(syncKey: string): Promise<{ success: boolean; data?: SyncPayload; updatedAt?: string; error?: string }> {
    try {
      const normalized = syncKey.trim().toUpperCase();
      const res = await fetch(`${SYNC_API_BASE_URL}/api/sync/pull/${encodeURIComponent(normalized)}`);
      const resData = await readSyncResponse(res);

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('لم يتم العثور على بيانات مرتبطة برمز المزامنة هذا. يرجى التأكد من الرمز والمحاولة ثانية.');
        }
        throw new Error(resData.error || `خطأ في استرجاع البيانات (${res.status})`);
      }

      if (!resData.data) {
        throw new Error('البيانات المستلمة فارغة');
      }

      localStorage.setItem(STORAGE_KEY_LAST_SYNC_TIME, new Date().toISOString());
      return {
        success: true,
        data: resData.data as SyncPayload,
        updatedAt: resData.updatedAt,
      };
    } catch (e: any) {
      console.warn('Sync pull from server failed:', e);
      return { success: false, error: e.message || 'تعذر جلب البيانات من الخادم' };
    }
  },

  applyPayload(payload: SyncPayload): boolean {
    try {
      if (Array.isArray(payload.tasks)) {
        StorageService.saveTasks(payload.tasks);
      }
      if (Array.isArray(payload.goals)) {
        StorageService.saveGoals(payload.goals);
      }
      if (Array.isArray(payload.notifications)) {
        StorageService.saveNotifications(payload.notifications);
      }
      if (payload.briefing) {
        StorageService.saveBriefingSettings(payload.briefing);
      }
      if (payload.streak) {
        StorageService.saveHabitStreak(payload.streak);
      }
      return true;
    } catch (e) {
      console.error('Error applying sync payload:', e);
      return false;
    }
  },

  encodeToUrlSafeString(payload: SyncPayload): string {
    const json = JSON.stringify(payload);
    return encodeURIComponent(btoa(unescape(encodeURIComponent(json))));
  },

  decodeFromUrlSafeString(encoded: string): SyncPayload | null {
    try {
      const json = decodeURIComponent(escape(atob(decodeURIComponent(encoded))));
      return JSON.parse(json);
    } catch (e) {
      console.error('Failed to decode sync string:', e);
      return null;
    }
  }
};

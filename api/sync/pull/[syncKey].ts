import {
  getSyncEntry,
  sendJson,
  setCorsHeaders,
  SyncStoreUnavailableError,
  type SyncRequest,
  type SyncResponse,
} from '../../_lib/syncStore.js';

export default async function handler(req: SyncRequest, res: SyncResponse): Promise<void> {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const queryKey = req.query?.syncKey;
  const syncKey = (Array.isArray(queryKey) ? queryKey[0] : queryKey)?.trim().toUpperCase();
  if (!syncKey) {
    sendJson(res, 400, { error: 'Missing syncKey' });
    return;
  }

  try {
    const entry = await getSyncEntry(syncKey);
    if (!entry) {
      sendJson(res, 404, { error: 'لم يتم العثور على بيانات مرتبطة برمز المزامنة هذا.' });
      return;
    }
    sendJson(res, 200, { success: true, data: entry.data, updatedAt: entry.updatedAt });
  } catch (error) {
    console.error('Sync pull failed:', error);
    const status = error instanceof SyncStoreUnavailableError ? 503 : 502;
    sendJson(res, status, { error: error instanceof Error ? error.message : 'Sync storage request failed.' });
  }
}

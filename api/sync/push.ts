import {
  sendJson,
  setCorsHeaders,
  SyncStoreUnavailableError,
  type SyncRequest,
  type SyncResponse,
  saveSyncEntry,
} from '../_lib/syncStore.js';

export default async function handler(req: SyncRequest, res: SyncResponse): Promise<void> {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const body = req.body as { syncKey?: unknown; data?: unknown } | undefined;
  if (typeof body?.syncKey !== 'string' || !body.syncKey.trim() || !body.data || typeof body.data !== 'object') {
    sendJson(res, 400, { error: 'Missing syncKey or data payload' });
    return;
  }

  const syncKey = body.syncKey.trim().toUpperCase();
  const updatedAt = new Date().toISOString();
  try {
    await saveSyncEntry(syncKey, { data: body.data, updatedAt });
    sendJson(res, 200, { success: true, syncKey, updatedAt });
  } catch (error) {
    console.error('Sync push failed:', error);
    const status = error instanceof SyncStoreUnavailableError ? 503 : 502;
    sendJson(res, status, { error: error instanceof Error ? error.message : 'Sync storage request failed.' });
  }
}

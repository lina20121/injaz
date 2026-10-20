export type SyncEntry = { data: unknown; updatedAt: string };

export interface SyncRequest {
  method?: string;
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
  headers?: Record<string, string | string[] | undefined>;
}

export interface SyncResponse {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(body?: string): void;
}

export class SyncStoreUnavailableError extends Error {}

export function setCorsHeaders(res: SyncResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export function sendJson(res: SyncResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

async function redisCommand(command: string[]): Promise<unknown> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new SyncStoreUnavailableError('Sync storage is not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN.');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  if (!response.ok) throw new Error(`Sync storage request failed (${response.status}).`);

  const result = await response.json() as { result?: unknown; error?: string };
  if (result.error) throw new Error(`Sync storage error: ${result.error}`);
  return result.result;
}

export async function saveSyncEntry(key: string, entry: SyncEntry): Promise<void> {
  await redisCommand(['SET', `injaz:sync:${key}`, JSON.stringify(entry)]);
}

export async function getSyncEntry(key: string): Promise<SyncEntry | null> {
  const result = await redisCommand(['GET', `injaz:sync:${key}`]);
  if (typeof result !== 'string') return null;
  return JSON.parse(result) as SyncEntry;
}

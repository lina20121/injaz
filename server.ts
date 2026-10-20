import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type ServerOptions = {
  port?: number;
  host?: string;
  staticDir?: string;
  dataDirectory?: string;
};

function loadSyncStore(syncFilePath: string): Record<string, { data: any; updatedAt: string }> {
  try {
    if (fs.existsSync(syncFilePath)) {
      return JSON.parse(fs.readFileSync(syncFilePath, 'utf-8'));
    }
  } catch (e) {
    console.warn('Could not read sync store file:', e);
  }
  return {};
}

function saveSyncStore(syncFilePath: string, store: Record<string, { data: any; updatedAt: string }>) {
  try {
    fs.writeFileSync(syncFilePath, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Could not write sync store file:', e);
  }
}

export async function startServer(options: ServerOptions = {}) {
  const app = express();
  const syncFilePath = path.join(options.dataDirectory ?? __dirname, '.sync_store.json');
  const syncStore = loadSyncStore(syncFilePath);
  app.use(express.json({ limit: '15mb' }));

  app.post('/api/sync/push', (req, res) => {
    const { syncKey, data } = req.body;
    if (!syncKey || !data) {
      return res.status(400).json({ error: 'Missing syncKey or data payload' });
    }

    const normalized = String(syncKey).trim().toUpperCase();
    const updatedAt = new Date().toISOString();
    syncStore[normalized] = { data, updatedAt };
    saveSyncStore(syncFilePath, syncStore);

    return res.json({
      success: true,
      syncKey: normalized,
      updatedAt,
      itemsCount: {
        tasks: data.tasks?.length || 0,
        goals: data.goals?.length || 0,
      },
    });
  });

  app.get('/api/sync/pull/:syncKey', (req, res) => {
    const normalized = String(req.params.syncKey).trim().toUpperCase();
    const entry = syncStore[normalized];

    if (!entry) {
      return res.status(404).json({ error: 'لم يتم العثور على بيانات مرتبطة برمز المزامنة هذا.' });
    }

    return res.json({ success: true, data: entry.data, updatedAt: entry.updatedAt });
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', version: '2.0', time: new Date().toISOString() });
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = options.staticDir ?? path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const port = options.port ?? Number(process.env.PORT || 3000);
  const host = options.host ?? '0.0.0.0';
  const server = await new Promise<ReturnType<typeof app.listen>>((resolve, reject) => {
    const listener = app.listen(port, host, () => resolve(listener));
    listener.once('error', reject);
  });

  const address = server.address();
  console.log(`Server listening on http://${host}:${typeof address === 'object' && address ? address.port : port}`);
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

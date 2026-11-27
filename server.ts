import 'dotenv/config';
import express, { Request, Response } from 'express';
import crypto from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIREBASE_PROJECT_ID = 'yousnap-app';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'sakinayesmin2203@gmail.com').trim().toLowerCase();
const YOUSNAP_BUCKET = 'YouSnap';
const PORT = Number(process.env.PORT || 3000);

interface FirebaseCertCache {
  certs: Record<string, string>;
  expiresAt: number;
}

let certCache: FirebaseCertCache = { certs: {}, expiresAt: 0 };

async function getFirebasePublicCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (certCache.expiresAt > now && Object.keys(certCache.certs).length > 0) {
    return certCache.certs;
  }

  const res = await fetch(
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch Firebase public certificates (${res.status})`);
  }

  const cacheControl = res.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  const maxAgeSeconds = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600;
  const certs = (await res.json()) as Record<string, string>;

  certCache = {
    certs,
    expiresAt: now + Math.max(60, maxAgeSeconds) * 1000,
  };
  return certs;
}

function decodeBase64Url(input: string): Buffer {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((input.length + 3) % 4);
  return Buffer.from(padded, 'base64');
}

class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

async function verifyFirebaseAdminToken(idToken: string): Promise<{ uid: string; email: string }> {
  const parts = idToken.split('.');
  if (parts.length !== 3) {
    throw new AuthError('Invalid Firebase ID token format', 401);
  }

  let header: any;
  let payload: any;
  try {
    header = JSON.parse(decodeBase64Url(parts[0]).toString('utf8'));
    payload = JSON.parse(decodeBase64Url(parts[1]).toString('utf8'));
  } catch {
    throw new AuthError('Malformed Firebase ID token', 401);
  }

  if (header.alg !== 'RS256' || typeof header.kid !== 'string') {
    throw new AuthError('Unsupported token signing algorithm', 401);
  }

  const certs = await getFirebasePublicCerts();
  const certPem = certs[header.kid];
  if (!certPem) {
    throw new AuthError('Unknown Firebase signing key', 401);
  }

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${parts[0]}.${parts[1]}`);
  verifier.end();

  const signatureValid = verifier.verify(certPem, decodeBase64Url(parts[2]));
  if (!signatureValid) {
    throw new AuthError('Invalid Firebase ID token signature', 401);
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== 'number' || payload.exp <= nowSec) {
    throw new AuthError('Firebase session expired — please sign in again', 401);
  }
  if (typeof payload.iat !== 'number' || payload.iat > nowSec + 300) {
    throw new AuthError('Invalid token issued-at timestamp', 401);
  }
  if (payload.aud !== FIREBASE_PROJECT_ID) {
    throw new AuthError('Firebase token audience mismatch', 403);
  }
  if (payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) {
    throw new AuthError('Firebase token issuer mismatch', 403);
  }
  if (typeof payload.sub !== 'string' || !payload.sub) {
    throw new AuthError('Missing Firebase user subject', 401);
  }

  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  if (!email || email !== ADMIN_EMAIL) {
    throw new AuthError('Admin privileges required for storage deletion', 403);
  }

  return { uid: payload.sub, email };
}

function isBlockedPrivateHost(hostname: string): boolean {
  const lower = hostname.trim().toLowerCase();
  if (!lower || lower === 'localhost' || lower.endsWith('.local') || lower.endsWith('.internal')) {
    return true;
  }

  const ipVersion = net.isIP(lower);
  if (ipVersion === 4) {
    const octets = lower.split('.').map(Number);
    const [a, b] = octets;
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  } else if (ipVersion === 6) {
    if (lower === '::1' || lower.startsWith('fe80:') || lower.startsWith('fc') || lower.startsWith('fd')) {
      return true;
    }
  }
  return false;
}

function validateExternalHttpsEndpoint(rawUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error('Configured storage endpoint URL is invalid');
  }
  if (parsed.protocol !== 'https:') {
    throw new Error('Storage endpoint URL must use HTTPS');
  }
  if (isBlockedPrivateHost(parsed.hostname)) {
    throw new Error('Storage endpoint hostname is not allowed');
  }
  return parsed;
}

function sanitizeStorageObjectKey(rawKey: unknown): string | null {
  if (typeof rawKey !== 'string') return null;
  let cleaned = rawKey.trim();
  if (!cleaned) return null;

  try {
    cleaned = decodeURIComponent(cleaned);
  } catch {
    // Keep raw string if already decoded
  }

  cleaned = cleaned.split('?')[0].split('#')[0].replace(/^\/+/, '').trim();
  if (!cleaned || cleaned.includes('\\') || cleaned.includes('\0')) return null;

  const segments = cleaned.split('/').filter(Boolean);
  if (segments.length === 0 || segments.some((s) => s === '.' || s === '..')) {
    return null;
  }

  return segments.join('/');
}

async function deleteFromSupabaseStorage(keys: string[]): Promise<void> {
  const rawSupabaseUrl = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!rawSupabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing');
  }

  const baseUrl = validateExternalHttpsEndpoint(rawSupabaseUrl);
  const endpoint = new URL(`/storage/v1/object/${encodeURIComponent(YOUSNAP_BUCKET)}`, baseUrl.origin);

  const response = await fetch(endpoint.toString(), {
    method: 'DELETE',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prefixes: keys }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(
      `Supabase Storage returned HTTP ${response.status}${errText ? `: ${errText.slice(0, 200)}` : ''}`
    );
  }
}

async function deleteViaCloudflareWorker(keys: string[]): Promise<void> {
  const rawWorkerUrl = process.env.CLOUDFLARE_WORKER_DELETE_URL?.trim();
  if (!rawWorkerUrl) {
    throw new Error('CLOUDFLARE_WORKER_DELETE_URL is missing');
  }

  const workerUrl = validateExternalHttpsEndpoint(rawWorkerUrl);
  const workerSecret = process.env.CLOUDFLARE_WORKER_SECRET?.trim();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (workerSecret) {
    headers.Authorization = `Bearer ${workerSecret}`;
  }

  const response = await fetch(workerUrl.toString(), {
    method: 'DELETE',
    headers,
    body: JSON.stringify({
      bucket: YOUSNAP_BUCKET,
      keys,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(
      `Cloudflare Worker DELETE returned HTTP ${response.status}${errText ? `: ${errText.slice(0, 200)}` : ''}`
    );
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  const handleStorageDelete = async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization || '';
      const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
      if (!tokenMatch) {
        res.status(401).json({ error: 'Missing Firebase Admin authorization token.' });
        return;
      }

      await verifyFirebaseAdminToken(tokenMatch[1]);

      const { bucket, keys } = (req.body || {}) as { bucket?: unknown; keys?: unknown };
      if (bucket !== undefined && bucket !== YOUSNAP_BUCKET) {
        res.status(400).json({ error: `Invalid bucket "${String(bucket)}". Expected "${YOUSNAP_BUCKET}".` });
        return;
      }

      if (!Array.isArray(keys) || keys.length === 0 || keys.length > 50) {
        res.status(400).json({ error: 'Provide between 1 and 50 valid storage object keys.' });
        return;
      }

      const cleanKeys = Array.from(
        new Set(keys.map(sanitizeStorageObjectKey).filter((k): k is string => Boolean(k)))
      );
      if (cleanKeys.length === 0) {
        res.status(400).json({ error: 'No valid YouSnap storage object keys provided.' });
        return;
      }

      const hasSupabase = Boolean(
        process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
      );
      const hasWorker = Boolean(process.env.CLOUDFLARE_WORKER_DELETE_URL?.trim());

      if (!hasSupabase && !hasWorker) {
        res.status(503).json({
          error:
            'Supabase Storage deletion is not configured on the server. Set SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY (or CLOUDFLARE_WORKER_DELETE_URL) in environment secrets.',
        });
        return;
      }

      if (hasSupabase) {
        await deleteFromSupabaseStorage(cleanKeys);
      } else {
        await deleteViaCloudflareWorker(cleanKeys);
      }

      res.json({
        success: true,
        bucket: YOUSNAP_BUCKET,
        deletedKeys: cleanKeys,
      });
    } catch (err: any) {
      const msg = err?.message || 'Unexpected storage deletion error';
      const status = err instanceof AuthError ? err.status : 502;
      res.status(status).json({ error: msg });
    }
  };

  app.post('/api/storage/delete', handleStorageDelete);
  app.delete('/api/storage/delete', handleStorageDelete);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`YouSnap Admin Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start YouSnap Admin Server:', err);
  process.exit(1);
});

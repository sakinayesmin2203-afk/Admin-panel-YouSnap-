/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * YouSnap Admin Panel Security Module:
 * 1. HTTPS / TLS Transport Enforcement & URL Sanitization
 * 2. Real AES-256-GCM Authenticated Encryption via Web Crypto API
 *    using a non-extractable 256-bit CryptoKey stored in IndexedDB.
 */

const KEYSTORE_DB_NAME = 'yousnap_admin_keystore';
const KEYSTORE_STORE_NAME = 'crypto_keys';
const KEYSTORE_KEY_ID = 'aes_256_gcm_master_v1';
const ENVELOPE_PREFIX = 'YS_AES256_GCM_V1:';

export interface Aes256GcmEnvelope {
  v: 1;
  alg: 'AES-256-GCM';
  iv: string;
  ct: string;
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

let memoryFallbackKey: CryptoKey | null = null;
let cachedMasterKeyPromise: Promise<CryptoKey> | null = null;

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname.endsWith('.local')
  );
}

/**
 * Enforces HTTPS/TLS transport in non-local environments and verifies
 * that the browser provides a TLS-backed Secure Context for Web Crypto.
 */
export function enforceHttpsTransport(): boolean {
  if (typeof window === 'undefined') return true;

  const { protocol, hostname, host, pathname, search, hash } = window.location;
  if (protocol === 'http:' && !isLocalHostname(hostname)) {
    window.location.replace(`https://${host}${pathname}${search}${hash}`);
    return false;
  }

  return Boolean(window.isSecureContext && window.crypto?.subtle);
}

/**
 * Returns true when the Admin Panel is running over HTTPS/TLS with Web Crypto active.
 */
export function isSecureTlsContext(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.isSecureContext && window.crypto?.subtle);
}

/**
 * Validates external URLs (avatars, thumbnails, videos), blocks dangerous schemes
 * (javascript:, vbscript:, data:text/html), and upgrades external http:// URLs to https://.
 */
export function sanitizeHttpsUrl(rawUrl: unknown): string {
  if (typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // Allow safe relative paths
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  // Block dangerous script/HTML URI schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:text/html')
  ) {
    return '';
  }

  // Allow safe inline image/video data or blob URLs when already generated locally
  if (lower.startsWith('data:image/') || lower.startsWith('blob:')) {
    return trimmed;
  }

  try {
    const normalizedInput = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
    const parsed = new URL(normalizedInput);

    if (parsed.protocol === 'https:') {
      return parsed.toString();
    }

    if (parsed.protocol === 'http:') {
      if (isLocalHostname(parsed.hostname)) {
        return parsed.toString();
      }
      parsed.protocol = 'https:';
      return parsed.toString();
    }

    return '';
  } catch {
    return '';
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function openKeystoreDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }

    const request = indexedDB.open(KEYSTORE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(KEYSTORE_STORE_NAME)) {
        db.createObjectStore(KEYSTORE_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open keystore'));
  });
}

async function readKeyFromIndexedDb(): Promise<CryptoKey | null> {
  const db = await openKeystoreDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(KEYSTORE_STORE_NAME, 'readonly');
    const store = tx.objectStore(KEYSTORE_STORE_NAME);
    const req = store.get(KEYSTORE_KEY_ID);
    req.onsuccess = () => resolve((req.result as CryptoKey) || null);
    req.onerror = () => reject(req.error || new Error('Failed to read key'));
    tx.oncomplete = () => db.close();
  });
}

async function writeKeyToIndexedDb(key: CryptoKey): Promise<void> {
  const db = await openKeystoreDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(KEYSTORE_STORE_NAME, 'readwrite');
    const store = tx.objectStore(KEYSTORE_STORE_NAME);
    const req = store.put(key, KEYSTORE_KEY_ID);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error || new Error('Failed to store key'));
    tx.oncomplete = () => db.close();
  });
}

/**
 * Generates or retrieves a non-extractable 256-bit AES-GCM CryptoKey.
 * Because `extractable` is `false`, JavaScript cannot export raw key bytes.
 */
async function getOrCreateAes256Key(): Promise<CryptoKey> {
  if (!isSecureTlsContext()) {
    throw new Error('Web Crypto AES-256-GCM requires an HTTPS/TLS Secure Context.');
  }

  if (cachedMasterKeyPromise) {
    return cachedMasterKeyPromise;
  }

  cachedMasterKeyPromise = (async () => {
    try {
      const existing = await readKeyFromIndexedDb();
      if (existing) return existing;

      const generated = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );

      await writeKeyToIndexedDb(generated);
      return generated;
    } catch {
      // Fallback for restricted/private browsing contexts where IndexedDB is disabled
      if (!memoryFallbackKey) {
        memoryFallbackKey = await window.crypto.subtle.generateKey(
          { name: 'AES-GCM', length: 256 },
          false,
          ['encrypt', 'decrypt']
        );
      }
      return memoryFallbackKey;
    }
  })();

  return cachedMasterKeyPromise;
}

/**
 * Initializes the AES-256-GCM non-extractable key on app boot.
 */
export async function initSecurityKeystore(): Promise<boolean> {
  try {
    await getOrCreateAes256Key();
    return true;
  } catch {
    return false;
  }
}

/**
 * Encrypts plaintext using AES-256-GCM with a fresh 96-bit random IV
 * and context-bound Additional Authenticated Data (AAD).
 */
export async function encryptAes256Gcm(
  plaintext: string,
  contextTag = 'default'
): Promise<string> {
  const key = await getOrCreateAes256Key();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const aad = textEncoder.encode(`YouSnap-Admin-AES256-GCM-v1:${contextTag}`);
  const data = textEncoder.encode(plaintext);

  const cipherBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      additionalData: aad,
      tagLength: 128,
    },
    key,
    data
  );

  const envelope: Aes256GcmEnvelope = {
    v: 1,
    alg: 'AES-256-GCM',
    iv: bytesToBase64(iv),
    ct: bytesToBase64(new Uint8Array(cipherBuffer)),
  };

  return `${ENVELOPE_PREFIX}${JSON.stringify(envelope)}`;
}

/**
 * Decrypts and integrity-verifies an AES-256-GCM payload using its context tag.
 */
export async function decryptAes256Gcm(
  payload: string,
  contextTag = 'default'
): Promise<string> {
  if (!payload.startsWith(ENVELOPE_PREFIX)) {
    throw new Error('Invalid AES-256-GCM envelope');
  }

  const envelope = JSON.parse(payload.slice(ENVELOPE_PREFIX.length)) as Aes256GcmEnvelope;
  if (envelope.v !== 1 || envelope.alg !== 'AES-256-GCM' || !envelope.iv || !envelope.ct) {
    throw new Error('Unsupported AES-256-GCM envelope');
  }

  const key = await getOrCreateAes256Key();
  const iv = base64ToBytes(envelope.iv);
  const ct = base64ToBytes(envelope.ct);
  const aad = textEncoder.encode(`YouSnap-Admin-AES256-GCM-v1:${contextTag}`);

  const plainBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(iv),
      additionalData: aad,
      tagLength: 128,
    },
    key,
    new Uint8Array(ct)
  );

  return textDecoder.decode(plainBuffer);
}

/**
 * Creates an AES-256-GCM encrypted audit token for admin payout/moderation records.
 */
export async function createEncryptedAuditEnvelope(
  record: Record<string, unknown>,
  contextTag = 'audit'
): Promise<string | null> {
  try {
    return await encryptAes256Gcm(JSON.stringify(record), contextTag);
  } catch {
    return null;
  }
}

/**
 * AES-256-GCM encrypted browser storage wrapper for sensitive Admin Panel state.
 */
export const secureStorage = {
  async setEncryptedItem(key: string, value: unknown): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const serialized = JSON.stringify(value);
      const encrypted = await encryptAes256Gcm(serialized, `storage:${key}`);
      window.localStorage.setItem(key, encrypted);
    } catch {
      // Never fall back to writing sensitive values in plaintext if encryption fails
    }
  },

  async getEncryptedItem<T>(key: string): Promise<T | null> {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    if (raw.startsWith(ENVELOPE_PREFIX)) {
      try {
        const decrypted = await decryptAes256Gcm(raw, `storage:${key}`);
        return JSON.parse(decrypted) as T;
      } catch {
        // Tampered or key-rotated ciphertext: clear stale entry safely
        window.localStorage.removeItem(key);
        return null;
      }
    }

    // Legacy plaintext value migration: parse once and re-encrypt with AES-256-GCM
    try {
      const parsed = JSON.parse(raw) as T;
      await this.setEncryptedItem(key, parsed);
      return parsed;
    } catch {
      return null;
    }
  },

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  },

  async clearSecurityKeystore(): Promise<void> {
    cachedMasterKeyPromise = null;
    memoryFallbackKey = null;

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('yousnap_admin_auth');
      window.localStorage.removeItem('yousnap_admin_email');
    }

    if (typeof indexedDB !== 'undefined') {
      await new Promise<void>((resolve) => {
        const req = indexedDB.deleteDatabase(KEYSTORE_DB_NAME);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
      });
    }
  },
};

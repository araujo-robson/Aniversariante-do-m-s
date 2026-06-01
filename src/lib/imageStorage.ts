// IndexedDB-based storage for photocard images.
// localStorage has ~5MB limit; with 20+ compressed photos it overflows silently,
// which caused project exports to be missing most images. IndexedDB has GBs available.

const DB_NAME = "aniversariantes-db";
const STORE = "photocards";
const VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getImage(key: string): Promise<string | null> {
  try {
    const v = await tx<string | undefined>("readonly", (s) => s.get(key) as IDBRequest<string | undefined>);
    if (v) return v;
  } catch { /* ignore */ }
  // Fallback: legacy localStorage entries
  try { return localStorage.getItem(`photocard-${key}`); } catch { return null; }
}

export async function setImage(key: string, value: string): Promise<void> {
  try {
    await tx("readwrite", (s) => s.put(value, key));
    // Clean up legacy localStorage copy if present
    try { localStorage.removeItem(`photocard-${key}`); } catch { /* */ }
  } catch (e) {
    console.error("IDB setImage failed", e);
    throw e;
  }
}

export async function removeImage(key: string): Promise<void> {
  try { await tx("readwrite", (s) => s.delete(key)); } catch { /* */ }
  try { localStorage.removeItem(`photocard-${key}`); } catch { /* */ }
}

export async function getAllImages(prefix: string): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const t = db.transaction(STORE, "readonly");
      const req = t.objectStore(STORE).openCursor();
      req.onsuccess = () => {
        const c = req.result;
        if (c) {
          const k = String(c.key);
          if (k.startsWith(prefix)) out[k.slice(prefix.length)] = c.value as string;
          c.continue();
        } else resolve();
      };
      req.onerror = () => reject(req.error);
    });
  } catch { /* */ }
  // Merge legacy localStorage entries
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(`photocard-${prefix}`)) {
        const sub = k.slice(`photocard-`.length + prefix.length);
        if (!(sub in out)) {
          const v = localStorage.getItem(k);
          if (v) out[sub] = v;
        }
      }
    }
  } catch { /* */ }
  return out;
}

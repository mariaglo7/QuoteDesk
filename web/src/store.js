// Code written with help from Claude (Anthropic)
// Saves to the private db of the signed in viewer, or to this browser when db is not available.
import { DEFAULT_SETTINGS } from './defaults.js';

const LOCAL_SETTINGS = 'wyceny.settings';
const LOCAL_QUOTES = 'wyceny.quotes';

const plain = (v) => JSON.parse(JSON.stringify(v));

function randomSecret() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, '0')).join('');
}

function localRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function localWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be blocked; the page keeps working for this session.
  }
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function createLocalBackend() {
  return {
    mode: 'local',
    readSettings: async () => localRead(LOCAL_SETTINGS, null),
    writeSettings: async (s) => localWrite(LOCAL_SETTINGS, s),
    listQuotes: async () => Object.values(localRead(LOCAL_QUOTES, {})),
    writeQuote: async (q) => localWrite(LOCAL_QUOTES, { ...localRead(LOCAL_QUOTES, {}), [q.id]: q }),
    removeQuote: async (id) => {
      const all = localRead(LOCAL_QUOTES, {});
      delete all[id];
      localWrite(LOCAL_QUOTES, all);
    },
    uploadCover: (blob) => blobToDataUrl(blob),
  };
}

function createDbBackend(db, uid, assets) {
  const col = db.collection(`data/users/${uid}`);
  return {
    mode: 'db',
    readSettings: async () => {
      const snap = await col.doc('settings').get();
      return snap.exists ? snap.data() : null;
    },
    writeSettings: (s) => col.doc('settings').set(plain(s)),
    listQuotes: async () => (await col.where('kind', '==', 'quote').get()).docs.map((d) => d.data()),
    writeQuote: (q) => col.doc(`q_${q.id}`).set(plain(q)),
    removeQuote: (id) => col.doc(`q_${id}`).delete(),
    uploadCover: async (blob) => (assets ? (await assets.upload(blob)).id : blobToDataUrl(blob)),
  };
}

async function pickBackend() {
  if (!window.claude?.use) return createLocalBackend();
  const [db, user, assets] = await Promise.all(['db', 'user', 'assets'].map((n) => window.claude.use(n)));
  const uid = await user?.id?.();
  return db && uid ? createDbBackend(db, uid, assets) : createLocalBackend();
}

export async function createStore() {
  const backend = await pickBackend();
  return {
    mode: backend.mode,
    async getSettings() {
      const saved = await backend.readSettings();
      const settings = { ...DEFAULT_SETTINGS, ...saved };
      if (!settings.linkSecret) {
        settings.linkSecret = randomSecret();
        await backend.writeSettings(settings);
      }
      return settings;
    },
    saveSettings: (s) => backend.writeSettings(s),
    listQuotes: () => backend.listQuotes(),
    saveQuote: (q) => backend.writeQuote(q),
    deleteQuote: (id) => backend.removeQuote(id),
    uploadCover: (blob) => backend.uploadCover(blob),
    async coverDataUrl(id) {
      if (!id) return null;
      if (id.startsWith('data:')) return id;
      try {
        return await blobToDataUrl(await (await fetch(`/_blob/${id}`)).blob());
      } catch {
        return null;
      }
    },
  };
}

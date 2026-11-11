export const defaults = { target: 'general', subjects: ['인물'], sns: 'Instagram', account: '', criteria: ['blur', 'duplicate', 'eyes', 'dark'], deviceReady: false, configured: false };
export function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('goreun-settings-v1') || '{}');
    return { ...defaults, target: ['general','parents','influencer'].includes(saved.target) ? saved.target : defaults.target,
      subjects: Array.isArray(saved.subjects) ? saved.subjects.filter((v) => ['여행','인물','동물','음식','제품'].includes(v)) : defaults.subjects,
      sns: ['Instagram','Threads','Facebook'].includes(saved.sns) ? saved.sns : defaults.sns,
      account: typeof saved.account === 'string' ? saved.account.slice(0,80) : '', criteria: Array.isArray(saved.criteria) ? saved.criteria.filter((v) => ['blur','duplicate','eyes','dark','tilt'].includes(v)) : defaults.criteria,
      deviceReady: saved.deviceReady === true, configured: saved.configured === true };
  } catch { return { ...defaults }; }
}
export function saveSettings(value) { localStorage.setItem('goreun-settings-v1', JSON.stringify(value)); }
export function profileKey(settings) { return settings.target === 'influencer' ? `influencer:${settings.sns}` : settings.target; }
let dbPromise;
function database() {
  if (!dbPromise) dbPromise = new Promise((resolve,reject) => {
    const request = indexedDB.open('goreun-taste-v1',1);
    request.onupgradeneeded = () => request.result.createObjectStore('profiles');
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
  });
  return dbPromise;
}
export async function loadTaste(key) {
  const db = await database();
  return new Promise((resolve,reject) => { const request = db.transaction('profiles').objectStore('profiles').get(key); request.onsuccess = () => resolve(request.result || []); request.onerror = () => reject(request.error); });
}
export async function saveTaste(key, refs) {
  const db = await database();
  return new Promise((resolve,reject) => {
    const transaction = db.transaction('profiles','readwrite'); transaction.objectStore('profiles').put(refs.slice(-10),key);
    transaction.oncomplete = resolve; transaction.onerror = () => reject(transaction.error); transaction.onabort = () => reject(transaction.error);
  });
}

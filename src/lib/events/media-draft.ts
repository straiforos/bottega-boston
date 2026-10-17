import { useCallback, useEffect, useRef, useState } from 'react';
import { DRAFT_TTL_MS } from './form-draft';

interface MediaDraft {
  key: string;
  blob: Blob;
  name: string;
  type: string;
  lastModified: number;
  savedAt: number;
}

let queue: Promise<unknown> = Promise.resolve();

/** Serialize operations so a slow write cannot resurrect a discarded file. */
function transaction<T>(run: (store: IDBObjectStore, result: (value: T) => void) => void): Promise<T> {
  const operation = queue.catch(() => {}).then(() => new Promise<T>((resolve, reject) => {
    const request = indexedDB.open('bottega-media-drafts', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('files', { keyPath: 'key' });
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('files', 'readwrite');
      let value: T;
      tx.oncomplete = () => { db.close(); resolve(value); };
      tx.onabort = () => { db.close(); reject(tx.error); };
      try { run(tx.objectStore('files'), (next) => { value = next; }); }
      catch (error) { db.close(); reject(error); }
    };
  }));
  queue = operation;
  return operation;
}

export function saveMediaDraft(key: string, file: File | null, now = Date.now()) {
  return transaction<void>((store) => {
    if (!file) { store.delete(key); return; }
    store.put({ key, blob: file.slice(), name: file.name, type: file.type, lastModified: file.lastModified, savedAt: now } satisfies MediaDraft);
  });
}

export function readMediaDraft(key: string, now = Date.now()) {
  return transaction<File | null>((store, result) => {
    result(null);
    const cursor = store.openCursor();
    cursor.onsuccess = () => {
      const row = cursor.result;
      if (!row) return;
      const saved = row.value as MediaDraft;
      if (now - saved.savedAt > DRAFT_TTL_MS) row.delete();
      else if (saved.key === key) result(new File([saved.blob], saved.name, { type: saved.type, lastModified: saved.lastModified }));
      row.continue();
    };
  });
}

/** Blobs persist in IndexedDB, never transient object URLs or localStorage. */
export function useMediaDraft(key: string, onFailure: () => void, enabled = true) {
  const [file, updateFile] = useState<File | null>(null);
  const [ready, setReady] = useState(false);
  const revision = useRef(0);
  const failure = useRef(onFailure);
  failure.current = onFailure;

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const version = revision.current;
    setReady(false);
    updateFile(null);
    void readMediaDraft(key).then((saved) => {
      if (active && revision.current === version) updateFile(saved);
    }).catch(() => { if (active) failure.current(); }).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, [key, enabled]);

  const setFile = useCallback((next: File | null) => {
    revision.current += 1;
    updateFile(next);
    void saveMediaDraft(key, next).catch(() => failure.current());
  }, [key]);

  const clearMedia = useCallback(async () => {
    revision.current += 1;
    updateFile(null);
    try { await saveMediaDraft(key, null); }
    catch { failure.current(); }
  }, [key]);

  return { file, setFile, clearMedia, ready };
}
export type ShareHistoryItem = {
  token: string;
  lastOpenedAt: number;
};

const KEY = "bengala.share.history.v1";
const MAX_ITEMS = 20;

function readRaw(): ShareHistoryItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ShareHistoryItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (i) =>
          i &&
          typeof i.token === "string" &&
          i.token.trim().length > 0 &&
          typeof i.lastOpenedAt === "number" &&
          Number.isFinite(i.lastOpenedAt)
      )
      .map((i) => ({ token: i.token.trim(), lastOpenedAt: i.lastOpenedAt }));
  } catch {
    return [];
  }
}

function writeRaw(items: ShareHistoryItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event("bengala:share-history"));
}

export function getShareHistory(): ShareHistoryItem[] {
  return readRaw().sort((a, b) => b.lastOpenedAt - a.lastOpenedAt);
}

export function addToShareHistory(token: string) {
  const t = token.trim();
  if (!t) return;

  const now = Date.now();
  const cur = readRaw();
  const without = cur.filter((i) => i.token !== t);
  const next = [{ token: t, lastOpenedAt: now }, ...without].slice(0, MAX_ITEMS);
  writeRaw(next);
}

export function removeFromShareHistory(token: string) {
  const t = token.trim();
  const cur = readRaw();
  const next = cur.filter((i) => i.token !== t);
  writeRaw(next);
}

export function clearShareHistory() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event("bengala:share-history"));
}

export function formatTokenShort(token: string) {
  const t = token.trim();
  if (t.length <= 18) return t;
  return `${t.slice(0, 10)}…${t.slice(-6)}`;
}

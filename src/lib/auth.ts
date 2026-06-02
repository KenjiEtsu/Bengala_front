export type AuthState = {
  accessToken: string;
  email: string;
  username: string;
  userId: string;
};

const KEY = "bengala.auth.v1";

export function readAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthState;
    if (
      !parsed ||
      typeof parsed.accessToken !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.username !== "string" ||
      typeof parsed.userId !== "string"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeAuth(state: AuthState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event("bengala:auth"));
}

export function clearAuth() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event("bengala:auth"));
}

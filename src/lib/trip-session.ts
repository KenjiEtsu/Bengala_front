export type TripSession = {
  tripId: string;
  writeToken: string;
  shareUrl: string;
  readToken: string;
  createdAt: number;
};

const SESSION_KEY = "bengala.trip.session.v1";

export function readTripSession(): TripSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TripSession;
    if (
      !parsed ||
      typeof parsed.tripId !== "string" ||
      typeof parsed.writeToken !== "string" ||
      typeof parsed.shareUrl !== "string" ||
      typeof parsed.readToken !== "string" ||
      typeof parsed.createdAt !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeTripSession(session: TripSession) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event("bengala:trip-session"));
}

export function clearTripSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event("bengala:trip-session"));
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { apiJson } from "@/lib/api";
import { readTripSession, type TripSession } from "@/lib/trip-session";

export type TrackingStatus =
  | { kind: "idle" }
  | { kind: "unsupported" }
  | { kind: "error"; message: string }
  | {
      kind: "running";
      lat: number;
      lon: number;
      acc: number;
      ts: number;
    };

export type TrailPoint = {
  lat: number;
  lon: number;
  acc: number;
  ts: number;
};

type TrackingContextValue = {
  status: TrackingStatus;
  isTrackingDesired: boolean;
  isWatching: boolean;
  trail: TrailPoint[];
  start: () => void;
  stop: () => void;
};

const TrackingContext = createContext<TrackingContextValue | null>(null);

const STORAGE_KEY = "bengala.tracking.desired.v1";
const TRAIL_KEY = "bengala.tracking.trail.v1";
const OUTBOX_KEY = "bengala.tracking.outbox.v1";

function readDesiredFromStorage(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeDesiredToStorage(value: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    // ignore
  }
}

function readTrailFromStorage(): TrailPoint[] {
  try {
    const raw = localStorage.getItem(TRAIL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<[number, number, number, number]>;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (t) =>
          Array.isArray(t) &&
          t.length === 4 &&
          t.every((n) => typeof n === "number" && Number.isFinite(n))
      )
      .map(([lat, lon, acc, ts]) => ({ lat, lon, acc, ts }));
  } catch {
    return [];
  }
}

function writeTrailToStorage(points: TrailPoint[]) {
  try {
    const compact = points.map((p) => [p.lat, p.lon, p.acc, p.ts] as const);
    localStorage.setItem(TRAIL_KEY, JSON.stringify(compact));
  } catch {
    // ignore (quota/private mode)
  }
}

type OutboxItem = {
  tripId: string;
  writeToken: string;
  point: TrailPoint;
};

function readOutbox(): OutboxItem[] {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OutboxItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i) =>
        i &&
        typeof i.tripId === "string" &&
        typeof i.writeToken === "string" &&
        i.point &&
        typeof i.point.lat === "number" &&
        typeof i.point.lon === "number" &&
        typeof i.point.ts === "number"
    );
  } catch {
    return [];
  }
}

function writeOutbox(items: OutboxItem[]) {
  try {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function TrackingProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<TrackingStatus>({ kind: "idle" });
  const [isWatching, setIsWatching] = useState(false);
  const desiredRef = useRef(false);
  const [isTrackingDesired, setIsTrackingDesired] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const lastTrailPointRef = useRef<TrailPoint | null>(null);
  const sessionRef = useRef<TripSession | null>(null);
  const flushingRef = useRef(false);

  const requestWakeLock = useCallback(async () => {
    try {
      const wakeLock = (navigator as unknown as { wakeLock?: any }).wakeLock;
      if (wakeLock?.request && !wakeLockRef.current) {
        wakeLockRef.current = await wakeLock.request("screen");
      }
    } catch {
      // best-effort
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (!wakeLockRef.current) return;
    try {
      await wakeLockRef.current.release?.();
    } catch {
      // ignore
    } finally {
      wakeLockRef.current = null;
    }
  }, []);

  const clearWatch = useCallback(() => {
    if (watchIdRef.current === null) return;
    try {
      navigator.geolocation.clearWatch(watchIdRef.current);
    } catch {
      // ignore
    } finally {
      watchIdRef.current = null;
      setIsWatching(false);
    }
  }, []);

  const flushOutbox = useCallback(async () => {
    if (flushingRef.current) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    flushingRef.current = true;
    try {
      const outbox = readOutbox();
      if (!outbox.length) return;

      // Enviar en orden; en futuro: batch.
      const remaining: OutboxItem[] = [];
      for (const item of outbox) {
        try {
          await apiJson<{ ok: boolean }>(
            `/api/trips/${encodeURIComponent(item.tripId)}/locations`,
            {
              method: "POST",
              headers: { authorization: `Bearer ${item.writeToken}` },
              body: JSON.stringify({
                lat: item.point.lat,
                lon: item.point.lon,
                acc: item.point.acc,
                ts: item.point.ts
              })
            }
          );
        } catch {
          remaining.push(item);
        }
      }

      writeOutbox(remaining);
    } finally {
      flushingRef.current = false;
    }
  }, []);

  const enqueueAndFlush = useCallback(
    (session: TripSession, point: TrailPoint) => {
      const item: OutboxItem = {
        tripId: session.tripId,
        writeToken: session.writeToken,
        point
      };
      const cur = readOutbox();
      cur.push(item);
      // cap para prototipo
      const capped = cur.length > 4000 ? cur.slice(cur.length - 4000) : cur;
      writeOutbox(capped);
      void flushOutbox();
    },
    [flushOutbox]
  );

  const startWatch = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus({ kind: "unsupported" });
      return;
    }

    if (watchIdRef.current !== null) return;

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const nextPoint: TrailPoint = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          acc: pos.coords.accuracy,
          ts: pos.timestamp
        };

        const prev = lastTrailPointRef.current;
        const shouldAppend =
          !prev ||
          // mínimo 5s entre puntos
          nextPoint.ts - prev.ts >= 5_000 ||
          // o si se movió ~10m+ (aprox, suficiente para prototipo)
          distanceMeters(prev.lat, prev.lon, nextPoint.lat, nextPoint.lon) >= 10;

        if (shouldAppend) {
          lastTrailPointRef.current = nextPoint;
          setTrail((cur) => {
            const next = [...cur, nextPoint];
            // cap para prototipo (evita crecer infinito)
            const capped =
              next.length > 2_000 ? next.slice(next.length - 2_000) : next;
            writeTrailToStorage(capped);
            return capped;
          });

          // Sync best-effort to backend (if session exists)
          const s = sessionRef.current;
          if (s) {
            enqueueAndFlush(s, nextPoint);
          }
        }

        setStatus({
          kind: "running",
          lat: nextPoint.lat,
          lon: nextPoint.lon,
          acc: nextPoint.acc,
          ts: nextPoint.ts
        });
      },
      (err) => {
        // En móviles suele pasar al perder permisos/contexto seguro.
        setStatus({ kind: "error", message: err.message });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10_000,
        timeout: 20_000
      }
    );

    watchIdRef.current = id;
    setIsWatching(true);
    void requestWakeLock();
  }, [enqueueAndFlush, requestWakeLock]);

  const start = useCallback(() => {
    desiredRef.current = true;
    setIsTrackingDesired(true);
    writeDesiredToStorage(true);
    startWatch();
  }, [startWatch]);

  const stop = useCallback(() => {
    desiredRef.current = false;
    setIsTrackingDesired(false);
    writeDesiredToStorage(false);
    clearWatch();
    setStatus({ kind: "idle" });
    setTrail([]);
    lastTrailPointRef.current = null;
    try {
      localStorage.removeItem(TRAIL_KEY);
    } catch {
      // ignore
    }
    void releaseWakeLock();
  }, [clearWatch, releaseWakeLock]);

  useEffect(() => {
    // Restore desired state across route changes / reloads.
    const desired = readDesiredFromStorage();
    desiredRef.current = desired;
    setIsTrackingDesired(desired);
    const restoredTrail = readTrailFromStorage();
    if (restoredTrail.length) {
      setTrail(restoredTrail);
      lastTrailPointRef.current =
        restoredTrail[restoredTrail.length - 1] ?? null;
    }

    // Load trip session if exists (for syncing points)
    sessionRef.current = readTripSession();

    if (desired) startWatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Reanudar si el navegador ha pausado el watch o al volver de background.
    const resumeIfNeeded = () => {
      if (!desiredRef.current) return;
      if (document.visibilityState !== "visible") return;
      if (watchIdRef.current !== null) return;
      startWatch();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        resumeIfNeeded();
        void requestWakeLock();
      } else {
        void releaseWakeLock();
      }
    };

    const onPageShow = () => resumeIfNeeded();

    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [releaseWakeLock, requestWakeLock, startWatch]);

  useEffect(() => {
    const syncSession = () => {
      sessionRef.current = readTripSession();
      void flushOutbox();
    };
    const onOnline = () => void flushOutbox();
    window.addEventListener("bengala:trip-session", syncSession);
    window.addEventListener("storage", syncSession);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("bengala:trip-session", syncSession);
      window.removeEventListener("storage", syncSession);
      window.removeEventListener("online", onOnline);
    };
  }, [flushOutbox]);

  useEffect(() => {
    return () => {
      clearWatch();
      void releaseWakeLock();
    };
  }, [clearWatch, releaseWakeLock]);

  const value = useMemo<TrackingContextValue>(
    () => ({
      status,
      isTrackingDesired,
      isWatching,
      trail,
      start,
      stop
    }),
    [isTrackingDesired, isWatching, start, status, stop, trail]
  );

  return (
    <TrackingContext.Provider value={value}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  const ctx = useContext(TrackingContext);
  if (!ctx) throw new Error("useTracking must be used within TrackingProvider");
  return ctx;
}

function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  // Haversine (approx), suficiente para decidir si añadimos punto.
  const R = 6371e3;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dPhi = toRad(lat2 - lat1);
  const dLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTracking } from "@/app/_components/tracking-provider";
import dynamic from "next/dynamic";
import { apiJson } from "@/lib/api";
import {
  clearTripSession,
  readTripSession,
  type TripSession,
  writeTripSession
} from "@/lib/trip-session";
import { readAuth } from "@/lib/auth";
import { useI18n } from "@/app/_components/i18n-provider";

const TripMapLazy = dynamic(
  () => import("@/app/_components/trip-map").then((m) => m.TripMap),
  { ssr: false }
);

type CreateTripResponse = {
  tripId: string;
  writeToken: string;
  shareUrl: string;
  readToken: string;
  username: string;
};

export function TripClient() {
  const { t } = useI18n();
  const { status, isWatching, isTrackingDesired, start, stop } = useTracking();
  const online = typeof navigator !== "undefined" ? navigator.onLine : true;
  const [session, setSession] = useState<TripSession | null>(null);
  const [creating, setCreating] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const canStart = useMemo(
    () => !isTrackingDesired || (status.kind !== "running" && !isWatching),
    [isTrackingDesired, isWatching, status.kind]
  );

  const startLabel = useMemo(() => {
    if (!isTrackingDesired) return t("tracking_start");
    if (status.kind === "running" && isWatching) return t("tracking_active");
    return t("tracking_resume");
  }, [isTrackingDesired, isWatching, status.kind, t]);

  useEffect(() => {
    const sync = () => setSession(readTripSession());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("bengala:trip-session", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("bengala:trip-session", sync);
    };
  }, []);

  const createShareLink = useCallback(async () => {
    setShareError(null);
    setCreating(true);
    try {
      const auth = readAuth();
      if (!auth?.accessToken) {
        setShareError("Inicia sesión para crear un viaje.");
        return;
      }
      const res = await apiJson<CreateTripResponse>("/api/trips", {
        method: "POST",
        headers: { authorization: `Bearer ${auth.accessToken}` }
      });
      const frontBase = window.location.origin.replace(/\/+$/, "");
      // Ahora compartimos por username (identificador del usuario).
      const username = (res.username || auth.username || "").trim();
      const frontShareUrl = username
        ? `${frontBase}/share/u/${encodeURIComponent(username)}`
        : `${frontBase}/share/${encodeURIComponent(res.readToken)}`;
      const next: TripSession = {
        tripId: res.tripId,
        writeToken: res.writeToken,
        // Compartimos la página del frontend (esta consultará al backend cada X segundos).
        shareUrl: frontShareUrl,
        readToken: res.readToken,
        createdAt: Date.now()
      };
      writeTripSession(next);
      setSession(next);
    } catch (e) {
      setShareError(e instanceof Error ? e.message : "Error creando enlace");
    } finally {
      setCreating(false);
    }
  }, []);

  const copyShareUrl = useCallback(async () => {
    if (!session?.shareUrl) return;
    setShareError(null);
    try {
      await navigator.clipboard.writeText(session.shareUrl);
    } catch {
      setShareError("No se pudo copiar el enlace en este dispositivo.");
    }
  }, [session]);

  const nativeShare = useCallback(async () => {
    if (!session?.shareUrl) return;
    setShareError(null);
    // Best-effort: iOS/Android suelen soportarlo.
    try {
      if (!("share" in navigator)) {
        await copyShareUrl();
        return;
      }
      await (navigator as any).share({
        title: "Bengala · Ubicación en tiempo real",
        text: "Enlace para ver mi ubicación y ruta.",
        url: session.shareUrl
      });
    } catch {
      // user cancel / not supported
    }
  }, [copyShareUrl, session]);

  const clearShare = useCallback(() => {
    clearTripSession();
    setSession(null);
  }, []);

  return (
    <main className="container">
      <section className="hero">
        <h1>{t("trip_title")}</h1>
        <div className="status-row" aria-label="Estado rápido">
          <span className={online ? "badge badge-ok" : "badge badge-warn"}>
            <span className="badge-dot" aria-hidden />
            {online ? t("connectivity") : t("no_connection")}
          </span>
          <span
            className={
              status.kind === "running"
                ? "badge badge-ok"
                : status.kind === "error"
                  ? "badge badge-danger"
                  : "badge"
            }
          >
            <span className="badge-dot" aria-hidden />
            {status.kind === "running" && isWatching
              ? t("tracking_active")
              : isTrackingDesired && (!isWatching || status.kind !== "running")
                ? t("resuming")
                : status.kind === "error"
                  ? t("gps_error")
                  : t("tracking_stopped")}
          </span>
        </div>
      </section>

      <div className="sos-fab" aria-label="Acceso rápido SOS">
        <Link href="/sos" aria-label="Botón rojo SOS">
          SOS
        </Link>
      </div>

      <section className="stack" aria-label="Controles y estado">
        <article className="card">
          <h3>{t("trip_map")}</h3>
          <p>{t("trip_map_body")}</p>
          <TripMapLazy />
        </article>

        <article className="card">
          <h3>{t("trip_share")}</h3>
          <p>{t("trip_share_body")}</p>
          <div className="actions" aria-label="Acciones de compartir">
            {!session ? (
              <button
                className="btn btn-primary"
                type="button"
                onClick={createShareLink}
                disabled={creating}
              >
                {creating ? t("creating_link") : t("create_link")}
              </button>
            ) : (
              <>
                <button className="btn btn-primary" type="button" onClick={nativeShare}>
                  {t("share")}
                </button>
                <button className="btn" type="button" onClick={copyShareUrl}>
                  {t("copy_link")}
                </button>
                <a className="btn" href={session.shareUrl} target="_blank" rel="noreferrer">
                  {t("open")}
                </a>
                <button className="btn" type="button" onClick={clearShare}>
                  {t("delete_link")}
                </button>
              </>
            )}
          </div>
          {session ? (
            <p className="fineprint">
              Enlace: <code>{session.shareUrl}</code>
            </p>
          ) : null}
          {shareError ? <p className="fineprint">{shareError}</p> : null}
        </article>

        <article className="card">
          <h3>{t("controls")}</h3>
          <div className="actions" aria-label="Controles">
            <button
              className="btn btn-primary"
              type="button"
              onClick={start}
              disabled={!canStart || (isTrackingDesired && status.kind === "running" && isWatching)}
            >
              {startLabel}
            </button>
            <button
              className="btn"
              type="button"
              onClick={stop}
              disabled={!isTrackingDesired}
            >
              {t("tracking_stop")}
            </button>
          </div>
        </article>

        <article className="card">
          <h3>{t("location")}</h3>
          <p>
            {status.kind === "idle" && t("ready_to_start")}
            {status.kind === "unsupported" &&
              t("geo_unsupported")}
            {status.kind === "error" && status.message}
            {status.kind === "running" &&
              `Lat: ${status.lat.toFixed(5)} · Lon: ${status.lon.toFixed(
                5
              )} · ±${Math.round(status.acc)}m`}
          </p>
        </article>

      </section>
    </main>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { apiJson } from "@/lib/api";
import { addToShareHistory } from "@/lib/share-history";
import { useI18n } from "@/app/_components/i18n-provider";

const ShareMapLazy = dynamic(
  () => import("@/app/share/[token]/share-map").then((m) => m.ShareMap),
  { ssr: false }
);

type LocationPoint = {
  lat: number;
  lon: number;
  acc?: number;
  ts: number;
};

type ShareUserResponse = {
  username: string;
  tripId: string;
  updatedAt: number;
  last: LocationPoint | null;
  trail: LocationPoint[];
};

export function ShareUserClient({ username }: { username: string }) {
  const { t } = useI18n();
  const u = useMemo(() => username.trim().toLowerCase(), [username]);
  const [data, setData] = useState<ShareUserResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const online = typeof navigator !== "undefined" ? navigator.onLine : true;

  const fetchShare = useCallback(async () => {
    try {
      const res = await apiJson<ShareUserResponse>(
        `/share/u/${encodeURIComponent(u)}`,
        { method: "GET" }
      );
      setData(res);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando ubicación");
    } finally {
      setLoading(false);
    }
  }, [u]);

  useEffect(() => {
    addToShareHistory(`u:${u}`);
    void fetchShare();
  }, [fetchShare, u]);

  useEffect(() => {
    const everyMs = 5_000;
    const id = window.setInterval(() => {
      if (!online) return;
      void fetchShare();
    }, everyMs);
    return () => window.clearInterval(id);
  }, [fetchShare, online]);

  const lastText = useMemo(() => {
    if (!data?.last) return "—";
    const d = new Date(data.last.ts);
    return `Lat: ${data.last.lat.toFixed(5)} · Lon: ${data.last.lon.toFixed(
      5
    )} · ${d.toLocaleString()}`;
  }, [data]);

  return (
    <main className="container">
      <section className="hero">
        <h1>
          {t("location_of")} <code>@{u}</code>
        </h1>
        <p>{t("auto_updates")}</p>
        <div className="hero-actions">
          <Link className="btn" href="/share">
            {t("change_user")}
          </Link>
          <button className="btn btn-primary" type="button" onClick={fetchShare}>
            {t("update")}
          </button>
        </div>
      </section>

      <section className="stack" aria-label="Tracking compartido">
        <article className="card">
          <h3>{t("map")}</h3>
          <p>{t("map_route_last")}</p>
          <ShareMapLazy
            viewKey={`bengala.share.mapview.u.${u}`}
            trail={data?.trail || []}
            current={data?.last ? { lat: data.last.lat, lon: data.last.lon } : null}
          />
        </article>

        <article className="card">
          <h3>{t("last_signal")}</h3>
          <p>{loading ? t("loading") : lastText}</p>
          <div className="status-row" aria-label="Estado">
            <span className={online ? "badge badge-ok" : "badge badge-warn"}>
              <span className="badge-dot" aria-hidden />
              {online ? t("connectivity") : t("no_connection")}
            </span>
            <span className={error ? "badge badge-danger" : "badge"}>
              <span className="badge-dot" aria-hidden />
              {error ? t("error_generic") : t("ok")}
            </span>
            <span className="badge">
              <span className="badge-dot" aria-hidden />
              {t("points")}: {data?.trail?.length ?? 0}
            </span>
          </div>
          {error ? <p className="fineprint">{error}</p> : null}
        </article>
      </section>
    </main>
  );
}

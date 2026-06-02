"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiJson } from "@/lib/api";
import dynamic from "next/dynamic";
import { addToShareHistory } from "@/lib/share-history";

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

type ShareResponse = {
  tripId: string;
  updatedAt: number;
  last: LocationPoint | null;
  trail: LocationPoint[];
};

export function ShareClient({ token }: { token: string }) {
  const [data, setData] = useState<ShareResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const online = typeof navigator !== "undefined" ? navigator.onLine : true;

  const fetchShare = useCallback(async () => {
    try {
      const res = await apiJson<ShareResponse>(`/share/${encodeURIComponent(token)}`, {
        method: "GET"
      });
      setData(res);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando ubicación");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    addToShareHistory(token);
    void fetchShare();
  }, [fetchShare, token]);

  useEffect(() => {
    // Polling simple para prototipo.
    const everyMs = 5_000;
    const id = window.setInterval(() => {
      if (!online) return;
      void fetchShare();
    }, everyMs);
    return () => window.clearInterval(id);
  }, [fetchShare, online]);

  const lastText = useMemo(() => {
    if (!data?.last) return "Sin datos aún.";
    const d = new Date(data.last.ts);
    return `Lat: ${data.last.lat.toFixed(5)} · Lon: ${data.last.lon.toFixed(
      5
    )} · ${d.toLocaleString()}`;
  }, [data]);

  return (
    <main className="container">
      <section className="hero">
        <h1>Ubicación compartida</h1>
        <p>
          Esta pantalla se actualiza automáticamente para mostrar la última
          ubicación y la ruta.
        </p>
        <div className="hero-actions">
          <Link className="btn" href="/">
            Inicio
          </Link>
          <button className="btn btn-primary" type="button" onClick={fetchShare}>
            Actualizar
          </button>
        </div>
      </section>

      <section className="stack" aria-label="Tracking compartido">
        <article className="card">
          <h3>Mapa</h3>
          <p>Ruta y última posición disponible.</p>
          <ShareMapLazy
            viewKey={`bengala.share.mapview.${token}`}
            trail={data?.trail || []}
            current={data?.last ? { lat: data.last.lat, lon: data.last.lon } : null}
          />
        </article>

        <article className="card">
          <h3>Última señal</h3>
          <p>{loading ? "Cargando…" : lastText}</p>
          <div className="status-row" aria-label="Estado">
            <span className={online ? "badge badge-ok" : "badge badge-warn"}>
              <span className="badge-dot" aria-hidden />
              {online ? "Conexión" : "Sin conexión"}
            </span>
            <span className={error ? "badge badge-danger" : "badge"}>
              <span className="badge-dot" aria-hidden />
              {error ? "Error" : "OK"}
            </span>
            <span className="badge">
              <span className="badge-dot" aria-hidden />
              Puntos: {data?.trail?.length ?? 0}
            </span>
          </div>
          {error ? <p className="fineprint">{error}</p> : null}
        </article>
      </section>
    </main>
  );
}

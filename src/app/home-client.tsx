"use client";

import Link from "next/link";
import { useI18n } from "@/app/_components/i18n-provider";

export function HomeClient() {
  const { t } = useI18n();

  return (
    <main className="container">
      <section className="hero">
        <h1>{t("home_title")}</h1>
        <p>{t("home_body")}</p>
        <div className="hero-actions">
          <Link className="btn btn-primary" href="/trip">
            {t("home_start_now")}
          </Link>
          <Link className="btn" href="/share">
            {t("home_open_tracking")}
          </Link>
          <Link className="btn" href="/info">
            {t("info_title")}
          </Link>
        </div>
      </section>

      <section className="grid" aria-label="Funciones">
        <article className="card">
          <h3>{t("feature_location")}</h3>
          <p>{t("feature_location_body")}</p>
        </article>
        <article className="card">
          <h3>{t("feature_offline")}</h3>
          <p>{t("feature_offline_body")}</p>
        </article>
        <article className="card">
          <h3>{t("feature_emergency")}</h3>
          <p>{t("feature_emergency_body")}</p>
        </article>
      </section>

      <p className="fineprint">
        PWA (MVP) → Capacitor (stores) → backend + seguridad.
      </p>
    </main>
  );
}

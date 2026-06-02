"use client";

import Link from "next/link";
import { useI18n } from "@/app/_components/i18n-provider";

export function Header() {
  const { locale, setLocale, t } = useI18n();
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Inicio Bengala">
          <span className="brand-mark" aria-hidden>
            🧭
          </span>
          <span className="brand-title">
            <strong>Bengala</strong>
            <span className="pill">{t("app_pwa")}</span>
          </span>
        </Link>

        <div className="header-actions" aria-label="Acciones">
          <select
            className="select"
            value={locale}
            onChange={(e) => setLocale(e.target.value === "en" ? "en" : "es")}
            aria-label="Idioma"
          >
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
          <Link className="pill" href="/trip">
            {t("start")}
          </Link>
        </div>
      </div>
    </header>
  );
}

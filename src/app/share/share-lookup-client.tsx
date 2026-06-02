"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiJson } from "@/lib/api";
import { useI18n } from "@/app/_components/i18n-provider";
import {
  addToShareHistory,
  clearShareHistory,
  formatTokenShort,
  getShareHistory,
  removeFromShareHistory,
  type ShareHistoryItem
} from "@/lib/share-history";

function extractToken(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  // Allow @username and u:username
  if (raw.startsWith("@")) {
    const u = raw.slice(1).trim();
    return u ? `u:${u}` : null;
  }
  if (raw.toLowerCase().startsWith("u:")) {
    const u = raw.slice(2).trim();
    return u ? `u:${u}` : null;
  }

  // If user pasted a full URL, try to parse /share/<token> or ?token=
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const url = new URL(raw);
      const qpToken = url.searchParams.get("token");
      if (qpToken) return qpToken.trim() || null;

      const parts = url.pathname.split("/").filter(Boolean);
      const shareIndex = parts.findIndex((p) => p === "share");
      if (shareIndex >= 0 && parts[shareIndex + 1]) {
        // support /share/u/<username>
        if (parts[shareIndex + 1] === "u" && parts[shareIndex + 2]) {
          return `u:${decodeURIComponent(parts[shareIndex + 2]!)}`;
        }
        return decodeURIComponent(parts[shareIndex + 1]!);
      }
    } catch {
      // fallthrough
    }
  }

  // If it's a valid username, treat as username (no @ needed)
  const normalized = raw.toLowerCase();
  if (/^[a-z0-9_]{3,20}$/.test(normalized)) return `u:${normalized}`;

  // Otherwise treat as token
  return raw;
}

export function ShareLookupClient() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ShareHistoryItem[]>([]);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const sync = () => setHistory(getShareHistory());
    sync();
    window.addEventListener("bengala:share-history", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("bengala:share-history", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const go = async () => {
    const token = extractToken(value);
    if (!token) {
      setError(t("lookup_body"));
      return;
    }
    setError(null);

    // Validar antes de navegar: si el usuario/token no existe, mostramos error.
    setChecking(true);
    try {
      if (token.startsWith("u:")) {
        const u = token.slice(2).trim().toLowerCase();
        await apiJson(`/share/u/${encodeURIComponent(u)}`, { method: "GET" });
        addToShareHistory(`u:${u}`);
        router.push(`/share/u/${encodeURIComponent(u)}`);
      } else {
        // Token de lectura legacy
        await apiJson(`/share/${encodeURIComponent(token)}`, { method: "GET" });
        addToShareHistory(token);
        router.push(`/share/${encodeURIComponent(token)}`);
      }
    } catch {
      setError(t("not_found"));
    } finally {
      setChecking(false);
    }
  };

  return (
    <main className="container">
      <section className="hero">
        <h1>{t("tracking_shared")}</h1>
        <p>
          {t("lookup_body")}
        </p>
      </section>

      <section className="stack" aria-label="Abrir tracking compartido">
        <article className="card">
          <h3>{t("open_by_token")}</h3>
          <p>{t("token_help")}</p>
          <div className="actions" aria-label="Entrada token">
            <input
              className="input"
              type="text"
              inputMode="text"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder={t("lookup_body")}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <button className="btn btn-primary" type="button" onClick={go}>
              {checking ? t("checking") : t("open_btn")}
            </button>
          </div>
          {error ? <p className="fineprint">{error}</p> : null}
        </article>

        <article className="card">
          <h3>{t("history")}</h3>
          <p>{t("history_body")}</p>
          {history.length ? (
            <div className="list" aria-label="Historial de tokens">
              {history.map((item) => {
                const when = new Date(item.lastOpenedAt).toLocaleString();
                const isUser = item.token.startsWith("u:");
                const href = isUser
                  ? `/share/u/${encodeURIComponent(item.token.slice(2))}`
                  : `/share/${encodeURIComponent(item.token)}`;
                return (
                  <div key={item.token} className="list-row">
                    <div className="list-main">
                      <div className="list-title">
                        <code>
                          {isUser
                            ? `@${item.token.slice(2)}`
                            : formatTokenShort(item.token)}
                        </code>
                      </div>
                      <div className="list-sub">{when}</div>
                    </div>
                    <div className="list-actions">
                      <Link className="btn" href={href}>
                        {t("open_btn")}
                      </Link>
                      <button
                        className="btn"
                        type="button"
                        onClick={() => removeFromShareHistory(item.token)}
                      >
                        {t("remove")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="fineprint">—</p>
          )}

          {history.length ? (
            <div className="actions" aria-label="Acciones historial">
              <button className="btn" type="button" onClick={clearShareHistory}>
                {t("clear_history")}
              </button>
            </div>
          ) : null}
        </article>
      </section>
    </main>
  );
}

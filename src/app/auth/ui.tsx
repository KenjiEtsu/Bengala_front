"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiJson } from "@/lib/api";
import { clearAuth, readAuth, writeAuth } from "@/lib/auth";
import { useI18n } from "@/app/_components/i18n-provider";

type LoginResponse = {
  ok: boolean;
  accessToken: string;
  user: { id: string; email: string; username: string };
};

type DocumentItem = {
  id: string;
  name: string;
  mime: string;
  size: number;
  sha256: string;
  createdAt: number;
};

export function AuthClient() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [auth, setAuth] = useState(() => (typeof window === "undefined" ? null : readAuth()));
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [docsBusy, setDocsBusy] = useState(false);

  useEffect(() => {
    const sync = () => setAuth(readAuth());
    window.addEventListener("bengala:auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("bengala:auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const canSubmit = useMemo(
    () => email.trim().includes("@") && password.length >= 10,
    [email, password]
  );

  const usernameNormalized = useMemo(
    () => username.trim().toLowerCase(),
    [username]
  );

  const usernameValid = useMemo(
    () => /^[a-z0-9_]{3,20}$/.test(usernameNormalized),
    [usernameNormalized]
  );

  const canRegister = useMemo(
    () => canSubmit && usernameValid,
    [canSubmit, usernameValid]
  );

  const register = async () => {
    setError(null);
    setBusy(true);
    try {
      await apiJson("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, username, password })
      });
      await login();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error registrando");
    } finally {
      setBusy(false);
    }
  };

  const login = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await apiJson<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      writeAuth({
        accessToken: res.accessToken,
        email: res.user.email,
        username: res.user.username,
        userId: res.user.id
      });
      setAuth(readAuth());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error login");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    setError(null);
    setBusy(true);
    try {
      await apiJson("/api/auth/logout", { method: "POST", body: JSON.stringify({}) });
    } catch {
      // ignore
    } finally {
      clearAuth();
      setAuth(null);
      setBusy(false);
    }
  };

  const loadDocs = async (token: string) => {
    setDocsError(null);
    try {
      const res = await apiJson<{ ok: boolean; documents: DocumentItem[] }>(
        "/api/documents",
        { method: "GET", headers: { authorization: `Bearer ${token}` } }
      );
      setDocs(res.documents || []);
    } catch (e) {
      setDocsError(e instanceof Error ? e.message : "Error cargando documentos");
    }
  };

  useEffect(() => {
    if (!auth?.accessToken) return;
    void loadDocs(auth.accessToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.accessToken]);

  const uploadDoc = async (file: File) => {
    if (!auth?.accessToken) return;
    setDocsBusy(true);
    setDocsError(null);
    try {
      const fd = new FormData();
      fd.append("file", file, file.name);
      const base = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001").replace(/\/+$/, "");
      const r = await fetch(`${base}/api/documents`, {
        method: "POST",
        credentials: "include",
        headers: { authorization: `Bearer ${auth.accessToken}` },
        body: fd
      });
      if (!r.ok) {
        const ct = r.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const j = await r.json().catch(() => null);
          throw new Error(`API ${r.status}: ${JSON.stringify(j)}`);
        }
        throw new Error(`API ${r.status}: ${await r.text().catch(() => r.statusText)}`);
      }
      await loadDocs(auth.accessToken);
    } catch (e) {
      setDocsError(e instanceof Error ? e.message : "Error subiendo documento");
    } finally {
      setDocsBusy(false);
    }
  };

  const downloadDoc = async (docId: string) => {
    if (!auth?.accessToken) return;
    setDocsError(null);
    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001").replace(
        /\/+$/,
        ""
      );
      const url = `${base}/api/documents/${encodeURIComponent(docId)}`;

      const r = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: { authorization: `Bearer ${auth.accessToken}` }
      });

      if (!r.ok) {
        const ct = r.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const j = await r.json().catch(() => null);
          throw new Error(`API ${r.status}: ${JSON.stringify(j)}`);
        }
        throw new Error(`API ${r.status}: ${await r.text().catch(() => r.statusText)}`);
      }

      const blob = await r.blob();
      const disposition = r.headers.get("content-disposition") || "";
      const nameMatch = /filename="([^"]+)"/.exec(disposition);
      const filename = nameMatch?.[1] || `documento-${docId}`;

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      setDocsError(e instanceof Error ? e.message : "No se pudo descargar el documento.");
    }
  };

  const deleteDoc = async (docId: string) => {
    if (!auth?.accessToken) return;
    setDocsBusy(true);
    setDocsError(null);
    try {
      await apiJson(`/api/documents/${encodeURIComponent(docId)}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${auth.accessToken}` }
      });
      await loadDocs(auth.accessToken);
    } catch (e) {
      setDocsError(e instanceof Error ? e.message : "Error borrando documento");
    } finally {
      setDocsBusy(false);
    }
  };

  return (
    <main className="container">
      <section className="hero">
        <h1>{t("account_title")}</h1>
        <p>{t("account_body")}</p>
        <div className="hero-actions">
          <Link className="btn" href="/trip">
            {t("go_trip")}
          </Link>
        </div>
      </section>

      <section className="stack" aria-label="Autenticación">
        {auth ? (
          <article className="card">
            <h3>{t("logged_in")}</h3>
            <p>
              {auth.email} · <code>@{auth.username}</code>
            </p>
            <div className="actions">
              <button className="btn" type="button" onClick={logout} disabled={busy}>
                {t("logout")}
              </button>
            </div>
          </article>
        ) : (
          <article className="card">
            <h3>{t("access")}</h3>
            <p>
              {t("pwd_hint")}
            </p>
            <div className="actions">
              <input
                className="input"
                placeholder={t("email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="input"
                placeholder={t("username")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
              <input
                className="input"
                placeholder={t("password")}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="btn btn-primary" type="button" onClick={login} disabled={!canSubmit || busy}>
                {busy ? t("processing") : t("login")}
              </button>
              <button className="btn" type="button" onClick={register} disabled={!canRegister || busy}>
                {busy ? t("processing") : t("register")}
              </button>
            </div>
            {!usernameNormalized ? (
              <p className="fineprint">{t("pick_username")}</p>
            ) : !usernameValid ? (
              <p className="fineprint">{t("bad_username")}</p>
            ) : null}
            {error ? <p className="fineprint">{error}</p> : null}
          </article>
        )}

        {auth ? (
          <article className="card">
            <h3>{t("documents")}</h3>
            <p>{t("docs_body")}</p>
            <div className="actions" aria-label="Subir documentación">
              <input
                className="input"
                type="file"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadDoc(f);
                  e.currentTarget.value = "";
                }}
                disabled={docsBusy}
              />
              <button
                className="btn"
                type="button"
                onClick={() => auth?.accessToken && loadDocs(auth.accessToken)}
                disabled={docsBusy}
              >
                {t("refresh_list")}
              </button>
            </div>

            {docsError ? <p className="fineprint">{docsError}</p> : null}

            {docs.length ? (
              <div className="list" aria-label="Lista de documentos">
                {docs.map((d) => (
                  <div key={d.id} className="list-row">
                    <div className="list-main">
                      <div className="list-title">
                        <code>{d.name}</code>
                      </div>
                      <div className="list-sub">
                        {Math.round(d.size / 1024)} KB ·{" "}
                        {new Date(d.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="list-actions">
                      <button className="btn" type="button" onClick={() => void downloadDoc(d.id)}>
                        {t("download")}
                      </button>
                      <button
                        className="btn"
                        type="button"
                        onClick={() => void deleteDoc(d.id)}
                        disabled={docsBusy}
                      >
                        {t("delete")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="fineprint">{t("no_docs")}</p>
            )}
          </article>
        ) : null}
      </section>
    </main>
  );
}

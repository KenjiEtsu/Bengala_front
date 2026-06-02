"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  DESTINATIONS,
  DESTINATION_SECTIONS_EN,
  DESTINATION_SECTIONS_ES,
  type DestinationNode
} from "@/lib/destinations";
import { useI18n } from "@/app/_components/i18n-provider";

const STORAGE_KEY = "bengala.info.selected.v1";

function findPath(root: DestinationNode[], id: string): DestinationNode[] {
  const stack: DestinationNode[] = [];

  const dfs = (nodes: DestinationNode[]): boolean => {
    for (const n of nodes) {
      stack.push(n);
      if (n.id === id) return true;
      if (n.children && dfs(n.children)) return true;
      stack.pop();
    }
    return false;
  };

  if (!id) return [];
  return dfs(root) ? [...stack] : [];
}

function flatten(nodes: DestinationNode[]): DestinationNode[] {
  const out: DestinationNode[] = [];
  const walk = (xs: DestinationNode[]) => {
    for (const n of xs) {
      out.push(n);
      if (n.children?.length) walk(n.children);
    }
  };
  walk(nodes);
  return out;
}

export function InfoClient() {
  const { t, locale } = useI18n();
  const [selectedId, setSelectedId] = useState<string>("es");
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setSelectedId(stored);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, selectedId);
    } catch {
      // ignore
    }
  }, [selectedId]);

  const path = useMemo(() => findPath(DESTINATIONS, selectedId), [selectedId]);
  const selected = path[path.length - 1] || null;
  const children = selected?.children || [];

  const allNodes = useMemo(() => flatten(DESTINATIONS), []);
  const matches = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    if (!q) return [];
    return allNodes
      .filter((n) => n.name.toLocaleLowerCase().includes(q))
      .slice(0, 10);
  }, [allNodes, query]);

  const sectionLabels = useMemo(() => {
    return locale === "en" ? DESTINATION_SECTIONS_EN : DESTINATION_SECTIONS_ES;
  }, [locale]);

  return (
    <main className="container">
      <section className="hero">
        <h1>{t("info_title")}</h1>
        <p>{t("info_body")}</p>
        <div className="hero-actions">
          <Link className="btn" href="/">
            {t("nav_home")}
          </Link>
        </div>
      </section>

      <section className="stack" aria-label={t("info_aria_map")}>
        <article className="card">
          <h3>{t("info_breadcrumbs")}</h3>
          <p className="fineprint">
            {path.length ? (
              path.map((p, idx) => (
                <span key={p.id}>
                  <button
                    className="linklike"
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                  >
                    {p.name}
                  </button>
                  {idx < path.length - 1 ? " → " : ""}
                </span>
              ))
            ) : (
              "—"
            )}
          </p>

          <div className="actions" aria-label={t("info_select")}>
            <input
              className="input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("info_search_placeholder")}
              inputMode="search"
            />
          </div>

          {matches.length ? (
            <div className="actions" aria-label={t("info_search_results")}>
              {matches.map((m) => (
                <button
                  key={m.id}
                  className="btn"
                  type="button"
                  onClick={() => {
                    setSelectedId(m.id);
                    setQuery("");
                  }}
                >
                  {m.name}
                </button>
              ))}
            </div>
          ) : null}
        </article>

        <article className="card">
          <h3>
            {t("info_destination")}: <code>{selected ? selected.name : "—"}</code>
          </h3>
          <p>{t("info_placeholder")}</p>
          <div className="list" aria-label={t("info_aria_sections")}>
            {Object.entries(sectionLabels).map(([key, label]) => (
              <div key={key} className="list-row">
                <div className="list-main">
                  <div className="list-title">{label}</div>
                  <div className="list-sub">{t("info_todo")}</div>
                </div>
              </div>
            ))}
          </div>
        </article>

        {children.length ? (
          <article className="card">
            <h3>{t("info_children")}</h3>
            <div className="actions" aria-label={t("info_aria_children")}>
              {children.map((c) => (
                <button
                  key={c.id}
                  className="btn"
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </article>
        ) : path.length > 1 ? (
          <article className="card">
            <h3>{t("info_navigation")}</h3>
            <div className="actions">
              <button
                className="btn"
                type="button"
                onClick={() => setSelectedId(path[path.length - 2]!.id)}
              >
                {t("info_back")}
              </button>
            </div>
          </article>
        ) : null}
      </section>
    </main>
  );
}


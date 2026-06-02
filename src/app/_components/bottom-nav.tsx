"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/app/_components/i18n-provider";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const items = [
    { href: "/", label: t("nav_home"), icon: "⌂" },
    { href: "/trip", label: t("nav_trip"), icon: "📍" },
    { href: "/share", label: t("nav_tracking"), icon: "🗺️" },
    { href: "/info", label: t("nav_info"), icon: "ℹ️" },
    { href: "/auth", label: t("nav_account"), icon: "👤" }
  ] as const;

  return (
    <nav className="bottom-nav" aria-label={t("nav_aria")}>
      <div className="bottom-nav-inner">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const className = active ? "nav-item nav-item-active" : "nav-item";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={className}
              aria-current={active ? "page" : undefined}
            >
              <strong aria-hidden>{item.icon}</strong>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


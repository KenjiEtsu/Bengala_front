import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SWRegister } from "@/app/_components/sw-register";
import { BottomNav } from "@/app/_components/bottom-nav";
import { Header } from "@/app/_components/header";
import { TrackingProvider } from "@/app/_components/tracking-provider";
import { I18nProvider } from "@/app/_components/i18n-provider";

export const metadata: Metadata = {
  title: "Bengala",
  description:
    "Bengala: señal de auxilio y acompañamiento para personas migrantes durante su viaje.",
  applicationName: "Bengala",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bengala"
  },
  formatDetection: {
    telephone: false
  },
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#0b1020"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <I18nProvider>
          <Header />
          <SWRegister />
          <TrackingProvider>
            <div className="app">
              <div className="app-main">{children}</div>
              <BottomNav />
            </div>
          </TrackingProvider>
        </I18nProvider>
      </body>
    </html>
  );
}

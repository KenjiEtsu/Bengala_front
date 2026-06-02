"use client";

import { useEffect } from "react";

export function SWRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const onLoad = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch {
        // Silent fail for prototype.
      }
    };

    window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}


"use client";

import { useMemo } from "react";
import Link from "next/link";

export default function SosPage() {
  const telHref = useMemo(() => {
    // 112 es estándar UE; si se despliega fuera, se parametrizará por país/idioma.
    return "tel:112";
  }, []);

  return (
    <main className="container">
      <section className="hero">
        <h1>Botón rojo (demo)</h1>
        <p>
          En PWA, sin red no podemos “forzar” envío de datos. La vía más fiable
          es intentar una llamada de emergencia.
        </p>
        <div className="hero-actions">
          <a className="btn btn-danger" href={telHref}>
            Llamar a emergencias (112)
          </a>
          <Link className="btn" href="/trip">
            Volver al viaje
          </Link>
        </div>
      </section>

      <p className="fineprint">
        Para el comportamiento “intentará conectarse a cualquier red disponible”
        de forma consistente, la ruta recomendada es empaquetar la app con
        Capacitor y usar APIs nativas cuando aplique (según plataforma/operador).
      </p>
    </main>
  );
}

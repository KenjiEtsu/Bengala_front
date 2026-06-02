export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <main className="container">
      <section className="hero">
        <h1>Sin conexión</h1>
        <p>
          La app seguirá guardando información localmente y sincronizará cuando
          vuelva la conexión.
        </p>
      </section>
      <section className="grid" aria-label="Recomendaciones">
        <article className="card">
          <h3>Activa el GPS</h3>
          <p>Si tu dispositivo lo permite, mantén la ubicación activada.</p>
        </article>
        <article className="card">
          <h3>Comprueba cobertura</h3>
          <p>En mar abierto puede haber zonas sin señal durante periodos largos.</p>
        </article>
        <article className="card">
          <h3>Emergencia</h3>
          <p>
            Si hay peligro inminente, intenta llamar a emergencias (112) cuando
            sea posible.
          </p>
        </article>
      </section>
    </main>
  );
}

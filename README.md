# Bengala PWA (prototipo)

Prototipo **PWA mobile-first** de Bengala (Superacció). Este repositorio contiene solo el **frontend** (Next.js). El backend se añadirá después.

## Requisitos

- Node.js 20+ (recomendado 22+)
- Un gestor de paquetes: `npm`, `pnpm` o `yarn`

## Arranque

```bash
cd bengala-pwa
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Error: "Only secure origins are allowed"

Algunas APIs (geolocalización, service worker/PWA) requieren **contexto seguro**:

- ✅ `http://localhost:3000` (en el mismo ordenador)
- ✅ `https://...` con **certificado válido y confiable** (recomendado para probar en móvil)
- ❌ `http://<IP-LAN>:3000` desde el móvil suele fallar con ese mensaje

Opciones para probar en móvil:
- Desplegar un preview (p.ej. Vercel) y probar por HTTPS.
- Usar un túnel HTTPS (ngrok/Cloudflare Tunnel).
- Como atajo local, `next dev --experimental-https` genera certificado *self-signed* (puede seguir sin considerarse “seguro” si el dispositivo no confía en el certificado).

## PWA

- Manifest: `src/app/manifest.ts`
- Service Worker: `public/sw.js`
- Registro del SW: `src/app/_components/sw-register.tsx`

Notas:
- iOS/Safari limita mucho el trabajo en background (tracking y sync). Para la fase “stores”, la ruta recomendada es empaquetar con Capacitor.

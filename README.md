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

## Cambiar el backend

El frontend lee la URL del backend desde `NEXT_PUBLIC_API_BASE`.

En local crea un archivo `.env.local` en `bengala-pwa` con:

```env
NEXT_PUBLIC_API_BASE=http://localhost:3001
```

Para Render o cualquier despliegue, cambia ese valor por la URL publica del backend:

```env
NEXT_PUBLIC_API_BASE=https://tu-backend.onrender.com
```

Ese valor lo usan todas las llamadas API del frontend, por ejemplo `src/lib/api.ts` y la pantalla de cuenta para subir o descargar documentos.

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

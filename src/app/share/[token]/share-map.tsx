"use client";

import { useEffect, useMemo, useRef } from "react";

type Point = { lat: number; lon: number };
type TrailPoint = Point & { ts?: number; acc?: number };

export function ShareMap({
  viewKey,
  trail,
  current
}: {
  viewKey: string;
  trail: TrailPoint[];
  current: Point | null;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const didFitRef = useRef(false);
  const userInteractedRef = useRef(false);
  const isRestoringRef = useRef(false);

  const center = useMemo(() => {
    if (current) return [current.lat, current.lon] as const;
    if (trail.length) return [trail[trail.length - 1]!.lat, trail[trail.length - 1]!.lon] as const;
    return [41.3874, 2.1686] as const;
  }, [current, trail]);

  const polyline = useMemo(
    () => trail.map((p) => [p.lat, p.lon] as const),
    [trail]
  );

  useEffect(() => {
    let cancelled = false;

    const mount = async () => {
      if (!containerRef.current) return;
      if (mapRef.current) return;

      const L = await import("leaflet");
      if (cancelled) return;

      leafletRef.current = L;
      const map = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: true
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      // Restore view
      let restored = false;
      try {
        const raw = localStorage.getItem(viewKey);
        if (raw) {
          const parsed = JSON.parse(raw) as { lat: number; lon: number; zoom: number };
          if (
            Number.isFinite(parsed.lat) &&
            Number.isFinite(parsed.lon) &&
            Number.isFinite(parsed.zoom)
          ) {
            isRestoringRef.current = true;
            map.setView([parsed.lat, parsed.lon] as any, parsed.zoom);
            restored = true;
            didFitRef.current = true;
            userInteractedRef.current = true;
          }
        }
      } catch {
        // ignore
      } finally {
        isRestoringRef.current = false;
      }

      if (!restored) map.setView(center as any, 12);

      const persistView = () => {
        if (isRestoringRef.current) return;
        try {
          const c = map.getCenter();
          const z = map.getZoom();
          localStorage.setItem(viewKey, JSON.stringify({ lat: c.lat, lon: c.lng, zoom: z }));
        } catch {
          // ignore
        }
      };

      const onUserInteract = () => {
        userInteractedRef.current = true;
      };

      map.on("movestart", onUserInteract);
      map.on("zoomstart", onUserInteract);
      map.on("moveend", persistView);
      map.on("zoomend", persistView);

      mapRef.current = map;
    };

    void mount();

    return () => {
      cancelled = true;
      try {
        mapRef.current?.remove?.();
      } catch {
        // ignore
      } finally {
        mapRef.current = null;
        polylineRef.current = null;
        markerRef.current = null;
        leafletRef.current = null;
        didFitRef.current = false;
        userInteractedRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewKey]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    if (polyline.length >= 2) {
      if (!polylineRef.current) {
        polylineRef.current = L.polyline(polyline as any, {
          color: "#111827",
          weight: 4,
          opacity: 0.9
        }).addTo(map);
      } else {
        polylineRef.current.setLatLngs(polyline as any);
      }

      if (!didFitRef.current && !userInteractedRef.current) {
        try {
          map.fitBounds(polylineRef.current.getBounds(), { padding: [18, 18] });
          didFitRef.current = true;
        } catch {
          // ignore
        }
      }
    } else if (polylineRef.current) {
      try {
        map.removeLayer(polylineRef.current);
      } catch {
        // ignore
      } finally {
        polylineRef.current = null;
        didFitRef.current = false;
      }
    }

    if (current) {
      const latlng = [current.lat, current.lon] as const;
      if (!markerRef.current) {
        markerRef.current = L.circleMarker(latlng as any, {
          radius: 7,
          color: "#ff3b30",
          weight: 2,
          fillOpacity: 0.9
        }).addTo(map);
      } else {
        markerRef.current.setLatLng(latlng as any);
      }
    } else if (markerRef.current) {
      try {
        map.removeLayer(markerRef.current);
      } catch {
        // ignore
      } finally {
        markerRef.current = null;
      }
    }

    if (!didFitRef.current && !userInteractedRef.current) {
      map.setView(center as any, 12);
    }
  }, [center, current, polyline]);

  return (
    <div className="map-wrap" role="region" aria-label="Mapa compartido">
      <div ref={containerRef} className="map" />
    </div>
  );
}


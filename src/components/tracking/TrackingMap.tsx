"use client";

import { loadGoogleMaps, type LatLng } from "@/lib/google-maps";
import { MORELIA_CENTER } from "@/lib/envio-labels";
import { useEffect, useRef } from "react";

type Props = {
  destino: LatLng;
  repartidor: LatLng | null;
  className?: string;
};

export default function TrackingMap({ destino, repartidor, className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const destinoMarkerRef = useRef<google.maps.Marker | null>(null);
  const repartidorMarkerRef = useRef<google.maps.Marker | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!containerRef.current) return;
      await loadGoogleMaps();
      if (cancelled || !containerRef.current) return;

      const center = repartidor ?? destino ?? MORELIA_CENTER;
      const map = new google.maps.Map(containerRef.current, {
        center,
        zoom: 14,
        disableDefaultUI: false,
        gestureHandling: "greedy",
      });
      mapRef.current = map;

      destinoMarkerRef.current = new google.maps.Marker({
        map,
        position: destino,
        title: "Destino",
        label: { text: "D", color: "#ffffff", fontWeight: "700" },
      });

      if (repartidor) {
        repartidorMarkerRef.current = new google.maps.Marker({
          map,
          position: repartidor,
          title: "Repartidor",
          label: { text: "R", color: "#ffffff", fontWeight: "700" },
        });
        polylineRef.current = new google.maps.Polyline({
          path: [repartidor, destino],
          geodesic: true,
          strokeColor: "#0066FF",
          strokeOpacity: 0.9,
          strokeWeight: 4,
          map,
        });
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(repartidor);
        bounds.extend(destino);
        map.fitBounds(bounds, 64);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (repartidorMarkerRef.current) {
      repartidorMarkerRef.current.setPosition(repartidor);
    } else if (repartidor) {
      repartidorMarkerRef.current = new google.maps.Marker({
        map,
        position: repartidor,
        title: "Repartidor",
        label: { text: "R", color: "#ffffff", fontWeight: "700" },
      });
    }

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (repartidor) {
      polylineRef.current = new google.maps.Polyline({
        path: [repartidor, destino],
        geodesic: true,
        strokeColor: "#0066FF",
        strokeOpacity: 0.9,
        strokeWeight: 4,
        map,
      });
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(repartidor);
      bounds.extend(destino);
      map.fitBounds(bounds, 64);
    }
  }, [destino, repartidor]);

  return (
    <div
      ref={containerRef}
      className={`h-full min-h-[280px] w-full bg-slate-200 ${className}`}
      aria-label="Mapa de seguimiento"
    />
  );
}

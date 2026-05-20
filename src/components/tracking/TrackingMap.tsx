"use client";

import { loadGoogleMaps, type LatLng } from "@/lib/google-maps";
import { MARKER_DESTINO, MARKER_REPARTIDOR } from "@/lib/map-markers";
import { MORELIA_CENTER } from "@/lib/envio-labels";
import { useEffect, useRef } from "react";

type Props = {
  destino: LatLng;
  repartidor: LatLng | null;
  className?: string;
  /** Vista compacta para filas del admin */
  mini?: boolean;
  interactive?: boolean;
  repartidorPulsando?: boolean;
};

function makeMarker(
  map: google.maps.Map,
  position: LatLng,
  iconUrl: string,
  title: string,
  zIndex: number,
): google.maps.Marker {
  return new google.maps.Marker({
    map,
    position,
    title,
    zIndex,
    icon: {
      url: iconUrl,
      scaledSize: new google.maps.Size(44, 44),
      anchor: new google.maps.Point(22, 22),
    },
  });
}

export default function TrackingMap({
  destino,
  repartidor,
  className = "",
  mini = false,
  interactive = true,
  repartidorPulsando = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const destinoMarkerRef = useRef<google.maps.Marker | null>(null);
  const repartidorMarkerRef = useRef<google.maps.Marker | null>(null);
  const pulseMarkerRef = useRef<google.maps.Marker | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!containerRef.current) return;
      await loadGoogleMaps();
      if (cancelled || !containerRef.current) return;

      const center = repartidor ?? destino ?? MORELIA_CENTER;
      const map = new google.maps.Map(containerRef.current, {
        center,
        zoom: mini ? 13 : 14,
        disableDefaultUI: mini,
        gestureHandling: interactive ? "greedy" : "none",
        zoomControl: !mini,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: !mini,
        clickableIcons: false,
      });
      mapRef.current = map;

      destinoMarkerRef.current = makeMarker(map, destino, MARKER_DESTINO, "Destino", 2);

      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#0066FF",
          strokeOpacity: 0.85,
          strokeWeight: mini ? 3 : 5,
        },
      });
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [mini, interactive]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    destinoMarkerRef.current?.setPosition(destino);

    if (repartidor) {
      if (!repartidorMarkerRef.current) {
        repartidorMarkerRef.current = makeMarker(
          map,
          repartidor,
          MARKER_REPARTIDOR,
          "Repartidor",
          3,
        );
        pulseMarkerRef.current = new google.maps.Marker({
          map,
          position: repartidor,
          zIndex: 2,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: repartidorPulsando ? (mini ? 22 : 28) : mini ? 14 : 18,
            fillColor: repartidorPulsando ? "#f59e0b" : "#0066FF",
            fillOpacity: repartidorPulsando ? 0.35 : 0.2,
            strokeColor: repartidorPulsando ? "#f59e0b" : "#0066FF",
            strokeOpacity: repartidorPulsando ? 0.7 : 0.45,
            strokeWeight: repartidorPulsando ? 3 : 2,
          },
        });
      } else {
        repartidorMarkerRef.current.setPosition(repartidor);
        pulseMarkerRef.current?.setPosition(repartidor);
      }

      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: repartidor,
          destination: destino,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRendererRef.current?.setDirections(result);
          } else {
            directionsRendererRef.current?.setMap(null);
            new google.maps.Polyline({
              path: [repartidor, destino],
              geodesic: true,
              strokeColor: "#0066FF",
              strokeOpacity: 0.85,
              strokeWeight: mini ? 3 : 5,
              map,
            });
          }
        },
      );

      const bounds = new google.maps.LatLngBounds();
      bounds.extend(repartidor);
      bounds.extend(destino);
      map.fitBounds(bounds, mini ? 24 : 72);
    } else {
      repartidorMarkerRef.current?.setMap(null);
      repartidorMarkerRef.current = null;
      pulseMarkerRef.current?.setMap(null);
      pulseMarkerRef.current = null;
      directionsRendererRef.current?.setMap(null);
      map.setCenter(destino);
      map.setZoom(mini ? 13 : 14);
    }
  }, [destino, repartidor, mini, repartidorPulsando]);

  return (
    <div
      ref={containerRef}
      className={`h-full w-full bg-slate-100 ${mini ? "min-h-[120px]" : "min-h-[280px]"} ${className}`}
      aria-label="Mapa de seguimiento"
    />
  );
}

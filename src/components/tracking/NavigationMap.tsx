"use client";

import { loadGoogleMaps, type LatLng } from "@/lib/google-maps";
import { bikeMarkerIcon, destinoMarkerIcon, repartidorMarkerIcon } from "@/lib/map-markers";
import {
  bearingDegrees,
  cleanInstruction,
  distanceMeters,
  formatDistance,
  formatDuration,
  type NavigationStats,
  type RouteStepInfo,
} from "@/lib/tracking-navigation";
import { useEffect, useMemo, useRef } from "react";

type Props = {
  current: LatLng | null;
  destination: LatLng;
  className?: string;
  marker: "navigation" | "bike";
  interactive?: boolean;
  followCurrent?: boolean;
  voiceEnabled?: boolean;
  speedKmh?: number;
  onStats?: (stats: NavigationStats | null) => void;
};

function toLatLngLiteral(latLng: google.maps.LatLng): LatLng {
  return { lat: latLng.lat(), lng: latLng.lng() };
}

function nearestPathDistanceMeters(point: LatLng, path: google.maps.LatLng[]): number {
  if (path.length === 0) return Infinity;
  return path.reduce((min, p) => Math.min(min, distanceMeters(point, toLatLngLiteral(p))), Infinity);
}

function routeStatsFromResult(result: google.maps.DirectionsResult, speedKmh: number): NavigationStats {
  const leg = result.routes[0]?.legs[0];
  const step = leg?.steps[0];
  const currentStep: RouteStepInfo | undefined = step
    ? {
        instruction: cleanInstruction(step.instructions),
        distanceText: step.distance?.text ?? formatDistance(step.distance?.value ?? 0),
        durationText: step.duration?.text ?? formatDuration(step.duration?.value ?? 0),
        distanceValue: step.distance?.value ?? 0,
        durationValue: step.duration?.value ?? 0,
        maneuver: step.maneuver,
      }
    : undefined;

  return {
    distanceText: leg?.distance?.text ?? formatDistance(0),
    durationText: leg?.duration?.text ?? formatDuration(0),
    distanceValue: leg?.distance?.value ?? 0,
    durationValue: leg?.duration?.value ?? 0,
    speedKmh,
    currentStep,
  };
}

export default function NavigationMap({
  current,
  destination,
  className = "",
  marker,
  interactive = true,
  followCurrent = false,
  voiceEnabled = false,
  speedKmh = 0,
  onStats,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const currentMarkerRef = useRef<google.maps.Marker | null>(null);
  const destinationMarkerRef = useRef<google.maps.Marker | null>(null);
  const pulseMarkerRefs = useRef<google.maps.Marker[]>([]);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const routePathRef = useRef<google.maps.LatLng[]>([]);
  const lastRouteOriginRef = useRef<LatLng | null>(null);
  const previousCurrentRef = useRef<LatLng | null>(null);
  const announcedRef = useRef<Set<string>>(new Set());

  const iconFactory = useMemo(
    () => (marker === "bike" ? bikeMarkerIcon : repartidorMarkerIcon),
    [marker],
  );

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!containerRef.current) return;
      await loadGoogleMaps();
      if (cancelled || !containerRef.current) return;

      const map = new google.maps.Map(containerRef.current, {
        center: current ?? destination,
        zoom: 15,
        disableDefaultUI: true,
        gestureHandling: interactive ? "greedy" : "none",
        clickableIcons: false,
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
        ],
      });

      mapRef.current = map;
      directionsServiceRef.current = new google.maps.DirectionsService();
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        preserveViewport: false,
        polylineOptions: {
          strokeColor: "#0066FF",
          strokeOpacity: 0.95,
          strokeWeight: 5,
        },
      });

      destinationMarkerRef.current = new google.maps.Marker({
        map,
        position: destination,
        title: "Destino",
        zIndex: 2,
        icon: {
          url: destinoMarkerIcon(),
          scaledSize: new google.maps.Size(48, 58),
          anchor: new google.maps.Point(24, 56),
        },
      });
    }

    void init();
    return () => {
      cancelled = true;
      pulseMarkerRefs.current.forEach((m) => m.setMap(null));
    };
  }, [destination, interactive]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !current) return;
    const previous = previousCurrentRef.current;
    const rotation = previous ? bearingDegrees(previous, current) : 0;
    previousCurrentRef.current = current;

    if (!currentMarkerRef.current) {
      currentMarkerRef.current = new google.maps.Marker({
        map,
        position: current,
        title: "Repartidor",
        zIndex: 3,
        icon: {
          url: iconFactory(rotation),
          scaledSize: new google.maps.Size(48, 48),
          anchor: new google.maps.Point(24, 24),
        },
      });

      pulseMarkerRefs.current = [18, 26, 34].map(
        (scale) =>
          new google.maps.Marker({
            map,
            position: current,
            zIndex: 1,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale,
              fillColor: "#0066FF",
              fillOpacity: 0.08,
              strokeColor: "#0066FF",
              strokeOpacity: 0.16,
              strokeWeight: 2,
            },
          }),
      );
    } else {
      currentMarkerRef.current.setPosition(current);
      currentMarkerRef.current.setIcon({
        url: iconFactory(rotation),
        scaledSize: new google.maps.Size(48, 48),
        anchor: new google.maps.Point(24, 24),
      });
      pulseMarkerRefs.current.forEach((m) => m.setPosition(current));
    }

    destinationMarkerRef.current?.setPosition(destination);
    if (followCurrent) map.panTo(current);

    const shouldRoute =
      !lastRouteOriginRef.current ||
      distanceMeters(lastRouteOriginRef.current, current) > 50 ||
      nearestPathDistanceMeters(current, routePathRef.current) > 50;

    if (!shouldRoute) return;
    lastRouteOriginRef.current = current;

    directionsServiceRef.current?.route(
      {
        origin: current,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
      },
      (result, status) => {
        if (status !== google.maps.DirectionsStatus.OK || !result) {
          onStats?.(null);
          return;
        }
        directionsRendererRef.current?.setDirections(result);
        routePathRef.current = result.routes[0]?.overview_path ?? [];
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(current);
        bounds.extend(destination);
        map.fitBounds(bounds, 64);
        onStats?.(routeStatsFromResult(result, speedKmh));
      },
    );
  }, [current, destination, followCurrent, iconFactory, onStats, speedKmh]);

  useEffect(() => {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const statsCurrent = current;
    const path = routePathRef.current;
    if (!statsCurrent || path.length === 0) return;

    const firstStepPoint = path[Math.min(6, path.length - 1)];
    const meters = distanceMeters(statsCurrent, toLatLngLiteral(firstStepPoint));
    [200, 100, 30].forEach((threshold) => {
      const key = `${threshold}-${firstStepPoint.lat().toFixed(5)}-${firstStepPoint.lng().toFixed(5)}`;
      if (meters <= threshold && !announcedRef.current.has(key)) {
        announcedRef.current.add(key);
        const utterance = new SpeechSynthesisUtterance(`En ${threshold} metros, continúa con la indicación de navegación.`);
        utterance.lang = "es-MX";
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
      }
    });
  }, [current, voiceEnabled]);

  return <div ref={containerRef} className={`h-full w-full bg-slate-100 ${className}`} />;
}

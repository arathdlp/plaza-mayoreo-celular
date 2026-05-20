"use client";

import { geocodeAddress, loadGoogleMaps, type LatLng } from "@/lib/google-maps";
import { MORELIA_CENTER } from "@/lib/envio-labels";
import { bikeMarkerIcon, destinoMarkerIcon, repartidorMarkerIcon } from "@/lib/map-markers";
import {
  bearingDegrees,
  cleanInstruction,
  directionsErrorMessage,
  distanceMeters,
  formatDistance,
  formatDuration,
  type NavigationStats,
  type RouteStepInfo,
} from "@/lib/tracking-navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const LOG_PREFIX = "[REPARTIDOR]";
const MAP_ERROR_PREFIX = "[MAP ERROR]";

type Props = {
  current: LatLng | null;
  destination: LatLng;
  destinationAddress?: string;
  className?: string;
  marker: "navigation" | "bike";
  interactive?: boolean;
  followCurrent?: boolean;
  voiceEnabled?: boolean;
  speedKmh?: number;
  onStats?: (stats: NavigationStats | null) => void;
};

type RoutesApiLatLng = {
  latitude?: number;
  longitude?: number;
};

type RoutesApiStep = {
  distanceMeters?: number;
  staticDuration?: string;
  duration?: string;
  navigationInstruction?: {
    maneuver?: string;
    instructions?: string;
  };
  endLocation?: {
    latLng?: RoutesApiLatLng;
  };
};

type RoutesApiRoute = {
  duration?: string;
  distanceMeters?: number;
  polyline?: {
    encodedPolyline?: string;
  };
  legs?: Array<{
    steps?: RoutesApiStep[];
  }>;
};

type RoutesApiResponse = {
  routes?: RoutesApiRoute[];
  error?: {
    code?: number;
    status?: string;
    message?: string;
  };
};

function isFallbackCenter(dest: LatLng): boolean {
  return (
    Math.abs(dest.lat - MORELIA_CENTER.lat) < 0.0001 &&
    Math.abs(dest.lng - MORELIA_CENTER.lng) < 0.0001
  );
}

function routeErrorMessage(status: number, body?: RoutesApiResponse): string {
  if (status === 403 || body?.error?.status === "PERMISSION_DENIED") {
    return "Google Routes API no está habilitada. Actívala en Google Cloud Console para esta API key.";
  }
  if (status === 400 || body?.error?.status === "INVALID_ARGUMENT") {
    return "No se pudo calcular la ruta. Verificar dirección del cliente.";
  }
  if (status === 429 || body?.error?.status === "RESOURCE_EXHAUSTED") {
    return "Google Routes API alcanzó el límite de uso. Revisa cuotas en Google Cloud Console.";
  }
  return body?.error?.message || `No se pudo calcular la ruta (${status}).`;
}

function parseDurationSeconds(value?: string): number {
  if (!value) return 0;
  const seconds = Number.parseFloat(value.replace("s", ""));
  return Number.isFinite(seconds) ? seconds : 0;
}

function decodePolyline(encoded: string): LatLng[] {
  const path: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    result = 0;
    shift = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    path.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return path;
}

function routeStepsFromRoutesApi(steps: RoutesApiStep[] | undefined): RouteStepInfo[] {
  if (!steps?.length) return [];
  return steps.map((step) => {
    const distanceValue = step.distanceMeters ?? 0;
    const durationValue = parseDurationSeconds(step.staticDuration ?? step.duration);
    const end = step.endLocation?.latLng;
    return {
      instruction: cleanInstruction(step.navigationInstruction?.instructions ?? "Continúa por la ruta"),
      distanceText: formatDistance(distanceValue),
      durationText: formatDuration(durationValue),
      distanceValue,
      durationValue,
      maneuver: step.navigationInstruction?.maneuver,
      endLocation:
        typeof end?.latitude === "number" && typeof end?.longitude === "number"
          ? { lat: end.latitude, lng: end.longitude }
          : undefined,
    };
  });
}

function routeStatsFromRoutesApi(
  route: RoutesApiRoute,
  speedKmh: number,
  stepIndex: number,
  steps: RouteStepInfo[],
): NavigationStats {
  const distanceValue = route.distanceMeters ?? 0;
  const durationValue = parseDurationSeconds(route.duration);
  const currentStep = steps[stepIndex] ?? steps[0];
  return {
    distanceText: formatDistance(distanceValue),
    durationText: formatDuration(durationValue),
    distanceValue,
    durationValue,
    speedKmh,
    currentStep,
    routeError: null,
    stepIndex,
    stepCount: steps.length,
  };
}

function nearestPathDistanceMeters(point: LatLng, path: LatLng[]): number {
  if (path.length === 0) return Infinity;
  return path.reduce((min, p) => Math.min(min, distanceMeters(point, p)), Infinity);
}

async function calcularRuta(origin: LatLng, destination: LatLng): Promise<RoutesApiResponse> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  if (!apiKey) throw new Error("Falta NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");

  const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline,routes.legs.steps",
    },
    body: JSON.stringify({
      origin: {
        location: { latLng: { latitude: origin.lat, longitude: origin.lng } },
      },
      destination: {
        location: { latLng: { latitude: destination.lat, longitude: destination.lng } },
      },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      languageCode: "es-MX",
      units: "METRIC",
    }),
  });

  const body = (await response.json().catch(() => ({}))) as RoutesApiResponse;
  if (!response.ok) {
    throw new Error(routeErrorMessage(response.status, body));
  }
  return body;
}

export default function NavigationMap({
  current,
  destination,
  destinationAddress = "",
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
  const displayPosRef = useRef<LatLng | null>(null);
  const targetPosRef = useRef<LatLng | null>(null);
  const currentMarkerRef = useRef<google.maps.Marker | null>(null);
  const destinationMarkerRef = useRef<google.maps.Marker | null>(null);
  const pulseMarkerRefs = useRef<google.maps.Marker[]>([]);
  const routePolylineRef = useRef<google.maps.Polyline | null>(null);
  const routePathRef = useRef<LatLng[]>([]);
  const lastRouteOriginRef = useRef<LatLng | null>(null);
  const stepIndexRef = useRef(0);
  const parsedStepsRef = useRef<RouteStepInfo[]>([]);
  const announcedStepRef = useRef(-1);
  const lastStatsRef = useRef<NavigationStats | null>(null);
  const pulsePhaseRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const pulseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const routeRequestIdRef = useRef(0);
  const geocodedRef = useRef(false);
  const destinationRef = useRef<LatLng | null>(null);
  const destAddressKeyRef = useRef("");
  const resolvingDestRef = useRef(false);
  const onStatsRef = useRef(onStats);

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [destReady, setDestReady] = useState(false);

  onStatsRef.current = onStats;

  const iconFactory = useCallback(
    (rotation: number) => (marker === "bike" ? bikeMarkerIcon : repartidorMarkerIcon)(rotation),
    [marker],
  );

  const speak = useCallback((text: string) => {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-MX";
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!containerRef.current || mapRef.current) return;
      try {
        setMapError(null);
        if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim()) {
          const msg = "Falta configurar NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en Vercel.";
          console.error(`${MAP_ERROR_PREFIX} ${msg}`);
          setMapError(msg);
          onStats?.({
            distanceText: "—",
            durationText: "—",
            distanceValue: 0,
            durationValue: 0,
            speedKmh,
            routeError: "Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY con Maps JavaScript API y Routes API habilitadas.",
          });
          return;
        }

        await loadGoogleMaps();
        if (cancelled || !containerRef.current || mapRef.current) return;

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
        console.log(`${LOG_PREFIX} Mapa cargado`);
        setMapReady(true);
      } catch (err) {
        console.error(`${MAP_ERROR_PREFIX} Error al cargar mapa`, err);
        setMapError("No se pudo cargar Google Maps.");
        onStats?.({
          distanceText: "—",
          durationText: "—",
          distanceValue: 0,
          durationValue: 0,
          speedKmh,
          routeError: "No se pudo cargar Google Maps.",
        });
      }
    }

    void init();
    return () => {
      cancelled = true;
      if (animFrameRef.current != null) cancelAnimationFrame(animFrameRef.current);
      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
      routePolylineRef.current?.setMap(null);
      pulseMarkerRefs.current.forEach((m) => m.setMap(null));
      currentMarkerRef.current?.setMap(null);
      destinationMarkerRef.current?.setMap(null);
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const addressKey = destinationAddress.trim();

    async function resolveDestination() {
      if (!isFallbackCenter(destination)) {
        destinationRef.current = destination;
        geocodedRef.current = true;
        destAddressKeyRef.current = addressKey;
        setDestReady(true);
        return;
      }

      if (destAddressKeyRef.current !== addressKey) {
        geocodedRef.current = false;
        destinationRef.current = null;
        setDestReady(false);
      }

      if (geocodedRef.current && destinationRef.current) {
        return;
      }

      if (!addressKey) {
        destinationRef.current = destination;
        geocodedRef.current = true;
        setDestReady(true);
        return;
      }

      if (geocodedRef.current) return;
      geocodedRef.current = true;
      destAddressKeyRef.current = addressKey;
      resolvingDestRef.current = true;

      try {
        console.log(`${LOG_PREFIX} Geocodificando destino:`, addressKey);
        const geo = await geocodeAddress(addressKey);
        if (cancelled) return;

        if (geo) {
          destinationRef.current = geo;
          setDestReady(true);
          console.log(`${LOG_PREFIX} Destino resuelto`, geo);
        } else {
          console.warn(`${MAP_ERROR_PREFIX} Geocoding falló para destino`);
          setMapError("No se pudo calcular la ruta. Verificar dirección del cliente.");
          onStatsRef.current?.({
            distanceText: "—",
            durationText: "—",
            distanceValue: 0,
            durationValue: 0,
            speedKmh,
            routeError: "No se pudo calcular la ruta. Verificar dirección del cliente.",
          });
        }
      } catch (err) {
        console.error(`${MAP_ERROR_PREFIX} Error resolviendo destino`, err);
        setMapError("No se pudo calcular la ruta. Verificar dirección del cliente.");
        onStatsRef.current?.({
          distanceText: "—",
          durationText: "—",
          distanceValue: 0,
          durationValue: 0,
          speedKmh,
          routeError: "No se pudo calcular la ruta. Verificar dirección del cliente.",
        });
      } finally {
        resolvingDestRef.current = false;
      }
    }

    void resolveDestination();
    return () => {
      cancelled = true;
    };
  }, [destination.lat, destination.lng, destinationAddress, speedKmh]);

  useEffect(() => {
    const map = mapRef.current;
    const resolvedDest = destinationRef.current;
    if (!map || !destReady || !resolvedDest) return;

    try {
      destinationMarkerRef.current?.setMap(null);
      destinationMarkerRef.current = new google.maps.Marker({
        map,
        position: resolvedDest,
        title: "Destino",
        zIndex: 2,
        icon: {
          url: destinoMarkerIcon(),
          scaledSize: new google.maps.Size(48, 58),
          anchor: new google.maps.Point(24, 56),
        },
      });
    } catch (err) {
      console.error(`${MAP_ERROR_PREFIX} Error creando marcador destino`, err);
      setMapError("No se pudo mostrar el destino en el mapa.");
    }
  }, [mapReady, destReady]);

  const updateMarkerPosition = useCallback(
    (pos: LatLng, rotation: number) => {
      const map = mapRef.current;
      if (!map) return;

      try {
        if (!currentMarkerRef.current) {
          currentMarkerRef.current = new google.maps.Marker({
            map,
            position: pos,
            title: "Repartidor",
            zIndex: 3,
            icon: {
              url: iconFactory(rotation),
              scaledSize: new google.maps.Size(48, 48),
              anchor: new google.maps.Point(24, 24),
            },
          });
          pulseMarkerRefs.current = [0, 1, 2].map(
            (i) =>
              new google.maps.Marker({
                map,
                position: pos,
                zIndex: 1,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 14 + i * 6,
                  fillColor: "#0066FF",
                  fillOpacity: 0.06,
                  strokeColor: "#0066FF",
                  strokeOpacity: 0.12,
                  strokeWeight: 2,
                },
              }),
          );
        } else {
          currentMarkerRef.current.setPosition(pos);
          currentMarkerRef.current.setIcon({
            url: iconFactory(rotation),
            scaledSize: new google.maps.Size(48, 48),
            anchor: new google.maps.Point(24, 24),
          });
          pulseMarkerRefs.current.forEach((m) => m.setPosition(pos));
        }
      } catch (err) {
        console.error(`${MAP_ERROR_PREFIX} Error actualizando marcador`, err);
        setMapError("No se pudo actualizar el marcador en el mapa.");
      }
    },
    [iconFactory],
  );

  useEffect(() => {
    if (!mapReady || !current) return;
    targetPosRef.current = current;
    if (!displayPosRef.current) {
      displayPosRef.current = current;
      updateMarkerPosition(current, 0);
    }

    if (animFrameRef.current == null) {
      const animate = () => {
        const target = targetPosRef.current;
        const display = displayPosRef.current;
        if (target && display) {
          const t = 0.12;
          const next = {
            lat: display.lat + (target.lat - display.lat) * t,
            lng: display.lng + (target.lng - display.lng) * t,
          };
          displayPosRef.current = next;
          const rot = bearingDegrees(display, next);
          updateMarkerPosition(next, rot);
          if (followCurrent) mapRef.current?.panTo(next);
        }
        animFrameRef.current = requestAnimationFrame(animate);
      };
      animFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animFrameRef.current != null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [current, followCurrent, mapReady, updateMarkerPosition]);

  useEffect(() => {
    if (!mapReady || pulseIntervalRef.current) return;
    pulseIntervalRef.current = setInterval(() => {
      pulsePhaseRef.current = (pulsePhaseRef.current + 1) % 3;
      const pos = displayPosRef.current;
      if (!pos || !mapRef.current) return;
      pulseMarkerRefs.current.forEach((m, i) => {
        const active = i === pulsePhaseRef.current;
        m.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: active ? 30 : 18,
          fillColor: "#0066FF",
          fillOpacity: active ? 0.14 : 0.05,
          strokeColor: "#0066FF",
          strokeOpacity: active ? 0.28 : 0.1,
          strokeWeight: 2,
        });
        m.setPosition(pos);
      });
    }, 2000);
    return () => {
      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current);
        pulseIntervalRef.current = null;
      }
    };
  }, [mapReady]);

  const requestRoute = useCallback(async () => {
    const map = mapRef.current;
    const origin = current;
    const dest = destinationRef.current;
    if (!map || !origin || !dest || resolvingDestRef.current) return;

    const shouldRoute =
      !lastRouteOriginRef.current ||
      distanceMeters(lastRouteOriginRef.current, origin) > 50 ||
      nearestPathDistanceMeters(origin, routePathRef.current) > 50;

    if (!shouldRoute) return;

    const requestId = routeRequestIdRef.current + 1;
    routeRequestIdRef.current = requestId;
    lastRouteOriginRef.current = origin;
    console.log(`${LOG_PREFIX} Routes API computeRoutes`, { origin, dest });

    try {
      setMapError(null);
      const response = await calcularRuta(origin, dest);
      if (routeRequestIdRef.current !== requestId) return;

      const route = response.routes?.[0];
      if (!route) {
        throw new Error("No se pudo calcular la ruta. Verificar dirección del cliente.");
      }

      const path = route.polyline?.encodedPolyline ? decodePolyline(route.polyline.encodedPolyline) : [];
      routePathRef.current = path;
      routePolylineRef.current?.setMap(null);
      if (path.length) {
        routePolylineRef.current = new google.maps.Polyline({
          map,
          path,
          strokeColor: "#0066FF",
          strokeOpacity: 0.95,
          strokeWeight: 5,
        });
      }

      stepIndexRef.current = 0;
      announcedStepRef.current = -1;
      const steps = routeStepsFromRoutesApi(route.legs?.[0]?.steps);
      parsedStepsRef.current = steps;
      const stats = routeStatsFromRoutesApi(route, speedKmh, 0, steps);
      lastStatsRef.current = stats;
      onStatsRef.current?.(stats);
      console.log(`${LOG_PREFIX} Ruta calculada con Routes API, pasos:`, steps.length);

      if (!followCurrent) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(origin);
        bounds.extend(dest);
        path.forEach((p) => bounds.extend(p));
        map.fitBounds(bounds, 64);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : directionsErrorMessage("ROUTES_API_FORBIDDEN");
      console.error(`${MAP_ERROR_PREFIX} Error en Routes API`, err);
      setMapError(message);
      onStatsRef.current?.({
        distanceText: "—",
        durationText: "—",
        distanceValue: 0,
        durationValue: 0,
        speedKmh,
        routeError: message,
      });
    }
  }, [current, followCurrent, speedKmh]);

  useEffect(() => {
    if (mapReady && current && destReady && destinationRef.current) {
      void requestRoute();
    }
  }, [mapReady, current, destReady, requestRoute]);

  useEffect(() => {
    if (!current || parsedStepsRef.current.length === 0) return;

    const parsed = parsedStepsRef.current;
    let idx = stepIndexRef.current;
    const step = parsed[idx];
    if (step?.endLocation && distanceMeters(current, step.endLocation) < 30 && idx < parsed.length - 1) {
      idx += 1;
      stepIndexRef.current = idx;
      console.log(`${LOG_PREFIX} Avanzando al paso`, idx + 1);
    }

    const currentStep = parsed[idx];
    if (currentStep && announcedStepRef.current !== idx) {
      announcedStepRef.current = idx;
      speak(currentStep.instruction);
    }

    if (lastStatsRef.current) {
      const next = {
        ...lastStatsRef.current,
        currentStep,
        stepIndex: idx,
        stepCount: parsed.length,
        speedKmh,
      };
      lastStatsRef.current = next;
      onStatsRef.current?.(next);
    }
  }, [current, speak, speedKmh]);

  return (
    <div className={`relative h-full w-full bg-slate-100 ${className}`} aria-label="Mapa de navegación">
      <div ref={containerRef} className="h-full w-full" />
      {mapError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 px-6 text-center">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {mapError}
          </div>
        </div>
      ) : !mapReady ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 px-6 text-center">
          <div className="mb-4 h-28 w-28 animate-pulse rounded-full bg-white shadow-sm" />
          <p className="text-sm font-medium text-slate-600">Obteniendo tu ubicación...</p>
        </div>
      ) : null}
    </div>
  );
}

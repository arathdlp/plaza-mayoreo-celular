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
  stepsFromDirectionsLeg,
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

function isFallbackCenter(dest: LatLng): boolean {
  return (
    Math.abs(dest.lat - MORELIA_CENTER.lat) < 0.0001 &&
    Math.abs(dest.lng - MORELIA_CENTER.lng) < 0.0001
  );
}

function toLatLngLiteral(latLng: google.maps.LatLng): LatLng {
  return { lat: latLng.lat(), lng: latLng.lng() };
}

function nearestPathDistanceMeters(point: LatLng, path: google.maps.LatLng[]): number {
  if (path.length === 0) return Infinity;
  return path.reduce((min, p) => Math.min(min, distanceMeters(point, toLatLngLiteral(p))), Infinity);
}

function stepEndLatLng(step: google.maps.DirectionsStep): LatLng | null {
  const end = step.end_location;
  if (!end) return null;
  return { lat: end.lat(), lng: end.lng() };
}

function routeStatsFromResult(
  result: google.maps.DirectionsResult,
  speedKmh: number,
  stepIndex: number,
  steps: RouteStepInfo[],
): NavigationStats {
  const leg = result.routes[0]?.legs[0];
  const currentStep = steps[stepIndex] ?? steps[0];
  return {
    distanceText: leg?.distance?.text ?? formatDistance(0),
    durationText: leg?.duration?.text ?? formatDuration(0),
    distanceValue: leg?.distance?.value ?? 0,
    durationValue: leg?.duration?.value ?? 0,
    speedKmh,
    currentStep,
    routeError: null,
    stepIndex,
    stepCount: steps.length,
  };
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
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const routePathRef = useRef<google.maps.LatLng[]>([]);
  const routeStepsRef = useRef<google.maps.DirectionsStep[]>([]);
  const lastRouteOriginRef = useRef<LatLng | null>(null);
  const stepIndexRef = useRef(0);
  const parsedStepsRef = useRef<RouteStepInfo[]>([]);
  const announcedStepRef = useRef(-1);
  const lastStatsRef = useRef<NavigationStats | null>(null);
  const pulsePhaseRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const pulseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [resolvedDest, setResolvedDest] = useState<LatLng | null>(null);
  const [resolvingDest, setResolvingDest] = useState(false);

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
      if (!containerRef.current) return;
      try {
        setMapError(null);
        if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim()) {
          console.error(`${MAP_ERROR_PREFIX} Falta NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`);
          setMapError("Falta configurar NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en Vercel.");
          onStats?.({
            distanceText: "—",
            durationText: "—",
            distanceValue: 0,
            durationValue: 0,
            speedKmh,
            routeError:
              "Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY con Maps JavaScript API y Directions API habilitadas.",
          });
          return;
        }
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
          preserveViewport: followCurrent,
          polylineOptions: {
            strokeColor: "#0066FF",
            strokeOpacity: 0.95,
            strokeWeight: 5,
          },
        });

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
      pulseMarkerRefs.current.forEach((m) => m.setMap(null));
      currentMarkerRef.current?.setMap(null);
      destinationMarkerRef.current?.setMap(null);
    };
  }, [destination, followCurrent, interactive, onStats, speedKmh]);

  useEffect(() => {
    let cancelled = false;

    async function resolveDestination() {
      try {
        setResolvingDest(true);
        let dest = destination;

        if (isFallbackCenter(dest) && destinationAddress.trim()) {
          console.log(`${LOG_PREFIX} Geocodificando destino:`, destinationAddress);
          const geo = await geocodeAddress(destinationAddress);
          if (geo) dest = geo;
          else {
            console.warn(`${MAP_ERROR_PREFIX} Geocoding falló para destino`);
            onStats?.({
              distanceText: "—",
              durationText: "—",
              distanceValue: 0,
              durationValue: 0,
              speedKmh,
              routeError: "No se pudo calcular la ruta. Verificar dirección del cliente.",
            });
            setResolvingDest(false);
            return;
          }
        }

        if (!cancelled) {
          setResolvedDest(dest);
          setResolvingDest(false);
          console.log(`${LOG_PREFIX} Destino resuelto`, dest);
        }
      } catch (err) {
        console.error(`${MAP_ERROR_PREFIX} Error resolviendo destino`, err);
        setMapError("No se pudo calcular la ruta. Verificar dirección del cliente.");
        onStats?.({
          distanceText: "—",
          durationText: "—",
          distanceValue: 0,
          durationValue: 0,
          speedKmh,
          routeError: "No se pudo calcular la ruta. Verificar dirección del cliente.",
        });
        setResolvingDest(false);
      }
    }

    void resolveDestination();
    return () => {
      cancelled = true;
    };
  }, [destination, destinationAddress, onStats, speedKmh]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !resolvedDest) return;

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
  }, [mapReady, resolvedDest]);

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
          const prev = targetPosRef.current;
          const rot = prev ? bearingDegrees(display, next) : 0;
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
    if (!mapReady) return;
    pulseIntervalRef.current = setInterval(() => {
      pulsePhaseRef.current = (pulsePhaseRef.current + 1) % 3;
      const pos = displayPosRef.current;
      const map = mapRef.current;
      if (!pos || !map) return;
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
      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
    };
  }, [mapReady]);

  const requestRoute = useCallback(() => {
    const map = mapRef.current;
    const origin = current;
    const dest = resolvedDest;
    if (!map || !origin || !dest || resolvingDest) return;

    const shouldRoute =
      !lastRouteOriginRef.current ||
      distanceMeters(lastRouteOriginRef.current, origin) > 50 ||
      nearestPathDistanceMeters(origin, routePathRef.current) > 50;

    if (!shouldRoute) return;

    lastRouteOriginRef.current = origin;
    console.log(`${LOG_PREFIX} DirectionsService.route`, { origin, dest });

    try {
      if (!directionsServiceRef.current) {
        throw new Error("DirectionsService no está listo");
      }
      directionsServiceRef.current.route(
        {
          origin,
          destination: dest,
          travelMode: google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: false,
        },
        (result, status) => {
          try {
            if (status !== google.maps.DirectionsStatus.OK || !result) {
              const msg = directionsErrorMessage(status);
              console.warn(`${MAP_ERROR_PREFIX} DirectionsService status:`, status);
              onStats?.({
                distanceText: "—",
                durationText: "—",
                distanceValue: 0,
                durationValue: 0,
                speedKmh,
                routeError: msg,
              });
              return;
            }

            directionsRendererRef.current?.setDirections(result);
            routePathRef.current = result.routes[0]?.overview_path ?? [];
            routeStepsRef.current = result.routes[0]?.legs[0]?.steps ?? [];
            stepIndexRef.current = 0;
            announcedStepRef.current = -1;

            const steps = stepsFromDirectionsLeg(result.routes[0]?.legs[0]);
            parsedStepsRef.current = steps;
            const stats = routeStatsFromResult(result, speedKmh, 0, steps);
            lastStatsRef.current = stats;
            onStats?.(stats);
            console.log(`${LOG_PREFIX} Ruta calculada, pasos:`, steps.length);

            if (!followCurrent) {
              const bounds = new google.maps.LatLngBounds();
              bounds.extend(origin);
              bounds.extend(dest);
              map.fitBounds(bounds, 64);
            }
          } catch (err) {
            console.error(`${MAP_ERROR_PREFIX} Error procesando ruta`, err);
            setMapError("No se pudo calcular la ruta. Verificar dirección del cliente.");
            onStats?.({
              distanceText: "—",
              durationText: "—",
              distanceValue: 0,
              durationValue: 0,
              speedKmh,
              routeError: "No se pudo calcular la ruta. Verificar dirección del cliente.",
            });
          }
        },
      );
    } catch (err) {
      console.error(`${MAP_ERROR_PREFIX} Error llamando DirectionsService`, err);
      setMapError("No se pudo calcular la ruta. Verificar dirección del cliente.");
      onStats?.({
        distanceText: "—",
        durationText: "—",
        distanceValue: 0,
        durationValue: 0,
        speedKmh,
        routeError: "No se pudo calcular la ruta. Verificar dirección del cliente.",
      });
    }
  }, [current, followCurrent, onStats, resolvedDest, resolvingDest, speedKmh]);

  useEffect(() => {
    if (mapReady && current && resolvedDest) {
      requestRoute();
    }
  }, [mapReady, current, resolvedDest, requestRoute]);

  useEffect(() => {
    if (!current || routeStepsRef.current.length === 0) return;

    const gSteps = routeStepsRef.current;
    const parsed = parsedStepsRef.current;
    let idx = stepIndexRef.current;
    const step = gSteps[idx];
    const end = step ? stepEndLatLng(step) : null;
    if (end && distanceMeters(current, end) < 30 && idx < gSteps.length - 1) {
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
      onStats?.(next);
    }
  }, [current, onStats, speak, speedKmh]);

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

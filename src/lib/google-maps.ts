import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { MORELIA_CENTER } from "@/lib/envio-labels";

let configured = false;

function ensureGoogleMapsOptions(): void {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  if (!key) {
    throw new Error("Falta NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
  }
  if (!configured) {
    setOptions({
      key,
      v: "weekly",
      libraries: ["maps", "marker", "geometry", "geocoding"],
    });
    configured = true;
  }
}

export async function loadGoogleMaps(): Promise<typeof google.maps> {
  ensureGoogleMapsOptions();
  await importLibrary("maps");
  return google.maps;
}

export type LatLng = { lat: number; lng: number };

export function parseCoord(v: number | string | null | undefined): number | null {
  if (v == null) return null;
  const n = typeof v === "string" ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : null;
}

export function resolveDestino(envio: {
  destino_lat: number | string | null;
  destino_lng: number | string | null;
}): LatLng {
  const lat = parseCoord(envio.destino_lat);
  const lng = parseCoord(envio.destino_lng);
  if (lat != null && lng != null) return { lat, lng };
  return { ...MORELIA_CENTER };
}

export async function geocodeAddress(address: string): Promise<LatLng | null> {
  if (!address.trim()) return null;
  ensureGoogleMapsOptions();
  await importLibrary("geocoding");
  const geocoder = new google.maps.Geocoder();
  return new Promise((resolve) => {
    geocoder.geocode({ address: `${address}, Morelia, Michoacán, México` }, (results, status) => {
      if (status === "OK" && results?.[0]?.geometry?.location) {
        const loc = results[0].geometry.location;
        resolve({ lat: loc.lat(), lng: loc.lng() });
      } else {
        resolve(null);
      }
    });
  });
}

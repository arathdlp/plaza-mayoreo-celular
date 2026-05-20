import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import type { LatLng } from "@/lib/coords";

export type { LatLng } from "@/lib/coords";
export { parseCoord, resolveDestino, coordsFromPosition } from "@/lib/coords";

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
      libraries: ["maps", "marker", "geometry", "geocoding", "places"],
    });
    configured = true;
  }
}

export async function loadGoogleMaps(): Promise<typeof google.maps> {
  ensureGoogleMapsOptions();
  await importLibrary("maps");
  return google.maps;
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

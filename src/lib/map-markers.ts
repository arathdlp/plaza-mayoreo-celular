/** Íconos SVG embebidos para marcadores de Google Maps. */
export function markerIconSvg(emoji: string, bg: string, ring?: string): string {
  const ringStroke = ring ?? "white";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="22" fill="${bg}" stroke="${ringStroke}" stroke-width="3"/>
    <text x="24" y="30" text-anchor="middle" font-size="20">${emoji}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const MARKER_DESTINO = markerIconSvg("🏠", "#111827");
export const MARKER_REPARTIDOR = markerIconSvg("🛵", "#0066FF");

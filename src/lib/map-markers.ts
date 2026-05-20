/** Íconos SVG embebidos para marcadores de Google Maps, sin dependencias de DOM. */
export function markerIconSvg(innerSvg: string, options?: { bg?: string; ring?: string }): string {
  const bg = options?.bg ?? "white";
  const ring = options?.ring ?? "#0066FF";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="21" fill="${bg}" stroke="${ring}" stroke-width="3"/>
    ${innerSvg}
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function repartidorMarkerIcon(rotation = 0): string {
  return markerIconSvg(
    `<g transform="translate(24 24) rotate(${rotation}) translate(-24 -24)">
      <path d="M24 11l8 24-8-5-8 5 8-24z" fill="#0066FF"/>
      <path d="M24 16l4.5 13.5L24 27l-4.5 2.5L24 16z" fill="white" opacity=".9"/>
    </g>`,
  );
}

export function bikeMarkerIcon(rotation = 0): string {
  return markerIconSvg(
    `<g transform="translate(24 24) rotate(${rotation}) translate(-24 -24)" fill="none" stroke="#0066FF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="15" cy="30" r="5"/>
      <circle cx="33" cy="30" r="5"/>
      <path d="M20 30l5-10 4 10M25 20h-5M25 20l5-4M20 30h9M30 16h4"/>
    </g>`,
  );
}

export function destinoMarkerIcon(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="58" viewBox="0 0 48 58">
    <path d="M24 56S7 37.5 7 23.5C7 13.8 14.6 6 24 6s17 7.8 17 17.5C41 37.5 24 56 24 56z" fill="#0066FF" stroke="white" stroke-width="3"/>
    <circle cx="24" cy="23.5" r="6" fill="white"/>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const MARKER_DESTINO = destinoMarkerIcon();
export const MARKER_REPARTIDOR = repartidorMarkerIcon();

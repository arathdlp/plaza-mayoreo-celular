"use client";

import type { LatLng } from "@/lib/coords";
import { MORELIA_CENTER } from "@/lib/envio-labels";
import Map, { Layer, Marker, Source } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

type Props = {
  destino: LatLng;
  repartidor: LatLng | null;
  className?: string;
  /** Vista compacta para filas del admin */
  mini?: boolean;
  interactive?: boolean;
  repartidorPulsando?: boolean;
};

export default function TrackingMap({
  destino,
  repartidor,
  className = "",
  mini = false,
  interactive = true,
  repartidorPulsando = false,
}: Props) {
  const repartidorPosition = repartidor ?? MORELIA_CENTER;
  const destinoLng = destino.lng;
  const destinoLat = destino.lat;
  const routeData = {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "LineString" as const,
      coordinates: [
        [repartidorPosition.lng || -101.195, repartidorPosition.lat || 19.706],
        [destinoLng, destinoLat],
      ],
    },
  };

  return (
    <div className={`h-full w-full overflow-hidden bg-[#0b0f14] ${mini ? "min-h-[120px]" : "min-h-[280px]"} ${className}`}>
      <Map
        initialViewState={{
          longitude: -101.195,
          latitude: 19.706,
          zoom: mini ? 12 : 14,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        interactive={interactive}
        attributionControl={mini ? false : undefined}
      >
        <Source type="geojson" data={routeData}>
          <Layer
            id={mini ? "route-mini" : "route"}
            type="line"
            paint={{
              "line-color": "#3B82F6",
              "line-width": mini ? 2 : 3,
              "line-dasharray": [2, 2],
            }}
          />
        </Source>

        <Marker
          longitude={repartidorPosition.lng || -101.195}
          latitude={repartidorPosition.lat || 19.706}
          anchor="center"
        >
          <div
            style={{
              width: mini ? 34 : 44,
              height: mini ? 34 : 44,
              borderRadius: "50%",
              backgroundColor: repartidorPulsando ? "#16A34A" : "#16A34A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "3px solid white",
              boxShadow: "0 0 0 8px rgba(22,163,74,0.2)",
              animation: "pulse 2s infinite",
            }}
            aria-label="Ubicación del repartidor"
          >
            <svg width={mini ? "14" : "18"} height={mini ? "14" : "18"} viewBox="0 0 24 24" fill="white" aria-hidden>
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
          </div>
        </Marker>

        <Marker longitude={destinoLng} latitude={destinoLat} anchor="bottom">
          <div
            style={{
              width: mini ? 30 : 36,
              height: mini ? 30 : 36,
              borderRadius: "50%",
              backgroundColor: "#EF4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "3px solid white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
            aria-label="Destino"
          >
            <svg width={mini ? "14" : "16"} height={mini ? "14" : "16"} viewBox="0 0 24 24" fill="white" aria-hidden>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            </svg>
          </div>
        </Marker>
      </Map>
    </div>
  );
}

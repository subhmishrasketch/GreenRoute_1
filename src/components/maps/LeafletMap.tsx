import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type: "vehicle" | "society" | "destination";
  label: string;
  status?: "available" | "en_route" | "busy" | "offline" | "arrived";
  rotation?: number;
  driverName?: string;
  driverPhone?: string;
}

interface LeafletMapProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (marker: MapMarker) => void;
  showRoute?: boolean;
  routeStart?: [number, number];
  routeEnd?: [number, number];
  className?: string;
}

const DEFAULT_CENTER: [number, number] = [19.2952, 72.8544];
const DEFAULT_ZOOM = 14;

const createVehicleIcon = (status: string, rotation: number = 0) => {
  const color = status === "en_route"
    ? "#22c55e"
    : status === "available"
    ? "#3b82f6"
    : status === "arrived"
    ? "#10b981"
    : "#94a3b8";

  return L.divIcon({
    html: `
      <div style="transform:rotate(${rotation}deg);width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
        <div style="background:${color};border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.3);border:3px solid white;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
            <path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
            <circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>
          </svg>
        </div>
      </div>`,
    className: "vehicle-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const createSocietyIcon = () =>
  L.divIcon({
    html: `
      <div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
        <div style="background:linear-gradient(135deg,#22c55e,#16a34a);border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(34,197,94,0.4);border:2px solid white;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
        </div>
      </div>`,
    className: "society-marker",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

const createDestinationIcon = () =>
  L.divIcon({
    html: `
      <div style="width:40px;height:50px;display:flex;flex-direction:column;align-items:center;">
        <div style="background:linear-gradient(135deg,#ef4444,#dc2626);border-radius:50% 50% 50% 0;width:32px;height:32px;display:flex;align-items:center;justify-content:center;transform:rotate(-45deg);box-shadow:0 4px 12px rgba(239,68,68,0.4);">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" style="transform:rotate(45deg);">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="#dc2626"/>
          </svg>
        </div>
      </div>`,
    className: "destination-marker",
    iconSize: [40, 50],
    iconAnchor: [20, 50],
  });

// Fetch road route from OSRM
async function fetchRoute(start: [number, number], end: [number, number]): Promise<[number, number][]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes && data.routes[0]) {
      return data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
    }
  } catch (e) {
    console.warn("OSRM route fetch failed, falling back to straight line", e);
  }
  return [start, end];
}

export function LeafletMap({
  markers,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  onMarkerClick,
  showRoute,
  routeStart,
  routeEnd,
  className = "",
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const routeRef = useRef<L.Polyline | null>(null);
  const routeKeyRef = useRef<string>("");

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker, id) => {
      if (!markers.find((m) => m.id === id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    markers.forEach((markerData) => {
      let icon: L.DivIcon;
      switch (markerData.type) {
        case "vehicle": icon = createVehicleIcon(markerData.status || "offline", markerData.rotation); break;
        case "society": icon = createSocietyIcon(); break;
        case "destination": icon = createDestinationIcon(); break;
        default: icon = createSocietyIcon();
      }

      const existing = markersRef.current.get(markerData.id);
      if (existing) {
        existing.setLatLng([markerData.lat, markerData.lng]);
        existing.setIcon(icon);
      } else {
        const marker = L.marker([markerData.lat, markerData.lng], { icon }).addTo(map);
        const popup = `
          <div style="padding:8px;min-width:150px;">
            <strong style="font-size:14px;">${markerData.label}</strong>
            ${markerData.driverName ? `<p style="margin:4px 0 0;color:#666;font-size:12px;">Driver: ${markerData.driverName}</p>` : ""}
            ${markerData.status ? `<p style="margin:4px 0 0;font-size:11px;text-transform:capitalize;color:${markerData.status === 'en_route' ? '#22c55e' : '#666'};">${markerData.status.replace('_', ' ')}</p>` : ""}
          </div>`;
        marker.bindPopup(popup);
        if (onMarkerClick) marker.on("click", () => onMarkerClick(markerData));
        markersRef.current.set(markerData.id, marker);
      }
    });
  }, [markers, onMarkerClick]);

  // Draw route using OSRM road data
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!showRoute || !routeStart || !routeEnd) {
      if (routeRef.current) {
        routeRef.current.remove();
        routeRef.current = null;
        routeKeyRef.current = "";
      }
      return;
    }

    // Only fetch new route when endpoints change significantly
    const newKey = `${routeStart[0].toFixed(3)},${routeStart[1].toFixed(3)}-${routeEnd[0].toFixed(3)},${routeEnd[1].toFixed(3)}`;
    if (newKey === routeKeyRef.current) return;
    routeKeyRef.current = newKey;

    fetchRoute(routeStart, routeEnd).then((points) => {
      if (routeRef.current) {
        routeRef.current.remove();
      }

      const route = L.polyline(points, {
        color: "#22c55e",
        weight: 5,
        opacity: 0.8,
        dashArray: "12, 8",
        className: "animated-route",
      }).addTo(map);

      routeRef.current = route;
      map.fitBounds(route.getBounds(), { padding: [50, 50] });
    });
  }, [showRoute, routeStart?.[0], routeStart?.[1], routeEnd?.[0], routeEnd?.[1]]);

  return (
    <div
      ref={mapContainerRef}
      className={`w-full h-full rounded-xl overflow-hidden ${className}`}
      style={{ minHeight: "400px" }}
    />
  );
}

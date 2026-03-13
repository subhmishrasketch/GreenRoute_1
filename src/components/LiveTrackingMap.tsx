import { useState, useEffect, useRef } from "react";
import { Truck, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LeafletMap, MapMarker } from "@/components/maps/LeafletMap";
import { toast } from "sonner";

interface LiveTrackingMapProps {
  isActive: boolean;
  estimatedTime?: string;
  societyLat?: number;
  societyLng?: number;
  societyName?: string;
}

// Simulated depot start
const DEPOT = { lat: 19.2650, lng: 72.8540 };
const DEFAULT_SOCIETY = { lat: 19.2952, lng: 72.8544, name: "Your Society" };

export function LiveTrackingMap({
  isActive,
  estimatedTime,
  societyLat,
  societyLng,
  societyName,
}: LiveTrackingMapProps) {
  const targetLat = societyLat || DEFAULT_SOCIETY.lat;
  const targetLng = societyLng || DEFAULT_SOCIETY.lng;
  const name = societyName || DEFAULT_SOCIETY.name;

  const [driverPos, setDriverPos] = useState({ lat: DEPOT.lat, lng: DEPOT.lng });
  const [arrived, setArrived] = useState(false);
  const [eta, setEta] = useState(estimatedTime || "Calculating...");
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const animRef = useRef<number>();
  const arrivedRef = useRef(false);

  // Fetch road route on mount
  useEffect(() => {
    if (!isActive) return;

    const fetchRoadRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${DEPOT.lng},${DEPOT.lat};${targetLng},${targetLat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates.map(
            (c: number[]) => [c[1], c[0]] as [number, number]
          );
          setRoutePoints(coords);
        } else {
          // Fallback: straight line
          setRoutePoints([[DEPOT.lat, DEPOT.lng], [targetLat, targetLng]]);
        }
      } catch {
        setRoutePoints([[DEPOT.lat, DEPOT.lng], [targetLat, targetLng]]);
      }
    };

    fetchRoadRoute();
  }, [isActive, targetLat, targetLng]);

  // Animate driver along the road route
  useEffect(() => {
    if (!isActive || routePoints.length < 2) return;

    setArrived(false);
    arrivedRef.current = false;
    setDriverPos({ lat: routePoints[0][0], lng: routePoints[0][1] });

    const totalDuration = 45000; // 45 seconds for full journey
    const startTime = Date.now();

    // Pre-calculate cumulative distances along route
    const cumDist: number[] = [0];
    for (let i = 1; i < routePoints.length; i++) {
      const dlat = routePoints[i][0] - routePoints[i - 1][0];
      const dlng = routePoints[i][1] - routePoints[i - 1][1];
      cumDist.push(cumDist[i - 1] + Math.sqrt(dlat * dlat + dlng * dlng));
    }
    const totalDist = cumDist[cumDist.length - 1];

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      // Find position along route based on progress
      const targetDist = progress * totalDist;
      let segIdx = 0;
      for (let i = 1; i < cumDist.length; i++) {
        if (cumDist[i] >= targetDist) { segIdx = i - 1; break; }
        segIdx = i - 1;
      }

      const segStart = cumDist[segIdx];
      const segEnd = cumDist[segIdx + 1] || segStart + 0.0001;
      const segProgress = (targetDist - segStart) / (segEnd - segStart);

      const lat = routePoints[segIdx][0] + (routePoints[Math.min(segIdx + 1, routePoints.length - 1)][0] - routePoints[segIdx][0]) * segProgress;
      const lng = routePoints[segIdx][1] + (routePoints[Math.min(segIdx + 1, routePoints.length - 1)][1] - routePoints[segIdx][1]) * segProgress;

      setDriverPos({ lat, lng });

      // Update ETA
      const remainingSec = Math.max(0, Math.round(((1 - progress) * totalDuration) / 1000));
      if (remainingSec > 60) setEta(`~${Math.ceil(remainingSec / 60)} mins`);
      else if (remainingSec > 0) setEta(`~${remainingSec} sec`);

      if (progress >= 1 && !arrivedRef.current) {
        arrivedRef.current = true;
        setArrived(true);
        setEta("Arrived!");
        toast.success("🚛 Vehicle has arrived!", {
          description: `Collection vehicle reached ${name}`,
          duration: 5000,
        });
        return;
      }

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isActive, routePoints, name]);

  const markers: MapMarker[] = [
    { id: "society", lat: targetLat, lng: targetLng, type: "society", label: name },
    { id: "depot", lat: DEPOT.lat, lng: DEPOT.lng, type: "destination", label: "Collection Center" },
  ];

  if (isActive) {
    markers.push({
      id: "driver",
      lat: driverPos.lat,
      lng: driverPos.lng,
      type: "vehicle",
      label: "Collection Vehicle",
      status: arrived ? "arrived" : "en_route",
      rotation: 0,
    });
  }

  const centerLat = (DEPOT.lat + targetLat) / 2;
  const centerLng = (DEPOT.lng + targetLng) / 2;

  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            Live Collection Tracking
          </CardTitle>
          {isActive && (
            <Badge
              variant="outline"
              className={
                arrived
                  ? "bg-[hsl(var(--success-green))]/10 text-[hsl(var(--success-green))] border-[hsl(var(--success-green))]/30"
                  : "bg-primary/10 text-primary border-primary/30 animate-pulse"
              }
            >
              {arrived ? (
                <><CheckCircle2 className="h-3 w-3 mr-1" /> Arrived</>
              ) : (
                <><Truck className="h-3 w-3 mr-1" /> En Route</>
              )}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-72 md:h-80 rounded-xl overflow-hidden border shadow-inner">
          <LeafletMap
            markers={markers}
            center={[centerLat, centerLng]}
            zoom={13}
            showRoute={isActive && routePoints.length > 0}
            routeStart={[DEPOT.lat, DEPOT.lng]}
            routeEnd={[targetLat, targetLng]}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg bg-accent p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Estimated Arrival</span>
          </div>
          <span className={`font-semibold ${arrived ? "text-[hsl(var(--success-green))]" : "text-primary"}`}>
            {eta}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className={`h-2 w-2 rounded-full ${isActive ? "bg-[hsl(var(--success-green))]" : "bg-muted-foreground/30"}`} />
          <span>Pickup Confirmed</span>
          <div className="flex-1 h-px bg-border" />
          <div className={`h-2 w-2 rounded-full ${isActive && !arrived ? "bg-primary animate-pulse" : arrived ? "bg-[hsl(var(--success-green))]" : "bg-muted-foreground/30"}`} />
          <span>Driver En Route</span>
          <div className="flex-1 h-px bg-border" />
          <div className={`h-2 w-2 rounded-full ${arrived ? "bg-[hsl(var(--success-green))]" : "bg-muted-foreground/30"}`} />
          <span>Arrived</span>
        </div>
      </CardContent>
    </Card>
  );
}

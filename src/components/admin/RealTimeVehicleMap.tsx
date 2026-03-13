import { useState, useEffect, useCallback, useRef } from "react";
import {
  Truck,
  MapPin,
  Phone,
  User,
  Clock,
  Navigation,
  RefreshCw,
  Wifi,
  WifiOff,
  Home,
  CheckCircle2,
  Route,
  Timer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import { LeafletMap, MapMarker } from "@/components/maps/LeafletMap";
import type { Vehicle, AdminPickup } from "@/hooks/useAdminPickups";

interface RealTimeVehicleMapProps {
  vehicles: Vehicle[];
  pickups: AdminPickup[];
  onRefresh: () => void;
}

const statusColors: Record<Vehicle["status"], string> = {
  available: "bg-success/20 text-success border-success/30",
  en_route: "bg-primary/20 text-primary border-primary/30",
  busy: "bg-warning/20 text-warning border-warning/30",
  offline: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<Vehicle["status"], string> = {
  available: "Available",
  en_route: "En Route",
  busy: "Busy",
  offline: "Offline",
};

// Society locations in Mira-Bhayandar
const SOCIETY_LOCATIONS = [
  { name: "Green Valley Society", lat: 19.2812, lng: 72.8534, area: "Mira Road" },
  { name: "Sunrise Apartments", lat: 19.3056, lng: 72.8689, area: "Bhayandar East" },
  { name: "Palm Grove Complex", lat: 19.2923, lng: 72.8901, area: "Bhayandar West" },
  { name: "Ocean View Heights", lat: 19.2734, lng: 72.8423, area: "Mira Road East" },
  { name: "Lakeside Residency", lat: 19.2867, lng: 72.8612, area: "Mira Road West" },
];

export function RealTimeVehicleMap({
  vehicles,
  pickups,
  onRefresh,
}: RealTimeVehicleMapProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [arrivedVehicles, setArrivedVehicles] = useState<Set<string>>(new Set());
  const notifiedRef = useRef<Set<string>>(new Set());
  const animationRef = useRef<number>();
  const [animatedPositions, setAnimatedPositions] = useState<
    Map<string, { lat: number; lng: number; rotation: number }>
  >(new Map());
  const routePointsRef = useRef<Map<string, [number, number][]>>(new Map());
  const routeIndexRef = useRef<Map<string, number>>(new Map());

  // Fetch OSRM road route for a vehicle
  const fetchRoute = useCallback(async (
    startLat: number, startLng: number, endLat: number, endLng: number
  ): Promise<[number, number][]> => {
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
      );
      const data = await res.json();
      if (data.routes?.[0]?.geometry?.coordinates) {
        return data.routes[0].geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]] as [number, number]
        );
      }
    } catch (e) {
      console.warn("OSRM fetch failed, using straight line", e);
    }
    // Fallback: straight line with intermediate points
    const steps = 80;
    return Array.from({ length: steps + 1 }, (_, i) => [
      startLat + (endLat - startLat) * (i / steps),
      startLng + (endLng - startLng) * (i / steps),
    ] as [number, number]);
  }, []);

  // Initialize vehicle positions and fetch routes for en_route vehicles
  useEffect(() => {
    const positions = new Map<string, { lat: number; lng: number; rotation: number }>();
    vehicles.forEach((v) => {
      positions.set(v.id, {
        lat: v.currentLatitude || 19.29 + (Math.random() - 0.5) * 0.02,
        lng: v.currentLongitude || 72.86 + (Math.random() - 0.5) * 0.02,
        rotation: 0,
      });
    });
    setAnimatedPositions(positions);

    // Fetch road routes for en_route vehicles
    vehicles.forEach(async (vehicle) => {
      if (vehicle.status !== "en_route" || routePointsRef.current.has(vehicle.id)) return;

      const pos = positions.get(vehicle.id);
      if (!pos) return;

      const assignedPickup = pickups.find((p) => p.vehicleId === vehicle.id);
      if (!assignedPickup) return;

      const society = SOCIETY_LOCATIONS.find((s) =>
        assignedPickup.societyName?.includes(s.name.split(" ")[0])
      );
      const targetLat = society?.lat || 19.29;
      const targetLng = society?.lng || 72.86;

      const route = await fetchRoute(pos.lat, pos.lng, targetLat, targetLng);
      routePointsRef.current.set(vehicle.id, route);
      routeIndexRef.current.set(vehicle.id, 0);
    });
  }, [vehicles, pickups, fetchRoute]);

  // Animate vehicles along road routes
  useEffect(() => {
    let lastTime = 0;
    const animate = (time: number) => {
      if (time - lastTime < 50) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTime = time;

      setAnimatedPositions((prev) => {
        const next = new Map(prev);

        vehicles.forEach((vehicle) => {
          if (vehicle.status !== "en_route") return;

          const route = routePointsRef.current.get(vehicle.id);
          if (!route || route.length === 0) return;

          let idx = routeIndexRef.current.get(vehicle.id) || 0;
          if (idx >= route.length - 1) {
            // Arrived
            if (!arrivedVehicles.has(vehicle.id) && !notifiedRef.current.has(vehicle.id)) {
              notifiedRef.current.add(vehicle.id);
              setArrivedVehicles((p) => new Set([...p, vehicle.id]));
              const assignedPickup = pickups.find((p) => p.vehicleId === vehicle.id);
              toast.success("🚛 Vehicle Arrived!", {
                description: `${vehicle.vehicleNumber} reached ${assignedPickup?.societyName || "destination"}`,
                duration: 5000,
              });
            }
            return;
          }

          // Advance along route
          idx = Math.min(idx + 1, route.length - 1);
          routeIndexRef.current.set(vehicle.id, idx);

          const [lat, lng] = route[idx];
          const prevPoint = route[Math.max(0, idx - 1)];
          const rotation = Math.atan2(lng - prevPoint[1], lat - prevPoint[0]) * (180 / Math.PI) + 90;

          next.set(vehicle.id, { lat, lng, rotation });
        });

        return next;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [vehicles, pickups, arrivedVehicles]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setArrivedVehicles(new Set());
    notifiedRef.current = new Set();
    routePointsRef.current = new Map();
    routeIndexRef.current = new Map();
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getAssignedPickup = (vehicleId: string) => {
    return pickups.find((p) => p.vehicleId === vehicleId);
  };

  // Generate map markers
  const mapMarkers: MapMarker[] = [
    // Vehicle markers
    ...vehicles.map((vehicle) => {
      const pos = animatedPositions.get(vehicle.id);
      const hasArrived = arrivedVehicles.has(vehicle.id);
      
      return {
        id: vehicle.id,
        lat: pos?.lat || vehicle.currentLatitude || 19.29,
        lng: pos?.lng || vehicle.currentLongitude || 72.86,
        type: "vehicle" as const,
        label: vehicle.vehicleNumber,
        status: hasArrived ? "arrived" as const : vehicle.status,
        rotation: pos?.rotation || 0,
        driverName: vehicle.driverName,
        driverPhone: vehicle.driverPhone,
      };
    }),
    // Society markers
    ...SOCIETY_LOCATIONS.map((society, idx) => ({
      id: `society-${idx}`,
      lat: society.lat,
      lng: society.lng,
      type: "society" as const,
      label: society.name,
    })),
  ];

  const activeVehicles = vehicles.filter((v) => v.status !== "offline");
  const offlineVehicles = vehicles.filter((v) => v.status === "offline");

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Map Section */}
      <Card variant="elevated" className="lg:col-span-2 animate-slide-up">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary animate-pulse" />
              Live Vehicle Tracking
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time positions powered by OpenStreetMap
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {/* Leaflet Map */}
          <div className="h-[450px] rounded-xl overflow-hidden border shadow-inner">
            <LeafletMap
              markers={mapMarkers}
              center={[19.295, 72.854]}
              zoom={13}
              onMarkerClick={(marker) => {
                const vehicle = vehicles.find((v) => v.id === marker.id);
                if (vehicle) setSelectedVehicle(vehicle);
              }}
            />
          </div>

          {/* Selected vehicle info */}
          {selectedVehicle && (
            <div className="mt-4 bg-accent/50 rounded-xl p-4 animate-scale-in">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{selectedVehicle.vehicleNumber}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      {selectedVehicle.driverName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {arrivedVehicles.has(selectedVehicle.id) && (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Arrived
                    </Badge>
                  )}
                  <Badge variant="outline" className={statusColors[selectedVehicle.status]}>
                    {statusLabels[selectedVehicle.status]}
                  </Badge>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                {selectedVehicle.driverPhone && (
                  <a
                    href={`tel:${selectedVehicle.driverPhone}`}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {selectedVehicle.driverPhone}
                  </a>
                )}
                {selectedVehicle.lastLocationUpdate && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Updated {format(new Date(selectedVehicle.lastLocationUpdate), "h:mm a")}
                  </div>
                )}
              </div>

              {getAssignedPickup(selectedVehicle.id) && (
                <div className="mt-3 pt-3 border-t flex items-center gap-3">
                  <Route className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    En route to:{" "}
                    <span className="font-medium">
                      {getAssignedPickup(selectedVehicle.id)?.societyName}
                    </span>
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fleet Status Panel */}
      <div className="space-y-4">
        {/* Quick Stats */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-success/10">
                <Wifi className="h-5 w-5 mx-auto mb-1 text-success" />
                <p className="text-2xl font-bold text-success">{activeVehicles.length}</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted">
                <WifiOff className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-2xl font-bold">{offlineVehicles.length}</p>
                <p className="text-xs text-muted-foreground">Offline</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              Fleet Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[350px] overflow-auto">
            {vehicles.map((vehicle) => {
              const pickup = getAssignedPickup(vehicle.id);
              const hasArrived = arrivedVehicles.has(vehicle.id);

              return (
                <div
                  key={vehicle.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                    selectedVehicle?.id === vehicle.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedVehicle(vehicle)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          hasArrived
                            ? "bg-success/20"
                            : vehicle.status === "en_route"
                            ? "bg-primary/20"
                            : vehicle.status === "available"
                            ? "bg-success/10"
                            : "bg-muted"
                        }`}
                      >
                        <Truck
                          className={`h-4 w-4 ${
                            hasArrived
                              ? "text-success"
                              : vehicle.status === "en_route"
                              ? "text-primary"
                              : vehicle.status === "available"
                              ? "text-success"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{vehicle.vehicleNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {vehicle.driverName}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        hasArrived
                          ? "bg-success/10 text-success border-success/30"
                          : statusColors[vehicle.status]
                      }`}
                    >
                      {hasArrived ? "Arrived" : statusLabels[vehicle.status]}
                    </Badge>
                  </div>

                  {pickup && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 pt-2 border-t">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{pickup.societyName}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

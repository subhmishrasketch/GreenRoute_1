import { useState, useEffect, useCallback, useRef } from "react";
import {
  Truck,
  MapPin,
  Phone,
  User,
  Clock,
  Navigation,
  RefreshCw,
  Circle,
  Wifi,
  WifiOff,
  Home,
  CheckCircle2,
  Bell,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Vehicle, AdminPickup } from "@/hooks/useAdminPickups";

interface VehicleTrackingMapProps {
  vehicles: Vehicle[];
  pickups: AdminPickup[];
  onRefresh: () => void;
}

interface AnimatedVehicle extends Vehicle {
  animatedLat: number;
  animatedLng: number;
  targetLat: number;
  targetLng: number;
  rotation: number;
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

// Mira-Bhayandar area bounds for the map
const MAP_BOUNDS = {
  minLat: 19.25,
  maxLat: 19.35,
  minLng: 72.8,
  maxLng: 72.92,
};

// Society locations in Mira-Bhayandar (simulated)
const SOCIETY_LOCATIONS = [
  { name: "Green Valley Society", lat: 19.28, lng: 72.85, area: "Mira Road" },
  { name: "Sunrise Apartments", lat: 19.31, lng: 72.87, area: "Bhayandar East" },
  { name: "Palm Grove Complex", lat: 19.29, lng: 72.89, area: "Bhayandar West" },
  { name: "Ocean View Heights", lat: 19.27, lng: 72.84, area: "Mira Road East" },
];

export function VehicleTrackingMap({
  vehicles,
  pickups,
  onRefresh,
}: VehicleTrackingMapProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [animatedVehicles, setAnimatedVehicles] = useState<AnimatedVehicle[]>([]);
  const [arrivedVehicles, setArrivedVehicles] = useState<Set<string>>(new Set());
  const animationRef = useRef<number>();
  const notifiedRef = useRef<Set<string>>(new Set());

  // Initialize animated vehicles
  useEffect(() => {
    setAnimatedVehicles(
      vehicles.map((v) => ({
        ...v,
        animatedLat: v.currentLatitude || 19.29 + (Math.random() - 0.5) * 0.05,
        animatedLng: v.currentLongitude || 72.86 + (Math.random() - 0.5) * 0.05,
        targetLat: v.currentLatitude || 19.29,
        targetLng: v.currentLongitude || 72.86,
        rotation: Math.random() * 360,
      }))
    );
  }, [vehicles]);

  // Animate vehicles moving toward their destinations
  useEffect(() => {
    const animate = () => {
      setAnimatedVehicles((prev) =>
        prev.map((vehicle) => {
          if (vehicle.status !== "en_route") return vehicle;

          const assignedPickup = pickups.find((p) => p.vehicleId === vehicle.id);
          
          // Get target location (society location or random destination)
          let targetLat = vehicle.targetLat;
          let targetLng = vehicle.targetLng;
          
          if (assignedPickup) {
            // Find matching society location
            const society = SOCIETY_LOCATIONS.find(
              (s) => assignedPickup.societyName?.includes(s.name.split(" ")[0])
            );
            if (society) {
              targetLat = society.lat;
              targetLng = society.lng;
            }
          }

          // Calculate distance to target
          const dx = targetLat - vehicle.animatedLat;
          const dy = targetLng - vehicle.animatedLng;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Check if arrived
          if (distance < 0.002) {
            // Vehicle arrived - trigger notification
            if (!arrivedVehicles.has(vehicle.id) && !notifiedRef.current.has(vehicle.id)) {
              notifiedRef.current.add(vehicle.id);
              setArrivedVehicles((prev) => new Set([...prev, vehicle.id]));
              
              toast.success("🚛 Vehicle Arrived!", {
                description: `${vehicle.vehicleNumber} has reached ${assignedPickup?.societyName || "destination"}`,
                duration: 5000,
                action: {
                  label: "View",
                  onClick: () => setSelectedVehicle(vehicle),
                },
              });
            }
            return vehicle;
          }

          // Move toward target with smooth animation
          const speed = 0.0003 + Math.random() * 0.0002;
          const newLat = vehicle.animatedLat + (dx / distance) * speed;
          const newLng = vehicle.animatedLng + (dy / distance) * speed;
          
          // Calculate rotation based on direction
          const rotation = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

          return {
            ...vehicle,
            animatedLat: newLat,
            animatedLng: newLng,
            rotation,
          };
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [pickups, arrivedVehicles]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setArrivedVehicles(new Set());
    notifiedRef.current = new Set();
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Convert lat/lng to map position (percentage)
  const getMapPosition = (lat: number, lng: number) => {
    const x =
      ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
    const y =
      100 -
      ((lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;

    return {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
    };
  };

  const getAssignedPickup = (vehicleId: string) => {
    return pickups.find((p) => p.vehicleId === vehicleId);
  };

  const activeVehicles = animatedVehicles.filter((v) => v.status !== "offline");
  const offlineVehicles = animatedVehicles.filter((v) => v.status === "offline");

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
              Real-time positions of all GreenRoute vehicles
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {/* Enhanced Map Container */}
          <div className="relative h-[450px] rounded-xl overflow-hidden border shadow-inner">
            {/* Map Background with realistic styling */}
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(152,45%,92%)] via-[hsl(80,30%,95%)] to-[hsl(160,35%,90%)]" />
            
            {/* Road grid pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-30">
              <defs>
                <pattern
                  id="road-grid"
                  width="60"
                  height="60"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 60 0 L 0 0 0 60"
                    fill="none"
                    stroke="hsl(160, 20%, 70%)"
                    strokeWidth="1"
                  />
                </pattern>
                <pattern
                  id="major-roads"
                  width="120"
                  height="120"
                  patternUnits="userSpaceOnUse"
                >
                  <line
                    x1="60"
                    y1="0"
                    x2="60"
                    y2="120"
                    stroke="hsl(160, 15%, 60%)"
                    strokeWidth="3"
                    strokeDasharray="10 5"
                  />
                  <line
                    x1="0"
                    y1="60"
                    x2="120"
                    y2="60"
                    stroke="hsl(160, 15%, 60%)"
                    strokeWidth="3"
                    strokeDasharray="10 5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#road-grid)" />
              <rect width="100%" height="100%" fill="url(#major-roads)" />
            </svg>

            {/* Water body (creek) */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[hsl(200,60%,80%)]/40 to-transparent" />

            {/* Map Labels */}
            <div className="absolute top-4 left-4 flex items-center gap-2 text-xs font-medium text-foreground bg-background/90 backdrop-blur px-3 py-2 rounded-lg shadow-sm border">
              <MapPin className="h-4 w-4 text-primary" />
              Mira-Bhayandar Region
            </div>

            {/* Society markers */}
            {SOCIETY_LOCATIONS.map((society, index) => {
              const pos = getMapPosition(society.lat, society.lng);
              return (
                <div
                  key={index}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 group"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  <div className="relative">
                    <div className="absolute -inset-3 bg-success/20 rounded-full animate-ping opacity-50" />
                    <div className="h-8 w-8 rounded-full bg-success shadow-lg flex items-center justify-center border-2 border-white">
                      <Home className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-background/95 backdrop-blur px-2 py-1 rounded shadow-lg border whitespace-nowrap">
                      <p className="text-xs font-medium">{society.name}</p>
                      <p className="text-[10px] text-muted-foreground">{society.area}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Landmark markers */}
            <div className="absolute top-[25%] left-[30%] flex flex-col items-center">
              <div className="h-4 w-4 rounded-full bg-primary/40 border-2 border-primary/60" />
              <span className="text-[10px] mt-1 text-muted-foreground whitespace-nowrap font-medium bg-background/80 px-1 rounded">
                Mira Road Station
              </span>
            </div>
            <div className="absolute top-[65%] right-[25%] flex flex-col items-center">
              <div className="h-4 w-4 rounded-full bg-primary/40 border-2 border-primary/60" />
              <span className="text-[10px] mt-1 text-muted-foreground whitespace-nowrap font-medium bg-background/80 px-1 rounded">
                Bhayandar Station
              </span>
            </div>

            {/* Animated Vehicle markers */}
            {animatedVehicles.map((vehicle) => {
              const pos = getMapPosition(vehicle.animatedLat, vehicle.animatedLng);
              const isSelected = selectedVehicle?.id === vehicle.id;
              const isOnline = vehicle.status !== "offline";
              const isEnRoute = vehicle.status === "en_route";
              const hasArrived = arrivedVehicles.has(vehicle.id);

              return (
                <div
                  key={vehicle.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transition: isEnRoute ? "none" : "all 0.3s ease-out",
                  }}
                  onClick={() => setSelectedVehicle(isSelected ? null : vehicle)}
                >
                  <div
                    className={`relative transition-transform duration-300 ${
                      isSelected ? "scale-125" : "hover:scale-110"
                    }`}
                  >
                    {/* Pulse effect for en_route */}
                    {isEnRoute && !hasArrived && (
                      <>
                        <div className="absolute -inset-4 rounded-full bg-primary/20 animate-ping" />
                        <div className="absolute -inset-2 rounded-full bg-primary/30 animate-pulse" />
                      </>
                    )}

                    {/* Arrived celebration effect */}
                    {hasArrived && (
                      <div className="absolute -inset-4">
                        <div className="absolute inset-0 rounded-full bg-success/30 animate-ping" />
                        <CheckCircle2 className="absolute -top-2 -right-2 h-5 w-5 text-success animate-bounce" />
                      </div>
                    )}

                    {/* Vehicle icon with rotation */}
                    <div
                      className={`relative p-2.5 rounded-full shadow-lg transition-all ${
                        hasArrived
                          ? "bg-success"
                          : isOnline
                          ? isSelected
                            ? "bg-primary scale-110"
                            : "bg-primary/90"
                          : "bg-muted-foreground/50"
                      }`}
                      style={{
                        transform: isEnRoute
                          ? `rotate(${vehicle.rotation}deg)`
                          : "none",
                      }}
                    >
                      <Truck
                        className={`h-5 w-5 ${
                          isOnline ? "text-primary-foreground" : "text-muted"
                        }`}
                        style={{
                          transform: isEnRoute
                            ? `rotate(${-vehicle.rotation}deg)`
                            : "none",
                        }}
                      />
                    </div>
                  </div>

                  {/* Vehicle label */}
                  <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <span className="text-xs font-semibold bg-background/95 backdrop-blur px-2 py-0.5 rounded shadow-sm border">
                      {vehicle.vehicleNumber}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Selected vehicle info overlay */}
            {selectedVehicle && (
              <div className="absolute bottom-4 left-4 right-4 bg-background/98 backdrop-blur-sm rounded-xl p-4 shadow-elevated border animate-scale-in">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Truck className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">
                        {selectedVehicle.vehicleNumber}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        {selectedVehicle.driverName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {arrivedVehicles.has(selectedVehicle.id) && (
                      <Badge
                        variant="outline"
                        className="bg-success/10 text-success border-success/30 animate-pulse"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Arrived
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={statusColors[selectedVehicle.status]}
                    >
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
                      <span>{selectedVehicle.driverPhone}</span>
                    </a>
                  )}
                  {selectedVehicle.lastLocationUpdate && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Updated{" "}
                        {format(selectedVehicle.lastLocationUpdate, "h:mm a")}
                      </span>
                    </div>
                  )}
                </div>

                {getAssignedPickup(selectedVehicle.id) && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Heading to:</span>
                      <span className="font-medium">
                        {getAssignedPickup(selectedVehicle.id)?.societyName ||
                          "Individual pickup"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Map legend */}
            <div className="absolute bottom-4 right-4 bg-background/95 backdrop-blur rounded-lg px-3 py-2 border shadow-sm">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span>Vehicle</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-success" />
                  <span>Society</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle List Sidebar */}
      <Card variant="elevated" className="animate-slide-up">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Fleet Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Active Vehicles */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Wifi className="h-4 w-4 text-success" />
              <span className="text-sm font-medium">
                Active ({activeVehicles.length})
              </span>
            </div>
            <div className="space-y-2">
              {activeVehicles.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => setSelectedVehicle(vehicle)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all hover:shadow-sm ${
                    selectedVehicle?.id === vehicle.id
                      ? "bg-primary/5 border-primary/30 shadow-sm"
                      : "bg-background hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors ${
                        arrivedVehicles.has(vehicle.id)
                          ? "bg-success/10"
                          : vehicle.status === "en_route"
                          ? "bg-primary/10"
                          : "bg-success/10"
                      }`}
                    >
                      <Truck
                        className={`h-5 w-5 transition-colors ${
                          arrivedVehicles.has(vehicle.id)
                            ? "text-success"
                            : vehicle.status === "en_route"
                            ? "text-primary"
                            : "text-success"
                        }`}
                      />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">{vehicle.vehicleNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {vehicle.driverName}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        arrivedVehicles.has(vehicle.id)
                          ? "bg-success/10 text-success border-success/30"
                          : statusColors[vehicle.status]
                      }`}
                    >
                      {arrivedVehicles.has(vehicle.id)
                        ? "Arrived"
                        : statusLabels[vehicle.status]}
                    </Badge>
                    {vehicle.status === "en_route" && !arrivedVehicles.has(vehicle.id) && (
                      <span className="text-[10px] text-primary animate-pulse">
                        • Moving
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Offline Vehicles */}
          {offlineVehicles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <WifiOff className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Offline ({offlineVehicles.length})
                </span>
              </div>
              <div className="space-y-2">
                {offlineVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between p-3 rounded-xl border bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Truck className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-muted-foreground">
                          {vehicle.vehicleNumber}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          {vehicle.driverName}
                        </p>
                      </div>
                    </div>
                    <Circle className="h-2 w-2 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Truck,
  Navigation,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  AlertCircle,
  ChevronRight,
  Home,
  ArrowLeft,
  Loader2,
  Compass,
  Volume2,
  VolumeX,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LeafletMap, MapMarker } from "@/components/maps/LeafletMap";
import { useDriverGPS } from "@/hooks/useDriverGPS";
import { format } from "date-fns";

interface AssignedPickup {
  id: string;
  pickupId: string;
  societyName: string;
  societyAddress: string;
  wasteType: string;
  quantity: string;
  scheduledTime: string;
  status: string;
  lat: number;
  lng: number;
  notes?: string;
}

// Simulated society locations
const SOCIETY_LOCATIONS: Record<string, { lat: number; lng: number; address: string }> = {
  "Green Valley Society": { lat: 19.2812, lng: 72.8534, address: "Sector 5, Mira Road East" },
  "Sunrise Apartments": { lat: 19.3056, lng: 72.8689, address: "Bhayandar East, Near Station" },
  "Palm Grove Complex": { lat: 19.2923, lng: 72.8901, address: "Bhayandar West" },
  "Ocean View Heights": { lat: 19.2734, lng: 72.8423, address: "Mira Road East" },
  "Lakeside Residency": { lat: 19.2867, lng: 72.8612, address: "Mira Road West" },
};

const NAVIGATION_STEPS = [
  { instruction: "Head north on Station Road", distance: "200m", time: "1 min" },
  { instruction: "Turn right onto Highway NH-8", distance: "1.2km", time: "4 min" },
  { instruction: "Continue straight past Mira Road Station", distance: "800m", time: "3 min" },
  { instruction: "Turn left into Sector 5", distance: "400m", time: "2 min" },
  { instruction: "Destination on your right", distance: "50m", time: "1 min" },
];

export default function DriverApp() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [assignedPickups, setAssignedPickups] = useState<AssignedPickup[]>([]);
  const [activePickup, setActivePickup] = useState<AssignedPickup | null>(null);
  const [navigationStep, setNavigationStep] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [confirmingPickup, setConfirmingPickup] = useState(false);
  const [eta, setEta] = useState("12 min");
  const [distance, setDistance] = useState("3.2 km");

  const { location, isTracking, startTracking, stopTracking, isSupported } = useDriverGPS({
    vehicleId: selectedVehicle || undefined,
    updateInterval: 5000,
    enableHighAccuracy: true,
  });

  // Redirect to driver login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/driver-login");
    }
  }, [user, authLoading, navigate]);

  // Fetch vehicles
  useEffect(() => {
    if (!user) return;
    const fetchVehicles = async () => {
      const { data } = await supabase
        .from("vehicles")
        .select("*")
        .order("vehicle_number");
      
      if (data) {
        setVehicles(data);
        setLoading(false);
      }
    };
    fetchVehicles();
  }, [user]);

  // Fetch assigned pickups for selected vehicle
  useEffect(() => {
    if (!selectedVehicle) return;

    const fetchPickups = async () => {
      const { data } = await supabase
        .from("pickups")
        .select("*")
        .eq("vehicle_id", selectedVehicle)
        .in("status", ["scheduled", "picked"])
        .order("scheduled_time");

      if (data) {
        const pickupsWithLocations: AssignedPickup[] = data.map((p) => {
          // Get society location or use random
          const societyKey = Object.keys(SOCIETY_LOCATIONS).find(
            (key) => p.notes?.includes(key)
          );
          const loc = societyKey 
            ? SOCIETY_LOCATIONS[societyKey] 
            : { lat: 19.29 + Math.random() * 0.02, lng: 72.85 + Math.random() * 0.02, address: "Mira Road" };
          
          return {
            id: p.id,
            pickupId: p.pickup_id,
            societyName: societyKey || `Society ${p.pickup_id.slice(-4)}`,
            societyAddress: loc.address,
            wasteType: p.waste_type,
            quantity: p.quantity,
            scheduledTime: p.scheduled_time || p.requested_at,
            status: p.status,
            lat: loc.lat,
            lng: loc.lng,
            notes: p.notes,
          };
        });
        setAssignedPickups(pickupsWithLocations);
      }
    };

    fetchPickups();
    
    // Start GPS tracking
    if (isSupported) {
      startTracking();
    }

    return () => {
      stopTracking();
    };
  }, [selectedVehicle]);

  // Simulate navigation progress
  useEffect(() => {
    if (!isNavigating || !activePickup) return;

    const interval = setInterval(() => {
      setNavigationStep((prev) => {
        if (prev >= NAVIGATION_STEPS.length - 1) {
          clearInterval(interval);
          toast.success("You have arrived!", {
            description: `Reached ${activePickup.societyName}`,
          });
          return prev;
        }
        
        // Voice instruction
        if (voiceEnabled && "speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(
            NAVIGATION_STEPS[prev + 1].instruction
          );
          utterance.rate = 0.9;
          speechSynthesis.speak(utterance);
        }
        
        return prev + 1;
      });

      // Update ETA
      setEta((prev) => {
        const mins = parseInt(prev) - 2;
        return mins > 0 ? `${mins} min` : "Arriving";
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [isNavigating, activePickup, voiceEnabled]);

  const handleStartNavigation = (pickup: AssignedPickup) => {
    setActivePickup(pickup);
    setIsNavigating(true);
    setNavigationStep(0);
    setEta("12 min");
    setDistance("3.2 km");
    
    toast.info("Navigation started", {
      description: `Heading to ${pickup.societyName}`,
    });
  };

  const handleConfirmPickup = async () => {
    if (!activePickup) return;
    
    setConfirmingPickup(true);
    
    // Update pickup status
    const { error } = await supabase
      .from("pickups")
      .update({ status: "picked" })
      .eq("id", activePickup.id);

    if (error) {
      toast.error("Failed to confirm pickup");
    } else {
      toast.success("Pickup confirmed!", {
        description: `${activePickup.wasteType} collected from ${activePickup.societyName}`,
      });
      
      // Remove from list and reset
      setAssignedPickups((prev) => prev.filter((p) => p.id !== activePickup.id));
      setActivePickup(null);
      setIsNavigating(false);
    }
    
    setConfirmingPickup(false);
  };

  const handleCancelNavigation = () => {
    setIsNavigating(false);
    setActivePickup(null);
    toast.info("Navigation cancelled");
  };

  // Generate map markers
  const mapMarkers: MapMarker[] = [
    // Current vehicle location
    ...(location.latitude && location.longitude
      ? [
          {
            id: "current-vehicle",
            lat: location.latitude,
            lng: location.longitude,
            type: "vehicle" as const,
            label: "Your Location",
            status: isNavigating ? "en_route" as const : "available" as const,
            rotation: location.heading || 0,
          },
        ]
      : []),
    // Society destinations
    ...assignedPickups.map((pickup) => ({
      id: pickup.id,
      lat: pickup.lat,
      lng: pickup.lng,
      type: "society" as const,
      label: pickup.societyName,
    })),
    // Active destination
    ...(activePickup
      ? [
          {
            id: "destination",
            lat: activePickup.lat,
            lng: activePickup.lng,
            type: "destination" as const,
            label: activePickup.societyName,
          },
        ]
      : []),
  ];

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading Driver App...</p>
        </div>
      </div>
    );
  }

  // Vehicle selection screen
  if (!selectedVehicle) {
    return (
      <div className="min-h-screen gradient-hero p-4">
        <div className="max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Card className="animate-slide-up">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto h-16 w-16 rounded-2xl gradient-eco flex items-center justify-center mb-3">
                <Truck className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-xl">Driver Login</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select your assigned vehicle to begin
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {vehicles.map((vehicle) => (
                <Button
                  key={vehicle.id}
                  variant="outline"
                  className="w-full justify-between h-auto py-4 px-4"
                  onClick={() => setSelectedVehicle(vehicle.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{vehicle.vehicle_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {vehicle.driver_name}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const selectedVehicleData = vehicles.find((v) => v.id === selectedVehicle);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedVehicle(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="font-semibold">{selectedVehicleData?.vehicle_number}</p>
              <p className="text-xs text-muted-foreground">
                {selectedVehicleData?.driver_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
            >
              {voiceEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>
            <Badge
              variant="outline"
              className={
                isTracking
                  ? "bg-success/10 text-success border-success/30"
                  : "bg-muted text-muted-foreground"
              }
            >
              <Compass className="h-3 w-3 mr-1" />
              {isTracking ? "GPS Active" : "GPS Off"}
            </Badge>
          </div>
        </div>
      </header>

      {/* Navigation Mode */}
      {isNavigating && activePickup ? (
        <div className="flex-1 flex flex-col">
          {/* Map */}
          <div className="h-[45vh] relative">
            <LeafletMap
              markers={mapMarkers}
              center={[activePickup.lat, activePickup.lng]}
              zoom={15}
              showRoute
              routeStart={
                location.latitude && location.longitude
                  ? [location.latitude, location.longitude]
                  : [19.295, 72.854]
              }
              routeEnd={[activePickup.lat, activePickup.lng]}
            />
            
            {/* ETA Overlay */}
            <div className="absolute top-4 left-4 right-4 bg-background/95 backdrop-blur rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">{eta}</p>
                  <p className="text-sm text-muted-foreground">{distance} remaining</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleCancelNavigation}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation Instructions */}
          <div className="flex-1 bg-card p-4 overflow-auto">
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                  <Navigation className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {NAVIGATION_STEPS[navigationStep].instruction}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {NAVIGATION_STEPS[navigationStep].distance} • {NAVIGATION_STEPS[navigationStep].time}
                  </p>
                </div>
              </div>
              <Progress 
                value={(navigationStep / (NAVIGATION_STEPS.length - 1)) * 100} 
                className="h-2"
              />
            </div>

            {/* Destination Card */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Home className="h-5 w-5 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{activePickup.societyName}</p>
                    <p className="text-sm text-muted-foreground">
                      {activePickup.societyAddress}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="capitalize">
                        {activePickup.wasteType}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {activePickup.quantity}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="gap-2">
                <Phone className="h-4 w-4" />
                Call Society
              </Button>
              <Button
                onClick={handleConfirmPickup}
                disabled={confirmingPickup}
                className="gap-2 gradient-eco text-primary-foreground"
              >
                {confirmingPickup ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Confirm Pickup
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Pickup List View */
        <div className="flex-1 p-4 space-y-4 overflow-auto">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3 text-center">
              <Package className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold">{assignedPickups.length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </Card>
            <Card className="p-3 text-center">
              <Clock className="h-5 w-5 mx-auto mb-1 text-warning" />
              <p className="text-xl font-bold">
                {assignedPickups.filter((p) => p.status === "scheduled").length}
              </p>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </Card>
            <Card className="p-3 text-center">
              <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-success" />
              <p className="text-xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </Card>
          </div>

          {/* Map Preview */}
          <Card className="overflow-hidden">
            <div className="h-48">
              <LeafletMap
                markers={mapMarkers}
                center={[19.295, 72.854]}
                zoom={13}
              />
            </div>
          </Card>

          {/* Assigned Pickups */}
          <div>
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Assigned Pickups
            </h2>
            
            {assignedPickups.length === 0 ? (
              <Card className="p-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No pickups assigned</p>
                <p className="text-sm text-muted-foreground/70">
                  Wait for admin to schedule pickups
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {assignedPickups.map((pickup) => (
                  <Card
                    key={pickup.id}
                    className="overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                            <Home className="h-5 w-5 text-success" />
                          </div>
                          <div>
                            <p className="font-semibold">{pickup.societyName}</p>
                            <p className="text-xs text-muted-foreground">
                              {pickup.societyAddress}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            pickup.status === "scheduled"
                              ? "bg-primary/10 text-primary border-primary/30"
                              : "bg-warning/10 text-warning border-warning/30"
                          }
                        >
                          {pickup.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm mb-3">
                        <div className="flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="capitalize">{pickup.wasteType}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>
                            {format(new Date(pickup.scheduledTime), "h:mm a")}
                          </span>
                        </div>
                      </div>

                      <Button
                        className="w-full gap-2 gradient-eco text-primary-foreground"
                        onClick={() => handleStartNavigation(pickup)}
                      >
                        <Navigation className="h-4 w-4" />
                        Start Navigation
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

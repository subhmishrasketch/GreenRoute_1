import { useState, useEffect } from "react";
import {
  Navigation,
  MapPin,
  Play,
  Square,
  Truck,
  Loader2,
  Signal,
  SignalZero,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDriverGPS } from "@/hooks/useDriverGPS";
import type { Vehicle } from "@/hooks/useAdminPickups";
import { format } from "date-fns";

interface DriverGPSPanelProps {
  vehicles: Vehicle[];
}

export function DriverGPSPanel({ vehicles }: DriverGPSPanelProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  
  const {
    location,
    isTracking,
    startTracking,
    stopTracking,
    isSupported,
  } = useDriverGPS({
    vehicleId: selectedVehicleId,
    updateInterval: 10000, // 10 seconds
    enableHighAccuracy: true,
  });

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  if (!isSupported) {
    return (
      <Card variant="elevated">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <SignalZero className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold text-lg mb-2">GPS Not Supported</h3>
            <p className="text-muted-foreground text-sm">
              Your browser doesn't support geolocation.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="animate-slide-up">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          Driver GPS Tracking
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Enable real-time location tracking for vehicle dispatch
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vehicle Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Vehicle</label>
          <Select
            value={selectedVehicleId}
            onValueChange={setSelectedVehicleId}
            disabled={isTracking}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a vehicle to track" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    {vehicle.vehicleNumber} - {vehicle.driverName}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tracking Status */}
        {selectedVehicleId && (
          <div className="space-y-4">
            {/* Control Buttons */}
            <div className="flex gap-3">
              {!isTracking ? (
                <Button
                  variant="eco"
                  className="flex-1 gap-2"
                  onClick={startTracking}
                  disabled={!selectedVehicleId}
                >
                  <Play className="h-4 w-4" />
                  Start Tracking
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  onClick={stopTracking}
                >
                  <Square className="h-4 w-4" />
                  Stop Tracking
                </Button>
              )}
            </div>

            {/* Status Display */}
            <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
              {/* Tracking Status Indicator */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge
                  variant="outline"
                  className={
                    isTracking
                      ? "bg-success/10 text-success border-success/30"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {isTracking ? (
                    <>
                      <Signal className="h-3 w-3 mr-1 animate-pulse" />
                      Live Tracking
                    </>
                  ) : (
                    <>
                      <SignalZero className="h-3 w-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
              </div>

              {/* Location Data */}
              {location.latitude && location.longitude ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Latitude</span>
                    <p className="font-mono text-sm font-medium">
                      {location.latitude.toFixed(6)}°
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Longitude</span>
                    <p className="font-mono text-sm font-medium">
                      {location.longitude.toFixed(6)}°
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Accuracy</span>
                    <p className="font-mono text-sm">
                      ±{location.accuracy?.toFixed(0) || "—"} m
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Speed</span>
                    <p className="font-mono text-sm">
                      {location.speed ? `${(location.speed * 3.6).toFixed(1)} km/h` : "—"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-4 text-muted-foreground">
                  {isTracking ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Acquiring location...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-5 w-5 mr-2" />
                      Start tracking to see location
                    </>
                  )}
                </div>
              )}

              {/* Error Display */}
              {location.error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {location.error}
                </div>
              )}

              {/* Last Update */}
              {location.timestamp && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                  <Clock className="h-3 w-3" />
                  Last update: {format(new Date(location.timestamp), "h:mm:ss a")}
                </div>
              )}
            </div>

            {/* Vehicle Info */}
            {selectedVehicle && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{selectedVehicle.vehicleNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedVehicle.driverName}
                  </p>
                </div>
                {isTracking && (
                  <CheckCircle2 className="h-5 w-5 text-success ml-auto" />
                )}
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
          <p className="font-medium mb-1">📍 How it works:</p>
          <ul className="space-y-1 ml-4 list-disc">
            <li>Select a vehicle and start tracking</li>
            <li>Your GPS location updates every 10 seconds</li>
            <li>Location is visible on the admin tracking map</li>
            <li>Works in background when app is open</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number | null;
  error: string | null;
}

interface UseDriverGPSOptions {
  vehicleId: string;
  updateInterval?: number; // in milliseconds
  enableHighAccuracy?: boolean;
}

export function useDriverGPS({
  vehicleId,
  updateInterval = 10000, // Default 10 seconds
  enableHighAccuracy = true,
}: UseDriverGPSOptions) {
  const { user, role } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    heading: null,
    speed: null,
    timestamp: null,
    error: null,
  });
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const isAdmin = role === "admin";

  // Update vehicle location in database
  const updateVehicleLocation = useCallback(
    async (lat: number, lng: number) => {
      if (!user || !isAdmin || !vehicleId) return false;

      try {
        const { error } = await supabase
          .from("vehicles")
          .update({
            current_latitude: lat,
            current_longitude: lng,
            last_location_update: new Date().toISOString(),
            status: "en_route",
          })
          .eq("id", vehicleId);

        if (error) throw error;
        return true;
      } catch (error) {
        console.error("Error updating vehicle location:", error);
        return false;
      }
    },
    [user, isAdmin, vehicleId]
  );

  // Handle position update
  const handlePositionUpdate = useCallback(
    (position: GeolocationPosition) => {
      const now = Date.now();
      
      // Throttle updates to prevent excessive database writes
      if (now - lastUpdateRef.current < updateInterval) {
        return;
      }
      
      lastUpdateRef.current = now;

      const { latitude, longitude, accuracy, heading, speed } = position.coords;
      
      setLocation({
        latitude,
        longitude,
        accuracy,
        heading,
        speed,
        timestamp: position.timestamp,
        error: null,
      });

      // Update in database
      updateVehicleLocation(latitude, longitude);
    },
    [updateInterval, updateVehicleLocation]
  );

  // Handle geolocation error
  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage: string;
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = "Location permission denied. Please enable location access.";
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = "Location information unavailable.";
        break;
      case error.TIMEOUT:
        errorMessage = "Location request timed out.";
        break;
      default:
        errorMessage = "An unknown error occurred.";
    }
    
    setLocation((prev) => ({ ...prev, error: errorMessage }));
    toast.error(errorMessage);
  }, []);

  // Start tracking
  const startTracking = useCallback(() => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    if (!vehicleId) {
      toast.error("No vehicle selected for tracking");
      return;
    }

    setIsTracking(true);
    lastUpdateRef.current = 0; // Reset to force immediate update

    // Use watchPosition for continuous tracking
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handleError,
      {
        enableHighAccuracy,
        timeout: 15000,
        maximumAge: 0,
      }
    );

    toast.success("GPS tracking started", {
      description: `Updating location every ${updateInterval / 1000} seconds`,
    });
  }, [vehicleId, handlePositionUpdate, handleError, enableHighAccuracy, updateInterval]);

  // Stop tracking
  const stopTracking = useCallback(async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsTracking(false);

    // Update vehicle status to available when stopping
    if (vehicleId && user && isAdmin) {
      await supabase
        .from("vehicles")
        .update({ status: "available" })
        .eq("id", vehicleId);
    }

    toast.info("GPS tracking stopped");
  }, [vehicleId, user, isAdmin]);

  // Get current position once
  const getCurrentPosition = useCallback(() => {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy,
        timeout: 10000,
        maximumAge: 0,
      });
    });
  }, [enableHighAccuracy]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    location,
    isTracking,
    startTracking,
    stopTracking,
    getCurrentPosition,
    isSupported: "geolocation" in navigator,
  };
}

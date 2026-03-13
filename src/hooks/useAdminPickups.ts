import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type PickupRow = Database["public"]["Tables"]["pickups"]["Row"];
type PickupStatus = Database["public"]["Enums"]["pickup_status"];

export interface AdminPickup {
  id: string;
  pickupId: string;
  wasteType: "plastic" | "cardboard";
  quantity: "small" | "medium" | "large";
  status: PickupStatus;
  requestedAt: Date;
  scheduledTime?: Date;
  vehicleId?: string;
  estimatedArrival?: string;
  notes?: string;
  societyId?: string;
  userId: string;
  societyName?: string;
  societyArea?: string;
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone?: string;
  status: "available" | "en_route" | "busy" | "offline";
  currentLatitude?: number;
  currentLongitude?: number;
  lastLocationUpdate?: Date;
  assignedPickupId?: string;
}

const mapRowToPickup = (row: PickupRow, societyInfo?: { name: string; area: string }): AdminPickup => ({
  id: row.id,
  pickupId: row.pickup_id,
  wasteType: row.waste_type as "plastic" | "cardboard",
  quantity: row.quantity as "small" | "medium" | "large",
  status: row.status,
  requestedAt: new Date(row.requested_at),
  scheduledTime: row.scheduled_time ? new Date(row.scheduled_time) : undefined,
  vehicleId: row.vehicle_id || undefined,
  estimatedArrival: row.estimated_arrival || undefined,
  notes: row.notes || undefined,
  societyId: row.society_id || undefined,
  userId: row.user_id,
  societyName: societyInfo?.name,
  societyArea: societyInfo?.area,
});

export function useAdminPickups() {
  const { user, role } = useAuth();
  const [pickups, setPickups] = useState<AdminPickup[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = role === "admin";

  // Fetch all pickups with society info
  const fetchPickups = useCallback(async () => {
    if (!user || !isAdmin) {
      setPickups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch pickups
      const { data: pickupsData, error: pickupsError } = await supabase
        .from("pickups")
        .select("*")
        .order("requested_at", { ascending: false });

      if (pickupsError) throw pickupsError;

      // Fetch societies for name/area mapping
      const { data: societiesData, error: societiesError } = await supabase
        .from("societies")
        .select("id, name, area");

      if (societiesError) throw societiesError;

      const societyMap = new Map(
        societiesData?.map((s) => [s.id, { name: s.name, area: s.area }]) || []
      );

      const mappedPickups = pickupsData?.map((row) =>
        mapRowToPickup(row, row.society_id ? societyMap.get(row.society_id) : undefined)
      ) || [];

      setPickups(mappedPickups);
    } catch (error) {
      console.error("Error fetching pickups:", error);
      toast.error("Failed to load pickups");
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  // Fetch all vehicles
  const fetchVehicles = useCallback(async () => {
    if (!user || !isAdmin) {
      setVehicles([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("vehicle_number", { ascending: true });

      if (error) throw error;

      const mappedVehicles: Vehicle[] = data?.map((v) => ({
        id: v.id,
        vehicleNumber: v.vehicle_number,
        driverName: v.driver_name,
        driverPhone: v.driver_phone || undefined,
        status: v.status as Vehicle["status"],
        currentLatitude: v.current_latitude ? Number(v.current_latitude) : undefined,
        currentLongitude: v.current_longitude ? Number(v.current_longitude) : undefined,
        lastLocationUpdate: v.last_location_update ? new Date(v.last_location_update) : undefined,
        assignedPickupId: v.assigned_pickup_id || undefined,
      })) || [];

      setVehicles(mappedVehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  }, [user, isAdmin]);

  // Update pickup status
  const updatePickupStatus = useCallback(
    async (
      pickupId: string,
      newStatus: PickupStatus,
      vehicleId?: string,
      scheduledTime?: Date,
      estimatedArrival?: string
    ) => {
      if (!user || !isAdmin) {
        toast.error("Unauthorized");
        return false;
      }

      try {
        const updateData: Partial<PickupRow> = {
          status: newStatus,
        };

        if (vehicleId) updateData.vehicle_id = vehicleId;
        if (scheduledTime) updateData.scheduled_time = scheduledTime.toISOString();
        if (estimatedArrival) updateData.estimated_arrival = estimatedArrival;

        const { error } = await supabase
          .from("pickups")
          .update(updateData)
          .eq("id", pickupId);

        if (error) throw error;

        // Update local state
        setPickups((prev) =>
          prev.map((p) =>
            p.id === pickupId
              ? {
                  ...p,
                  status: newStatus,
                  vehicleId: vehicleId || p.vehicleId,
                  scheduledTime: scheduledTime || p.scheduledTime,
                  estimatedArrival: estimatedArrival || p.estimatedArrival,
                }
              : p
          )
        );

        // If assigning vehicle, update vehicle status
        if (vehicleId && newStatus === "scheduled") {
          await supabase
            .from("vehicles")
            .update({ 
              status: "en_route", 
              assigned_pickup_id: pickupId 
            })
            .eq("id", vehicleId);
        }

        // If pickup is complete, free up the vehicle
        if (newStatus === "recycled") {
          const pickup = pickups.find((p) => p.id === pickupId);
          if (pickup?.vehicleId) {
            await supabase
              .from("vehicles")
              .update({ 
                status: "available", 
                assigned_pickup_id: null 
              })
              .eq("id", pickup.vehicleId);
          }
        }

        toast.success(`Pickup status updated to ${newStatus}`);
        return true;
      } catch (error) {
        console.error("Error updating pickup:", error);
        toast.error("Failed to update pickup status");
        return false;
      }
    },
    [user, isAdmin, pickups]
  );

  // Update vehicle location (for real-world GPS integration)
  const updateVehicleLocation = useCallback(
    async (vehicleId: string, latitude: number, longitude: number) => {
      if (!user || !isAdmin) return false;

      try {
        const { error } = await supabase
          .from("vehicles")
          .update({
            current_latitude: latitude,
            current_longitude: longitude,
            last_location_update: new Date().toISOString(),
          })
          .eq("id", vehicleId);

        if (error) throw error;
        return true;
      } catch (error) {
        console.error("Error updating vehicle location:", error);
        return false;
      }
    },
    [user, isAdmin]
  );

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user || !isAdmin) return;

    fetchPickups();
    fetchVehicles();

    // Subscribe to pickups changes
    const pickupsChannel = supabase
      .channel("admin-pickups-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pickups",
        },
        () => {
          fetchPickups();
        }
      )
      .subscribe();

    // Subscribe to vehicles changes
    const vehiclesChannel = supabase
      .channel("admin-vehicles-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vehicles",
        },
        () => {
          fetchVehicles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(pickupsChannel);
      supabase.removeChannel(vehiclesChannel);
    };
  }, [user, isAdmin, fetchPickups, fetchVehicles]);

  const getStats = useCallback(() => {
    const total = pickups.length;
    const requested = pickups.filter((p) => p.status === "requested").length;
    const scheduled = pickups.filter((p) => p.status === "scheduled").length;
    const picked = pickups.filter((p) => p.status === "picked").length;
    const recycled = pickups.filter((p) => p.status === "recycled").length;

    return { total, requested, scheduled, picked, recycled };
  }, [pickups]);

  return {
    pickups,
    vehicles,
    loading,
    updatePickupStatus,
    updateVehicleLocation,
    getStats,
    refetch: fetchPickups,
    refetchVehicles: fetchVehicles,
  };
}

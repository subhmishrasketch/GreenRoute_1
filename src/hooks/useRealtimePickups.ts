import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { notificationService } from "@/services/notificationService";
import { emailNotificationService } from "@/services/emailNotificationService";
import type { Database } from "@/integrations/supabase/types";

type PickupRow = Database["public"]["Tables"]["pickups"]["Row"];
type PickupInsert = Database["public"]["Tables"]["pickups"]["Insert"];

export interface RealtimePickup {
  id: string;
  pickupId: string;
  wasteType: "plastic" | "cardboard";
  quantity: "small" | "medium" | "large";
  status: "requested" | "scheduled" | "picked" | "recycled";
  requestedAt: Date;
  scheduledTime?: Date;
  vehicleId?: string;
  estimatedArrival?: string;
  notes?: string;
}

const mapRowToPickup = (row: PickupRow): RealtimePickup => ({
  id: row.id,
  pickupId: row.pickup_id,
  wasteType: row.waste_type as "plastic" | "cardboard",
  quantity: row.quantity as "small" | "medium" | "large",
  status: row.status as "requested" | "scheduled" | "picked" | "recycled",
  requestedAt: new Date(row.requested_at),
  scheduledTime: row.scheduled_time ? new Date(row.scheduled_time) : undefined,
  vehicleId: row.vehicle_id || undefined,
  estimatedArrival: row.estimated_arrival || undefined,
  notes: row.notes || undefined,
});

const getStatusMessage = (oldStatus: string, newStatus: string): string => {
  const messages: Record<string, string> = {
    "requested-scheduled": "🚛 Your pickup has been scheduled!",
    "scheduled-picked": "✅ Your waste has been picked up!",
    "picked-recycled": "♻️ Your waste has been recycled! Eco-points earned!",
  };
  return messages[`${oldStatus}-${newStatus}`] || `Pickup status updated to ${newStatus}`;
};

export function useRealtimePickups() {
  const { user, role } = useAuth();
  const [pickups, setPickups] = useState<RealtimePickup[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial pickups
  const fetchPickups = useCallback(async () => {
    if (!user) {
      setPickups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("pickups")
        .select("*")
        .order("requested_at", { ascending: false });

      if (error) throw error;

      setPickups(data?.map(mapRowToPickup) || []);
    } catch (error) {
      console.error("Error fetching pickups:", error);
      toast.error("Failed to load pickups");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create a new pickup
  const createPickup = useCallback(
    async (wasteType: "plastic" | "cardboard", quantity: "small" | "medium" | "large", societyId?: string) => {
      if (!user) {
        toast.error("You must be logged in to create a pickup");
        return null;
      }

      const pickupId = `PKP-${Date.now().toString(36).toUpperCase()}`;

      const insertData: PickupInsert = {
        pickup_id: pickupId,
        user_id: user.id,
        waste_type: wasteType,
        quantity: quantity,
        society_id: societyId || null,
      };

      try {
        const { data, error } = await supabase
          .from("pickups")
          .insert(insertData)
          .select()
          .single();

        if (error) throw error;

        const newPickup = mapRowToPickup(data);
        
        // Optimistically add to state
        setPickups((prev) => [newPickup, ...prev]);
        
        toast.success("Pickup request submitted!", {
          description: `Request ID: ${pickupId}`,
        });

        // Send confirmation email
        if (user.email) {
          emailNotificationService.sendPickupConfirmation(
            user.email,
            user.user_metadata?.full_name || "User",
            pickupId,
            societyId || "Your Society",
            wasteType,
            quantity
          );
        }

        return newPickup;
      } catch (error) {
        console.error("Error creating pickup:", error);
        toast.error("Failed to create pickup request");
        return null;
      }
    },
    [user]
  );

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    fetchPickups();

    const channel = supabase
      .channel("pickups-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pickups",
        },
        (payload) => {
          console.log("Realtime pickup update:", payload);

          if (payload.eventType === "INSERT") {
            const newPickup = mapRowToPickup(payload.new as PickupRow);
            setPickups((prev) => {
              // Avoid duplicates
              if (prev.some((p) => p.id === newPickup.id)) return prev;
              return [newPickup, ...prev];
            });
          }

          if (payload.eventType === "UPDATE") {
            const updatedPickup = mapRowToPickup(payload.new as PickupRow);
            const oldData = payload.old as Partial<PickupRow>;
            
            setPickups((prev) =>
              prev.map((p) => (p.id === updatedPickup.id ? updatedPickup : p))
            );

            // Show notification for status changes
            if (oldData.status && oldData.status !== updatedPickup.status) {
              const message = getStatusMessage(oldData.status, updatedPickup.status);
              toast.success(message, {
                description: `Pickup ID: ${updatedPickup.pickupId}`,
              });

              // Send push notification
              if (updatedPickup.status === "scheduled") {
                notificationService.sendPickupScheduledNotification(
                  updatedPickup.pickupId,
                  updatedPickup.estimatedArrival
                );
                // Send scheduled email
                if (user?.email) {
                  emailNotificationService.sendPickupScheduled(
                    user.email,
                    user.user_metadata?.full_name || "User",
                    updatedPickup.pickupId,
                    updatedPickup.vehicleId || "",
                    "",
                    updatedPickup.scheduledTime?.toLocaleString() || ""
                  );
                }
              } else if (updatedPickup.status === "picked") {
                notificationService.sendPickupCompletedNotification(updatedPickup.pickupId);
                // Send completed email
                if (user?.email) {
                  emailNotificationService.sendPickupCompleted(
                    user.email,
                    user.user_metadata?.full_name || "User",
                    updatedPickup.pickupId,
                    updatedPickup.wasteType,
                    updatedPickup.quantity
                  );
                }
              } else if (updatedPickup.status === "recycled") {
                notificationService.sendRecycledNotification(updatedPickup.pickupId);
              }
            }
          }

          if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as Partial<PickupRow>).id;
            setPickups((prev) => prev.filter((p) => p.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchPickups]);

  const getStats = useCallback(() => {
    const total = pickups.length;
    const recycled = pickups.filter((p) => p.status === "recycled").length;
    const pending = pickups.filter((p) => p.status === "requested" || p.status === "scheduled").length;
    const plasticCount = pickups.filter((p) => p.wasteType === "plastic").length;
    const cardboardCount = pickups.filter((p) => p.wasteType === "cardboard").length;

    return { total, recycled, pending, plasticCount, cardboardCount };
  }, [pickups]);

  return { pickups, loading, createPickup, getStats, refetch: fetchPickups };
}

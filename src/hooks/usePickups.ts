import { useState, useCallback } from "react";
import type { PickupRequest, WasteType, PickupStatus } from "@/types/pickup";

// Generate random time in future
const getRandomFutureTime = () => {
  const hours = Math.floor(Math.random() * 2) + 1;
  const minutes = Math.floor(Math.random() * 60);
  const now = new Date();
  now.setHours(now.getHours() + hours);
  now.setMinutes(minutes);
  return now;
};

const getEstimatedArrival = () => {
  const hours = Math.floor(Math.random() * 2) + 1;
  const minutes = Math.floor(Math.random() * 30) + 10;
  const now = new Date();
  now.setHours(now.getHours() + hours);
  now.setMinutes(minutes);
  return now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

// Demo data
const initialPickups: PickupRequest[] = [
  {
    id: "PKP-001",
    wasteType: "cardboard",
    quantity: "large",
    status: "recycled",
    requestedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    scheduledTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    vehicleId: "MBMC-ECO-03",
  },
  {
    id: "PKP-002",
    wasteType: "plastic",
    quantity: "medium",
    status: "picked",
    requestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    scheduledTime: new Date(Date.now() - 12 * 60 * 60 * 1000),
    vehicleId: "MBMC-ECO-01",
  },
  {
    id: "PKP-003",
    wasteType: "cardboard",
    quantity: "small",
    status: "scheduled",
    requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    scheduledTime: getRandomFutureTime(),
    vehicleId: "MBMC-ECO-02",
    estimatedArrival: getEstimatedArrival(),
  },
];

export function usePickups() {
  const [pickups, setPickups] = useState<PickupRequest[]>(initialPickups);

  const createPickup = useCallback(
    (wasteType: WasteType, quantity: "small" | "medium" | "large") => {
      const newPickup: PickupRequest = {
        id: `PKP-${String(pickups.length + 1).padStart(3, "0")}`,
        wasteType,
        quantity,
        status: "requested",
        requestedAt: new Date(),
      };

      setPickups((prev) => [newPickup, ...prev]);

      // Simulate auto-scheduling after 3 seconds
      setTimeout(() => {
        setPickups((prev) =>
          prev.map((p) =>
            p.id === newPickup.id
              ? {
                  ...p,
                  status: "scheduled" as PickupStatus,
                  scheduledTime: getRandomFutureTime(),
                  vehicleId: `MBMC-ECO-0${Math.floor(Math.random() * 5) + 1}`,
                  estimatedArrival: getEstimatedArrival(),
                }
              : p
          )
        );
      }, 3000);

      return newPickup;
    },
    [pickups.length]
  );

  const getStats = useCallback(() => {
    const total = pickups.length;
    const recycled = pickups.filter((p) => p.status === "recycled").length;
    const pending = pickups.filter((p) => p.status === "requested" || p.status === "scheduled").length;
    const plasticCount = pickups.filter((p) => p.wasteType === "plastic").length;
    const cardboardCount = pickups.filter((p) => p.wasteType === "cardboard").length;

    return { total, recycled, pending, plasticCount, cardboardCount };
  }, [pickups]);

  return { pickups, createPickup, getStats };
}

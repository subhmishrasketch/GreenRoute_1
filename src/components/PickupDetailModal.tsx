import { Package, Archive, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusTimeline } from "./StatusTimeline";
import { LiveTrackingMap } from "./LiveTrackingMap";
import { cn } from "@/lib/utils";
import type { PickupRequest } from "@/types/pickup";
import { format } from "date-fns";

interface PickupDetailModalProps {
  request: PickupRequest | null;
  open: boolean;
  onClose: () => void;
}

export function PickupDetailModal({ request, open, onClose }: PickupDetailModalProps) {
  if (!request) return null;

  const WasteIcon = request.wasteType === "plastic" ? Package : Archive;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                request.wasteType === "plastic" ? "bg-plastic/10" : "bg-cardboard/10"
              )}
            >
              <WasteIcon
                className={cn(
                  "h-6 w-6",
                  request.wasteType === "plastic" ? "text-plastic" : "text-cardboard"
                )}
              />
            </div>
            <div>
              <p className="text-lg font-semibold capitalize">
                {request.wasteType} Waste Pickup
              </p>
              <p className="text-sm font-normal text-muted-foreground">
                Request #{request.id}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Request Details */}
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-muted p-4">
            <div>
              <p className="text-sm text-muted-foreground">Quantity</p>
              <p className="font-semibold text-foreground capitalize">{request.quantity}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Requested</p>
              <p className="font-semibold text-foreground">
                {format(request.requestedAt, "MMM dd, yyyy h:mm a")}
              </p>
            </div>
            {request.scheduledTime && (
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="font-semibold text-foreground">
                  {format(request.scheduledTime, "MMM dd, yyyy h:mm a")}
                </p>
              </div>
            )}
            {request.vehicleId && (
              <div>
                <p className="text-sm text-muted-foreground">Vehicle</p>
                <p className="font-semibold text-foreground">{request.vehicleId}</p>
              </div>
            )}
          </div>

          {/* Status Timeline */}
          <div className="rounded-xl border bg-card p-4">
            <h3 className="mb-4 font-semibold text-foreground">Collection Status</h3>
            <StatusTimeline currentStatus={request.status} />
          </div>

          {/* Live Tracking */}
          {(request.status === "scheduled" || request.status === "picked") && (
            <LiveTrackingMap
              isActive={request.status === "scheduled"}
              estimatedTime={request.estimatedArrival}
            />
          )}

          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

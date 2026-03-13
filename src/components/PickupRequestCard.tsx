import { format } from "date-fns";
import { Package, Archive, Clock, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PickupRequest } from "@/types/pickup";

interface PickupRequestCardProps {
  request: PickupRequest;
  onClick: () => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  requested: { label: "Requested", className: "bg-warning/10 text-warning border-warning/30" },
  scheduled: { label: "Scheduled", className: "bg-primary/10 text-primary border-primary/30" },
  picked: { label: "Picked Up", className: "bg-success/10 text-success border-success/30" },
  recycled: { label: "Recycled", className: "bg-recycled/10 text-recycled border-recycled/30" },
};

export function PickupRequestCard({ request, onClick }: PickupRequestCardProps) {
  const WasteIcon = request.wasteType === "plastic" ? Package : Archive;
  const status = statusConfig[request.status];

  return (
    <Card
      variant="interactive"
      className={cn(
        "border-l-4",
        request.wasteType === "plastic" ? "border-l-plastic" : "border-l-cardboard"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
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
              <h3 className="font-semibold text-foreground capitalize">
                {request.wasteType} Waste
              </h3>
              <p className="text-sm text-muted-foreground capitalize">
                {request.quantity} quantity
              </p>
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {format(request.requestedAt, "MMM dd, h:mm a")}
              </div>
            </div>
          </div>

          <Badge className={cn("border", status.className)}>{status.label}</Badge>
        </div>

        {request.estimatedArrival && request.status === "scheduled" && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-accent p-2">
            <Truck className="h-4 w-4 text-primary" />
            <span className="text-sm text-foreground">
              Arriving at <span className="font-semibold">{request.estimatedArrival}</span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

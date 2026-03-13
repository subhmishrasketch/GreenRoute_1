import { useState } from "react";
import { format } from "date-fns";
import {
  Package,
  Archive,
  Clock,
  Truck,
  CheckCircle2,
  Recycle,
  ChevronDown,
  MapPin,
  User,
  Calendar,
  Filter,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminPickup, Vehicle } from "@/hooks/useAdminPickups";
import type { Database } from "@/integrations/supabase/types";

type PickupStatus = Database["public"]["Enums"]["pickup_status"];

interface PickupManagementTableProps {
  pickups: AdminPickup[];
  vehicles: Vehicle[];
  onUpdateStatus: (
    pickupId: string,
    newStatus: PickupStatus,
    vehicleId?: string,
    scheduledTime?: Date,
    estimatedArrival?: string
  ) => Promise<boolean>;
}

const statusConfig: Record<
  PickupStatus,
  { label: string; icon: React.ReactNode; color: string; next?: PickupStatus }
> = {
  requested: {
    label: "Requested",
    icon: <Clock className="h-4 w-4" />,
    color: "bg-warning/10 text-warning border-warning/20",
    next: "scheduled",
  },
  scheduled: {
    label: "Scheduled",
    icon: <Calendar className="h-4 w-4" />,
    color: "bg-primary/10 text-primary border-primary/20",
    next: "picked",
  },
  picked: {
    label: "Picked Up",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "bg-recycled/10 text-recycled border-recycled/20",
    next: "recycled",
  },
  recycled: {
    label: "Recycled",
    icon: <Recycle className="h-4 w-4" />,
    color: "bg-success/10 text-success border-success/20",
  },
};

const wasteTypeIcons = {
  plastic: <Package className="h-4 w-4 text-plastic" />,
  cardboard: <Archive className="h-4 w-4 text-cardboard" />,
};

export function PickupManagementTable({
  pickups,
  vehicles,
  onUpdateStatus,
}: PickupManagementTableProps) {
  const [statusFilter, setStatusFilter] = useState<PickupStatus | "all">("all");
  const [selectedPickup, setSelectedPickup] = useState<AdminPickup | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState<string>("");
  const [estimatedArrival, setEstimatedArrival] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredPickups = pickups.filter(
    (p) => statusFilter === "all" || p.status === statusFilter
  );

  const availableVehicles = vehicles.filter(
    (v) => v.status === "available" || v.status === "offline"
  );

  const handleStatusChange = async (pickup: AdminPickup, newStatus: PickupStatus) => {
    if (newStatus === "scheduled" && pickup.status === "requested") {
      setSelectedPickup(pickup);
      setIsDialogOpen(true);
      return;
    }

    setIsUpdating(true);
    await onUpdateStatus(pickup.id, newStatus);
    setIsUpdating(false);
  };

  const handleScheduleConfirm = async () => {
    if (!selectedPickup) return;

    setIsUpdating(true);
    const success = await onUpdateStatus(
      selectedPickup.id,
      "scheduled",
      selectedVehicle || undefined,
      scheduledTime ? new Date(scheduledTime) : undefined,
      estimatedArrival || undefined
    );

    if (success) {
      setIsDialogOpen(false);
      setSelectedPickup(null);
      setSelectedVehicle("");
      setScheduledTime("");
      setEstimatedArrival("");
    }
    setIsUpdating(false);
  };

  return (
    <Card variant="elevated" className="animate-slide-up">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Pickup Management
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Update pickup statuses and assign vehicles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as PickupStatus | "all")}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="requested">Requested</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="picked">Picked Up</SelectItem>
              <SelectItem value="recycled">Recycled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Pickup ID</TableHead>
                <TableHead className="font-semibold">Society</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Quantity</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Vehicle</TableHead>
                <TableHead className="font-semibold">Requested</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPickups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No pickups found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPickups.map((pickup) => {
                  const config = statusConfig[pickup.status];
                  const assignedVehicle = vehicles.find((v) => v.id === pickup.vehicleId);

                  return (
                    <TableRow key={pickup.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-sm font-medium">
                        {pickup.pickupId}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {pickup.societyName || "Individual"}
                          </span>
                          {pickup.societyArea && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {pickup.societyArea}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {wasteTypeIcons[pickup.wasteType]}
                          <span className="capitalize text-sm">{pickup.wasteType}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {pickup.quantity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`flex items-center gap-1.5 w-fit ${config.color}`}
                        >
                          {config.icon}
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {assignedVehicle ? (
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">
                              {assignedVehicle.vehicleNumber}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(pickup.requestedAt, "MMM d, h:mm a")}
                      </TableCell>
                      <TableCell className="text-right">
                        {config.next && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(pickup, config.next!)}
                            disabled={isUpdating}
                            className="gap-1.5"
                          >
                            Move to {statusConfig[config.next].label}
                            <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Schedule Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Schedule Pickup
            </DialogTitle>
            <DialogDescription>
              Assign a vehicle and set the pickup schedule for{" "}
              <span className="font-medium">{selectedPickup?.pickupId}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle">Assign Vehicle</Label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger id="vehicle">
                  <SelectValue placeholder="Select a vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {availableVehicles.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No vehicles available
                    </SelectItem>
                  ) : (
                    availableVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          {vehicle.vehicleNumber} - {vehicle.driverName}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledTime">Scheduled Time</Label>
              <Input
                id="scheduledTime"
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eta">Estimated Arrival</Label>
              <Input
                id="eta"
                placeholder="e.g., 30-45 minutes"
                value={estimatedArrival}
                onChange={(e) => setEstimatedArrival(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="eco"
              onClick={handleScheduleConfirm}
              disabled={isUpdating || !selectedVehicle}
            >
              {isUpdating ? "Scheduling..." : "Confirm Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

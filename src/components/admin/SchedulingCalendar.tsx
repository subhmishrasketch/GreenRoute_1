import { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Truck,
  Package,
  Archive,
  Plus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, addDays, startOfWeek, isSameDay, isToday, addWeeks, subWeeks } from "date-fns";
import { cn } from "@/lib/utils";
import type { AdminPickup, Vehicle } from "@/hooks/useAdminPickups";

interface SchedulingCalendarProps {
  pickups: AdminPickup[];
  vehicles: Vehicle[];
  onSchedulePickup: (
    pickupId: string,
    vehicleId: string,
    scheduledTime: string,
    estimatedArrival: string
  ) => Promise<void>;
}

interface ScheduleSlot {
  hour: number;
  label: string;
}

const timeSlots: ScheduleSlot[] = [
  { hour: 8, label: "8:00 AM" },
  { hour: 9, label: "9:00 AM" },
  { hour: 10, label: "10:00 AM" },
  { hour: 11, label: "11:00 AM" },
  { hour: 12, label: "12:00 PM" },
  { hour: 13, label: "1:00 PM" },
  { hour: 14, label: "2:00 PM" },
  { hour: 15, label: "3:00 PM" },
  { hour: 16, label: "4:00 PM" },
  { hour: 17, label: "5:00 PM" },
];

export function SchedulingCalendar({
  pickups,
  vehicles,
  onSchedulePickup,
}: SchedulingCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedPickup, setSelectedPickup] = useState<AdminPickup | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  // Get days of the current week
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  // Get scheduled pickups for a specific day and time
  const getPickupsForSlot = (date: Date, hour: number) => {
    return pickups.filter((pickup) => {
      if (!pickup.scheduledTime) return false;
      const scheduledDate = new Date(pickup.scheduledTime);
      return (
        isSameDay(scheduledDate, date) && scheduledDate.getHours() === hour
      );
    });
  };

  // Get pending pickups that need scheduling
  const pendingPickups = pickups.filter((p) => p.status === "requested");

  // Available vehicles for scheduling
  const availableVehicles = vehicles.filter((v) => v.status === "available");

  const handlePrevWeek = () => setCurrentWeekStart((prev) => subWeeks(prev, 1));
  const handleNextWeek = () => setCurrentWeekStart((prev) => addWeeks(prev, 1));
  const handleToday = () =>
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const openScheduleDialog = (pickup: AdminPickup, date?: Date, hour?: number) => {
    setSelectedPickup(pickup);
    if (date && hour !== undefined) {
      setSelectedDate(date);
      setSelectedTime(hour.toString());
    } else {
      setSelectedDate(new Date());
      setSelectedTime("");
    }
    setSelectedVehicle("");
    setScheduleDialogOpen(true);
  };

  const handleSchedule = async () => {
    if (!selectedPickup || !selectedDate || !selectedTime || !selectedVehicle) return;

    setIsScheduling(true);
    try {
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(parseInt(selectedTime), 0, 0, 0);

      // Estimate arrival 30 mins after scheduled time
      const estimatedArrival = format(
        new Date(scheduledDateTime.getTime() + 30 * 60 * 1000),
        "h:mm a"
      );

      await onSchedulePickup(
        selectedPickup.id,
        selectedVehicle,
        scheduledDateTime.toISOString(),
        estimatedArrival
      );

      setScheduleDialogOpen(false);
      setSelectedPickup(null);
    } catch (error) {
      console.error("Failed to schedule pickup:", error);
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Calendar Header */}
      <Card variant="elevated">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Pickup Scheduling Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-2 gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Jump to Date
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={currentWeekStart}
                    onSelect={(date) =>
                      date &&
                      setCurrentWeekStart(startOfWeek(date, { weekStartsOn: 1 }))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {format(currentWeekStart, "MMMM d")} -{" "}
            {format(addDays(currentWeekStart, 6), "MMMM d, yyyy")}
          </p>
        </CardHeader>

        <CardContent className="p-0">
          {/* Week Calendar Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Day Headers */}
              <div className="grid grid-cols-8 border-b">
                <div className="p-3 text-sm font-medium text-muted-foreground border-r bg-muted/30">
                  Time
                </div>
                {weekDays.map((day, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-3 text-center border-r last:border-r-0",
                      isToday(day) && "bg-primary/5"
                    )}
                  >
                    <div className="text-xs text-muted-foreground uppercase">
                      {format(day, "EEE")}
                    </div>
                    <div
                      className={cn(
                        "text-lg font-semibold mt-1",
                        isToday(day) && "text-primary"
                      )}
                    >
                      {format(day, "d")}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              <div className="max-h-[500px] overflow-y-auto">
                {timeSlots.map((slot) => (
                  <div key={slot.hour} className="grid grid-cols-8 border-b last:border-b-0">
                    <div className="p-2 text-xs font-medium text-muted-foreground border-r bg-muted/30 flex items-start">
                      {slot.label}
                    </div>
                    {weekDays.map((day, dayIndex) => {
                      const slotPickups = getPickupsForSlot(day, slot.hour);
                      return (
                        <div
                          key={dayIndex}
                          className={cn(
                            "p-1 border-r last:border-r-0 min-h-[60px] transition-colors hover:bg-muted/30 cursor-pointer group",
                            isToday(day) && "bg-primary/5"
                          )}
                          onClick={() => {
                            if (pendingPickups.length > 0 && slotPickups.length === 0) {
                              openScheduleDialog(pendingPickups[0], day, slot.hour);
                            }
                          }}
                        >
                          {slotPickups.map((pickup) => (
                            <div
                              key={pickup.id}
                              className={cn(
                                "p-1.5 rounded-md text-xs mb-1 cursor-pointer transition-all hover:scale-[1.02] animate-scale-in",
                                pickup.wasteType === "plastic"
                                  ? "bg-[hsl(var(--plastic-blue))]/10 border border-[hsl(var(--plastic-blue))]/30 text-[hsl(var(--plastic-blue))]"
                                  : "bg-[hsl(var(--cardboard-brown))]/10 border border-[hsl(var(--cardboard-brown))]/30 text-[hsl(var(--cardboard-brown))]"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <div className="flex items-center gap-1">
                                {pickup.wasteType === "plastic" ? (
                                  <Package className="h-3 w-3" />
                                ) : (
                                  <Archive className="h-3 w-3" />
                                )}
                                <span className="truncate font-medium">
                                  {pickup.societyName || "Pickup"}
                                </span>
                              </div>
                            </div>
                          ))}
                          {slotPickups.length === 0 && pendingPickups.length > 0 && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity h-full flex items-center justify-center">
                              <Plus className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Pickups */}
      <Card variant="elevated">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Pending Pickups ({pendingPickups.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingPickups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-success/50 mb-3" />
              <p className="text-muted-foreground">All pickups are scheduled!</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pendingPickups.map((pickup) => (
                <div
                  key={pickup.id}
                  className="flex items-center justify-between p-3 rounded-xl border bg-gradient-to-br from-background to-muted/30 hover:shadow-card transition-all cursor-pointer group"
                  onClick={() => openScheduleDialog(pickup)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center",
                        pickup.wasteType === "plastic"
                          ? "bg-[hsl(var(--plastic-blue))]/10"
                          : "bg-[hsl(var(--cardboard-brown))]/10"
                      )}
                    >
                      {pickup.wasteType === "plastic" ? (
                        <Package className="h-5 w-5 text-[hsl(var(--plastic-blue))]" />
                      ) : (
                        <Archive className="h-5 w-5 text-[hsl(var(--cardboard-brown))]" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {pickup.societyName || "Individual Pickup"}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {pickup.wasteType} • {pickup.quantity}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Schedule
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Schedule Pickup
            </DialogTitle>
            <DialogDescription>
              Assign a vehicle and schedule time for this pickup request.
            </DialogDescription>
          </DialogHeader>

          {selectedPickup && (
            <div className="space-y-4 py-4">
              {/* Pickup Info */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div
                  className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    selectedPickup.wasteType === "plastic"
                      ? "bg-[hsl(var(--plastic-blue))]/10"
                      : "bg-[hsl(var(--cardboard-brown))]/10"
                  )}
                >
                  {selectedPickup.wasteType === "plastic" ? (
                    <Package className="h-5 w-5 text-[hsl(var(--plastic-blue))]" />
                  ) : (
                    <Archive className="h-5 w-5 text-[hsl(var(--cardboard-brown))]" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {selectedPickup.societyName || "Individual Pickup"}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {selectedPickup.wasteType} • {selectedPickup.quantity}
                  </p>
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate || undefined}
                      onSelect={(date) => setSelectedDate(date || null)}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.hour} value={slot.hour.toString()}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {slot.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Vehicle Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Assign Vehicle</label>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No available vehicles
                      </div>
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
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="eco"
              onClick={handleSchedule}
              disabled={
                !selectedDate || !selectedTime || !selectedVehicle || isScheduling
              }
            >
              {isScheduling ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Schedule Pickup
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import { Zap, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Vehicle } from "@/hooks/useAdminPickups";

interface AutoScheduleToggleProps {
  vehicles: Vehicle[];
  onAutoSchedule: () => void;
}

export function AutoScheduleToggle({ vehicles, onAutoSchedule }: AutoScheduleToggleProps) {
  const [autoMode, setAutoMode] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleAutoSchedule = async () => {
    setProcessing(true);
    try {
      // Get all pending pickups
      const { data: pendingPickups, error: pickupError } = await supabase
        .from("pickups")
        .select("*")
        .eq("status", "requested")
        .order("requested_at", { ascending: true });

      if (pickupError) throw pickupError;
      if (!pendingPickups || pendingPickups.length === 0) {
        toast.info("No pending pickups to schedule");
        setProcessing(false);
        return;
      }

      const availableVehicles = vehicles.filter((v) => v.status === "available");
      if (availableVehicles.length === 0) {
        toast.warning("No vehicles available for scheduling");
        setProcessing(false);
        return;
      }

      let scheduled = 0;
      for (let i = 0; i < pendingPickups.length; i++) {
        const vehicle = availableVehicles[i % availableVehicles.length];
        const scheduledTime = new Date();
        scheduledTime.setMinutes(scheduledTime.getMinutes() + 30 + i * 20);

        const { error } = await supabase
          .from("pickups")
          .update({
            status: "scheduled",
            vehicle_id: vehicle.id,
            scheduled_time: scheduledTime.toISOString(),
            estimated_arrival: `~${30 + i * 20} mins`,
          })
          .eq("id", pendingPickups[i].id);

        if (!error) scheduled++;
      }

      toast.success(`Auto-scheduled ${scheduled} pickups!`, {
        description: `Assigned to ${availableVehicles.length} available vehicle(s)`,
      });
      onAutoSchedule();
    } catch (e: any) {
      toast.error(e.message || "Auto-scheduling failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card variant="elevated" className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" /> Auto-Scheduling
          </CardTitle>
          <Switch checked={autoMode} onCheckedChange={setAutoMode} />
        </div>
        <CardDescription>
          When enabled, automatically assign pending pickups to available vehicles
        </CardDescription>
      </CardHeader>
      {autoMode && (
        <CardContent className="pt-0 space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 border border-accent">
            <Clock className="h-5 w-5 text-primary shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Smart Assignment</p>
              <p className="text-xs text-muted-foreground">Round-robin assignment with 20-minute intervals between pickups</p>
            </div>
          </div>
          <Button
            variant="eco"
            className="w-full gap-2"
            onClick={handleAutoSchedule}
            disabled={processing}
          >
            {processing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Scheduling...</>
            ) : (
              <><CheckCircle2 className="h-4 w-4" /> Schedule All Pending Pickups</>
            )}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

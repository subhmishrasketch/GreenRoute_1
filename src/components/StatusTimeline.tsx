import { Check, Clock, Truck, Recycle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PickupStatus } from "@/types/pickup";

interface StatusTimelineProps {
  currentStatus: PickupStatus;
}

const statuses: { status: PickupStatus; label: string; icon: React.ElementType }[] = [
  { status: "requested", label: "Requested", icon: Clock },
  { status: "scheduled", label: "Scheduled", icon: Check },
  { status: "picked", label: "Picked Up", icon: Truck },
  { status: "recycled", label: "Recycled", icon: Recycle },
];

export function StatusTimeline({ currentStatus }: StatusTimelineProps) {
  const currentIndex = statuses.findIndex((s) => s.status === currentStatus);

  return (
    <div className="relative">
      {/* Connection line */}
      <div className="absolute left-6 top-6 h-[calc(100%-48px)] w-0.5 bg-border" />
      <div
        className="absolute left-6 top-6 w-0.5 bg-primary transition-all duration-500"
        style={{ height: `calc(${(currentIndex / (statuses.length - 1)) * 100}% - 48px)` }}
      />

      <div className="space-y-6">
        {statuses.map((s, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = s.icon;

          return (
            <div key={s.status} className="flex items-center gap-4">
              <div
                className={cn(
                  "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300",
                  isCompleted && "border-primary bg-primary",
                  isCurrent && "border-primary bg-accent animate-pulse-soft",
                  !isCompleted && !isCurrent && "border-border bg-muted"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 text-primary-foreground" />
                ) : isCurrent ? (
                  <Icon className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p
                  className={cn(
                    "font-medium transition-colors",
                    isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </p>
                {isCurrent && (
                  <p className="text-sm text-primary animate-fade-in">In Progress</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

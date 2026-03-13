import { Clock, Calendar, CheckCircle2, Recycle, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";

interface AdminPickupStatsProps {
  stats: {
    total: number;
    requested: number;
    scheduled: number;
    picked: number;
    recycled: number;
  };
}

export function AdminPickupStats({ stats }: AdminPickupStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-5 mb-8">
      <StatsCard
        icon={<TrendingUp className="h-5 w-5 text-primary" />}
        label="Total Pickups"
        value={stats.total}
      />
      <StatsCard
        icon={<Clock className="h-5 w-5 text-warning" />}
        label="Requested"
        value={stats.requested}
      />
      <StatsCard
        icon={<Calendar className="h-5 w-5 text-primary" />}
        label="Scheduled"
        value={stats.scheduled}
      />
      <StatsCard
        icon={<CheckCircle2 className="h-5 w-5 text-recycled" />}
        label="Picked Up"
        value={stats.picked}
      />
      <StatsCard
        icon={<Recycle className="h-5 w-5 text-success" />}
        label="Recycled"
        value={stats.recycled}
      />
    </div>
  );
}

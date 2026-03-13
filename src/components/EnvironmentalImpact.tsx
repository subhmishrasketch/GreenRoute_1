import { Leaf, Wind, TreeDeciduous, Droplets } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EnvironmentalImpactProps {
  plasticSaved: number;
  co2Reduced: number;
  treesEquivalent?: number;
  waterSaved?: number;
}

export function EnvironmentalImpact({
  plasticSaved,
  co2Reduced,
  treesEquivalent,
  waterSaved,
}: EnvironmentalImpactProps) {
  // Calculate equivalents if not provided
  const trees = treesEquivalent || Math.round(co2Reduced / 21); // ~21kg CO2 per tree/year
  const water = waterSaved || Math.round(plasticSaved * 3); // ~3L water saved per kg plastic

  const stats = [
    {
      icon: Leaf,
      value: `${plasticSaved.toLocaleString()} kg`,
      label: "Plastic Saved",
      color: "text-plastic",
      bgColor: "bg-plastic/10",
    },
    {
      icon: Wind,
      value: `${co2Reduced.toLocaleString()} kg`,
      label: "CO₂ Reduced",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: TreeDeciduous,
      value: trees.toLocaleString(),
      label: "Trees Equivalent",
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      icon: Droplets,
      value: `${water.toLocaleString()} L`,
      label: "Water Saved",
      color: "text-recycled",
      bgColor: "bg-recycled/10",
    },
  ];

  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardHeader className="pb-3 gradient-eco">
        <CardTitle className="flex items-center gap-2 text-lg text-primary-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/20">
            <Leaf className="h-4 w-4 text-primary-foreground" />
          </div>
          Environmental Impact
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-xl bg-muted/50 p-4 text-center"
            >
              <div className={`mb-2 rounded-full ${stat.bgColor} p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

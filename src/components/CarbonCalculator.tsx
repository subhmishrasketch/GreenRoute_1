import { useState } from "react";
import { Calculator, TreePine, Droplets, Wind, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ImpactResult {
  co2Saved: number;
  treesEquivalent: number;
  waterSaved: number;
  energySaved: number;
}

export function CarbonCalculator() {
  const [plasticKg, setPlasticKg] = useState("");
  const [cardboardKg, setCardboardKg] = useState("");
  const [result, setResult] = useState<ImpactResult | null>(null);

  const calculate = () => {
    const plastic = parseFloat(plasticKg) || 0;
    const cardboard = parseFloat(cardboardKg) || 0;

    // Approximate environmental impact factors
    const co2Saved = plastic * 1.5 + cardboard * 0.9; // kg CO2
    const treesEquivalent = cardboard / 58.5; // ~58.5 kg cardboard = 1 tree
    const waterSaved = plastic * 16.3 + cardboard * 7.4; // liters
    const energySaved = plastic * 5.7 + cardboard * 3.2; // kWh

    setResult({
      co2Saved: Math.round(co2Saved * 10) / 10,
      treesEquivalent: Math.round(treesEquivalent * 100) / 100,
      waterSaved: Math.round(waterSaved),
      energySaved: Math.round(energySaved * 10) / 10,
    });
  };

  const impactCards = result ? [
    { icon: Wind, label: "CO₂ Saved", value: `${result.co2Saved} kg`, color: "text-primary", bg: "bg-primary/10" },
    { icon: TreePine, label: "Trees Saved", value: result.treesEquivalent.toFixed(2), color: "text-[hsl(var(--success-green))]", bg: "bg-[hsl(var(--success-green))]/10" },
    { icon: Droplets, label: "Water Saved", value: `${result.waterSaved} L`, color: "text-[hsl(var(--plastic-blue))]", bg: "bg-[hsl(var(--plastic-blue))]/10" },
    { icon: Zap, label: "Energy Saved", value: `${result.energySaved} kWh`, color: "text-[hsl(var(--warning-amber))]", bg: "bg-[hsl(var(--warning-amber))]/10" },
  ] : [];

  return (
    <Card variant="elevated">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--success-green))]/10">
            <Calculator className="h-4 w-4 text-[hsl(var(--success-green))]" />
          </div>
          Carbon Footprint Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          See the environmental impact of your recycling efforts.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <Label className="text-xs">Plastic recycled (kg)</Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={plasticKg}
              onChange={(e) => setPlasticKg(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">Cardboard recycled (kg)</Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={cardboardKg}
              onChange={(e) => setCardboardKg(e.target.value)}
            />
          </div>
        </div>

        <Button variant="eco" className="w-full mb-4" onClick={calculate}>
          <Calculator className="h-4 w-4 mr-2" />
          Calculate Impact
        </Button>

        {result && (
          <div className="grid grid-cols-2 gap-3 animate-fade-in">
            {impactCards.map((card) => (
              <div key={card.label} className="rounded-xl bg-accent p-4 text-center">
                <div className={cn("mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl", card.bg)}>
                  <card.icon className={cn("h-5 w-5", card.color)} />
                </div>
                <p className="text-lg font-bold text-foreground">{card.value}</p>
                <p className="text-[10px] text-muted-foreground">{card.label}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

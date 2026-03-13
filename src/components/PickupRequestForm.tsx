import { useState } from "react";
import { Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WasteTypeSelector } from "./WasteTypeSelector";
import { QuantitySelector } from "./QuantitySelector";
import type { WasteType } from "@/types/pickup";

interface PickupRequestFormProps {
  onSubmit: (wasteType: WasteType, quantity: "small" | "medium" | "large") => void;
}

export function PickupRequestForm({ onSubmit }: PickupRequestFormProps) {
  const [wasteType, setWasteType] = useState<WasteType | null>(null);
  const [quantity, setQuantity] = useState<"small" | "medium" | "large" | null>(null);

  const handleSubmit = () => {
    if (wasteType && quantity) {
      onSubmit(wasteType, quantity);
      setWasteType(null);
      setQuantity(null);
    }
  };

  return (
    <Card variant="elevated" className="animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-eco shadow-soft">
            <Truck className="h-5 w-5 text-primary-foreground" />
          </div>
          Request Pickup
        </CardTitle>
        <CardDescription>
          Schedule a collection for your e-commerce packaging waste
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            1. Select Waste Type
          </label>
          <WasteTypeSelector selected={wasteType} onSelect={setWasteType} />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            2. Estimated Quantity
          </label>
          <QuantitySelector selected={quantity} onSelect={setQuantity} />
        </div>

        <Button
          variant="eco"
          size="xl"
          className="w-full"
          disabled={!wasteType || !quantity}
          onClick={handleSubmit}
        >
          <Truck className="h-5 w-5" />
          Schedule Pickup
        </Button>
      </CardContent>
    </Card>
  );
}

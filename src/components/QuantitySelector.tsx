import { cn } from "@/lib/utils";

type Quantity = "small" | "medium" | "large";

interface QuantitySelectorProps {
  selected: Quantity | null;
  onSelect: (quantity: Quantity) => void;
}

const quantities: { value: Quantity; label: string; description: string; icon: string }[] = [
  { value: "small", label: "Small", description: "1-3 packages", icon: "📦" },
  { value: "medium", label: "Medium", description: "4-8 packages", icon: "📦📦" },
  { value: "large", label: "Large", description: "9+ packages", icon: "📦📦📦" },
];

export function QuantitySelector({ selected, onSelect }: QuantitySelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {quantities.map((q) => (
        <button
          key={q.value}
          onClick={() => onSelect(q.value)}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-300",
            selected === q.value
              ? "border-primary bg-accent shadow-soft"
              : "border-border bg-card hover:border-primary/30 hover:shadow-soft"
          )}
        >
          <span className="text-2xl">{q.icon}</span>
          <div className="text-center">
            <p className="font-medium text-foreground">{q.label}</p>
            <p className="text-xs text-muted-foreground">{q.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

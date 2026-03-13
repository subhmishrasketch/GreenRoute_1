import { Package, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WasteType } from "@/types/pickup";

interface WasteTypeSelectorProps {
  selected: WasteType | null;
  onSelect: (type: WasteType) => void;
}

export function WasteTypeSelector({ selected, onSelect }: WasteTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => onSelect("plastic")}
        className={cn(
          "group relative flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all duration-300",
          selected === "plastic"
            ? "border-plastic bg-plastic/10 shadow-card"
            : "border-border bg-card hover:border-plastic/50 hover:shadow-soft"
        )}
      >
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-xl transition-all duration-300",
            selected === "plastic"
              ? "bg-plastic shadow-soft"
              : "bg-muted group-hover:bg-plastic/20"
          )}
        >
          <Package
            className={cn(
              "h-8 w-8 transition-colors",
              selected === "plastic" ? "text-primary-foreground" : "text-muted-foreground"
            )}
          />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-foreground">Plastic</h3>
          <p className="text-xs text-muted-foreground">Bubble wrap, bags, films</p>
        </div>
        {selected === "plastic" && (
          <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-plastic text-primary-foreground shadow-soft">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </button>

      <button
        onClick={() => onSelect("cardboard")}
        className={cn(
          "group relative flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all duration-300",
          selected === "cardboard"
            ? "border-cardboard bg-cardboard/10 shadow-card"
            : "border-border bg-card hover:border-cardboard/50 hover:shadow-soft"
        )}
      >
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-xl transition-all duration-300",
            selected === "cardboard"
              ? "bg-cardboard shadow-soft"
              : "bg-muted group-hover:bg-cardboard/20"
          )}
        >
          <Archive
            className={cn(
              "h-8 w-8 transition-colors",
              selected === "cardboard" ? "text-primary-foreground" : "text-muted-foreground"
            )}
          />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-foreground">Cardboard</h3>
          <p className="text-xs text-muted-foreground">Boxes, packaging sheets</p>
        </div>
        {selected === "cardboard" && (
          <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-cardboard text-primary-foreground shadow-soft">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </button>
    </div>
  );
}

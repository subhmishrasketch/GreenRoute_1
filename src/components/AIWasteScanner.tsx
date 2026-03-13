import { useState, useRef } from "react";
import { Camera, Loader2, Sparkles, Package, Archive, CheckCircle2, AlertCircle, Upload, X, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ScanResult {
  wasteType: "plastic" | "cardboard" | "mixed" | "unknown";
  confidence: number;
  estimatedWeight: string;
  recyclable: boolean;
  tips: string[];
  suggestedQuantity: "small" | "medium" | "large";
}

export function AIWasteScanner({ onScanComplete }: { onScanComplete?: (type: string, quantity: string) => void }) {
  const [description, setDescription] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      // Extract base64 data
      setImageBase64(dataUrl.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleScan = async () => {
    if (!description.trim() && !imageBase64) {
      toast.error("Please describe the waste or upload a photo");
      return;
    }

    setScanning(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-waste-scanner", {
        body: { description: description.trim(), image: imageBase64 },
      });

      if (error) throw error;
      setResult(data as ScanResult);
      toast.success("Waste analyzed successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to analyze waste");
    } finally {
      setScanning(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "plastic": return <Package className="h-5 w-5 text-[hsl(var(--plastic-blue))]" />;
      case "cardboard": return <Archive className="h-5 w-5 text-[hsl(var(--cardboard-brown))]" />;
      default: return <AlertCircle className="h-5 w-5 text-warning" />;
    }
  };

  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/30">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 animate-pulse-soft">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          AI Waste Scanner
        </CardTitle>
        <CardDescription>Upload a photo or describe your waste — AI will identify the type and suggest a pickup size</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {/* Image Upload Area */}
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border-2 border-primary/20">
              <img src={imagePreview} alt="Waste preview" className="w-full h-48 object-cover" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-2 left-2">
                <Badge className="bg-background/80 backdrop-blur text-foreground text-xs">
                  <ImageIcon className="h-3 w-3 mr-1" /> Photo attached
                </Badge>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 bg-muted/30 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="text-primary font-medium">Upload photo</span> of your waste
              </p>
              <p className="text-xs text-muted-foreground">JPG, PNG up to 5MB</p>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">and/or describe it</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Textarea
          placeholder="e.g., 3 large Amazon boxes, 5 plastic bottles, bubble wrap from electronics packaging..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[80px] resize-none"
        />
        <Button
          variant="eco"
          className="w-full gap-2"
          onClick={handleScan}
          disabled={scanning || (!description.trim() && !imageBase64)}
        >
          {scanning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Analyzing with AI...
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" /> Scan Waste
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-4 animate-slide-up">
            <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(result.wasteType)}
                  <span className="font-semibold text-foreground capitalize">{result.wasteType}</span>
                </div>
                <Badge className={cn(
                  "text-xs",
                  result.confidence > 80 ? "bg-[hsl(var(--success-green))]/10 text-[hsl(var(--success-green))] border-[hsl(var(--success-green))]/30"
                    : "bg-[hsl(var(--warning-amber))]/10 text-[hsl(var(--warning-amber))] border-[hsl(var(--warning-amber))]/30"
                )}>
                  {result.confidence}% confident
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-background p-2">
                  <p className="text-lg font-bold text-foreground">{result.estimatedWeight}</p>
                  <p className="text-xs text-muted-foreground">Est. Weight</p>
                </div>
                <div className="rounded-lg bg-background p-2">
                  <p className="text-lg font-bold text-foreground capitalize">{result.suggestedQuantity}</p>
                  <p className="text-xs text-muted-foreground">Pickup Size</p>
                </div>
                <div className="rounded-lg bg-background p-2">
                  <div className="flex justify-center">
                    {result.recyclable ? (
                      <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success-green))]" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{result.recyclable ? "Recyclable" : "Not Recyclable"}</p>
                </div>
              </div>

              {result.tips.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">💡 Tips:</p>
                  {result.tips.map((tip, i) => (
                    <p key={i} className="text-xs text-muted-foreground">• {tip}</p>
                  ))}
                </div>
              )}

              {onScanComplete && (result.wasteType === "plastic" || result.wasteType === "cardboard") && (
                <Button
                  variant="eco"
                  className="w-full"
                  onClick={() => onScanComplete(result.wasteType, result.suggestedQuantity)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Use for Pickup Request
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

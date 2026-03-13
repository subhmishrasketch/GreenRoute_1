import { useState } from "react";
import { Image, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useGallery } from "@/hooks/useGallery";

const categoryColors: Record<string, string> = {
  cleanup: "bg-[hsl(var(--success-green))]/10 text-[hsl(var(--success-green))] border-[hsl(var(--success-green))]/30",
  recycling: "bg-[hsl(var(--plastic-blue))]/10 text-[hsl(var(--plastic-blue))] border-[hsl(var(--plastic-blue))]/30",
  awareness: "bg-primary/10 text-primary border-primary/30",
  infrastructure: "bg-[hsl(var(--cardboard-brown))]/10 text-[hsl(var(--cardboard-brown))] border-[hsl(var(--cardboard-brown))]/30",
  general: "bg-muted text-muted-foreground border-border",
};

export function GalleryTab() {
  const { items, loading } = useGallery();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const activeItems = items.filter((i) => i.is_active);
  const categories = ["all", ...new Set(activeItems.map((i) => i.category))];
  const filtered = filter === "all" ? activeItems : activeItems.filter((i) => i.category === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (activeItems.length === 0) {
    return (
      <Card variant="elevated" className="flex flex-col items-center justify-center py-16">
        <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <Image className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Gallery Items Yet</h3>
        <p className="text-muted-foreground text-center max-w-sm">
          MBMC will share photos of waste management initiatives and community work here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
              filter === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <Card
            key={item.id}
            variant="elevated"
            className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setSelectedImage(item.image_url)}
          >
            <div className="aspect-video relative overflow-hidden bg-muted">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <Badge
                variant="outline"
                className={`absolute top-2 right-2 text-xs capitalize ${categoryColors[item.category] || categoryColors.general}`}
              >
                {item.category}
              </Badge>
            </div>
            <CardContent className="pt-3 pb-4">
              <h3 className="font-semibold text-sm text-foreground line-clamp-1">{item.title}</h3>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(item.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {selectedImage && (
            <img src={selectedImage} alt="Gallery" className="w-full h-auto" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

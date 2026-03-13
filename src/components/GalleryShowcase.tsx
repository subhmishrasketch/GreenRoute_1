import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Image } from "lucide-react";
import { useGallery } from "@/hooks/useGallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function GalleryShowcase() {
  const { items, loading } = useGallery();
  const activeItems = items.filter((i) => i.is_active);
  const [current, setCurrent] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const next = useCallback(() => {
    if (activeItems.length === 0) return;
    setCurrent((prev) => (prev + 1) % activeItems.length);
  }, [activeItems.length]);

  const prev = useCallback(() => {
    if (activeItems.length === 0) return;
    setCurrent((prev) => (prev - 1 + activeItems.length) % activeItems.length);
  }, [activeItems.length]);

  // Auto-slide every 5s
  useEffect(() => {
    if (activeItems.length <= 1) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next, activeItems.length]);

  if (loading || activeItems.length === 0) return null;

  const currentItem = activeItems[current];

  return (
    <section className="py-12 bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Image className="h-3.5 w-3.5" />
            MBMC Initiatives
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Our Work in Action
          </h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            See how MBMC is transforming waste management across Mira-Bhayandar
          </p>
        </div>

        {/* Single large image block */}
        <div className="relative max-w-4xl mx-auto">
          <div
            className="relative overflow-hidden rounded-2xl cursor-pointer group"
            onClick={() => setSelectedImage(currentItem.image_url)}
          >
            <div className="aspect-[16/9] bg-muted relative">
              {activeItems.map((item, idx) => (
                <img
                  key={item.id}
                  src={item.image_url}
                  alt={item.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    idx === current ? "opacity-100" : "opacity-0"
                  }`}
                  loading="lazy"
                />
              ))}
            </div>

            {/* Overlay with info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <Badge variant="outline" className="mb-3 bg-white/20 text-white border-white/30 text-xs capitalize backdrop-blur-sm">
                {currentItem.category}
              </Badge>
              <h3 className="font-bold text-white text-lg md:text-xl line-clamp-1">{currentItem.title}</h3>
              {currentItem.description && (
                <p className="text-white/80 text-sm mt-1 line-clamp-2 max-w-lg">{currentItem.description}</p>
              )}
            </div>

            {/* Counter */}
            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-medium">
              {current + 1} / {activeItems.length}
            </div>
          </div>

          {/* Navigation arrows */}
          {activeItems.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 hover:text-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 hover:text-white"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-5">
            {activeItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === current ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {selectedImage && <img src={selectedImage} alt="Gallery" className="w-full h-auto" />}
        </DialogContent>
      </Dialog>
    </section>
  );
}

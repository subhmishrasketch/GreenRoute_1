import { useState, useRef } from "react";
import { Plus, Trash2, Image, Loader2, Eye, EyeOff, Upload, Link } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGallery } from "@/hooks/useGallery";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function GalleryManagement() {
  const { items, loading, addItem, updateItem, deleteItem } = useGallery();
  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [uploadMode, setUploadMode] = useState<"upload" | "url">("upload");
  const [form, setForm] = useState({ title: "", description: "", image_url: "", category: "general" });
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("gallery-images")
        .getPublicUrl(fileName);

      setForm((prev) => ({ ...prev, image_url: publicUrl }));
      setPreviewUrl(publicUrl);
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.title || !form.image_url) return;
    setAdding(true);
    const success = await addItem(form);
    if (success) {
      setForm({ title: "", description: "", image_url: "", category: "general" });
      setPreviewUrl(null);
      setAddOpen(false);
    }
    setAdding(false);
  };

  const resetForm = () => {
    setForm({ title: "", description: "", image_url: "", category: "general" });
    setPreviewUrl(null);
    setUploadMode("upload");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Image className="h-5 w-5 text-primary" />
          Gallery Management
        </h2>
        <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button variant="eco" className="gap-2">
              <Plus className="h-4 w-4" /> Add Photo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Gallery Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Beach Cleanup Drive 2024" />
              </div>

              {/* Image Upload Tabs */}
              <div className="space-y-2">
                <Label>Image *</Label>
                <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as "upload" | "url")}>
                  <TabsList className="grid w-full grid-cols-2 h-9">
                    <TabsTrigger value="upload" className="text-xs gap-1.5">
                      <Upload className="h-3.5 w-3.5" /> Upload File
                    </TabsTrigger>
                    <TabsTrigger value="url" className="text-xs gap-1.5">
                      <Link className="h-3.5 w-3.5" /> Paste URL
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="mt-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div
                      className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="text-sm text-muted-foreground">Uploading...</p>
                        </div>
                      ) : previewUrl ? (
                        <div className="space-y-2">
                          <img src={previewUrl} alt="Preview" className="max-h-32 mx-auto rounded-lg object-cover" />
                          <p className="text-xs text-muted-foreground">Click to change image</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8 text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground">Click to upload an image</p>
                          <p className="text-xs text-muted-foreground/70">JPG, PNG, WebP • Max 5MB</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="url" className="mt-3">
                    <Input
                      value={form.image_url}
                      onChange={(e) => {
                        setForm({ ...form, image_url: e.target.value });
                        setPreviewUrl(e.target.value);
                      }}
                      placeholder="https://example.com/image.jpg"
                    />
                    {form.image_url && uploadMode === "url" && (
                      <img src={form.image_url} alt="Preview" className="mt-2 max-h-32 rounded-lg object-cover" onError={() => setPreviewUrl(null)} />
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cleanup">Cleanup</SelectItem>
                    <SelectItem value="recycling">Recycling</SelectItem>
                    <SelectItem value="awareness">Awareness</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button variant="eco" onClick={handleAdd} disabled={adding || !form.title || !form.image_url}>
                {adding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <Card variant="elevated" className="py-12 text-center">
          <Image className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No gallery items yet. Add your first photo!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} variant="elevated" className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                {!item.is_active && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                    <Badge variant="outline" className="bg-background">Hidden</Badge>
                  </div>
                )}
              </div>
              <CardContent className="pt-3 pb-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-sm line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateItem(item.id, { is_active: !item.is_active })}
                  >
                    {item.is_active ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
                    {item.is_active ? "Hide" : "Show"}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => deleteItem(item.id)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

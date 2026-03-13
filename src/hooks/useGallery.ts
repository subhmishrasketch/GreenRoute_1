import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string;
  is_active: boolean;
  created_at: string;
}

export function useGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGallery(); }, [fetchGallery]);

  const addItem = useCallback(async (item: { title: string; description?: string; image_url: string; category: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("gallery").insert({
        ...item,
        uploaded_by: user?.id,
      });
      if (error) throw error;
      toast.success("Gallery item added!");
      fetchGallery();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to add gallery item");
      return false;
    }
  }, [fetchGallery]);

  const updateItem = useCallback(async (id: string, updates: Partial<GalleryItem>) => {
    try {
      const { error } = await supabase.from("gallery").update(updates).eq("id", id);
      if (error) throw error;
      toast.success("Gallery item updated!");
      fetchGallery();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to update");
      return false;
    }
  }, [fetchGallery]);

  const deleteItem = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from("gallery").delete().eq("id", id);
      if (error) throw error;
      toast.success("Gallery item deleted!");
      fetchGallery();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  }, [fetchGallery]);

  return { items, loading, addItem, updateItem, deleteItem, refetch: fetchGallery };
}

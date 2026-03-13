import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export function useAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const createAnnouncement = useCallback(async (title: string, content: string, priority: string) => {
    if (!user) return false;
    try {
      const { error } = await supabase.from("announcements").insert({
        title,
        content,
        priority,
        created_by: user.id,
      });
      if (error) throw error;
      toast.success("Announcement published!");
      fetchAnnouncements();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to create announcement");
      return false;
    }
  }, [user, fetchAnnouncements]);

  const deleteAnnouncement = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
      toast.success("Announcement deleted!");
      fetchAnnouncements();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  }, [fetchAnnouncements]);

  return { announcements, loading, createAnnouncement, deleteAnnouncement, refetch: fetchAnnouncements };
}

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { notificationService } from "@/services/notificationService";

export interface Complaint {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  category: string;
  status: string;
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
}

export function useComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  // Listen for realtime updates to complaints (for push notifications to users)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('complaint-responses')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'complaints',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as any;
          if (updated.admin_response && updated.status === 'resolved') {
            // Send push notification
            notificationService.sendNotification(
              "Complaint Response Received",
              {
                body: `Your complaint "${updated.subject}" has been responded to by MBMC admin.`,
                icon: "/pwa-192x192.svg",
                tag: `complaint-${updated.id}`,
              }
            );
            toast.info("Admin responded to your complaint!", {
              description: updated.subject,
            });
            // Refetch to update UI
            fetchComplaints();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchComplaints]);

  const createComplaint = useCallback(async (subject: string, description: string, category: string) => {
    if (!user) return false;
    try {
      const { error } = await supabase.from("complaints").insert({
        user_id: user.id,
        subject,
        description,
        category,
      });
      if (error) throw error;
      toast.success("Complaint submitted successfully!");
      fetchComplaints();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to submit complaint");
      return false;
    }
  }, [user, fetchComplaints]);

  const respondToComplaint = useCallback(async (id: string, response: string) => {
    try {
      const { error } = await supabase.from("complaints").update({
        admin_response: response,
        status: "resolved",
        responded_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
      toast.success("Response sent!");
      fetchComplaints();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to respond");
      return false;
    }
  }, [fetchComplaints]);

  return { complaints, loading, createComplaint, respondToComplaint, refetch: fetchComplaints };
}

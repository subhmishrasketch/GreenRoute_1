import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface NotificationPreferences {
  email_pickup_confirmed: boolean;
  email_pickup_scheduled: boolean;
  email_vehicle_arriving: boolean;
  email_pickup_completed: boolean;
  push_pickup_confirmed: boolean;
  push_pickup_scheduled: boolean;
  push_vehicle_arriving: boolean;
  push_pickup_completed: boolean;
  sms_vehicle_arriving: boolean;
  sms_pickup_completed: boolean;
  phone_number: string | null;
}

const defaultPreferences: NotificationPreferences = {
  email_pickup_confirmed: true,
  email_pickup_scheduled: true,
  email_vehicle_arriving: true,
  email_pickup_completed: true,
  push_pickup_confirmed: true,
  push_pickup_scheduled: true,
  push_vehicle_arriving: true,
  push_pickup_completed: true,
  sms_vehicle_arriving: true,
  sms_pickup_completed: false,
  phone_number: null,
};

export function useNotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPreferences = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences({
          email_pickup_confirmed: data.email_pickup_confirmed,
          email_pickup_scheduled: data.email_pickup_scheduled,
          email_vehicle_arriving: data.email_vehicle_arriving,
          email_pickup_completed: data.email_pickup_completed,
          push_pickup_confirmed: data.push_pickup_confirmed,
          push_pickup_scheduled: data.push_pickup_scheduled,
          push_vehicle_arriving: data.push_vehicle_arriving,
          push_pickup_completed: data.push_pickup_completed,
          sms_vehicle_arriving: data.sms_vehicle_arriving,
          sms_pickup_completed: data.sms_pickup_completed,
          phone_number: data.phone_number,
        });
      }
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const savePreferences = useCallback(
    async (newPrefs: NotificationPreferences) => {
      if (!user) return;
      setSaving(true);
      try {
        const { error } = await supabase
          .from("notification_preferences")
          .upsert(
            { user_id: user.id, ...newPrefs },
            { onConflict: "user_id" }
          );

        if (error) throw error;

        setPreferences(newPrefs);
        toast.success("Notification preferences saved!");
      } catch (error) {
        console.error("Error saving notification preferences:", error);
        toast.error("Failed to save preferences");
      } finally {
        setSaving(false);
      }
    },
    [user]
  );

  const updatePreference = useCallback(
    (key: keyof NotificationPreferences, value: boolean | string | null) => {
      const updated = { ...preferences, [key]: value };
      setPreferences(updated);
      savePreferences(updated);
    },
    [preferences, savePreferences]
  );

  return { preferences, loading, saving, updatePreference, refetch: fetchPreferences };
}

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type SocietyRow = Database["public"]["Tables"]["societies"]["Row"];

export interface Society {
  id: string;
  name: string;
  area: string;
  numberOfFlats: number;
  address?: string;
  ecoPoints: number;
  totalPickups: number;
  plasticCollected: number;
  cardboardCollected: number;
  co2Reduced: number;
  plasticSaved: number;
}

const mapRowToSociety = (row: SocietyRow): Society => ({
  id: row.id,
  name: row.name,
  area: row.area,
  numberOfFlats: row.number_of_flats,
  address: row.address || undefined,
  ecoPoints: row.eco_points,
  totalPickups: row.total_pickups,
  plasticCollected: Number(row.plastic_collected),
  cardboardCollected: Number(row.cardboard_collected),
  co2Reduced: Number(row.co2_reduced),
  plasticSaved: Number(row.plastic_saved),
});

export function useSociety() {
  const { user } = useAuth();
  const [society, setSociety] = useState<Society | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRegistered, setHasRegistered] = useState(false);

  const fetchSociety = useCallback(async () => {
    if (!user) {
      setSociety(null);
      setHasRegistered(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("societies")
        .select("*")
        .eq("caretaker_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setSociety(mapRowToSociety(data[0]));
        setHasRegistered(true);
      } else {
        setSociety(null);
        setHasRegistered(false);
      }
    } catch (error) {
      console.error("Error fetching society:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSociety();
  }, [fetchSociety]);

  return { society, loading, hasRegistered, refetch: fetchSociety };
}
